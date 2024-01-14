import prisma from "../../db";
import { GameType, JapaneseTransaction, JapaneseTransactionType, Wind } from "@prisma/client";
import {
    getDealerPlayerId,
    getWind,
    WIND_ORDER,
    FullJapaneseGame,
    createEloCalculatorInputs,
    FullJapaneseRound, getPlayerScoreWithIndex, getPlayerTenpaiStatusWithIndex
} from "./game.util";
import GameService from "./game.service";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
import { CreateJapaneseRoundType, validateCreateJapaneseRound } from "../../validation/game.validation";

type PartialJapaneseRound = Pick<FullJapaneseRound, "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount">;

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
                player0Riichi: createRound.player0Riichi,
                player1Riichi: createRound.player1Riichi,
                player2Riichi: createRound.player2Riichi,
                player3Riichi: createRound.player3Riichi,
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
        startRiichiStickCount: 0,
        bonus: 0,
    };
};

export function dealershipRetains(round: FullJapaneseRound) {
    const transactions: JapaneseTransaction[] = round.transactions;
    const dealerIndex = round.roundNumber - 1;
    for (const transaction of transactions) {
        if (transaction.type !== JapaneseTransactionType.NAGASHI_MANGAN && transaction[getPlayerScoreWithIndex(dealerIndex)] > 0) {
            return true;
        }
        if (transaction.type === JapaneseTransactionType.INROUND_RYUUKYOKU) {
            return true;
        }
    }
    return round[getPlayerTenpaiStatusWithIndex(dealerIndex)];
}

export function getNewHonbaCount(round: FullJapaneseRound) {
    const transactions: JapaneseTransaction[] = round.transactions;
    const dealerIndex = round.roundNumber - 1;
    if (transactions.length === 0) {
        return round.bonus + 1;
    }
    for (const transaction of transactions) {
        if (
            transaction.type === JapaneseTransactionType.INROUND_RYUUKYOKU ||
            transaction.type === JapaneseTransactionType.NAGASHI_MANGAN
        ) {
            return round.bonus + 1;
        }
        if (transaction[getPlayerScoreWithIndex(dealerIndex)] > 0) {
            return round.bonus + 1;
        }
    }

    return 0;
}

// CAREFUL the riichi sticks on table are just taken from prev round and need to be updated
// TODO: breaks at north 4
const getNextJapaneseRound = (game: FullJapaneseGame): PartialJapaneseRound => {
    if (game.rounds.length === 0) {
        return getFirstJapaneseRound();
    }

    const previousRound: FullJapaneseRound = game.rounds[game.rounds.length - 1];
    const newHonbaCount = getNewHonbaCount(
        previousRound
    );
    if (dealershipRetains(previousRound)) {
        return {
            roundCount: previousRound.roundCount + 1,
            bonus: newHonbaCount,
            roundNumber: previousRound.roundNumber,
            roundWind: previousRound.roundWind,
            startRiichiStickCount: previousRound.endRiichiStickCount,
        };
    }
    return {
        roundCount: previousRound.roundCount + 1,
        bonus: newHonbaCount,
        roundNumber: previousRound.roundNumber === 4 ? 1 : previousRound.roundNumber + 1,
        roundWind:
            previousRound.roundNumber === 4
                ? getNextRoundWind(previousRound.roundWind)
                : previousRound.roundWind,
        startRiichiStickCount: previousRound.endRiichiStickCount,
    };
};

const getNextRoundWind = (wind: Wind): Wind => {
    return getWind(WIND_ORDER.indexOf(wind) + 1);
}

// TODO: use the following to refactor
// function addScoreDeltas(scoreDelta1: number[], scoreDelta2: number[]): number[] {
//     const finalScoreDelta = getEmptyScoreDelta();
//     for (const index of range(NUM_PLAYERS)) {
//         finalScoreDelta[index] += scoreDelta1[index] + scoreDelta2[index];
//     }
//     return finalScoreDelta;
// }
//
// function reduceScoreDeltas(transactions: Transaction[]): number[] {
//     return transactions.reduce<number[]>(
//         (result, current) => addScoreDeltas(result, current.scoreDeltas),
//         getEmptyScoreDelta()
//     );
// }
//
// function generateTenpaiScoreDeltas(tenpais: number[]) {
//     const scoreDeltas = getEmptyScoreDelta();
//     if (tenpais.length === 0 || tenpais.length === NUM_PLAYERS) {
//         return scoreDeltas;
//     }
//     for (const index of range(NUM_PLAYERS)) {
//         if (tenpais.includes(index)) {
//             scoreDeltas[index] = 3000 / tenpais.length;
//         } else {
//             scoreDeltas[index] = -3000 / (4 - tenpais.length);
//         }
//     }
//     return scoreDeltas;
// }
//
// export function generateOverallScoreDelta(concludedRound: ConcludedRound) {
//     const rawScoreDeltas = addScoreDeltas(reduceScoreDeltas(concludedRound.transactions), getEmptyScoreDelta());
//     for (const id of concludedRound.riichis) {
//         rawScoreDeltas[id] -= 1000;
//     }
//     if (containingAny(concludedRound.transactions, ActionType.NAGASHI_MANGAN)) {
//         return rawScoreDeltas;
//     }
//     const riichiDeltas = addScoreDeltas(generateTenpaiScoreDeltas(concludedRound.tenpais), rawScoreDeltas);
//     const headbumpWinner = findHeadbumpWinner(concludedRound.transactions);
//     if (concludedRound.endingRiichiSticks === 0) {
//         riichiDeltas[headbumpWinner] += (concludedRound.startingRiichiSticks + concludedRound.riichis.length) * 1000;
//     }
//     return riichiDeltas;
// }

const getJapanesePlayersCurrentScore = (game: FullJapaneseGame): number[] => {
    const result = [0, 0, 0, 0];
    // game.rounds.forEach((round) => {
    //     round.transactions.forEach((transaction) => {
    //         result[0] += transaction.player0ScoreChange;
    //         result[1] += transaction.player1ScoreChange;
    //         result[2] += transaction.player2ScoreChange;
    //         result[3] += transaction.player3ScoreChange;
    //     });
    // });

    return result;
}

export default JapaneseGameService;
