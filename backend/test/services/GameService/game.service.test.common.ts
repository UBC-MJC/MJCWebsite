import { beforeEach, describe, expect, it} from "vitest";
import { initialise } from "../util";
import { getGameService } from "../../../src/services/game/game.util";
import { GameStatus, GameType, Wind } from "@prisma/client";


export function testGameServiceCommon(gameVariant: string) {
    return describe("Common Game Service Tests", () => {
        const gameService = getGameService(gameVariant);
        let initState;
        beforeEach(async () => {
            initState = await initialise();
        });
        it("should start a game and a round", async () => {
            const ret = await gameService.createGame(
                GameType.RANKED,
                ["testUser1", "testUser2", "testUser3", "testUser4"],
                "test1",
                initState.season.id,
            );
            const id = ret.id;
            expect(ret).toMatchObject({
                endedAt: null,
                recordedById: "test1",
                seasonId: initState.season.id,
                status: GameStatus.IN_PROGRESS,
                type: GameType.RANKED,
            });
            const fullGame = await gameService.getGame(id);
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
                status: GameStatus.IN_PROGRESS,
                type: GameType.RANKED,
            });
        });
    });
}
