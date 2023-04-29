import {NextFunction, Request, Response} from "express";
import {deletePlayer, findAllPlayers, updatePlayer} from "../services/player.service";
import createError from "http-errors";
import {createSeason, deleteSeason, findAllSeasons, getCurrentSeason, updateSeason} from "../services/season.service";
import {makeDummyAdmins} from "../services/admin.service";
import {Season} from "@prisma/client";
import {playerSchema, PlayerType} from "../validation/player.validation";
import {
    createSeasonSchema,
    CreateSeasonType,
    updateSeasonSchema,
    UpdateSeasonType
} from "../validation/season.validation";

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
        res.json({...playerOmitted})
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
        res.json({...player})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const getSeasonsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    findAllSeasons().then((seasons) => {
        let currentSeason: Season | undefined = undefined
        if (seasons.length !== 0 && seasons[0].endDate > new Date) {
            currentSeason = seasons[0]
            seasons.splice(0, 1)
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
    getCurrentSeason().then(() => {
        next(createError.InternalServerError("Season already in progress"))
    }).catch(() => {
        createSeasonSchema.validate(req.body.season).then((season: CreateSeasonType) => {
            const startDate = new Date(season.startDate)

            const endDate = new Date(season.endDate)
            if (endDate < new Date()) {
                throw new Error("End date must be in the future")
            }

            return createSeason(season.name, startDate, endDate)
        }).then((season) => {
            res.json({...season})
        }).catch((err: any) => {
            next(createError.InternalServerError(err.message))
        })
    })
}

const updateSeasonHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {id} = req.params
    if (!id) {
        next(createError.BadRequest("Invalid season id"))
    }

    updateSeasonSchema.validate(req.body.season).then((season: UpdateSeasonType) => {
        const updateSeasonObject: Season = {
            id: id,
            name: season.name,
            startDate: new Date(season.startDate),
            endDate: new Date(season.endDate)
        }
        return updateSeason(updateSeasonObject)
    }).then((season) => {
        res.json({...season})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const deleteSeasonHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {id} = req.params
    if (!id) {
        next(createError.BadRequest("Invalid season id"))
    }

    deleteSeason(id).then((season) => {
        res.json({...season})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const makeTestAdminsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    makeDummyAdmins().catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

export {
    getPlayersHandler,
    updatePlayerHandler,
    deletePlayerHandler,
    getSeasonsHandler,
    createSeasonHandler,
    updateSeasonHandler,
    deleteSeasonHandler,
    makeTestAdminsHandler
}
