import { it, describe, expect, beforeEach } from "vitest";
import { getGameService } from "../../../src/services/game/game.util";
import prisma from "../../../src/db";
import { initialise, initialiseGame } from "../util";
import { testGameServiceCommon } from "./game.service.test.common";
import { JapaneseTransactionType, Wind } from "@prisma/client";
import { generateOverallScoreDelta } from "../../../src/services/game/japaneseGame.service";

describe("Japanese Game Service Tests", async () => {
    const gameService = getGameService("jp");
    let initState;
    beforeEach(async () => {
        initState = await initialise();
    });
    it("should initialize properly", () => {
        expect(gameService.playerGameDatabase).equal(prisma.japanesePlayerGame);
        expect(gameService.gameDatabase).equal(prisma.japaneseGame);
    });
    it("should have the correct first round", async () => {
        const game = await initialiseGame(gameService, initState.season.id);
        const id = game.id;
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
    describe("Migrated Prototype tests", () => {
        it("should handle normal deal in 30fu 1han 0 -> 2", async () => {
            const game = await initialiseGame(gameService, initState.season.id);
            const round = {
                roundCount: 0,
                bonus: 0,
                roundWind: Wind.EAST,
                roundNumber: 1,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        hand: { fu: 30, han: 1 },
                        scoreDeltas: [-1000, 0, 1000, 0],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-1000, 0, 1000, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                bonus: 0,
                roundCount: 1,
                roundNumber: 2,
                roundWind: Wind.EAST,
                startRiichiStickCount: 0,
            });
        });
    });
});
testGameServiceCommon("jp");
