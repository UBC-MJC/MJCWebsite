import { NextFunction, Request, Response } from "express";
import { deletePlayer, findAllPlayers, updatePlayer } from "../services/player.service";
import createError from "http-errors";
import {
    createSeason,
    deleteSeason,
    updateSeason,
} from "../services/season.service";
import { makeDummyAdmins } from "../services/admin.service";
import { Season } from "@prisma/client";
import { playerSchema, PlayerType } from "../validation/player.validation";
import {
    createSeasonSchema,
    CreateSeasonType,
    updateSeasonSchema,
    UpdateSeasonType,
} from "../validation/season.validation";
import prisma from "../db";

const getPlayersHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    findAllPlayers()
        .then((players) => {
            const playersCleaned = players.map((player) => {
                const { password, ...playerOmitted } = player;
                return playerOmitted;
            });
            res.json({ players: playersCleaned });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

const updatePlayerHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        next(createError.BadRequest("Invalid player id"));
    }

    playerSchema
        .validate(req.body.player)
        .then((player: PlayerType) => updatePlayer(id, player))
        .then((player) => {
            const { password, ...playerOmitted } = player;
            res.json({ ...playerOmitted });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

const deletePlayerHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        next(createError.BadRequest("Invalid player id"));
    }

    deletePlayer(id)
        .then((player) => {
            res.json({ ...player });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

// nested promises are ugly, someone smarter than me should fix this
const createSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const season: CreateSeasonType = await createSeasonSchema.validate(req.body.season);
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        if (endDate < new Date()) {
            next(createError.InternalServerError("End date must be in the future"));
            return;
        }
        res.json(createSeason(season.name, season.type, startDate, endDate));
    } catch (error: any) {
        next(createError.InternalServerError(error.message));
    }
};

const updateSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        return next(createError.BadRequest("Invalid season id"));
    }

    updateSeasonSchema
        .validate(req.body.season)
        .then((season: UpdateSeasonType) => {
            const updateSeasonObject: Season = {
                id: id,
                name: season.name,
                startDate: new Date(season.startDate),
                endDate: new Date(season.endDate),
            };
            return updateSeason(updateSeasonObject);
        })
        .then((season) => {
            res.json({ ...season });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

const deleteSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        return next(createError.BadRequest("Invalid season id"));
    }

    deleteSeason(id)
        .then((season) => {
            res.json({ ...season });
        })
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

const makeTestAdminsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    makeDummyAdmins().catch((err: any) => {
        next(createError.InternalServerError(err.message));
    });
};

async function removeQualificationHandler(req: Request, res: Response, next: NextFunction) {
    const result = await prisma.player.updateMany({
        data: {
            japaneseQualified: false,
            hongKongQualified: false,
        },
    });
    res.json(result);
}

export {
    getPlayersHandler,
    updatePlayerHandler,
    deletePlayerHandler,
    createSeasonHandler,
    updateSeasonHandler,
    deleteSeasonHandler,
    makeTestAdminsHandler,
    removeQualificationHandler,
};
