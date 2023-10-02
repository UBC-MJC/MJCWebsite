import prisma from "../../db";
import { HongKongGame, GameType, HongKongRound } from "@prisma/client";
import GameService from "./game.service";
import { FullHongKongGame, getDealerPlayerId, getWind, windOrder } from "./game.util";

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
                gameType: gameType,
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
                rounds: true,
            },
        });
    }

    public deleteGame(id: number): Promise<void> {
        return Promise.resolve();
    }

    public submitGame(game: FullHongKongGame): Promise<void> {
        return Promise.resolve();
    }

    public async createRound(game: FullHongKongGame, roundRequest: any): Promise<void> {
        return Promise.resolve();
    }

    public async deleteRound(id: string): Promise<void> {
        const deleteHands = prisma.hongKongHand.deleteMany({
            where: {
                roundId: id,
            },
        });

        const deleteRound = prisma.hongKongRound.delete({
            where: {
                id: id,
            },
        });

        await prisma.$transaction([deleteHands, deleteRound]);
    }

    public mapGameObject(game: FullHongKongGame): any {
        return {
            id: game.id,
            gameType: game.gameType,
            status: game.status,
            recordedById: game.recordedById,
            players: game.players.map((player: any) => {
                return {
                    id: player.player.id,
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds,
            currentRound: getNextHongKongRound(game),
        };
    }

    public isGameOver(game: FullHongKongGame): boolean {
        return false;
    }
}

const getFirstHongKongRound = (): any => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
    };
};

const getNextHongKongRound = (game: any): any => {
    const rounds: any[] = game.rounds;
    if (rounds.length === 0) {
        return getFirstHongKongRound();
    }

    const lastRound = rounds[rounds.length - 1];
    const lastRoundWind = lastRound.roundWind;
    const lastRoundNumber = lastRound.roundNumber;
    const lastRoundCount = lastRound.roundCount;
    const lastBonus = lastRound.bonus;

    const lastDealerId = getDealerPlayerId(game, lastRoundNumber);
    const lastDealerScore = lastRound.scores.find((score: any) => score.playerId === lastDealerId);
    if (lastDealerScore.scoreChange > 0) {
        return {
            roundCount: lastRoundCount + 1,
            roundNumber: lastRoundNumber,
            roundWind: lastRoundWind,
            bonus: lastBonus + 1,
        };
    }

    return {
        roundCount: lastRoundCount + 1,
        roundNumber: lastRoundNumber === 4 ? 1 : lastRoundNumber + 1,
        roundWind:
            lastRoundNumber === 4 ? getWind(windOrder.indexOf(lastRoundWind) + 1) : lastRoundWind,
        bonus: 0,
    };
};

const createHongKongRound = async (game: any, round: any): Promise<void> => {
    const query = {
        data: {
            game: {
                connect: {
                    id: game.gameId,
                },
            },
            roundCount: round.roundCount,
            roundNumber: round.roundNumber,
            roundWind: round.roundWind,
            bonus: round.bonus,
            roundType: round.roundValue.type.value,
            scores: createHongKongScoresQuery(round),
        },
    };

    try {
        await prisma.hongKongRound.create(query);
    } catch (err) {
        console.error("Error adding hong kong round: ", err);
        console.error("Query: ", query);
    }
};

const createHongKongScoresQuery = (round: any): any => {
    const hand = createHongKongHandQuery(round.pointsValue);

    const data: any[] = [];
    for (const key in round.roundValue.playerActions) {
        const playerScore = {
            player: {
                connect: {
                    id: key,
                },
            },
            scoreChange: 0,
            scoreType: "",
            riichi: false,
            hand: {
                create: hand,
            },
        };

        data.push(playerScore);
    }

    const query = {
        createMany: {
            data,
        },
    };

    return query;
};

const createHongKongHandQuery = (pointsValue: any): any => {
    return {
        points: pointsValue.points,
        fu: pointsValue.fu,
        dora: pointsValue.dora,
    };
};

export default HongKongGameService;
