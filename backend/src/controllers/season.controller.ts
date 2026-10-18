import { Request, Response } from "express";
import { findAllSeasons, getCurrentSeasons } from "../services/season.service";

const getCurrentSeasonsHandler = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(await getCurrentSeasons());
};

const getSeasonsHandler = async (_req: Request, res: Response): Promise<void> => {
    res.json(await findAllSeasons());
};

export { getCurrentSeasonsHandler, getSeasonsHandler };
