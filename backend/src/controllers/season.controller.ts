import {NextFunction, Request, Response} from "express";
import {getCurrentSeason} from "../services/season.service";
import createError from "http-errors";

const getCurrentSeasonHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const season = await getCurrentSeason();

        res.status(200).json({
            id: season.id,
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
        })
    } catch (error: any) {
        next(createError.InternalServerError(error.message))
    }
}

export {getCurrentSeasonHandler}
