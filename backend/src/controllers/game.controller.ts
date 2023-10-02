import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { createGameSchema, validateRound } from "../validation/game.validation";
import { getCurrentSeason } from "../services/season.service";
import { generatePlayerQuery, getGameService } from "../services/game/game.util";
import GameService from "../services/game/game.service";

const getGamesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.status(200).json({});
    } catch (error: any) {
        console.error("Error in getGamesHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const getGameHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const gameVariant = req.params.gameVariant;
    if (isNaN(id)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService: GameService = getGameService(gameVariant);

    try {
        const newGame = await gameService.getGame(id);
        if (!newGame) {
            return next(createError.NotFound("Game not found"));
        }

        const result = gameService.mapGameObject(newGame);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error in getGameHandler:", error);
        next(createError.InternalServerError(error.message));
    }
};

const createGameHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const gameVariant: string = req.params.gameVariant;

    try {
        const { players, gameType } = await createGameSchema.validate(req.body);

        const playersQuery = await generatePlayerQuery(gameVariant, players);
        const season = await getCurrentSeason();

        const gameService: GameService = getGameService(gameVariant);
        const newGame = await gameService.createGame(
            gameType,
            playersQuery,
            req.player.id,
            season.id,
        );

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
    const gameVariant: string = req.params.gameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService: GameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== "IN_PROGRESS") {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id) {
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
    const gameVariant: string = req.params.gameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService: GameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== "IN_PROGRESS") {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        } else if (!gameService.isGameOver(game)) {
            return next(createError.BadRequest("Game is not over yet"));
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
    const gameVariant: string = req.params.gameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }
    const { roundRequest } = req.body;

    const gameService: GameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== "IN_PROGRESS") {
            return next(createError.BadRequest("Game is not in progress"));
        }
        validateRound(roundRequest, game, gameVariant);
        if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        } else if (gameService.isGameOver(game)) {
            return next(createError.BadRequest("Game is already over"));
        }

        await gameService.createRound(game, roundRequest);
        const updatedGame = await gameService.getGame(gameId);
        res.status(201).json(gameService.mapGameObject(updatedGame));
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
    const gameVariant: string = req.params.gameVariant;
    const gameId = Number(req.params.id);
    if (isNaN(gameId)) {
        return next(createError.NotFound("Game id is not a number"));
    }

    const gameService: GameService = getGameService(gameVariant);
    try {
        const game = await gameService.getGame(gameId);
        if (!game) {
            return next(createError.NotFound("Game not found"));
        } else if (game.status !== "IN_PROGRESS") {
            return next(createError.BadRequest("Game is not in progress"));
        } else if (game.rounds.length === 0) {
            return next(createError.BadRequest("Game has no rounds"));
        } else if (game.recordedById !== req.player.id) {
            return next(createError.Forbidden("You are not the recorder of this game"));
        }

        await gameService.deleteRound(game.rounds[game.rounds.length - 1].id);
        const updatedGame = await gameService.getGame(gameId);
        res.status(201).json(gameService.mapGameObject(updatedGame));
    } catch (error: any) {
        console.error("Error in deleteLastRoundHandler:", error);
        next(createError.BadRequest(error.message));
    }
};

export {
    getGamesHandler,
    getGameHandler,
    createGameHandler,
    deleteGameHandler,
    submitGameHandler,
    createRoundHandler,
    deleteLastRoundHandler,
};
