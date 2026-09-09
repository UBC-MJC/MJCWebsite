import { Request, Response } from "express";
import createError from "http-errors";
import {
    createGameSchema,
    gameIdSchema,
    gameVariantSchema,
    setChomboSchema,
} from "../validation/game.validation";
import { seasonIdSchema } from "../validation/season.validation";
import { findSeason } from "../services/season.service";
import { GameFilterArgs } from "../services/game/game.util";
import { createRoundForVariant, getGameService } from "../services/game/gameService.factory";
import { addGameListener, sendGameUpdate } from "../services/game/liveGame.service";
import { GameStatus } from "@prisma/client";

const getGamesHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameService = getGameService(gameVariant);

    const query: GameFilterArgs = {
        seasonId: req.query.seasonId?.toString(),
        playerIds:
            req.query.playerIds === "" || typeof req.query.playerIds === "undefined"
                ? undefined
                : req.query.playerIds.toString().split(","),
        gameStatus: GameStatus.FINISHED,
    };

    const games = await gameService.getGames(query);
    const result = await Promise.all(games.map((game) => gameService.mapGameObject(game)));
    res.status(200).json(result);
};

const respondWithGame = async (
    req: Request,
    res: Response,
    addListener: boolean,
): Promise<void> => {
    const id = gameIdSchema.parse(req.params.id);
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);

    const gameService = getGameService(gameVariant);
    const newGame = await gameService.getGame(id);
    if (!newGame) {
        throw createError.NotFound("Game not found");
    }

    const gameResult = await gameService.mapGameObject(newGame);

    if (addListener) {
        addGameListener(req, res, gameResult, gameVariant);
    } else {
        res.status(200).json(gameResult);
    }
};

const getGameHandler = (req: Request, res: Response): Promise<void> =>
    respondWithGame(req, res, false);

const getLiveGameHandler = (req: Request, res: Response): Promise<void> =>
    respondWithGame(req, res, true);

const getLiveGamesHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameService = getGameService(gameVariant);
    const filter: GameFilterArgs = {
        gameStatus: GameStatus.IN_PROGRESS,
    };
    const liveGames = await gameService.getGames(filter);
    const result = await Promise.all(liveGames.map((game) => gameService.mapGameObject(game)));
    res.status(200).json(result);
};

const createGameHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const { players, seasonId } = createGameSchema.parse(req.body);
    const season = await findSeason(seasonId);
    const now = new Date();
    if (!season || season.startDate > now || season.endDate <= now) {
        throw createError.BadRequest("Season is not active");
    }

    const gameService = getGameService(gameVariant);
    const newGame = await gameService.createGame(season, players, req.player.id);

    res.status(201).json({
        id: newGame.id,
    });
};

const deleteGameHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameId = gameIdSchema.parse(req.params.id);

    const gameService = getGameService(gameVariant);
    const game = await gameService.getGame(gameId);
    if (!game) {
        throw createError.NotFound("Game not found");
    } else if (game.status !== GameStatus.IN_PROGRESS) {
        throw createError.BadRequest("Game is not in progress");
    } else if (game.recordedById !== req.player.id && !req.player.admin) {
        throw createError.Forbidden("You are not the recorder of this game");
    }

    await gameService.deleteGame(gameId);
    res.status(201).json({});
};

const submitGameHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameId = gameIdSchema.parse(req.params.id);

    const gameService = getGameService(gameVariant);
    const game = await gameService.getGame(gameId);
    if (!game) {
        throw createError.NotFound("Game not found");
    } else if (game.status !== GameStatus.IN_PROGRESS) {
        throw createError.BadRequest("Game is not in progress");
    } else if (game.recordedById !== req.player.id) {
        throw createError.Forbidden("You are not the recorder of this game");
    }

    await gameService.submitGame(game);
    res.status(201).json({});
};

const createRoundHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameId = gameIdSchema.parse(req.params.id);
    const roundRequest: unknown = req.body?.roundRequest;

    const gameService = getGameService(gameVariant);
    const game = await gameService.getGame(gameId);
    if (!game) {
        throw createError.NotFound("Game not found");
    } else if (game.status !== GameStatus.IN_PROGRESS) {
        throw createError.BadRequest("Game is not in progress");
    } else if (game.recordedById !== req.player.id) {
        throw createError.Forbidden("You are not the recorder of this game");
    }

    await createRoundForVariant(gameVariant, game, roundRequest);

    const updatedGame = await gameService.getGameOrThrow(gameId);
    const gameResult = await gameService.mapGameObject(updatedGame);
    res.status(201).json(gameResult);
    sendGameUpdate(gameResult, gameVariant);
};

const deleteLastRoundHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const gameId = gameIdSchema.parse(req.params.id);

    const gameService = getGameService(gameVariant);
    const game = await gameService.getGame(gameId);
    if (!game) {
        throw createError.NotFound("Game not found");
    } else if (game.status !== GameStatus.IN_PROGRESS) {
        throw createError.BadRequest("Game is not in progress");
    } else if (game.recordedById !== req.player.id) {
        throw createError.Forbidden("You are not the recorder of this game");
    }
    if (game.rounds.length === 0) {
        throw createError.BadRequest("Game has no rounds");
    }

    await gameService.deleteRound(game.rounds[game.rounds.length - 1].id);
    const updatedGame = await gameService.getGameOrThrow(gameId);
    const gameResult = await gameService.mapGameObject(updatedGame);
    res.status(201).json(gameResult);
    sendGameUpdate(gameResult, gameVariant);
};

const recalcSeasonHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const seasonId = seasonIdSchema.parse(req.params.seasonId);
    const gameService = getGameService(gameVariant);
    const newEloStats = await gameService.recalcSeason(seasonId);
    res.status(201).json(newEloStats);
};

const setChomboHandler = async (req: Request, res: Response): Promise<void> => {
    const gameVariant = gameVariantSchema.parse(req.params.gameVariant);
    const { playerId, chomboCount } = setChomboSchema.parse(req.body);
    const gameId = gameIdSchema.parse(req.params.id);
    const gameService = getGameService(gameVariant);
    const result = await gameService.setChombo(gameId, playerId, chomboCount);
    res.status(201).json(result);
};
export {
    getGamesHandler,
    getGameHandler,
    getLiveGameHandler,
    createGameHandler,
    getLiveGamesHandler,
    deleteGameHandler,
    submitGameHandler,
    createRoundHandler,
    deleteLastRoundHandler,
    recalcSeasonHandler,
    setChomboHandler,
};
