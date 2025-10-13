import { NextFunction, Request, Response } from "express";
import { deletePlayer, findAllPlayers, updatePlayer } from "../services/player.service";
import createError from "http-errors";
import {
    createSeason,
    deleteSeason,
    getCurrentSeason,
    updateSeason,
} from "../services/season.service";
import { makeDummyAdmins } from "../services/admin.service";
import { Season } from "@prisma/client";
import { playerSchema } from "../validation/player.validation";
import { createSeasonSchema, updateSeasonSchema } from "../validation/season.validation";
import prisma from "../db";

const getPlayersHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const players = await findAllPlayers();
        const playersCleaned = players.map((player) => {
            const { password, ...playerOmitted } = player;
            return playerOmitted;
        });
        res.json({ players: playersCleaned });
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
    }
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
    try {
        const player = playerSchema.parse(req.body.player);
        const updatedPlayer = await updatePlayer(id, player);
        const { password: _, ...playerOmitted } = updatedPlayer;
        res.json(playerOmitted);
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
    }
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

    try {
        const player = await deletePlayer(id);
        res.json({ ...player });
    } catch (err) {
        next(createError.InternalServerError((err as Error).message));
    }
};

// nested promises are ugly, someone smarter than me should fix this
const createSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        await getCurrentSeason();
        next(createError.InternalServerError("Season already in progress"));
        return;
    } catch (_) {
        void 0;
    }
    try {
        const season = createSeasonSchema.parse(req.body.season);
        const startDate = new Date(season.startDate);
        const endDate = new Date(season.endDate);
        if (endDate < new Date()) {
            throw new Error("End date must be in the future");
        }
        const createdSeason = await createSeason(season.name, startDate, endDate);
        res.json({ ...createdSeason });
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
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
    try {
        const parsedSeason = updateSeasonSchema.parse(req.body.season);
        const updateSeasonObject = {
            id: id,
            name: parsedSeason.name,
            startDate: new Date(parsedSeason.startDate),
            endDate: new Date(parsedSeason.endDate),
        };
        res.json(updateSeason(updateSeasonObject));
    } catch (err: any) {
        next(createError.InternalServerError(err.message));
    }
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

    try {
        const season = await deleteSeason(id);
        res.json({ ...season });
    } catch (err) {
        next(createError.InternalServerError((err as Error).message));
    }
};

const makeTestAdminsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        await makeDummyAdmins();
        res.json({ message: "Test admins created successfully" });
    } catch (err) {
        next(createError.InternalServerError((err as Error).message));
    }
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
