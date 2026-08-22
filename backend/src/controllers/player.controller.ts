import { Request, Response } from "express";
import createError from "http-errors";
import {
    loginSchema,
    passwordResetSchema,
    registerSchema,
    requestPasswordResetSchema,
    updateSettingsSchema,
    updateUsernameSchema,
} from "../validation/player.validation";
import {
    createPlayer,
    findPlayerByUsernameOrEmail,
    requestPasswordReset,
    resetPassword,
    updatePlayer,
} from "../services/player.service";
import { addAuthCookieToResponse, generateToken } from "../middleware/jwt";
import bcrypt from "bcryptjs";
import { getCurrentSeason } from "../services/season.service";
import { STARTING_ELO } from "../services/game/game.util";
import { getGameService } from "../services/game/gameService.factory";
import { gameTypeSchema, gameVariantSchema } from "../validation/game.validation";

const isProduction = () => process.env.NODE_ENV === "production";

interface PlayerStatisticsParams {
    playerId: string;
    gameVariant: string;
    seasonId: string;
}

const registerHandler = async (req: Request, res: Response): Promise<void> => {
    const registerPlayerRequest = registerSchema.parse(req.body);
    const player = await createPlayer(registerPlayerRequest);
    const token = generateToken(player.id);
    const { password: _, ...playerOmitted } = player;

    // Set httpOnly cookie for security
    addAuthCookieToResponse(res, token, isProduction());

    res.json({
        player: playerOmitted,
    });
};

const loginHandler = async (req: Request, res: Response): Promise<void> => {
    const loginRequest = loginSchema.parse(req.body);
    const player = await findPlayerByUsernameOrEmail(loginRequest.username);

    if (!player || !bcrypt.compareSync(loginRequest.password, player.password)) {
        throw createError.Unauthorized("Username or password is incorrect");
    }

    const token = generateToken(player.id);
    const { password: _, ...playerOmitted } = player;

    // Set httpOnly cookie for security
    addAuthCookieToResponse(res, token, isProduction());

    res.json({
        player: playerOmitted,
    });
};

const requestPasswordResetHandler = async (req: Request, res: Response): Promise<void> => {
    const { username } = requestPasswordResetSchema.parse(req.body);
    const player = await findPlayerByUsernameOrEmail(username);
    if (!player) {
        throw createError.BadRequest("Username or email not found");
    }

    const host = isProduction() ? "https://" + req.headers.host : "http://localhost:3000";
    await requestPasswordReset(player, host);

    res.json({ email: player.email });
};

const passwordResetHandler = async (req: Request, res: Response): Promise<void> => {
    const { playerId, token, newPassword } = passwordResetSchema.parse(req.body);

    const success = await resetPassword(playerId, token, newPassword);
    if (!success) {
        throw createError.BadRequest("Invalid token");
    }

    res.json({});
};

const getQualifiedPlayersHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameType = gameTypeSchema.parse(req.params.gameType);
    const gameService = getGameService(gameVariant);
    const qualifiedPlayers = await gameService.getQualifiedPlayers(gameType);
    const players = qualifiedPlayers.map((player) => {
        return {
            playerId: player.id,
            username: player.username,
        };
    });
    res.json(players);
};

const getPlayerLeaderboardHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameType = gameTypeSchema.parse(req.params.gameType);
    let seasonId: string;
    if (typeof req.query.seasonId === "string" && req.query.seasonId.length > 0) {
        seasonId = req.query.seasonId;
    } else {
        if (typeof req.query.seasonId !== "undefined") {
            throw createError.BadRequest("Invalid season id");
        }
        const season = await getCurrentSeason();
        seasonId = season.id;
    }

    const gameService = getGameService(gameVariant);
    const playerElos = await gameService.getAllPlayerElos(seasonId, gameType);
    playerElos.forEach((playerElo) => {
        playerElo.elo = Number(playerElo.elo) + STARTING_ELO;
        playerElo.gameCount = Number(playerElo.gameCount);
    });

    res.json({ players: playerElos });
};

const getCurrentPlayerHandler = (req: Request, res: Response) => {
    const token = generateToken(req.player.id);
    const { password: _, ...playerOmitted } = req.player;
    res.json({
        player: { authToken: token, ...playerOmitted },
    });
};

const updateSettingsHandler = async (req: Request, res: Response): Promise<void> => {
    const { settings } = updateSettingsSchema.parse(req.body);
    const player = await updatePlayer(req.player.id, settings);
    const { password: _, ...playerOmitted } = player;
    res.json({ ...playerOmitted });
};

const updateUsernameHandler = async (req: Request, res: Response): Promise<void> => {
    const { username } = updateUsernameSchema.parse(req.body);
    const player = await updatePlayer(req.player.id, { username });
    const { password: _, ...playerOmitted } = player;
    res.json({ ...playerOmitted });
};

async function getUserStatisticsHandler(
    req: Request<PlayerStatisticsParams>,
    res: Response,
): Promise<void> {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameService = getGameService(gameVariant);
    const playerId: string = req.params.playerId;
    const seasonId = req.params.seasonId === "all" ? "" : req.params.seasonId;
    const result = await gameService.getUserStatistics(seasonId, playerId);
    res.json(result);
}

async function getPlacementHistoryHandler(
    req: Request<PlayerStatisticsParams>,
    res: Response,
): Promise<void> {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameService = getGameService(gameVariant);
    const playerId: string = req.params.playerId;
    const seasonId = req.params.seasonId === "all" ? "" : req.params.seasonId;
    const result = await gameService.getPlacementHistory(seasonId, playerId);
    res.json(result);
}

const logoutHandler = (_req: Request, res: Response): void => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
};

export {
    registerHandler,
    loginHandler,
    logoutHandler,
    requestPasswordResetHandler,
    passwordResetHandler,
    getQualifiedPlayersHandler,
    getPlayerLeaderboardHandler,
    getCurrentPlayerHandler,
    updateSettingsHandler,
    updateUsernameHandler,
    getUserStatisticsHandler,
    getPlacementHistoryHandler,
};
