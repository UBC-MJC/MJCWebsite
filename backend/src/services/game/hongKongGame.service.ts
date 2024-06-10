import prisma from "../../db";
import { HongKongTransaction, Player, Prisma, Wind } from "@prisma/client";
import { GameService } from "./game.service";
import {
    addScoreDeltas,
    GAME_CONSTANTS,
    getEmptyScoreDelta,
    getNextRoundWind,
    reduceScoreDeltas,
    WIND_ORDER,
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
    constructor() {
        super(prisma.hongKongGame, prisma.hongKongPlayerGame, GAME_CONSTANTS["hk"]);
    }

    public async createRound(game: FullHongKongGame, roundRequest: any): Promise<any> {
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
            return await prisma.hongKongRound.create(query);
        } catch (err) {
            console.error("Error adding HongKong round: ", err);
            console.error("Query: ", query);
            throw err;
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
        if (dealershipRetains(previousRound)) {
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

    public isEligible(player: Player): boolean {
        return player.hongKongQualified;
    }

    public async getQualifiedPlayers(): Promise<Player[]> {
        return prisma.player.findMany({
            where: {
                hongKongQualified: true,
            },
        });
    }

    public async getUserStatistics(seasonId: string, playerId: string): Promise<any> {
        const total: number = await prisma.$queryRaw`select count(*) as count
            from HongKongRound r,
                 HongKongPlayerGame pg,
                 HongKongGame g
            where pg.gameId = r.gameId
              and g.id = pg.gameId 
              and g.seasonId = ${seasonId}
              and pg.playerId = ${playerId}`;
        const dealIns = [];
        const wins = [];
        for (const i in WIND_ORDER) {
            // Note: have to use unsafe for performance
            const attributeName = "player" + i + "ScoreChange";
            const windDealIn: any = await prisma.$queryRawUnsafe(
                `select sum(${attributeName}) as dealInPoint,
                        count(r.id)           as count
                 from HongKongTransaction t,
                      HongKongRound r,
                      HongKongPlayerGame pg,
                      HongKongGame g
                 where pg.gameId = r.gameId
                   and r.id = t.roundId
                   and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                   and ${attributeName} < 0
                   and pg.wind = ${"'" + String(WIND_ORDER[i]) + "'"}
                   and pg.gameId = g.id
                   and g.seasonId = ${"'" + seasonId + "'"}
                   and pg.playerId = ${playerId}`,
            );
            const windWin: any = await prisma.$queryRawUnsafe(
                `select
                        sum(${attributeName}) as dealInPoint,
                        count(r.id)           as count
                 from HongKongTransaction t,
                      HongKongRound r,
                      HongKongPlayerGame pg,
                      HongKongGame g
                 where pg.gameId = r.gameId
                   and r.id = t.roundId
                   and ${attributeName} > 0
                   and pg.wind = ${"'" + String(WIND_ORDER[i]) + "'"}
                   and pg.gameId = g.id
                   and g.seasonId = ${"'" + seasonId + "'"}
                   and pg.playerId = ${playerId}`,
            );
            dealIns.push(windDealIn);
            wins.push(windWin);
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
            result.winPoint += Number(win.dealInPoint);
        }
        return result;
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

const dealershipRetains = (round: ConcludedHongKongRoundT): boolean => {
    if (round.roundWind == Wind.NORTH && round.roundNumber == 4 && round.transactions.length == 0) {
        return true; // carve out for N4 deck out
    }
    for (const transaction of round.transactions) {
        if (transaction.scoreDeltas[round.roundNumber - 1] > 0) {
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
