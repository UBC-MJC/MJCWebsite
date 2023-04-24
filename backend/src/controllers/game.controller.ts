import {NextFunction, Request, Response} from "express"
import createError from "http-errors";
import {createGameSchema, CreateGameType} from "../validation/game.validation";
import {checkPlayerGameEligibility, addGame, checkPlayerListUnique} from "../services/game.service";
import {Game, Player} from "@prisma/client";
import {findPlayerByUsernames} from "../services/player.service";
import {getCurrentSeason} from "../services/season.service";

const getGames = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({})
    } catch (error) {
        throw error
    }
}

const getGame = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({})
    } catch (error) {
        throw error
    }
}

const createGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const createGameObject: CreateGameType = await createGameSchema.validate(req.body)

        checkPlayerListUnique(createGameObject.players)
        checkPlayerGameEligibility(createGameObject.gameVariant, req.player)
        const playerList = await findPlayerByUsernames(createGameObject.players);
        playerList.forEach((player) => checkPlayerGameEligibility(createGameObject.gameVariant, player))
        const playersQuery = playerList.map((player: Player, index) => {
            return {
                wind: getWind(createGameObject.players.indexOf(player.username)),
                player: {
                    connect: {
                        id: player.id
                    }
                }
            }
        })

        const season = await getCurrentSeason();

        const newGame: Game = await addGame(createGameObject, playersQuery, req.player.id, season.id)

        res.status(201).json({
            gameId: newGame.id,
            rounds: [{
                roundCount: 1,
                roundNumber: 1,
                roundWind: "EAST"
            }]
        })
    } catch (error: any) {
        next(createError.BadRequest(error.message))
    }
}

const getWind = (index: number): string => {
    switch (index) {
        case 0:
            return "EAST"
        case 1:
            return "SOUTH"
        case 2:
            return "WEST"
        case 3:
            return "NORTH"
        default:
            return "NONE"
    }
}

export {getGames, getGame, createGame}
