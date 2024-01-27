import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { loginSchema, registerSchema } from "../validation/player.validation";
import {
    createPlayer,
    findPlayerByUsername,
    findQualifiedPlayers,
    updatePlayer,
} from "../services/player.service";
import { generateToken } from "../middleware/jwt";
import bcrypt from "bcryptjs";
import { getAllPlayerElos } from "../services/leaderboard.service";
import { getCurrentSeason } from "../services/season.service";

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
        .then(() => findPlayerByUsername(req.body.username))
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

const getPlayerNamesHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant;

    findQualifiedPlayers(gameVariant)
        .then((players) => {
            const playerNames = players.map((player) => player.username);
            res.json({ playerNames });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

const getPlayerLeaderboardHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant;
    if (gameVariant !== "jp" && gameVariant !== "hk") {
        return next(createError.BadRequest("Invalid game variant"));
    }

    try {
        const season = await getCurrentSeason();
        const playerElos = await getAllPlayerElos(gameVariant, season.id);
        playerElos.forEach((playerElo) => {
            playerElo.elo = Number(playerElo.elo) + 1500;
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
    getPlayerNamesHandler,
    getPlayerLeaderboardHandler,
    getCurrentPlayerHandler,
    updateSettingsHandler,
};
