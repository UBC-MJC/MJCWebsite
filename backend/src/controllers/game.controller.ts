import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { createGameSchema } from "../validation/game.validation";
import { getCurrentSeason } from "../services/season.service";
import { GameFilterArgs, GameVariant, getGameService } from "../services/game/game.util";
import { addGameListener, sendGameUpdate } from "../services/game/liveGame.service";
import { GameStatus, GameType } from "@prisma/client";

const getGamesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const gameVariant = req.params.gameVariant as GameVariant;
        const gameService = getGameService(gameVariant);

        const query: GameFilterArgs = {
            seasonId: req.query.seasonId?.toString(),
            playerIds:
                req.query.playerIds === "" || typeof req.query.playerIds === "undefined"
                    ? undefined
                    : req.query.playerIds.toString().split(","),
            gameType: GameType.RANKED,
            gameStatus: GameStatus.FINISHED,
        };

        const games = await gameService.getGames(query);
        const result = await Promise.all(games.map((game) => gameService.mapGameObject(game)));
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error in getGamesHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const getGameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
    addListener = false,
): Promise<void> => {
    const id = Number(req.params.id);
    const gameVariant = req.params.gameVariant as GameVariant;
    if (isNaN(id)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService = getGameService(gameVariant);

    try {
        const newGame = await gameService.getGame(id);
        if (!newGame) {
            return next(createError.NotFound("Game not found"));
        }

        const gameResult = await gameService.mapGameObject(newGame);

        if (addListener) {
            addGameListener(req, res, gameResult, gameVariant);
        } else {
            res.status(200).json(gameResult);
        }
    } catch (error: any) {
        console.error("Error in getGameHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const getLiveGamesHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameService = getGameService(gameVariant);
    try {
        const filter: GameFilterArgs = {
            gameStatus: GameStatus.IN_PROGRESS,
        };
        const liveGames = await gameService.getGames(filter);
        const result = await Promise.all(liveGames.map((game) => gameService.mapGameObject(game)));
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error in getLiveGamesHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const createGameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;

    try {
        const { players, gameType } = createGameSchema.parse(req.body);
        const season = await getCurrentSeason();

        const gameService = getGameService(gameVariant);
        const newGame = await gameService.createGame(gameType, players, req.player.id, season.id);

        res.status(201).json({
            id: newGame.id,
        });
    } catch (error: any) {
        next(createError.BadRequest(error.message));
    }
};

const deleteGameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== GameStatus.IN_PROGRESS) {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id && !req.player.admin) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        }

        await gameService.deleteGame(gameId);
        res.status(201).json({});
    } catch (error: any) {
        console.error("Error in deleteGameHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

const submitGameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== GameStatus.IN_PROGRESS) {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        }

        await gameService.submitGame(game);
        res.status(201).json({});
    } catch (error: any) {
        console.error("Error in submitGameHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

const createRoundHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }
    const { roundRequest } = req.body;

    const gameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== GameStatus.IN_PROGRESS) {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        }

        await gameService.createRound(game, roundRequest);
        const updatedGame = await gameService.getGame(gameId);
        const gameResult = await gameService.mapGameObject(updatedGame);
        res.status(201).json(gameResult);
        sendGameUpdate(gameResult, gameVariant);
    } catch (error: any) {
        console.error("Error in createRoundHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

const deleteLastRoundHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== GameStatus.IN_PROGRESS) {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        }
        if (game.rounds.length === 0) {
            return next(createError.BadRequest("Game has no rounds"));
        }

        await gameService.deleteRound(game.rounds[game.rounds.length - 1].id);
        const updatedGame = await gameService.getGame(gameId);
        const gameResult = await gameService.mapGameObject(updatedGame);
        res.status(201).json(gameResult);
        sendGameUpdate(gameResult, gameVariant);
    } catch (error: any) {
        console.error("Error in deleteLastRoundHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

const recalcSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    try {
        const seasonId = await getCurrentSeason();
        const gameService = getGameService(gameVariant);
        const newEloStats = await gameService.recalcSeason(seasonId.id);
        res.status(201).json(newEloStats);
    } catch (error: any) {
        console.error("Error in recalcAllHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

const setChomboHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const gameVariant = req.params.gameVariant as GameVariant;
    const { playerId, chomboCount } = req.body;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }
    try {
        const gameService = getGameService(gameVariant);
        const result = await gameService.setChombo(gameId, playerId, chomboCount);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error in setChomboHandler:", error);
        next(createError.BadRequest(error.message));
    }
};
export {
    getGamesHandler,
    getGameHandler,
    createGameHandler,
    getLiveGamesHandler,
    deleteGameHandler,
    submitGameHandler,
    createRoundHandler,
    deleteLastRoundHandler,
    recalcSeasonHandler,
    setChomboHandler,
};
