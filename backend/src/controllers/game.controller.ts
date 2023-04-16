import {NextFunction, Request, Response} from "express"
import createError from "http-errors";
import {createGameSchema, CreateGameType} from "../validation/game.validation";
import {checkPlayerGameEligibility, createGameService} from "../services/game.service";
import {Game} from "@prisma/client";
import {findPlayerByUsernames} from "../services/player.service";

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
        const createGame: CreateGameType = await createGameSchema.validate(req.body)

        checkPlayerGameEligibility(createGame.gameType, req.player)
        const playerList = await findPlayerByUsernames(createGame.players);
        playerList.forEach((player) => checkPlayerGameEligibility(createGame.gameType, player))

        const newGame: Game = await createGameService(createGame.gameType, playerList.map((player) => {
            return {id: player.id}
        }))
        res.status(201).json({
            gameId: newGame.id
        })
    } catch (error: any) {
        next(createError.BadRequest(error.message))
    }
}

export {getGames, getGame, createGame}
