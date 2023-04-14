import {Request, Response} from "express"

const getGames = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({})
    } catch (error) {
        throw error
    }
}

const addGame = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(201).json({message: "Game added"})
    } catch (error) {
        throw error
    }
}

export {getGames, addGame}
