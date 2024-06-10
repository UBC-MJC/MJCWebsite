import prisma from "../../db";
import { JapaneseTransaction, JapaneseTransactionType, Player, Prisma } from "@prisma/client";
import {
    addScoreDeltas,
    GAME_CONSTANTS,
    getEmptyScoreDelta,
    getNextRoundWind,
    NUM_PLAYERS,
    range,
    reduceScoreDeltas,
    Wind,
    WIND_ORDER,
} from "./game.util";
import { GameService } from "./game.service";
import {
    ConcludedJapaneseRoundT,
    JapaneseTransactionT,
    validateCreateJapaneseRound,
} from "../../validation/game.validation";

const fullJapaneseGame = Prisma.validator<Prisma.JapaneseGameDefaultArgs>()({
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
type FullJapaneseGame = Prisma.JapaneseGameGetPayload<typeof fullJapaneseGame>;
const fullJapaneseRound = Prisma.validator<Prisma.JapaneseRoundDefaultArgs>()({
    include: {
        transactions: true,
    },
});
type FullJapaneseRound = Prisma.JapaneseRoundGetPayload<typeof fullJapaneseRound>;
type PartialJapaneseRound = Pick<
    FullJapaneseRound,
    "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount"
>;

export const RIICHI_STICK_VALUE = 1000;

class JapaneseGameService extends GameService {
    constructor() {
        super(prisma.japaneseGame, prisma.japanesePlayerGame, GAME_CONSTANTS["jp"]);
    }

    public async createRound(game: FullJapaneseGame, roundRequest: any): Promise<any> {
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
            return await prisma.japaneseRound.create(query);
        } catch (err) {
            console.error("Error adding Riichi round: ", err);
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

    public getNextRound(game: FullJapaneseGame): PartialJapaneseRound {
        if (game.rounds.length === 0) {
            return getFirstJapaneseRound();
        }

        const previousRound: ConcludedJapaneseRoundT = this.transformDBRound(
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
    }

    public getGameFinalScore(game: FullJapaneseGame): number[] {
        if (game.rounds.length === 0) {
            return getEmptyScoreDelta();
        }

        const rounds = game.rounds.map((round) => this.transformDBRound(round));
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
    }

    public transformDBRound(dbRound: FullJapaneseRound): ConcludedJapaneseRoundT {
        const riichis: number[] = [];
        const tenpais: number[] = [];
        if (dbRound.player0Riichi) {
            riichis.push(0);
        }
        if (dbRound.player1Riichi) {
            riichis.push(1);
        }
        if (dbRound.player2Riichi) {
            riichis.push(2);
        }
        if (dbRound.player3Riichi) {
            riichis.push(3);
        }
        if (dbRound.player0Tenpai) {
            tenpais.push(0);
        }
        if (dbRound.player1Tenpai) {
            tenpais.push(1);
        }
        if (dbRound.player2Tenpai) {
            tenpais.push(2);
        }
        if (dbRound.player3Tenpai) {
            tenpais.push(3);
        }
        return {
            roundCount: dbRound.roundCount,
            roundWind: dbRound.roundWind,
            roundNumber: dbRound.roundNumber,
            bonus: dbRound.bonus,
            startRiichiStickCount: dbRound.startRiichiStickCount,
            endRiichiStickCount: dbRound.endRiichiStickCount,
            riichis: riichis,
            tenpais: tenpais,
            transactions: dbRound.transactions.map((dbTransaction) =>
                transformDBTransaction(dbTransaction),
            ),
        };
    }

    public isEligible(player: Player): boolean {
        return player.japaneseQualified;
    }

    public async getQualifiedPlayers(): Promise<Player[]> {
        return prisma.player.findMany({
            where: {
                japaneseQualified: true,
            },
        });
    }

    public async getUserStatistics(seasonId: string, playerId: string): Promise<any> {
        const totalTemp = await prisma.$queryRaw<{ count: number }[]>`select count(*) as count
                                   from JapaneseRound r,
                                        JapanesePlayerGame pg,
                                        JapaneseGame g
                                   where pg.gameId = r.gameId
                                     and g.id = pg.gameId
                                     and g.seasonId = ${seasonId}
                                     and pg.playerId = ${playerId}`;
        const total = totalTemp[0].count;
        const dealIns = [];
        const wins = [];
        for (const i in WIND_ORDER) {
            // Note: have to use unsafe for performance
            const attributeName = "player" + i + "ScoreChange";
            const windDealIn = await prisma.$queryRawUnsafe<
                { dealInPoint: number; count: number }[]
            >(
                `select -sum(${attributeName}) as dealInPoint,
                        count(r.id)           as count
                 from JapaneseTransaction t,
                      JapaneseRound r,
                      JapanesePlayerGame pg,
                      JapaneseGame g
                 where pg.gameId = r.gameId
                   and r.id = t.roundId
                   and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                   and (t.paoPlayerIndex IS NULL or t.paoPlayerIndex != ${Number(i)})
                   and ${attributeName} < 0
                   and pg.wind = ${"'" + String(WIND_ORDER[i]) + "'"}
                   and pg.gameId = g.id
                   and g.seasonId = ${"'" + seasonId + "'"}
                   and pg.playerId = ${"'" + playerId + "'"}`,
            );
            const windWin: any = await prisma.$queryRawUnsafe<
                { winPoint: number; count: number }[]
            >(
                `select sum(${attributeName}) as winPoint,
                        count(r.id)            as count
                 from JapaneseTransaction t,
                      JapaneseRound r,
                      JapanesePlayerGame pg,
                      JapaneseGame g
                 where pg.gameId = r.gameId
                   and r.id = t.roundId
                   and ${attributeName} > 0
                   and pg.wind = ${"'" + String(WIND_ORDER[i]) + "'"}
                   and pg.gameId = g.id
                   and g.seasonId = ${"'" + seasonId + "'"}
                   and pg.playerId = ${"'" + playerId + "'"}`,
            );
            dealIns.push(windDealIn[0]);
            wins.push(windWin[0]);
        }
        const result = {
            totalRounds: Number(total),
            dealInCount: 0,
            dealInPoint: 0,
            winCount: 0,
            winPoint: 0,
        };
        for (const dealIn of dealIns) {
            result.dealInCount += Number(dealIn.count);
            result.dealInPoint += Number(dealIn.dealInPoint);
        }
        for (const win of wins) {
            result.winCount += Number(win.count);
            result.winPoint += Number(win.winPoint);
        }
        return result;
    }
}

const getFirstJapaneseRound = (): PartialJapaneseRound => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: Wind.EAST,
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

export function containingAny(
    transactions: JapaneseTransactionT[],
    transactionType: JapaneseTransactionType,
): JapaneseTransactionT | null {
    for (const transaction of transactions) {
        if (transaction.transactionType === transactionType) {
            return transaction;
        }
    }
    return null;
}
export { FullJapaneseRound, FullJapaneseGame, JapaneseGameService };
