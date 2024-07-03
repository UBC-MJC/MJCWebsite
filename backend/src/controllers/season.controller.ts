import { NextFunction, Request, Response } from "express";
import { findAllSeasons, getCurrentSeason } from "../services/season.service";
import createError from "http-errors";

const getCurrentSeasonHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const season = await getCurrentSeason();

        res.status(200).json({
            id: season.id,
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
        });
    } catch (error: any) {
        next(createError.InternalServerError(error.message));
    }
};

const getSeasonsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    findAllSeasons()
        .then((seasons) => res.json(seasons))
        .catch((err: any) => {
            next(createError.InternalServerError(err.message));
        });
};

export { getCurrentSeasonHandler, getSeasonsHandler };
