import prisma from "../../db";
import { GameType, Wind } from "@prisma/client";
import {
    getDealerPlayerId,
    getWind,
    requiresHand,
    WIND_ORDER,
    FullJapaneseGame,
    createEloCalculatorInputs,
    FullJapaneseRound, getPropertyFromIndex
} from "./game.util";
import GameService from "./game.service";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
import { CreateJapaneseRoundType, validateCreateJapaneseRound } from "../../validation/game.validation";

type PartialJapaneseRound = Pick<FullJapaneseRound, "roundCount" | "roundNumber" | "roundWind" | "bonus" | "riichiSticksOnTable">;

class JapaneseGameService extends GameService {
    public createGame(
        gameType: GameType,
        playersQuery: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        return prisma.japaneseGame.create({
            data: {
                season: {
                    connect: {
                        id: seasonId,
                    },
                },
                type: gameType,
                status: "IN_PROGRESS",
                recordedBy: {
                    connect: {
                        id: recorderId,
                    },
                },
                players: {
                    create: playersQuery,
                },
            },
        });
    }

    public getGame(id: number): Promise<any> {
        return prisma.japaneseGame.findUnique({
            where: {
                id: id,
            },
            include: {
                players: {
                    include: {
                        player: true,
                    },
                },
                rounds: {
                    include: {
                        transactions: true
                    },
                },
            },
        });
    }

    public async deleteGame(id: number): Promise<void> {
        await prisma.japaneseGame.delete({
            where: {
                id: id,
            },
        });
    }

    // TODO: replace getAllPlayerElos call, not all elos are needed
    public async submitGame(game: FullJapaneseGame): Promise<void> {
        const playerScores = getJapanesePlayersCurrentScore(game);
        const eloList = await getAllPlayerElos("jp", game.seasonId);
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            game.players,
            playerScores,
            eloList,
        );
        const calculatedElos = getEloChanges(eloCalculatorInput, "jp");

        await prisma.$transaction(
            calculatedElos.map((eloObject) => {
                return prisma.japanesePlayerGame.update({
                    where: {
                        id: game.players.find((player) => player.player.id === eloObject.playerId)!.id,
                    },
                    data: {
                        eloChange: eloObject.eloChange,
                    },
                });
            }),
        );

        await prisma.japaneseGame.update({
            where: {
                id: game.id,
            },
            data: {
                status: "FINISHED",
                endedAt: new Date(),
            },
        });
    }

    public async createRound(game: FullJapaneseGame, createRoundRequest: any): Promise<void> {
        validateCreateJapaneseRound(createRoundRequest, game);
        const createRound = createRoundRequest as CreateJapaneseRoundType;

        const currentRound = getNextJapaneseRound(game);

        const query: any = {
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                ...currentRound,
                trueEastRiichi: createRound.trueEastRiichi,
                trueSouthRiichi: createRound.trueSouthRiichi,
                trueWestRiichi: createRound.trueWestRiichi,
                trueNorthRiichi: createRound.trueNorthRiichi,
                transactions: {
                    create: createRound.transactions,
                }
            },
        };

        try {
            await prisma.japaneseRound.create(query);
        } catch (err) {
            console.error("Error adding japanese round: ", err);
            console.error("Query: ", query);
        }
    }

    public async deleteRound(id: string): Promise<void> {
        await prisma.japaneseRound.delete({
            where: {
                id: id,
            },
        });
    }

    public mapGameObject(game: FullJapaneseGame): any {
        const nextRound = getNextJapaneseRound(game);

        return {
            id: game.id,
            type: game.type,
            status: game.status,
            recordedById: game.recordedById,
            players: game.players.map((player) => {
                return {
                    id: player.player.id,
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds,
            currentRound: nextRound,
            gameOver: this.isGameOver(game, nextRound),
        };
    }

    public isGameOver(
        game: FullJapaneseGame,
        nextRound: any = getNextJapaneseRound(game),
    ): boolean {
        const playerScores = getJapanesePlayersCurrentScore(game);
        const allPositive = Object.values(playerScores).every((score: number) => score >= 0);

        if (!allPositive) {
            // end game if player has negative score
            return true;
        } else if (
            nextRound.roundWind === "EAST" ||
            (nextRound.roundWind === "SOUTH" && nextRound.roundNumber < 4)
        ) {
            return false;
        } else if (nextRound.roundWind === "SOUTH" && nextRound.roundNumber === 4) {
            const lastRound = game.rounds[game.rounds.length - 1];
            if (lastRound.roundWind === "SOUTH" && lastRound.roundNumber === 4) {
                // end game if we are in south 4 because dealer won and dealer has most points
                const dealerId = getDealerPlayerId(game, 4);

                // check if dealer has most points
                let dealerHasMostPoints = true;
                const dealerIndex = lastRound.roundNumber;
                for (let i = 0; i < 4; i++) {
                    if (i !== dealerIndex && playerScores[i] > playerScores[dealerIndex]) {
                        dealerHasMostPoints = false;
                        break;
                    }
                }

                return dealerHasMostPoints;
            } else {
                // don't end game because we are in south 4 from south 3
                return false;
            }
        } else {
            // we are in west/north round, end game if someone has more than 30000 points
            for (const playerId in playerScores) {
                if (playerScores[playerId] >= 30000) {
                    return true;
                }
            }
            return false;
        }
    }
}

const getFirstJapaneseRound = (): PartialJapaneseRound => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
        riichiSticksOnTable: 0,
    };
};

