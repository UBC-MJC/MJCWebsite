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
import { GameVariant, getGameService, STARTING_ELO } from "../services/game/game.util";
import { GameType } from "@prisma/client";

const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const registerPlayerRequest = registerSchema.parse(req.body);
    try {
        const player = await createPlayer(registerPlayerRequest);

        if (!player) {
            throw new Error("Error creating player");
        }
        const token = generateToken(player.id);
        const { password: _, ...playerOmitted } = player;
        res.json({
            player: { authToken: token, ...playerOmitted },
        });
    } catch (err: any) {
        next(createError.BadRequest(err.message));
    }
};

const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const registerPlayerRequest = loginSchema.parse(req.body);
    try {
        const player = await findPlayerByUsernameOrEmail(registerPlayerRequest.username);
        if (player && bcrypt.compareSync(req.body.password, player.password)) {
            const token = generateToken(player.id);
            const { password, ...playerOmitted } = player;
            res.json({
                player: { authToken: token, ...playerOmitted },
            });
        } else {
            next(createError.Unauthorized("Username or password is incorrect"));
        }
    } catch (err: any) {
        next(createError.Unauthorized("Username or password is incorrect"));
    }
};

const requestPasswordResetHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const player = await findPlayerByUsernameOrEmail(req.body.username);
        if (!player) {
            next(createError.BadRequest("Username or email not found"));
            return;
        }

        const host =
            process.env.NODE_ENV === "production"
                ? "https://" + req.headers.host
                : "http://localhost:3000";
        await requestPasswordReset(player, host);

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
    const { playerId, token, newPassword } = req.body;
    if (!playerId || !token || !newPassword) {
        return next(createError.BadRequest("Invalid request"));
    }
    try {
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

const getQualifiedPlayersHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    try {
        const gameService = getGameService(gameVariant);
        const qualifiedPlayers = await gameService.getQualifiedPlayers(
            req.params.gameType as GameType,
        );
        const players = qualifiedPlayers.map((player) => {
            return {
                playerId: player.id,
                username: player.username,
            };
        });
        res.json(players);
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
    }
};

const getPlayerLeaderboardHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    try {
        let seasonId: string;
        if (typeof req.query.seasonId !== "undefined") {
            seasonId = req.query.seasonId as string;
        } else {
            const season = await getCurrentSeason();
            seasonId = season.id;
        }

        const gameService = getGameService(gameVariant);
        const playerElos = await gameService.getAllPlayerElos(
            seasonId,
            req.params.gameType as GameType,
        );
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

const updateUsernameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    updatePlayer(req.player.id, { username: req.body.username })
        .then((player) => {
            const { password, ...playerOmitted } = player;
            res.json({ ...playerOmitted });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

async function getUserStatisticsHandler(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameService = getGameService(gameVariant);
    const playerId: string = req.params.playerId;
    const seasonId: string = req.params.seasonId;
    const result = await gameService.getUserStatistics(seasonId, playerId);
    res.json(result);
}

export {
    registerHandler,
    loginHandler,
    requestPasswordResetHandler,
    passwordResetHandler,
    getQualifiedPlayersHandler,
    getPlayerLeaderboardHandler,
    getCurrentPlayerHandler,
    updateSettingsHandler,
    updateUsernameHandler,
    getUserStatisticsHandler,
};
