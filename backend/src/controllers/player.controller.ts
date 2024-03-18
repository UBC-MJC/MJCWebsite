import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { loginSchema, registerSchema } from "../validation/player.validation";
import {
    createPlayer,
    findPlayerByUsernameOrEmail,
    requestPasswordReset,
    resetPassword,
    updatePlayer,
} from "../services/player.service";
import { generateToken } from "../middleware/jwt";
import bcrypt from "bcryptjs";
import { getCurrentSeason } from "../services/season.service";
import { getGameService, STARTING_ELO } from "../services/game/game.util";

const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    registerSchema
        .validate(req.body)
        .then(() => createPlayer(req.body))
        .then((player) => {
            if (!player) {
                throw new Error("Error creating player");
            }

            const token = generateToken(player.id);
            const { password, ...playerOmitted } = player;
            res.json({
                player: { authToken: token, ...playerOmitted },
            });
        })
        .catch((err: any) => {
            next(createError.BadRequest(err.message));
        });
};

const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    loginSchema
        .validate(req.body)
        .then(() => findPlayerByUsernameOrEmail(req.body.username))
        .then((player) => {
            if (player && bcrypt.compareSync(req.body.password, player.password)) {
                const token = generateToken(player.id);
                const { password, ...playerOmitted } = player;
                res.json({
                    player: { authToken: token, ...playerOmitted },
                });
            } else {
                next(createError.Unauthorized("Username or password is incorrect"));
            }
        })
        .catch(() => {
            next(createError.Unauthorized("Username or password is incorrect"));
        });
};

const requestPasswordResetHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const player = await findPlayerByUsernameOrEmail(req.body.username);
        if (!player) {
            return next(createError.BadRequest("Username or email not found"));
        }

        await requestPasswordReset(player);

        res.json({ email: player.email });
    } catch (error: any) {
        console.error("Error in requestPasswordResetHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const passwordResetHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { playerId, token, newPassword } = req.body;
        if (!playerId || !token || !newPassword) {
            return next(createError.BadRequest("Invalid request"));
        }

        const success = await resetPassword(playerId, token, newPassword);
        if (!success) {
            return next(createError.BadRequest("Invalid token"));
        }

        res.json({});
    } catch (error: any) {
        console.error("Error in passwordResetHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const getPlayerNamesHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant;
    try {
        const gameService = getGameService(gameVariant);
        const qualifiedPlayers = await gameService.getQualifiedPlayers();
        const playerNames = qualifiedPlayers.map((player) => player.username);
        res.json({ playerNames });
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
    }
};

const getPlayerLeaderboardHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant;
    try {
        const season = await getCurrentSeason();
        const gameService = getGameService(gameVariant);
        const playerElos = await gameService.getAllPlayerElos(season.id);
        playerElos.forEach((playerElo) => {
            playerElo.elo = Number(playerElo.elo) + STARTING_ELO;
            playerElo.gameCount = Number(playerElo.gameCount);
        });

        res.json({ players: playerElos });
    } catch (error: any) {
        console.error("Error in submitGameHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const getCurrentPlayerHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = generateToken(req.player.id);
    const { password, ...playerOmitted } = req.player;
    res.json({
        player: { authToken: token, ...playerOmitted },
    });
};

const updateSettingsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    updatePlayer(req.player.id, req.body.settings)
        .then((player) => {
            const { password, ...playerOmitted } = player;
            res.json({ ...playerOmitted });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

export {
    registerHandler,
    loginHandler,
    requestPasswordResetHandler,
    passwordResetHandler,
    getPlayerNamesHandler,
    getPlayerLeaderboardHandler,
    getCurrentPlayerHandler,
    updateSettingsHandler,
};
