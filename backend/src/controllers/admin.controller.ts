import {NextFunction, Request, Response} from "express";
import {findAllPlayers} from "../services/player.service";
import createError from "http-errors";
import {createSeason, findAllSeasons, getCurrentSeason} from "../services/season.service";
import {makeDummyAdmins, deletePlayer, updatePlayer} from "../services/admin.service";
import {Season} from "@prisma/client";
import {playerSchema, PlayerType} from "../validation/player.validation";

const getPlayersHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

const updatePlayerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {id} = req.params
    if (!id) {
        next(createError.BadRequest("Invalid player id"))
    }

    playerSchema.validate(req.body.player).then((player: PlayerType) =>
        updatePlayer(id, player)
    ).then((player) => {
        const {password, ...playerOmitted} = player;
        res.json({player: playerOmitted})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const deletePlayerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {id} = req.params
    if (!id) {
        next(createError.BadRequest("Invalid player id"))
    }

    deletePlayer(id).then((player) => {
        res.json({player: player})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const getSeasonsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    findAllSeasons().then((seasons) => {
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

const createSeasonHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    getCurrentSeason().then((season) => {
        next(createError.InternalServerError("Season already in progress"))
    }).catch((err: any) => {
        const {seasonName} = req.body
        if (!seasonName || typeof seasonName !== "string") {
            next(createError.BadRequest("Invalid season name"))
        }

        createSeason(seasonName, new Date()).then((season) => {
            res.json({season})
        }).catch((err: any) => {
            next(createError.InternalServerError(err.message))
        })
    })
}

const makeTestAdminsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    makeDummyAdmins().catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

export {getPlayersHandler, updatePlayerHandler, deletePlayerHandler, getSeasonsHandler, createSeasonHandler, makeTestAdminsHandler}
