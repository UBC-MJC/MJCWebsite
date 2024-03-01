import prisma from "../../db";
import { GameStatus, GameType, HongKongTransaction } from "@prisma/client";
import GameService from "./game.service";
import {
    addScoreDeltas,
    FullHongKongGame,
    FullHongKongRound,
    GameFilterArgs,
    generateGameQuery,
    getEmptyScoreDelta,
    getNextRoundWind,
    getPlayerEloDeltas,
    reduceScoreDeltas,
} from "./game.util";
import {
    ConcludedHongKongRoundT,
    HongKongTransactionT,
    validateCreateHongKongRound,
} from "../../validation/game.validation";

class HongKongGameService extends GameService {
    public createGame(
        gameType: GameType,
        playersQuery: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        return prisma.hongKongGame.create({
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
        return prisma.hongKongGame.findUnique({
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

    public getGames(filter: GameFilterArgs): Promise<any[]> {
        const whereQuery = generateGameQuery(filter);

        return prisma.hongKongGame.findMany({
            where: whereQuery,
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
        await prisma.hongKongGame.delete({
            where: {
                id: id,
            },
        });
    }

    public async submitGame(game: FullHongKongGame): Promise<void> {
        const playerScores = getHongKongGameFinalScore(game);
        const calculatedElos = await getPlayerEloDeltas(game, playerScores, "hk");

        await updateHongKongPlayerGameElo(calculatedElos, game);

        await prisma.hongKongGame.update({
            where: {
                id: game.id,
            },
            data: {
                status: GameStatus.FINISHED,
                endedAt: new Date(),
            },
        });
    }

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

    public async mapGameObject(game: FullHongKongGame): Promise<any> {
        const nextRound = getNextHongKongRound(game);
        const playerScores = getHongKongGameFinalScore(game);
        const eloDeltas = await getPlayerEloDeltas(game, playerScores, "hk");
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
            rounds: game.rounds.map((round) => transformDBHongKongRound(round)),
            eloDeltas: orderedEloDeltas,
            currentRound: nextRound,
        };
    }
}
export function generateOverallScoreDelta(concludedGame: ConcludedHongKongRoundT) {
    return addScoreDeltas(reduceScoreDeltas(concludedGame.transactions), getEmptyScoreDelta());
}

export const getHongKongGameFinalScore = (game: FullHongKongGame): number[] => {
    if (game.rounds.length === 0) {
        return getEmptyScoreDelta();
    }
    return game.rounds.reduce<number[]>(
        (result, current) =>
            addScoreDeltas(result, generateOverallScoreDelta(transformDBHongKongRound(current))),
        getEmptyScoreDelta(),
    );
};

export async function updateHongKongPlayerGameElo(
    calculatedElos: { eloChange: number; playerId: string }[],
    game: FullHongKongGame,
) {
    await prisma.$transaction(
        calculatedElos.map((elo) => {
            return prisma.hongKongPlayerGame.update({
                where: {
                    id: game.players.find((player) => player.player.id === elo.playerId)!.id,
                },
                data: {
                    eloChange: elo.eloChange,
                },
            });
        }),
    );
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

const getNextHongKongRound = (game: FullHongKongGame): any => {
    if (game.rounds.length === 0) {
        return getFirstHongKongRound();
    }
    const previousRound: ConcludedHongKongRoundT = transformDBHongKongRound(
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
function transformDBHongKongRound(dbHongKongRound: FullHongKongRound): ConcludedHongKongRoundT {
    return {
        roundCount: dbHongKongRound.roundCount,
        roundWind: dbHongKongRound.roundWind,
        roundNumber: dbHongKongRound.roundNumber,
        transactions: dbHongKongRound.transactions.map((dbTransaction: HongKongTransaction) =>
            transformDBTransaction(dbTransaction),
        ),
    };
}

export default HongKongGameService;
