import { Request, Response } from "express";
import { deletePlayer, findAllPlayers, updatePlayer } from "../services/player.service";
import createError from "http-errors";
import {
    createSeason,
    deleteSeason,
    findCurrentSeason,
    updateSeason,
} from "../services/season.service";
import { makeDummyAdmins } from "../services/admin.service";
import { playerSchema } from "../validation/player.validation";
import { createSeasonSchema, updateSeasonSchema } from "../validation/season.validation";
import prisma from "../db";
import { resetAllCheckIns } from "../services/checkin.service";

const requireStringParam = (value: unknown, errorMessage: string): string => {
    if (typeof value !== "string" || value.length === 0) {
        throw createError.BadRequest(errorMessage);
    }

    return value;
};

const getPlayersHandler = async (_req: Request, res: Response): Promise<void> => {
    const players = await findAllPlayers();
    const playersCleaned = players.map((player) => {
        const { password: _, ...playerOmitted } = player;
        return playerOmitted;
    });
    res.json({ players: playersCleaned });
};

const updatePlayerHandler = async (req: Request, res: Response): Promise<void> => {
    const id = requireStringParam(req.params.id, "Invalid player id");
    const player = playerSchema.parse(req.body?.player);
    const updatedPlayer = await updatePlayer(id, player);
    const { password: _, ...playerOmitted } = updatedPlayer;
    res.json(playerOmitted);
};

const deletePlayerHandler = async (req: Request, res: Response): Promise<void> => {
    const id = requireStringParam(req.params.id, "Invalid player id");
    const player = await deletePlayer(id);
    res.json({ ...player });
};

const createSeasonHandler = async (req: Request, res: Response): Promise<void> => {
    if (await findCurrentSeason()) {
        throw createError.Conflict("Season already in progress");
    }

    const season = createSeasonSchema.parse(req.body?.season);
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    if (endDate < new Date()) {
        throw createError.BadRequest("End date must be in the future");
    }

    const createdSeason = await createSeason(season.name, startDate, endDate);
    res.json({ ...createdSeason });
};

const updateSeasonHandler = async (req: Request, res: Response): Promise<void> => {
    const id = requireStringParam(req.params.id, "Invalid season id");
    const parsedSeason = updateSeasonSchema.parse(req.body?.season);
    const updateSeasonObject = {
        id,
        name: parsedSeason.name,
        startDate: new Date(parsedSeason.startDate),
        endDate: new Date(parsedSeason.endDate),
    };
    const updatedSeason = await updateSeason(updateSeasonObject);
    res.json(updatedSeason);
};

const deleteSeasonHandler = async (req: Request, res: Response): Promise<void> => {
    const id = requireStringParam(req.params.id, "Invalid season id");
    const season = await deleteSeason(id);
    res.json({ ...season });
};

const makeTestAdminsHandler = async (_req: Request, res: Response): Promise<void> => {
    await makeDummyAdmins();
    res.json({ message: "Test admins created successfully" });
};

async function removeQualificationHandler(_req: Request, res: Response): Promise<void> {
    const result = await prisma.player.updateMany({
        data: {
            japaneseQualified: false,
            hongKongQualified: false,
        },
    });
    res.json(result);
}

const resetAllCheckInsHandler = async (req: Request, res: Response): Promise<void> => {
    await resetAllCheckIns();
    res.json({ message: "All players have been checked out" });
};

export {
    getPlayersHandler,
    updatePlayerHandler,
    deletePlayerHandler,
    createSeasonHandler,
    updateSeasonHandler,
    deleteSeasonHandler,
    makeTestAdminsHandler,
    removeQualificationHandler,
    resetAllCheckInsHandler,
};
