import {GameStatus, GameType} from "@prisma/client";
import {
    createEloCalculatorInputs,
    GameFilterArgs,
    GameVariant,
    generateGameQuery,
    transformEloStats,
} from "./game.util";
import {EloCalculatorInput, getEloChanges} from "./eloCalculator";
import JapaneseGameService from "./japaneseGame.service";
import HongKongGameService from "./hongKongGame.service";
import prisma from "../../db";

abstract class GameService {
    public gameDatabase: any;
    public playerGameDatabase: any;

    public async createGame(
        gameType: GameType,
        playersQuery: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        return this.gameDatabase.create({
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

    public async getGame(id: number): Promise<any> {
        return this.gameDatabase.findUnique({
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

    public async getGames(filter: GameFilterArgs): Promise<any[]> {
        const whereQuery = generateGameQuery(filter);

        return this.gameDatabase.findMany({
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
        await this.gameDatabase.delete({
            where: {
                id: id,
            },
        });
    }
    // TODO: replace getAllPlayerElos call, not all elos are needed
    public async submitGame(game: any): Promise<void> {
        const playerScores = this.getGameFinalScore(game);
        const calculatedElos = await this.getPlayerEloDeltas(game, playerScores);

        await this.updatePlayerGameElo(calculatedElos, game);

        await this.gameDatabase.update({
            where: {
                id: game.id,
            },
            data: {
                status: GameStatus.FINISHED,
                endedAt: new Date(),
            },
        });
    }
    abstract createRound(game: any, roundRequest: any): Promise<void>;
    abstract deleteRound(id: string): Promise<void>;
    public async mapGameObject(game: any): Promise<any> {
        const nextRound = this.getNextRound(game);
        const playerScores = this.getGameFinalScore(game);
        const eloDeltas = await this.getPlayerEloDeltas(game, playerScores);
        const orderedEloDeltas = eloDeltas.reduce((result: any, deltaObject) => {
            result[deltaObject.playerId] = deltaObject.eloChange;
            return result;
        }, {});
        return {
            id: game.id,
            type: game.type,
            status: game.status,
            recordedById: game.recordedById,
            createdAt: game.createdAt,
            players: game.players.map((player: any) => {
                return {
                    id: player.player.id,
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds.map((round: any) => this.transformDBRound(round)),
            eloDeltas: orderedEloDeltas,
            currentRound: nextRound,
        };
    }

    public async getPlayerEloDeltas(game: any, playerScores: number[], overridingEloList?: any[]) {
        let eloList = overridingEloList;
        if (eloList === undefined) {
            eloList = await this.getAllPlayerElos(game.seasonId);
        }
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            game.players,
            playerScores,
            eloList,
        );
        return getEloChanges(eloCalculatorInput, this.getVariant());
    }
    abstract getVariant(): GameVariant;
    abstract getNextRound(game: any): any;
    public async getAllPlayerElos(seasonId: string): Promise<any[]> {
        return (await prisma.$queryRaw`SELECT sum(gp.eloChange) as elo, count(gp.eloChange) as gameCount, p.id, p.username
                                FROM ${this.gameDatabase} g
                                         LEFT JOIN ${this.playerGameDatabase} gp
                                                   ON g.id = gp.gameId
                                         LEFT JOIN Player p
                                                   ON gp.playerId = p.id
                                WHERE g.seasonId = ${seasonId} AND g.status = ${"FINISHED"} AND g.type = ${"RANKED"}
                                GROUP BY playerId
                                ORDER BY elo DESC;`) as any[];
    }

    abstract getGameFinalScore(game: any): number[];

    public async updatePlayerGameElo(
        calculatedElos: { eloChange: number; playerId: string }[],
        game: any,
    ) {
        await prisma.$transaction(
            calculatedElos.map((eloObject) => {
                return this.playerGameDatabase.update({
                    where: {
                        id: game.players.find(
                            (player: any) => player.player.id === eloObject.playerId,
                        )!.id,
                    },
                    data: {
                        eloChange: eloObject.eloChange,
                    },
                });
            }),
        );
    }

    abstract transformDBRound(dbRound: any): any;
    public async recalcSeason(seasonId: string): Promise<any> {
        const finishedGames = await this.getGames({
            seasonId: seasonId,
            gameStatus: GameStatus.FINISHED,
        });
        finishedGames.sort((a, b) => {
            const date1 = new Date(a.endedAt);
            const date2 = new Date(b.endedAt);
            if (date1 < date2) {
                return -1;
            }
            return 1;
        });
        const eloStats: any = {};
        const debugStats = []; // to be removed once it has been established that this is correct
        for (const game of finishedGames) {
            const playerScores = this.getGameFinalScore(game);
            const calculatedElos = await this.getPlayerEloDeltas(
                game,
                playerScores,
                transformEloStats(eloStats),
            );

            for (const calculatedElo of calculatedElos) {
                if (!eloStats[calculatedElo.playerId]) {
                    console.log(eloStats[calculatedElo.playerId]);
                    eloStats[calculatedElo.playerId] = 0;
                }
                eloStats[calculatedElo.playerId] += calculatedElo.eloChange;
            }
            await this.updatePlayerGameElo(calculatedElos, game);
            debugStats.push(calculatedElos);
        }
        return { eloStats: eloStats, orderedGames: finishedGames, debugStats: debugStats };
    }
}

const getGameService = (gameVariant: string): GameService => {
    switch (gameVariant) {
        case "jp":
            return new JapaneseGameService();
        case "hk":
            return new HongKongGameService();
        default:
            throw new Error(`Invalid game variant ${gameVariant}`);
    }
};

export { getGameService };
export default GameService;
