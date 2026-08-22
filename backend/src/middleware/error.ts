import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import createError from "http-errors";
import { ZodError } from "zod";
import { InvalidGameInputError, NoCurrentSeasonError } from "../errors/domain.error";

interface ErrorResponse {
    status: number;
    message: string;
}

const getErrorResponse = (error: unknown): ErrorResponse => {
    if (error instanceof ZodError || error instanceof InvalidGameInputError) {
        return { status: 400, message: error.message };
    }

    if (error instanceof NoCurrentSeasonError) {
        return { status: 404, message: error.message };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return { status: 409, message: "A record with these values already exists" };
        }
        if (error.code === "P2025") {
            return { status: 404, message: "Record not found" };
        }
    }

    if (createError.isHttpError(error)) {
        return {
            status: error.status,
            message: error.status >= 500 ? "Internal Server Error" : error.message,
        };
    }

    return { status: 500, message: "Internal Server Error" };
};

const errorHandler = (error: unknown, _req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        next(error);
        return;
    }

    const { status, message } = getErrorResponse(error);

    console.error("Error:", error);
    res.status(status).json(message);
};

export { errorHandler };
