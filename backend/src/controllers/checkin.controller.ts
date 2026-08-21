import { NextFunction, Request, Response } from "express";
import { checkInPlayer, checkOutPlayer, getCheckedInPlayers, getStatus } from "../services/checkin.service";
import createError from "http-errors";

const checkInHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const player = await checkInPlayer(req.player.id);

        res.json({
            checkedInAt: player.checkedInAt,
        });
    } catch (err: any) {
        console.error("Error in checkInHandler:", err);
        next(createError.InternalServerError(err.message));
    }
};

const checkOutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const player = await checkOutPlayer(req.player.id);

        res.json({
            checkedInAt: player.checkedInAt,
        });
    } catch (err: any) {
        console.error("Error in checkOutHandler:", err);
        next(createError.InternalServerError(err.message));
    }
};

const getStatusHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const player = await getStatus(req.player.id);

        res.json({
            checkedInAt: player?.checkedInAt ?? null,
        });
    } catch (err: any) {
        console.error("Error in getStatusHandler:", err);
        next(createError.InternalServerError(err.message));
    }
};

const getCheckedInPlayersHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const players = await getCheckedInPlayers();

        res.json({
            players,
        });
    } catch (err: any) {
        console.error("Error in getCheckedInPlayersHandler:", err);
        next(createError.InternalServerError(err.message));
    }
};

export {
    checkInHandler,
    checkOutHandler,
    getStatusHandler,
    getCheckedInPlayersHandler
}