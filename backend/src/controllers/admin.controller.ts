import {NextFunction, Request, Response} from "express";
import {findAllPlayers} from "../services/player.service";
import createError from "http-errors";
import {getAllSeasons} from "../services/season.service";
import {makeDummyAdmins} from "../services/admin.service";

const getPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    findAllPlayers({}).then((players) => {
        const playersCleaned = players.map((player) => {
            const {password, ...playerOmitted} = player;
            return playerOmitted
        })
        res.json({players: playersCleaned})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const getSeasons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    getAllSeasons().then((seasons) => {
        res.json({seasons})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const addSeason = async (req: Request, res: Response): Promise<void> => {

}

const makeTestAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    makeDummyAdmins().catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

export {getPlayers, getSeasons, addSeason, makeTestAdmins}
