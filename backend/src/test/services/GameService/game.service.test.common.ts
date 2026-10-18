import { beforeEach, describe, expect, it } from "vitest";
import { initialise } from "../util";
import { getGameService } from "../../../services/game/gameService.factory";
import { GameStatus, GameType, Wind } from "@prisma/client";
import type { GameVariant } from "../../../validation/game.validation";
import prisma from "../../../db";

export function testGameServiceCommon(gameVariant: GameVariant) {
    return describe("Common Game Service Tests", () => {
        const gameService = getGameService(gameVariant);
        let initState: Awaited<ReturnType<typeof initialise>>;
        beforeEach(async () => {
            initState = await initialise();
        });
        it("should start a game and a round", async () => {
            const ret = await gameService.createGame(
                initState.season,
                ["testUser1", "testUser2", "testUser3", "testUser4"],
                "test1",
            );
            const id = ret.id;
            expect(ret).toMatchObject({
                endedAt: null,
                recordedById: "test1",
                seasonId: initState.season.id,
                status: GameStatus.IN_PROGRESS,
            });
            const fullGame = await gameService.getGameOrThrow(id);
            const mappedGame = await gameService.mapGameObject(fullGame);
            expect(mappedGame).toMatchObject({
                currentRound: {
                    roundCount: 1,
                    roundNumber: 1,
                    roundWind: Wind.EAST,
                },
                id: id,
                players: [
                    {
                        id: "test1",
                        trueWind: Wind.EAST,
                        username: "testUser1",
                    },
                    {
                        id: "test2",
                        trueWind: Wind.SOUTH,
                        username: "testUser2",
                    },
                    {
                        id: "test3",
                        trueWind: Wind.WEST,
                        username: "testUser3",
                    },
                    {
                        id: "test4",
                        trueWind: Wind.NORTH,
                        username: "testUser4",
                    },
                ],
                recordedById: "test1",
                rounds: [],
                season: initState.season,
                status: GameStatus.IN_PROGRESS,
            });
        });

        it("requires qualification for every competitive season type", async () => {
            await prisma.player.update({
                where: { id: "test1" },
                data:
                    gameVariant === "jp"
                        ? { japaneseQualified: false }
                        : { hongKongQualified: false },
            });

            const createCompetitiveGame = gameService.createGame(
                { ...initState.season, type: GameType.TOURNEY },
                ["testUser1", "testUser2", "testUser3", "testUser4"],
                "test2",
            );

            await expect(createCompetitiveGame).rejects.toThrow(
                "Player not eligible for game type",
            );
        });
    });
}
