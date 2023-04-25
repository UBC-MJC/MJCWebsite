import {NextFunction, Request, Response} from "express";
import {findAllPlayers} from "../services/player.service";
import createError from "http-errors";
import {createSeason, getAllSeasons, getCurrentSeason} from "../services/season.service";
import {makeDummyAdmins} from "../services/admin.service";
import {Season} from "@prisma/client";

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
        let currentSeason: Season | undefined = undefined

        for (let i = 0; i < seasons.length; i++) {
            if (seasons[i].endDate === null) {
                currentSeason = seasons[i]
                seasons.splice(i, 1)
                break
            }
        }

        res.json({
            currentSeason: currentSeason,
            pastSeasons: seasons
        })
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const addSeason = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    getCurrentSeason().then((season) => {
        next(createError.InternalServerError("Season already in progress"))
    }).catch((err: any) => {
        return
    }).then(() => {
        const {seasonName} = req.body
        if (!seasonName || typeof seasonName !== "string") {
            next(createError.BadRequest("Invalid season name"))
        }

        return createSeason(seasonName, new Date())
    }).then((season) => {
        res.json({season})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const makeTestAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    makeDummyAdmins().catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

export {getPlayers, getSeasons, addSeason, makeTestAdmins}
