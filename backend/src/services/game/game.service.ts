import { GameStatus, GameType, Player } from "@prisma/client";
import {
    createEloCalculatorInputs,
    GameFilterArgs,
    generateGameQuery,
    generatePlayerQuery,
} from "./game.util";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
import prisma from "../../db";

abstract class GameService {
    public readonly gameDatabase: any;
    public readonly playerGameDatabase: any;
    public readonly constants: any;

    protected constructor(gameDatabase: any, playerGameDatabase: any, constants: any) {
        this.gameDatabase = gameDatabase;
        this.playerGameDatabase = playerGameDatabase;
        this.constants = constants;
    }

    public async createGame(
        gameType: GameType,
        players: string[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        const playersQuery = await generatePlayerQuery(players, this.isEligible);
        return await this.gameDatabase.create({
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
            eloDeltas: orderedEloDeltas, // TODO: after the game has ended, it would be better to return the actual delta
            currentRound: nextRound,
        };
    }

    public async getPlayerEloDeltas(game: any, playerScores: number[], overridingEloDict?: any) {
        let eloDict = overridingEloDict;
        if (eloDict === undefined) {
            eloDict = await this.getSelectedPlayerElos(game.seasonId, game.players);
        }
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            game.players,
            playerScores,
            eloDict,
        );
        return getEloChanges(
            eloCalculatorInput,
            this.constants.SCORE_ADJUSTMENT,
            this.constants.DIVIDING_CONSTANT,
        );
    }
    abstract getNextRound(game: any): any;
    public async getAllPlayerElos(seasonId: string): Promise<any[]> {
        const result = await this.playerGameDatabase.groupBy({
            by: "playerId",
            _sum: {
                eloChange: true,
            },
            _count: {
                eloChange: true,
            },
            where: {
                game: {
                    seasonId: seasonId,
                    status: "FINISHED",
                    type: "RANKED",
                },
            },
        });
        const allPlayers = await prisma.player.findMany({
            select: {
                id: true,
                username: true,
            },
        });
        if (result === undefined) {
            throw new Error("getAllPlayerElos result undefined, seasonId = " + seasonId);
        }
        const usernameDict: any = {};
        for (const playerObj of allPlayers) {
            usernameDict[playerObj.id] = playerObj.username;
        }
        return result.map((player: any) => {
            return {
                id: player.playerId,
                username: usernameDict[player.playerId],
                elo: player._sum.eloChange,
                gameCount: player._count.eloChange,
            };
        });
    }

    public async getSelectedPlayerElos(seasonId: string, playerGames: any[]): Promise<any> {
        const playerIds: string[] = playerGames.map((playerGame) => playerGame.playerId);
        console.log(playerGames);
        const dbResult = await this.playerGameDatabase.groupBy({
            by: "playerId",
            _sum: {
                eloChange: true,
            },
            where: {
                game: {
                    seasonId: seasonId,
                    status: "FINISHED",
                    type: "RANKED",
                },
                playerId: {
                    in: playerIds,
                },
            },
        });
        if (dbResult === undefined) {
            throw new Error("getSelectedPlayerElos dbResult undefined, seasonId = " + seasonId);
        }
        const resultDict: any = {};
        for (const result of dbResult) {
            resultDict[result.playerId] = result._sum.eloChange;
        }
        return resultDict;
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
            const calculatedElos = await this.getPlayerEloDeltas(game, playerScores, eloStats);

            for (const calculatedElo of calculatedElos) {
                if (!eloStats[calculatedElo.playerId]) {
                    eloStats[calculatedElo.playerId] = 0;
                }
                eloStats[calculatedElo.playerId] += calculatedElo.eloChange;
            }
            await this.updatePlayerGameElo(calculatedElos, game);
            debugStats.push(calculatedElos);
        }
        return { eloStats: eloStats, orderedGames: finishedGames, debugStats: debugStats };
    }
    abstract isEligible(player: Player): boolean;
    abstract getQualifiedPlayers(): Promise<Player[]>;
}

export { GameService };
