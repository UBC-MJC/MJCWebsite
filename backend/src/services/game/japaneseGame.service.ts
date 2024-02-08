import prisma from "../../db";
import { GameStatus, GameType, JapaneseTransaction, JapaneseTransactionType } from "@prisma/client";
import {
    addScoreDeltas,
    containingAny,
    createEloCalculatorInputs,
    FullJapaneseGame,
    FullJapaneseRound,
    getEmptyScoreDelta,
    getNextRoundWind,
    getPlayerEloDeltas,
    NUM_PLAYERS,
    range,
    reduceScoreDeltas,
    RIICHI_STICK_VALUE,
} from "./game.util";
import GameService from "./game.service";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
import {
    ConcludedJapaneseRoundT,
    JapaneseTransactionT,
    validateCreateJapaneseRound,
} from "../../validation/game.validation";

type PartialJapaneseRound = Pick<
    FullJapaneseRound,
    "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount"
>;

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
                status: GameStatus.IN_PROGRESS,
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
                        transactions: true,
                    },
                },
            },
        });
    }

    public getCurrentGames(): Promise<any[]> {
        return prisma.japaneseGame.findMany({
            where: {
                status: GameStatus.IN_PROGRESS,
            },
            include: {
                players: {
                    include: {
                        player: true,
                    },
                },
                rounds: {
                    include: {
                        transactions: true,
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
        const playerScores = getJapaneseGameFinalScore(game);
        const calculatedElos = await getPlayerEloDeltas(game, playerScores, "jp");

        await prisma.$transaction(
            calculatedElos.map((eloObject) => {
                return prisma.japanesePlayerGame.update({
                    where: {
                        id: game.players.find((player) => player.player.id === eloObject.playerId)!
                            .id,
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
                status: GameStatus.FINISHED,
                endedAt: new Date(),
            },
        });
    }

    public async createRound(game: FullJapaneseGame, roundRequest: any): Promise<void> {
        validateCreateJapaneseRound(roundRequest, game);
        const concludedRound = roundRequest as ConcludedJapaneseRoundT;

        const query: any = {
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                ...transformConcludedRound(concludedRound),
                transactions: {
                    create: concludedRound.transactions.map((transaction) =>
                        transformTransaction(transaction),
                    ),
                },
            },
        };

        try {
            await prisma.japaneseRound.create(query);
        } catch (err) {
            console.error("Error adding japanese round: ", err);
            console.error("Query: ", query);
            throw err;
        }
    }

    public async deleteRound(id: string): Promise<void> {
        await prisma.japaneseRound.delete({
            where: {
                id: id,
            },
        });
    }

    public async mapGameObject(game: FullJapaneseGame): Promise<any> {
        const nextRound = getNextJapaneseRound(game);
        const playerScores = getJapaneseGameFinalScore(game);
        const eloDeltas = await getPlayerEloDeltas(game, playerScores, "jp");
        const orderedEloDeltas = eloDeltas.reduce((result: any, deltaObject) => {
            result[deltaObject.playerId] = deltaObject.eloChange;
            return result;
        }, {});

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
            rounds: game.rounds.map((round) => transformDBJapaneseRound(round)),
            eloDeltas: orderedEloDeltas,
            currentRound: nextRound,
        };
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

export function dealershipRetains(
    transactions: JapaneseTransactionT[],
    tenpais: number[],
    dealerIndex: number,
) {
    for (const transaction of transactions) {
        if (
            transaction.transactionType !== JapaneseTransactionType.NAGASHI_MANGAN &&
            transaction.scoreDeltas[dealerIndex] > 0
        ) {
            return true;
        }
        if (transaction.transactionType === JapaneseTransactionType.INROUND_RYUUKYOKU) {
            return true;
        }
    }
    return tenpais.includes(dealerIndex);
}

export function getNewHonbaCount(
    transactions: JapaneseTransactionT[],
    dealerIndex: number,
    honba: number,
) {
    if (transactions.length === 0) {
        return honba + 1;
    }
    for (const transaction of transactions) {
        if (
            transaction.transactionType === JapaneseTransactionType.INROUND_RYUUKYOKU ||
            transaction.transactionType === JapaneseTransactionType.NAGASHI_MANGAN
        ) {
            return honba + 1;
        }
        if (transaction.scoreDeltas[dealerIndex] > 0) {
            return honba + 1;
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

    const previousRound: ConcludedJapaneseRoundT = transformDBJapaneseRound(
        game.rounds[game.rounds.length - 1],
    );
    const newHonbaCount = getNewHonbaCount(
        previousRound.transactions,
        previousRound.roundNumber - 1,
        previousRound.bonus,
    );
    if (
        dealershipRetains(
            previousRound.transactions,
            previousRound.tenpais,
            previousRound.roundNumber - 1,
        )
    ) {
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

function generateTenpaiScoreDeltas(tenpais: number[]) {
    const scoreDeltas = getEmptyScoreDelta();
    if (tenpais.length === 0 || tenpais.length === NUM_PLAYERS) {
        return scoreDeltas;
    }
    for (const index of range(NUM_PLAYERS)) {
        if (tenpais.includes(index)) {
            scoreDeltas[index] = 3000 / tenpais.length;
        } else {
            scoreDeltas[index] = -3000 / (4 - tenpais.length);
        }
    }
    return scoreDeltas;
}

function findHeadbumpWinner(transactions: JapaneseTransactionT[]) {
    const winners = new Set<number>();
    const losers = new Set<number>();
    for (const transaction of transactions) {
        for (let index = 0; index < transaction.scoreDeltas.length; index++) {
            if (transaction.paoPlayerIndex !== undefined && transaction.paoPlayerIndex === index) {
                // is pao target
                continue;
            }
            if (transaction.scoreDeltas[index] < 0) {
                losers.add(index);
            } else if (transaction.scoreDeltas[index] > 0) {
                winners.add(index);
            }
        }
    }
    const [loser] = losers; // should only have one real loser
    return getClosestWinner(loser, winners);
}

function getClosestWinner(loserLocalPos: number, winners: Set<number>) {
    let [closestWinnerIndex] = winners;
    for (const winnerIndex of winners) {
        if (
            (winnerIndex - loserLocalPos) % NUM_PLAYERS <
            (closestWinnerIndex - loserLocalPos) % NUM_PLAYERS
        ) {
            closestWinnerIndex = winnerIndex;
        }
    }
    return closestWinnerIndex;
}

export function generateOverallScoreDelta(concludedRound: ConcludedJapaneseRoundT) {
    const rawScoreDeltas = addScoreDeltas(
        reduceScoreDeltas(concludedRound.transactions),
        getEmptyScoreDelta(),
    );
    for (const id of concludedRound.riichis) {
        rawScoreDeltas[id] -= RIICHI_STICK_VALUE;
    }
    if (containingAny(concludedRound.transactions, JapaneseTransactionType.NAGASHI_MANGAN)) {
        return rawScoreDeltas;
    }
    const riichiDeltas = addScoreDeltas(
        generateTenpaiScoreDeltas(concludedRound.tenpais),
        rawScoreDeltas,
    );
    const headbumpWinner = findHeadbumpWinner(concludedRound.transactions);
    if (concludedRound.endRiichiStickCount === 0) {
        riichiDeltas[headbumpWinner] +=
            (concludedRound.startRiichiStickCount + concludedRound.riichis.length) *
            RIICHI_STICK_VALUE;
    }
    return riichiDeltas;
}

const getJapaneseGameFinalScore = (game: FullJapaneseGame): number[] => {
    if (game.rounds.length === 0) {
        return getEmptyScoreDelta();
    }

    const rounds = game.rounds.map((round) => transformDBJapaneseRound(round));
    const rawScore = rounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getEmptyScoreDelta(),
    );
    const finalRiichiStick = rounds[rounds.length - 1].endRiichiStickCount;
    const maxScore = Math.max(...rawScore);
    for (const index of range(NUM_PLAYERS)) {
        if (rawScore[index] === maxScore) {
            rawScore[index] += finalRiichiStick * RIICHI_STICK_VALUE; // added to the first player with the max score
            break;
        }
    }
    return rawScore;
};

function transformTransaction(transaction: JapaneseTransactionT): any {
    return {
        ...transaction.hand,
        paoPlayerIndex: transaction.paoPlayerIndex,
        player0ScoreChange: transaction.scoreDeltas[0],
        player1ScoreChange: transaction.scoreDeltas[1],
        player2ScoreChange: transaction.scoreDeltas[2],
        player3ScoreChange: transaction.scoreDeltas[3],
        transactionType: transaction.transactionType.toString(),
    };
}

function transformDBTransaction(dbTransaction: JapaneseTransaction): JapaneseTransactionT {
    const scoreDeltas = [
        dbTransaction.player0ScoreChange,
        dbTransaction.player1ScoreChange,
        dbTransaction.player2ScoreChange,
        dbTransaction.player3ScoreChange,
    ];
    let result: any = {
        scoreDeltas: scoreDeltas,
        transactionType: dbTransaction.transactionType,
    };
    if (dbTransaction.han !== null) {
        const hand = {
            han: dbTransaction.han,
            fu: dbTransaction.fu,
            dora: dbTransaction.dora,
        };
        result = {
            ...result,
            hand: hand,
        };
    }
    if (dbTransaction.paoPlayerIndex !== null) {
        result = {
            ...result,
            paoPlayerIndex: dbTransaction.paoPlayerIndex,
        };
    }
    return result as JapaneseTransactionT;
}

function transformConcludedRound(concludedRound: ConcludedJapaneseRoundT): any {
    return {
        roundCount: concludedRound.roundCount,
        roundWind: concludedRound.roundWind,
        roundNumber: concludedRound.roundNumber,
        bonus: concludedRound.bonus,
        startRiichiStickCount: concludedRound.startRiichiStickCount,
        endRiichiStickCount: concludedRound.endRiichiStickCount,
        player0Riichi: concludedRound.riichis.includes(0),
        player1Riichi: concludedRound.riichis.includes(1),
        player2Riichi: concludedRound.riichis.includes(2),
        player3Riichi: concludedRound.riichis.includes(3),
        player0Tenpai: concludedRound.tenpais.includes(0),
        player1Tenpai: concludedRound.tenpais.includes(1),
        player2Tenpai: concludedRound.tenpais.includes(2),
        player3Tenpai: concludedRound.tenpais.includes(3),
    };
}

function transformDBJapaneseRound(dbJapaneseRound: FullJapaneseRound): ConcludedJapaneseRoundT {
    const riichis = [];
    const tenpais = [];
    if (dbJapaneseRound.player0Riichi) {
        riichis.push(0);
    }
    if (dbJapaneseRound.player1Riichi) {
        riichis.push(1);
    }
    if (dbJapaneseRound.player2Riichi) {
        riichis.push(2);
    }
    if (dbJapaneseRound.player3Riichi) {
        riichis.push(3);
    }
    if (dbJapaneseRound.player0Tenpai) {
        tenpais.push(0);
    }
    if (dbJapaneseRound.player1Tenpai) {
        tenpais.push(1);
    }
    if (dbJapaneseRound.player2Tenpai) {
        tenpais.push(2);
    }
    if (dbJapaneseRound.player3Tenpai) {
        tenpais.push(3);
    }
    return {
        roundCount: dbJapaneseRound.roundCount,
        roundWind: dbJapaneseRound.roundWind,
        roundNumber: dbJapaneseRound.roundNumber,
        bonus: dbJapaneseRound.bonus,
        startRiichiStickCount: dbJapaneseRound.startRiichiStickCount,
        endRiichiStickCount: dbJapaneseRound.endRiichiStickCount,
        riichis: riichis,
        tenpais: tenpais,
        transactions: dbJapaneseRound.transactions.map((dbTransaction) =>
            transformDBTransaction(dbTransaction),
        ),
    };
}

export default JapaneseGameService;
