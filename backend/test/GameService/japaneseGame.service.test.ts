import { it, describe, expect, beforeEach } from "vitest";
import { getGameService } from "../../src/services/game/game.util";
import prisma from "../../src/db";
import { initialise } from "../util";
import { testGameServiceCommon } from "./game.service.test.common";
import { GameType, JapaneseTransactionType } from "@prisma/client";

const bruh = [
    {
        transactionType: JapaneseTransactionType.DEAL_IN,
        hand: { fu: 30, han: 1, dora: 0 },
        scoreDeltas: [-1000, 0, 1000, 0],
    },
]
describe("Japanese Game Service Unit Tests", () => {
    describe("dealership Retains", () => {
    })
    describe("getNewHonbaCount", () => {

    })
    describe("generateTenpaiScoreDeltas", () => {

    })
    describe("findHeadbumpWinner", () => {

    })
    describe("getClosestWinner", () => {

    })
    describe("generateOverallScoreDelta", () => {

        }
    )
})
describe("Japanese Game Service Pseudo-Integration Tests", async () => {
    const gameService = getGameService("jp");
    let initState;
    beforeEach(async () => {
        initState = await initialise();
    });
    it("should initialize properly", () => {
        expect(gameService.playerGameDatabase).equal(prisma.japanesePlayerGame);
        expect(gameService.gameDatabase).equal(prisma.japaneseGame);
    });
    it("should initialize properly", async () => {
        const ret = await gameService.createGame(
            GameType.RANKED,
            ["testUser1", "testUser2", "testUser3", "testUser4"],
            "test1",
            initState.season.id,
        );
        const id = ret.id;
        const fullGame = await gameService.getGame(id);
        const firstRound = await gameService.getNextRound(fullGame);
        expect(firstRound).deep.equal({
            bonus: 0,
            roundCount: 1,
            roundNumber: 1,
            roundWind: "EAST",
            startRiichiStickCount: 0,
        });
    });
});
describe("Score Delta Checks", async () => {});
testGameServiceCommon("jp");
