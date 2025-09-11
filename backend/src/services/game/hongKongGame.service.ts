import prisma from "../../db";
import { GameType, HongKongTransaction, Player, Prisma, Wind } from "@prisma/client";
import { GameService } from "./game.service";
import {
    addScoreDeltas,
    getEmptyScoreDelta,
    getNextRoundWind,
    reduceScoreDeltas,
} from "./game.util";
import {
    ConcludedHongKongRoundT,
    HongKongTransactionT,
    validateCreateHongKongRound,
} from "../../validation/game.validation";

type FullHongKongGame = Prisma.HongKongGameGetPayload<{
    include: {
        players: {
            include: {
                player: true;
            };
        };
        rounds: {
            include: {
                transactions: true;
            };
        };
    };
}>;
type FullHongKongRound = Prisma.HongKongRoundGetPayload<{
    include: {
        transactions: true;
    };
}>;

class HongKongGameService extends GameService {
    constructor() {
        super(prisma.hongKongGame, prisma.hongKongPlayerGame, {
            STARTING_SCORE: 750,
            DIVIDING_CONSTANT: 5,
            SCORE_ADJUSTMENT: [100, 0, 0, -100],
        });
    }

    public async createRound(game: FullHongKongGame, roundRequest: any): Promise<any> {
        validateCreateHongKongRound(roundRequest, game);
        const concludedRound = roundRequest as ConcludedHongKongRoundT;

        const query = {
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

    public getNextRound(game: FullHongKongGame) {
        if (game.rounds.length === 0) {
            return getFirstHongKongRound();
        }
        const previousRound: ConcludedHongKongRoundT = this.transformDBRound(
            game.rounds[game.rounds.length - 1],
        );
        // if (dealershipRetains(previousRound)) {
        //     return {
        //         roundCount: previousRound.roundCount + 1,
        //         roundNumber: previousRound.roundNumber,
        //         roundWind: previousRound.roundWind,
        //     };
        // }
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

    public async getQualifiedPlayers(gameType: GameType): Promise<Player[]> {
        if (gameType === GameType.CASUAL) {
            return prisma.player.findMany();
        }
        return prisma.player.findMany({
            where: {
                hongKongQualified: true,
            },
        });
    }

    public async getUserStatistics(seasonId: string, playerId: string): Promise<any> {
        return {};
    }
}
export function generateOverallScoreDelta(concludedGame: ConcludedHongKongRoundT) {
    return addScoreDeltas(reduceScoreDeltas(concludedGame.transactions), getEmptyScoreDelta());
}

const getFirstHongKongRound = () => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
    };
};

const dealershipRetains = (round: ConcludedHongKongRoundT): boolean => {
    if (
        round.roundWind === Wind.NORTH &&
        round.roundNumber === 4 &&
        round.transactions.length === 0
    ) {
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
    let result: HongKongTransactionT = {
        scoreDeltas: scoreDeltas,
        transactionType: dbTransaction.transactionType,
    };
    if (dbTransaction.hand !== null) {
        result = {
            ...result,
            hand: dbTransaction.hand,
        };
    }
    return result;
}
export { FullHongKongRound, HongKongGameService };
export { FullHongKongGame };
