import { it, describe, expect, beforeEach, vi } from "vitest";
import { getGameService } from "../../../services/game/game.util";
import prisma from "../../../db";
import { testGameServiceCommon } from "./game.service.test.common";
import { JapaneseTransactionType, Wind } from "@prisma/client";
import { generateOverallScoreDelta } from "../../../services/game/japaneseGame.service";
import { initialise, initialiseGame } from "../util";
vi.mock("@prisma/client");
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

    describe("should calculate points correctly", async () => {
        it("should handle normal deal in 30fu 1han 0 -> 2", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
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
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle normal deal in 30fu 1han 2 -> 0", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        hand: { fu: 30, han: 1 },
                        scoreDeltas: [1500, 0, -1500, 0],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([1500, 0, -1500, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle deal in 30fu 2han 1 -> 0, 0, 1 riichi", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 3,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 3,
                startRiichiStickCount: 0,
                riichis: [0, 1],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        hand: { fu: 30, han: 2 },
                        scoreDeltas: [2900, -2900, 0, 0],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([3900, -3900, 0, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle double ron", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [8000, 0, -8000, 0],
                        hand: { fu: 30, han: 5 },
                    },
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, 12000, -12000, 0],
                        hand: { fu: 30, han: 6 },
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([8000, 12000, -20000, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle double ron with bonus and riichi", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
                riichis: [1, 2, 3],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, 0, 12000, -12000],
                        hand: { fu: 30, han: 6 },
                    },
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, 2300, 0, -2300],
                        hand: { fu: 30, han: 2 },
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([0, 4300, 11000, -15300]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.SOUTH,
                roundNumber: 1,
                roundCount: 6,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle double ron with bonus and riichi with a dealer win", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
                riichis: [1, 2, 3],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, -18000, 0, 18000],
                        hand: { fu: 30, han: 6 },
                    },
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, -2300, 2300, 0],
                        hand: { fu: 30, han: 2 },
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([0, -21300, 4300, 17000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 6,
                bonus: 2,
                startRiichiStickCount: 0,
            });
        });
        it("should be order agnostic for double ron", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
                riichis: [1, 2, 3],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, 2300, 0, -2300],
                        hand: { fu: 30, han: 2 },
                    },
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        scoreDeltas: [0, 0, 12000, -12000],
                        hand: { fu: 30, han: 6 },
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([0, 4300, 11000, -15300]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.SOUTH,
                roundNumber: 1,
                roundCount: 6,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });

        it("should handle tsumo 30fu 3han by dealer", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.SELF_DRAW,
                        hand: { fu: 30, han: 3 },
                        scoreDeltas: [-2000, 6000, -2000, -2000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-2000, 6000, -2000, -2000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 4,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle tsumo 30fu 3han by non-dealer", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.SELF_DRAW,
                        hand: { fu: 30, han: 3 },
                        scoreDeltas: [-1000, -2000, -1000, 4000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-1000, -2000, -1000, 4000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle draw with one tenpai dealer", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [0],
                endRiichiStickCount: 0,
                transactions: [],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([3000, -1000, -1000, -1000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle draw with one tenpai by non-dealer", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [1],
                endRiichiStickCount: 0,
                transactions: [],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-1000, 3000, -1000, -1000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle draw with all tenpai, riichi by 0", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [0],
                tenpais: [0, 1, 2, 3],
                endRiichiStickCount: 1,
                transactions: [],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-1000, 0, 0, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 1,
            });
        });
        it("should handle draw with no tenpai, 1 riichi stick on table", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 1,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 3,
                bonus: 0,
                startRiichiStickCount: 1,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 1,
                transactions: [],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([0, 0, 0, 0]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 3,
                roundCount: 4,
                bonus: 1,
                startRiichiStickCount: 1,
            });
        });

        it("should handle South 3 going to South 4 with p3 win 1st at 30,000", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.SOUTH,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 1,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 0,
                riichis: [],
                roundNumber: 3,
                roundCount: 4,
                roundWind: Wind.SOUTH,
                startRiichiStickCount: 1,
                tenpais: [],
                transactions: [
                    {
                        hand: {
                            fu: 30,
                            han: 3,
                        },
                        scoreDeltas: [-1000, -1000, -2000, 4000],
                        transactionType: JapaneseTransactionType.SELF_DRAW,
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-1000, -1000, -2000, 5000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.SOUTH,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        // it("should handle South 4 hanchan end with p0 win at 30,000", async () => {
        //     const roundS4 = new JapaneseRound({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 1,
        //     });
        //
        //     const endingResultS4 = roundS4.concludeRound();
        //     expect(generateOverallScoreDelta(endingResultS4)).deep.equal([5000, -1000, -1000, -2000]);
        //
        //     expect(roundS4Next).deep.equal({
        //         roundWind: Wind.WEST,
        //         roundNumber: 1,
        //         roundCount: 0,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 hanchan not end with p0 win but no one at 30,000", async () => {
        //     const roundS4 = new JapaneseRound({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        //
        //     const endingResultS4 = roundS4.concludeRound();
        //     expect(generateOverallScoreDelta(endingResultS4)).deep.equal([1100, -300, -300, -500]);
        //
        //     expect(roundS4Next).deep.equal({
        //         roundWind: Wind.WEST,
        //         roundNumber: 1,
        //         roundCount: 0,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 -> South 4 bonus 1 with p3 win less than 30,000 and 1st", async () => {
        //     const game = await initialiseGame(gameService, initState.season.id, {
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        //
        //     expect(generateOverallScoreDelta(round)).deep.equal([0, 0, -1500, 1500]);
        //
        //     await gameService.createRound(game, round);
        //     const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
        //     expect(currState.currentRound).deep.equal({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 1,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 hanchan end with p3 win at 30,000 and 1st", async () => {
        //     const game = await initialiseGame(gameService, initState.season.id, {
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 2,
        //     });
        //
        //     expect(generateOverallScoreDelta(round)).deep.equal([-1000, -1000, -1000, 5000]);
        //
        //     await gameService.createRound(game, round);
        //     const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
        //     expect(currState.currentRound).deep.equal({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 1,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 hanchan end with p3 tenpai at 30,000 and 1st", async () => {
        //     const roundS3 = new JapaneseRound({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 3,
        //         roundCount: 4,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        //
        //     const endingResultS3 = roundS3.concludeRound();
        //     expect(generateOverallScoreDelta(endingResultS3)).deep.equal([0, 0, -2000, 2000]);
        //
        //     roundS4.setTenpais([3]);
        //     const endingResultS4 = roundS4.concludeRound();
        //     expect(generateOverallScoreDelta(endingResultS4)).deep.equal([-1000, -1000, -1000, 3000]);
        //
        //     expect(roundS4Next).deep.equal({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 1,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 hanchan does not end from p0 score > p3 score > 30,000", async () => {
        //     const game = await initialiseGame(gameService, initState.season.id, {
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        //
        //     expect(generateOverallScoreDelta(round)).deep.equal([8000, 0, -13800, 5800]);
        //
        //     await gameService.createRound(game, round);
        //     const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
        //     expect(currState.currentRound).deep.equal({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 1,
        //         startRiichiStickCount: 0,
        //     });
        // });
        // it("should handle South 4 hanchan does not end from p3 not 1st by position", async () => {
        //     const game = await initialiseGame(gameService, initState.season.id, {
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 0,
        //         startRiichiStickCount: 0,
        //     });
        //
        //     expect(generateOverallScoreDelta(round)).deep.equal([12000, 0, -24000, 12000]);
        //
        //     await gameService.createRound(game, round);
        //     const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
        //     expect(currState.currentRound).deep.equal({
        //         roundWind: Wind.SOUTH,
        //         roundNumber: 4,
        //         roundCount: 5,
        //         bonus: 1,
        //         startRiichiStickCount: 0,
        //     });
        // });
        it("should handle South 4 hanchan end with p3 no-ten and p0 at 30000", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.SOUTH,
                roundNumber: 3,
                roundCount: 4,
                bonus: 0,
                startRiichiStickCount: 0,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 0,
                riichis: [],
                roundNumber: 3,
                roundCount: 4,
                roundWind: Wind.SOUTH,
                startRiichiStickCount: 0,
                tenpais: [],
                transactions: [
                    {
                        hand: {
                            fu: 30,
                            han: 3,
                        },
                        scoreDeltas: [4000, -1000, -2000, -1000],
                        transactionType: JapaneseTransactionType.SELF_DRAW,
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([4000, -1000, -2000, -1000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));

            expect(currState.currentRound).deep.equal({
                roundWind: Wind.SOUTH,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
            const round2 = {
                roundWind: Wind.SOUTH,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
                endRiichiStickCount: 0,
                tenpais: [0, 1, 2],
                riichis: [],
                transactions: [],
            };
            expect(generateOverallScoreDelta(round2)).deep.equal([1000, 1000, 1000, -3000]);
            const updatedGame = await gameService.getGame(game.id);
            await gameService.createRound(updatedGame, round2);
            const currState2 = await gameService.mapGameObject(await gameService.getGame(game.id));

            expect(currState2.currentRound).deep.equal({
                roundWind: Wind.WEST,
                roundNumber: 1,
                roundCount: 6,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle South 4 hanchan does not end with p3 no-ten and no one at 30,000", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.SOUTH,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 0,
                riichis: [],
                roundNumber: 4,
                roundCount: 5,
                roundWind: Wind.SOUTH,
                startRiichiStickCount: 0,
                tenpais: [0],
                transactions: [],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([3000, -1000, -1000, -1000]);

            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.WEST,
                roundNumber: 1,
                roundCount: 6,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle hanchan end if next round is North 1 and no one at 30,000", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.WEST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 0,
                riichis: [],
                roundNumber: 4,
                roundCount: 5,
                roundWind: Wind.WEST,
                startRiichiStickCount: 0,
                tenpais: [],
                transactions: [
                    {
                        hand: {
                            fu: 30,
                            han: 1,
                        },
                        scoreDeltas: [1000, -1000, 0, 0],
                        transactionType: JapaneseTransactionType.DEAL_IN,
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([1000, -1000, 0, 0]);

            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.NORTH,
                roundNumber: 1,
                roundCount: 6,
                bonus: 0,
                startRiichiStickCount: 0,
            });
        });
        it("should handle hanchan not end p1 at 0", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 0,
                startRiichiStickCount: 0,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 0,
                riichis: [1],
                roundNumber: 4,
                roundCount: 5,
                roundWind: Wind.EAST,
                startRiichiStickCount: 0,
                tenpais: [],
                transactions: [
                    {
                        hand: {
                            fu: 30,
                            han: 8,
                        },
                        scoreDeltas: [0, -24000, 0, 24000],
                        transactionType: JapaneseTransactionType.DEAL_IN,
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([0, -25000, 0, 25000]);

            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 6,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle hanchan end p1 < 0", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });
            const round = {
                endRiichiStickCount: 0,
                bonus: 1,
                riichis: [1],
                roundNumber: 4,
                roundCount: 5,
                roundWind: Wind.EAST,
                startRiichiStickCount: 0,
                tenpais: [],
                transactions: [
                    {
                        hand: {
                            fu: 30,
                            han: 8,
                        },
                        scoreDeltas: [0, -24300, 0, 24300],
                        transactionType: JapaneseTransactionType.DEAL_IN,
                    },
                ],
            };

            expect(generateOverallScoreDelta(round)).deep.equal([0, -25300, 0, 25300]);

            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 6,
                bonus: 2,
                startRiichiStickCount: 0,
            });
        });
        // nagashi mangan tests
        it("should handle non-dealer nagashi mangan", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, 8000, -2000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-4000, -2000, 8000, -2000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle dealer nagashi mangan", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [12000, -4000, -4000, -4000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([12000, -4000, -4000, -4000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle non-dealer nagashi mangan and dealer tenpai", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [0],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, 8000, -2000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-4000, -2000, 8000, -2000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should handle non-dealer nagashi mangan with riichi sticks from previous rounds", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 1,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 1,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 1,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, -2000, 8000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-4000, -2000, -2000, 8000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 1,
            });
        });
        it("should handle non-dealer nagashi mangan and p1 p2 riichi during round", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [1, 2],
                tenpais: [1, 2],
                endRiichiStickCount: 2,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, -2000, 8000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-4000, -3000, -3000, 8000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 2,
            });
        });
        it("should handle three nagashi mangan", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 1,
                roundCount: 0,
                bonus: 0,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, 8000, -2000, -2000],
                    },
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, 8000, -2000],
                    },
                    {
                        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
                        scoreDeltas: [-4000, -2000, -2000, 8000],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-12000, 4000, 4000, 4000]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 2,
                roundCount: 1,
                bonus: 1,
                startRiichiStickCount: 0,
            });
        });
        it("should consider pao tsumo to one of two yakuman", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });

            const round = {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.SELF_DRAW_PAO,
                        hand: { fu: 40, han: 13 },
                        paoTarget: 0,
                        scoreDeltas: [-48000, 0, 0, 48000],
                    },
                    {
                        transactionType: JapaneseTransactionType.SELF_DRAW,
                        hand: { fu: 30, han: 13 },
                        scoreDeltas: [-16100, -16100, -16100, 48300],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-64100, -16100, -16100, 96300]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 6,
                bonus: 2,
                startRiichiStickCount: 0,
            });
        });
        it("should consider pao deal in to one of two yakuman", async () => {
            const game = await initialiseGame(gameService, initState.season.id, {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
            });
            const round = {
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 5,
                bonus: 1,
                startRiichiStickCount: 0,
                riichis: [],
                tenpais: [],
                endRiichiStickCount: 0,
                transactions: [
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN_PAO,
                        hand: { fu: 40, han: 13 },
                        paoTarget: 0,
                        scoreDeltas: [-24000, -24000, 0, 48000],
                    },
                    {
                        transactionType: JapaneseTransactionType.DEAL_IN,
                        hand: { fu: 30, han: 13 },
                        scoreDeltas: [0, -48300, 0, 48300],
                    },
                ],
            };
            expect(generateOverallScoreDelta(round)).deep.equal([-24000, -72300, 0, 96300]);
            await gameService.createRound(game, round);
            const currState = await gameService.mapGameObject(await gameService.getGame(game.id));
            expect(currState.currentRound).deep.equal({
                roundWind: Wind.EAST,
                roundNumber: 4,
                roundCount: 6,
                bonus: 2,
                startRiichiStickCount: 0,
            });
        });
    });
});
testGameServiceCommon("jp");
