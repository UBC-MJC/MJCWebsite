import { NextFunction, Request, Response } from "express";
import { findAllSeasons, getCurrentSeasons } from "../services/season.service";
import createError from "http-errors";

const getCurrentSeasonsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const seasons = await getCurrentSeasons();
        res.status(200).json(seasons);
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

export { getCurrentSeasonsHandler, getSeasonsHandler };
