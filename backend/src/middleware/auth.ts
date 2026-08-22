import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { verifyToken } from "./jwt";
import { findPlayerById } from "../services/player.service";

const isAuthenticated = async (req: Request, _res: Response, next: NextFunction) => {
    // Try to get token from cookie first, then fall back to Authorization header for backward compatibility
    const token = req.cookies?.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw createError.Unauthorized("Invalid token");
    }

    const payloadId: string | undefined = verifyToken(token);
    if (typeof payloadId === "undefined") {
        throw createError.Unauthorized("Invalid token");
    }

    const player = await findPlayerById(payloadId);
    if (!player) {
        throw createError.Unauthorized("Invalid token");
    }

    req.player = player;
    next();
};

const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (req.player && req.player.admin) {
        next();
        return;
    }

    throw createError.Unauthorized("User is not an admin");
};

export { isAuthenticated, isAdmin };
