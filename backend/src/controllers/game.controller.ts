import {NextFunction, Request, Response} from "express"
import createError from "http-errors";
import {createGameSchema} from "../validation/game.validation";
import {
    checkPlayerGameEligibility,
    createGame,
    checkPlayerListUnique,
    getDefaultRound,
    getWind, getGame
} from "../services/game.service";
import {Game, Player} from "@prisma/client";
import {findPlayerByUsernames} from "../services/player.service";
import {getCurrentSeason} from "../services/season.service";

const getGamesHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({})
    } catch (error) {
        throw error
    }
}

const getGameHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
        next(createError.NotFound("Game not found"))
        return
    }

    getGame(id).then((newGame) => {
        if (!newGame) {
            next(createError.NotFound("Game not found"))
            return
        }

        res.status(200).json({
            id: newGame.id,
            gameType: newGame.gameType,
            gameVariant: newGame.gameVariant,
            status: newGame.status,
            recordedById: newGame.recordedById,
            players: newGame.players,
            rounds: newGame.japaneseRounds || newGame.hongKongRounds
        })
    }).catch((err) => {
        next(createError.InternalServerError(err.message))
    })
}

const createGameHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {players, gameType, gameVariant} = await createGameSchema.validate(req.body)

        checkPlayerListUnique(players)
        checkPlayerGameEligibility(gameVariant, req.player)
        const playerList = await findPlayerByUsernames(players);
        playerList.forEach((player) => checkPlayerGameEligibility(gameVariant, player))
        const playersQuery = playerList.map((player: Player) => {
            return {
                wind: getWind(players.indexOf(player.username)),
                player: {
                    connect: {
                        id: player.id
                    }
                }
            }
        })

        const season = await getCurrentSeason();

        const defaultRoundQuery = getDefaultRound(gameVariant);

        const newGame: Game = await createGame(gameVariant, gameType, playersQuery, defaultRoundQuery, req.player.id, season.id)

        res.status(201).json({
            id: newGame.id
        })
    } catch (error: any) {
        next(createError.BadRequest(error.message))
    }
}

export {getGamesHandler, getGameHandler, createGameHandler}