// CAREFUL the riichi sticks on table are just taken from prev round and need to be updated
// TODO: breaks at north 4
const getNextJapaneseRound = (game: FullJapaneseGame): PartialJapaneseRound => {
    if (game.rounds.length === 0) {
        return getFirstJapaneseRound();
    }

    const previousRound: FullJapaneseRound = game.rounds[game.rounds.length - 1];

    const dealerRepeat = isDealerRepeat(previousRound);
    const previousRoundDeckedOut = roundDeckedOut(previousRound);

    if (dealerRepeat && previousRoundDeckedOut) {
        return {
            ...previousRound,
            roundCount: previousRound.roundCount + 1,
            bonus: previousRound.bonus + 1,
        };
    }

    if (dealerRepeat) {
        return {
            ...previousRound,
            roundCount: previousRound.roundCount + 1,
            bonus: previousRound.bonus + 1,
            riichiSticksOnTable: 0,
        };
    }

    if (previousRoundDeckedOut) {
        return {
            ...previousRound,
            roundCount: previousRound.roundCount + 1,
            roundNumber: (previousRound.roundNumber % 4) + 1,
            roundWind: getNextRoundWind(previousRound.roundWind, previousRound.roundNumber),
            bonus: previousRound.bonus + 1,
        };
    }

    return {
        roundCount: previousRound.roundCount  + 1,
        roundNumber: (previousRound.roundNumber % 4) + 1,
        roundWind: getNextRoundWind(previousRound.roundWind, previousRound.roundNumber),
        bonus: 0,
        riichiSticksOnTable: 0,
    };
};

const isDealerRepeat = (round: FullJapaneseRound): boolean => {
    return round.transactions.some((transaction) => transaction[getPropertyFromIndex(round.roundNumber - 1)] > 0);
}

const roundDeckedOut = (round: FullJapaneseRound): boolean => {
    return round.transactions.length === 0 || round.transactions[0].type === "TENPAI";
}

const getNextRoundWind = (wind: Wind, roundNumber: number): Wind => {
    if (roundNumber === 4) {
        return getWind(WIND_ORDER.indexOf(wind) + 1);
    } else {
        return wind;
    }
}

