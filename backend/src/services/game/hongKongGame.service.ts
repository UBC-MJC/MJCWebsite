import prisma from "../../db";
import { HongKongTransaction, Prisma } from "@prisma/client";
import { GameService } from "./game.service";
import {
    addScoreDeltas,
    GAME_CONSTANTS,
    getEmptyScoreDelta,
    getNextRoundWind,
    reduceScoreDeltas,
} from "./game.util";
import {
    ConcludedHongKongRoundT,
    HongKongTransactionT,
    validateCreateHongKongRound,
} from "../../validation/game.validation";

const fullHongKongGame = Prisma.validator<Prisma.HongKongGameDefaultArgs>()({
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
type FullHongKongGame = Prisma.HongKongGameGetPayload<typeof fullHongKongGame>;
const fullHongKongRound = Prisma.validator<Prisma.HongKongRoundDefaultArgs>()({
    include: {
        transactions: true,
    },
});
type FullHongKongRound = Prisma.HongKongRoundGetPayload<typeof fullHongKongRound>;

class HongKongGameService extends GameService {
    public gameDatabase = prisma.hongKongGame;
    public playerGameDatabase = prisma.hongKongPlayerGame;
    public constants = GAME_CONSTANTS["hk"];

    public async createRound(game: FullHongKongGame, roundRequest: any): Promise<void> {
        validateCreateHongKongRound(roundRequest, game);
        const concludedRound = roundRequest as ConcludedHongKongRoundT;

        const query: any = {
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                roundCount: concludedRound.roundCount,
                roundWind: concludedRound.roundWind,
                roundNumber: concludedRound.roundNumber,
                transactions: {
                    create: concludedRound.transactions.map((transaction) =>
                        transformTransaction(transaction),
                    ),
                },
            },
        };

        try {
            await prisma.hongKongRound.create(query);
        } catch (err) {
            console.error("Error adding HongKong round: ", err);
            console.error("Query: ", query);
        }
    }

    public async deleteRound(id: string): Promise<void> {
        await prisma.hongKongRound.delete({
            where: {
                id: id,
            },
        });
    }

    public transformDBRound(dbRound: FullHongKongRound): ConcludedHongKongRoundT {
        return {
            roundCount: dbRound.roundCount,
            roundWind: dbRound.roundWind,
            roundNumber: dbRound.roundNumber,
            transactions: dbRound.transactions.map((dbTransaction: HongKongTransaction) =>
                transformDBTransaction(dbTransaction),
            ),
        };
    }

    public getNextRound(game: FullHongKongGame): any {
        if (game.rounds.length === 0) {
            return getFirstHongKongRound();
        }
        const previousRound: ConcludedHongKongRoundT = this.transformDBRound(
            game.rounds[game.rounds.length - 1],
        );
        if (dealershipRetains(previousRound.transactions, previousRound.roundNumber - 1)) {
            return {
                roundCount: previousRound.roundCount + 1,
                roundNumber: previousRound.roundNumber,
                roundWind: previousRound.roundWind,
            };
        }
        return {
            roundCount: previousRound.roundCount + 1,
            roundNumber: previousRound.roundNumber === 4 ? 1 : previousRound.roundNumber + 1,
            roundWind:
                previousRound.roundNumber === 4
                    ? getNextRoundWind(previousRound.roundWind)
                    : previousRound.roundWind,
        };
    }

    public getGameFinalScore(game: FullHongKongGame): number[] {
        if (game.rounds.length === 0) {
            return getEmptyScoreDelta();
        }
        return game.rounds.reduce<number[]>(
            (result, current) =>
                addScoreDeltas(result, generateOverallScoreDelta(this.transformDBRound(current))),
            getEmptyScoreDelta(),
        );
    }

    public async getAllPlayerElos(seasonId: string): Promise<any[]> {
        return (await prisma.$queryRaw`SELECT sum(gp.eloChange) as elo, count(gp.eloChange) as gameCount, p.id, p.username
                                FROM HongKongGame g
                                         LEFT JOIN HongKongPlayerGame gp
                                                   ON g.id = gp.gameId
                                         LEFT JOIN Player p
                                                   ON gp.playerId = p.id
                                WHERE g.seasonId = ${seasonId} AND g.status = ${"FINISHED"} AND g.type = ${"RANKED"}
                                GROUP BY playerId
                                ORDER BY elo DESC;`) as any[];
    }
}
export function generateOverallScoreDelta(concludedGame: ConcludedHongKongRoundT) {
    return addScoreDeltas(reduceScoreDeltas(concludedGame.transactions), getEmptyScoreDelta());
}

const getFirstHongKongRound = (): any => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
    };
};

const dealershipRetains = (transactions: HongKongTransactionT[], dealerIndex: number): boolean => {
    for (const transaction of transactions) {
        if (transaction.scoreDeltas[dealerIndex] > 0) {
            return true;
        }
    }
    return false;
};
function transformTransaction(transaction: HongKongTransactionT): any {
    return {
        hand: transaction.hand,
        player0ScoreChange: transaction.scoreDeltas[0],
        player1ScoreChange: transaction.scoreDeltas[1],
        player2ScoreChange: transaction.scoreDeltas[2],
        player3ScoreChange: transaction.scoreDeltas[3],
        transactionType: transaction.transactionType.toString(),
    };
}

function transformDBTransaction(dbTransaction: HongKongTransaction): HongKongTransactionT {
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
    if (dbTransaction.hand !== null) {
        result = {
            ...result,
            hand: dbTransaction.hand,
        };
    }
    return result as HongKongTransactionT;
}
export { FullHongKongRound, HongKongGameService };
export { FullHongKongGame };
