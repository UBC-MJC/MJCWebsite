import { it, describe, expect, beforeEach } from "vitest";
import { getGameService } from "../../../src/services/game/game.util";
import prisma from "../../../src/db";
import { testGameServiceCommon } from "./game.service.test.common";
import { initialise, initialiseGame } from "../util";
import { HongKongTransactionType, Wind } from "@prisma/client";
import { generateOverallScoreDelta } from "../../../src/services/game/hongKongGame.service";

describe("Hong Kong Game Service Tests", async () => {
    const gameService = getGameService("hk");
    let initState;
    beforeEach(async () => {
        initState = await initialise();
    });
    it("should initialize properly", () => {
        expect(gameService.playerGameDatabase).equal(prisma.hongKongPlayerGame);
        expect(gameService.gameDatabase).equal(prisma.hongKongGame);
    });
    it("should have the correct first round", async () => {
        const game = await initialiseGame(gameService, initState.season.id);
        const id = game.id;
        const fullGame = await gameService.getGame(id);
        const firstRound = await gameService.getNextRound(fullGame);
        expect(firstRound).deep.equal({
            roundCount: 1,
            roundNumber: 1,
            roundWind: "EAST",
        });
    });
    it("sanity check", async () => {
        const game = await initialiseGame(gameService, initState.season.id);
        const round = {
            roundCount: 0,
            roundWind: Wind.EAST,
            roundNumber: 1,
            transactions: [
                {
                    transactionType: HongKongTransactionType.DEAL_IN,
                    hand: 5,
                    scoreDeltas: [-32, 32, 0, 0],
                },
            ],
        };
        expect(generateOverallScoreDelta(round)).deep.equal([-32, 32, 0, 0]);
        await gameService.createRound(game, round);
        const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
        expect(currState.currentRound).deep.equal({
            roundCount: 1,
            roundNumber: 2,
            roundWind: Wind.EAST,
        });
    });
});
testGameServiceCommon("hk");
