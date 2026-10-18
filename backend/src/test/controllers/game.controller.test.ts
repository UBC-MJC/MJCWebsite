import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { recalcSeasonHandler } from "../../controllers/game.controller";
import { getGameService } from "../../services/game/gameService.factory";

vi.mock("../../services/game/gameService.factory", () => ({
    getGameService: vi.fn(),
}));
vi.mock("../../services/season.service", () => ({ findSeason: vi.fn() }));
vi.mock("../../services/game/liveGame.service", () => ({
    addGameListener: vi.fn(),
    sendGameUpdate: vi.fn(),
}));

describe("recalcSeasonHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([undefined, "", "   ", ["season-id"], { id: "season-id" }])(
        "rejects an invalid or missing seasonId: %j",
        async (seasonId) => {
            const req = {
                params: { gameVariant: "jp", seasonId },
                query: { seasonId: "query-season" },
            } as unknown as Request;

            await expect(recalcSeasonHandler(req, {} as Response)).rejects.toBeInstanceOf(ZodError);
            expect(getGameService).not.toHaveBeenCalled();
        },
    );

    it.each(["hk", "jp"])(
        "recalculates the explicitly requested season for %s",
        async (gameVariant) => {
            const result = { eloDict: {}, orderedGames: [], debugStats: [] };
            const recalcSeason = vi.fn().mockResolvedValue(result);
            vi.mocked(getGameService).mockReturnValue({ recalcSeason } as unknown as ReturnType<
                typeof getGameService
            >);
            const req = {
                params: { gameVariant, seasonId: "previous-season" },
                query: { seasonId: "query-season" },
            } as unknown as Request;
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

            await recalcSeasonHandler(req, res as unknown as Response);

            expect(getGameService).toHaveBeenCalledWith(gameVariant);
            expect(recalcSeason).toHaveBeenCalledWith("previous-season");
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(result);
        },
    );
});