// TODO: add riichi sticks to score
const getJapanesePlayersCurrentScore = (game: FullJapaneseGame): number[] => {
    const result = [0, 0, 0, 0];
    game.rounds.forEach((round) => {
        round.transactions.forEach((transaction) => {
            result[0] += transaction.player0ScoreChange;
            result[1] += transaction.player1ScoreChange;
            result[2] += transaction.player2ScoreChange;
            result[3] += transaction.player3ScoreChange;
        });
    });

    return result;
}
    // const roundType = round.roundValue.type.value;
    // const playerActions = round.roundValue.playerActions;
    // const hand = round.pointsValue;
    // const { bonus, riichiSticksOnTable } = currentRound;
    //
    // let winnerId: string | undefined = undefined;
    // let loserId: string | undefined = undefined;
    // let paoId: string | undefined = undefined;
    // let currentRiichiSticks = riichiSticksOnTable;
    //
    // const playerScores: any = {};
    // for (const playerId in playerActions) {
    //     playerScores[playerId] = {
    //         scoreChange: 0,
    //         riichi: false,
    //     };
    //
    //     if (playerActions[playerId].includes("Winner")) {
    //         winnerId = playerId;
    //     }
    //
    //     if (playerActions[playerId].includes("Loser")) {
    //         loserId = playerId;
    //     }
    //
    //     if (playerActions[playerId].includes("Pao Player")) {
    //         paoId = playerId;
    //     }
    //
    //     if (playerActions[playerId].includes("Riichis")) {
    //         playerScores[playerId].riichi = true;
    //         playerScores[playerId].scoreChange -= 1000;
    //         currentRiichiSticks++;
    //     }
    // }
    //
    // switch (roundType) {
    //     case "DEAL_IN":
    //         updateJapaneseDealIn(
    //             playerScores,
    //             winnerId!,
    //             loserId!,
    //             dealerId,
    //             hand,
    //             bonus,
    //             currentRiichiSticks,
    //         );
    //         break;
    //     case "SELF_DRAW":
    //         updateJapaneseSelfDraw(
    //             playerScores,
    //             winnerId!,
    //             dealerId,
    //             hand,
    //             bonus,
    //             currentRiichiSticks,
    //         );
    //         break;
    //     case "DECK_OUT":
    //         updateJapaneseDeckOut(playerScores, playerActions);
    //         break;
    //     case "MISTAKE":
    //         updateJapaneseMistake(playerScores, loserId!);
    //         break;
    //     case "RESHUFFLE":
    //         break;
    //     case "DEAL_IN_PAO":
    //         updateJapaneseDealInPao(
    //             playerScores,
    //             winnerId!,
    //             loserId!,
    //             paoId!,
    //             dealerId,
    //             hand,
    //             bonus,
    //             currentRiichiSticks,
    //         );
    //         break;
    //     case "SELF_DRAW_PAO":
    //         updateJapaneseSelfDrawPao(
    //             playerScores,
    //             winnerId!,
    //             paoId!,
    //             dealerId,
    //             hand,
    //             bonus,
    //             currentRiichiSticks,
    //         );
    //         break;
    //     default:
    //         throw new Error("Invalid round type: " + roundType);
    // }
    //
    // const scoresQuery: any[] = [];
    // for (const playerId in playerScores) {
    //     scoresQuery.push({
    //         player: {
    //             connect: {
    //                 id: playerId,
    //             },
    //         },
    //         scoreChange: playerScores[playerId].scoreChange,
    //         riichi: playerScores[playerId].riichi,
    //     });
    // }
    //
    // if (roundType !== "RESHUFFLE" && roundType !== "DECK_OUT") {
    //     currentRiichiSticks = 0;
    // }
    //
    // return { scoresQuery, newRiichiStickTotal: currentRiichiSticks };
