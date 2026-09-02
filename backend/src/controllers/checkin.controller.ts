import { Request, Response } from "express";
import { checkInPlayer, checkOutPlayer, getCheckedInPlayers, getStatus } from "../services/checkin.service";

const checkInHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
        const player = await checkInPlayer(req.player.id);

        res.json({
            checkedInAt: player.checkedInAt,
        });
};

const checkOutHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
        const player = await checkOutPlayer(req.player.id);

        res.json({
            checkedInAt: player.checkedInAt,
        });
};

const getStatusHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
        const player = await getStatus(req.player.id);

        res.json({
            checkedInAt: player?.checkedInAt ?? null,
        });
};

const getCheckedInPlayersHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
        const players = await getCheckedInPlayers();

        res.json({
            players,
        });
};

export {
    checkInHandler,
    checkOutHandler,
    getStatusHandler,
    getCheckedInPlayersHandler
}