import { Request, Response } from "express";
import { findAllSeasons, findCurrentSeason } from "../services/season.service";
import createError from "http-errors";

const getCurrentSeasonHandler = async (_req: Request, res: Response): Promise<void> => {
    const season = await findCurrentSeason();
    if (!season) {
        throw createError.NotFound("No season in progress");
    }

    res.status(200).json({
        id: season.id,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
    });
};

const getSeasonsHandler = async (_req: Request, res: Response): Promise<void> => {
    const seasons = await findAllSeasons();
    res.json(seasons);
};

export { getCurrentSeasonHandler, getSeasonsHandler };