// const updateJapaneseDealIn = (
//     playerScores: any,
//     winnerId: string,
//     loserId: string,
//     dealerId: string,
//     hand: any,
//     bonus: number,
//     riichiSticks: number,
// ) => {
//     let handValue;
//     const bonusPoints = bonus * 300;
//
//     // The multiplier is for whether it's a dealer victory
//     const multiplier = winnerId !== dealerId ? 4 : 6;
//
//     const { points, fu } = hand;
//
//     // Check to see if you have to count basic points
//     if (points < 5) {
//         if (fu === 20 || (points === 1 && fu === 25)) {
//             throw new Error("Invalid points/fu combination");
//         } else {
//             // Calculate hand value, if it's above a mangan, cap it there
//             const manganPayout = 2000 * multiplier;
//             handValue = Math.ceil((fu * Math.pow(2, 2 + points) * multiplier) / 100) * 100;
//             handValue = handValue > manganPayout ? manganPayout : handValue;
//         }
//     } else {
//         handValue = manganValue(points) * multiplier;
//     }
//
//     // Add everything together to finalize total
//     playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
//     playerScores[loserId].scoreChange -= handValue + bonusPoints;
// };
//
// const updateJapaneseSelfDraw = (
//     playerScores: any,
//     winnerId: string,
//     dealerId: string,
//     hand: any,
//     bonus: number,
//     riichiSticks: number,
// ) => {
//     let basicPoints: number;
//     const bonusPoints = bonus * 300;
//     const individualBonusPayout = bonusPoints / 3;
//
//     const { points, fu } = hand;
//
//     // Check to see if you have to count basic points
//     if (points < 5) {
//         if ((points === 1 && (fu === 20 || fu === 25)) || (points === 2 && fu === 25)) {
//             throw RangeError("Invalid points/fu combination");
//         } else {
//             // Calculate hand value, if it's above a mangan, cap it there
//             basicPoints = fu * Math.pow(2, 2 + points);
//             basicPoints = basicPoints < 2000 ? basicPoints : 2000;
//         }
//     } else {
//         basicPoints = manganValue(points);
//     }
//
//     const nonDealerPays = Math.ceil((basicPoints / 100) * (dealerId === winnerId ? 2 : 1)) * 100;
//     const dealerPays = Math.ceil((basicPoints / 100) * 2) * 100;
//
//     // caclulate score changes for eeveryone except winner and dealer
//     for (const playerId in playerScores) {
//         if (playerId !== winnerId && playerId !== dealerId) {
//             playerScores[playerId].scoreChange -= nonDealerPays + individualBonusPayout;
//         }
//     }
//
//     // If dealer wins, everyone pays dealer amount, otherwise dealer pays differently
//     if (dealerId === winnerId) {
//         playerScores[dealerId].scoreChange += nonDealerPays * 3 + bonusPoints + riichiSticks * 1000;
//     } else {
//         playerScores[dealerId].scoreChange -= dealerPays + individualBonusPayout;
//         playerScores[winnerId].scoreChange +=
//             dealerPays + nonDealerPays * 2 + bonusPoints + riichiSticks * 1000;
//     }
// };
//
// const updateJapaneseDeckOut = (playerScores: any, playerActions: any) => {
//     let tenpaiCount = 0;
//
//     for (const playerId in playerScores) {
//         if (playerActions[playerId].includes("Tenpais")) {
//             tenpaiCount++;
//         }
//     }
//
//     if (tenpaiCount === 0 || tenpaiCount === 4) {
//         return;
//     }
//
//     const tenpaiMoneyWon = 3000 / tenpaiCount;
//     const tenpaiMoneyLost = 3000 / (4 - tenpaiCount);
//
//     for (const playerId in playerScores) {
//         if (playerActions[playerId].includes("Tenpais")) {
//             playerScores[playerId].scoreChange += tenpaiMoneyWon;
//         } else {
//             playerScores[playerId].scoreChange -= tenpaiMoneyLost;
//         }
//     }
// };
//
// const updateJapaneseMistake = (playerScores: any, loserId: string) => {
//     for (const playerId in playerScores) {
//         playerScores[playerId].scoreChange = 4000;
//     }
//
//     playerScores[loserId].scoreChange = -12000;
// };
//
// const updateJapaneseDealInPao = (
//     playerScores: any,
//     winnerId: string,
//     loserId: string,
//     paoId: string,
//     dealerId: string,
//     hand: any,
//     bonus: number,
//     riichiSticks: number,
// ) => {
//     const { points } = hand;
//     if (points < 13) {
//         throw new Error("Pao cannot happen unless hand is yakuman");
//     }
//
//     for (const playerId in playerScores) {
//         playerScores[playerId].scoreChange = 0;
//     }
//
//     const bonusPoints = bonus * 300;
//
//     const multiplier = winnerId !== dealerId ? 4 : 6;
//     const handValue = manganValue(points) * multiplier;
//
//     playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
//     playerScores[loserId].scoreChange -= handValue / 2 + bonusPoints + riichiSticks * 1000;
//     playerScores[paoId].scoreChange -= handValue / 2;
// };
//
// const updateJapaneseSelfDrawPao = (
//     playerScores: any,
//     winnerId: string,
//     paoId: string,
//     dealerId: string,
//     hand: any,
//     bonus: number,
//     riichiSticks: number,
// ) => {
//     const { points } = hand;
//     if (points < 13) {
//         throw new Error("Pao cannot happen unless hand is yakuman");
//     }
//
//     const bonusPoints = bonus * 300;
//
//     const multiplier = winnerId !== dealerId ? 4 : 6;
//     const handValue = manganValue(points) * multiplier;
//
//     playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
//     playerScores[paoId].scoreChange -= handValue + bonusPoints;
// };

/**
 * Calculates the total base points  for high value hands
 * @param {number} points - total points in hand
 * @returns {number} representing number of base points as the result of a certain point threshold,
 *                   must be greater than mangan minimum points
 */
// const manganValue = (points: number) => {
//     let multiplier = 0;
//     switch (true) {
//         case points === 5:
//             multiplier = 1;
//             break;
//         case points <= 7:
//             multiplier = 1.5;
//             break;
//         case points <= 10:
//             multiplier = 2;
//             break;
//         case points <= 12:
//             multiplier = 3;
//             break;
//         // After 13 points is hit, we only see multiples of 13
//         case points === 13:
//             multiplier = 4;
//             break;
//         case points === 26:
//             multiplier = 4 * 2;
//             break;
//         case points === 39:
//             multiplier = 4 * 3;
//             break;
//         case points === 52:
//             multiplier = 4 * 4;
//             break;
//         case points === 65:
//             multiplier = 4 * 5;
//             break;
//     }
//     return 2000 * multiplier;
// };

export default JapaneseGameService;
