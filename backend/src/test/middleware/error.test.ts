import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import createError from "http-errors";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorHandler } from "../../middleware/error";
import { InvalidGameInputError, NoCurrentSeasonError } from "../../errors/domain.error";

function createResponse() {
    const status = vi.fn();
    const json = vi.fn();
    const response = {
        headersSent: false,
        status,
        json,
    } as unknown as Response;
    status.mockReturnValue(response);
    return { response, status, json };
}

describe("errorHandler", () => {
    it.each([
        [createError.BadRequest("Invalid request"), 400, "Invalid request"],
        [z.never().safeParse("invalid").error, 400, expect.stringContaining("Invalid input")],
        [new InvalidGameInputError("Invalid players"), 400, "Invalid players"],
        [new NoCurrentSeasonError(), 404, "No season in progress"],
        [
            new Prisma.PrismaClientKnownRequestError("Duplicate", {
                code: "P2002",
                clientVersion: "test",
            }),
            409,
            "A record with these values already exists",
        ],
        [new Error("Unexpected failure"), 500, "Internal Server Error"],
    ])("serializes errors", (error, expectedStatus, expectedMessage) => {
        const { response, status, json } = createResponse();
        const next = vi.fn();
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        errorHandler(error, {} as Request, response, next as NextFunction);

        expect(status).toHaveBeenCalledWith(expectedStatus);
        expect(json).toHaveBeenCalledWith(expectedMessage);
        expect(next).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });

    it("delegates after response headers have been sent", () => {
        const error = new Error("Streaming failed");
        const response = { headersSent: true } as Response;
        const next = vi.fn();

        errorHandler(error, {} as Request, response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(error);
    });
});
