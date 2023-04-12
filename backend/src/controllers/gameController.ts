import {Request, Response} from "express"
import {IGame} from "../types/game"
import * as gameModel from "../models/gameModel";

const getGames = async (req: Request, res: Response): Promise<void> => {
    try {
        const games: IGame[] = await gameModel.readAll()
        res.status(200).json({games})
    } catch (error) {
        throw error
    }
}

const addGame = async (req: Request, res: Response): Promise<void> => {
    try {
        // const body = req.body as Pick<IGame, "name" | "description" | "status">
        const insertId = await gameModel.create()
        const allGames: IGame[] = await gameModel.readAll()
        res.status(201)
            .json({message: "Game added", insertId: insertId, games: allGames})
    } catch (error) {
        throw error
    }
}

export {getGames, addGame}
