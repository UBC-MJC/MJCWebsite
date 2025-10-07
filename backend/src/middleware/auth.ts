import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { verifyToken } from "./jwt";
import { findPlayerById } from "../services/player.service";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // Try to get token from cookie first, then fall back to Authorization header for backward compatibility
    const token = req.cookies?.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(createError.Unauthorized("Invalid token"));
    }

    try {
        const payloadId: string | undefined = verifyToken(token);
        if (typeof payloadId === "undefined") {
            return next(createError.Unauthorized("Invalid token"));
        }

        findPlayerById(payloadId)
            .then((player) => {
                if (player) {
                    req.player = player;
                    return next();
                } else {
                    return next(createError.Unauthorized("Invalid token"));
                }
            })
            .catch((err) => {
                return next(createError.InternalServerError(err.message));
            });
    } catch (err) {
        return next(createError.Unauthorized());
    }
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.player && req.player.admin) {
        return next();
    } else {
        return next(createError.Unauthorized("User is not an admin"));
    }
};

export { isAuthenticated, isAdmin };
