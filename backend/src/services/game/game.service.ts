import { GameStatus, GameType, Player, Wind } from "@prisma/client";
import {
    checkPlayerListUnique,
    createEloCalculatorInputs,
    GameFilterArgs,
    generateGameQuery,
    generatePlayerQuery,
} from "./game.util";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
import prisma from "../../db";
import { findPlayerByUsernameOrEmail, sanitizeFullName } from "../player.service";

export type EloDict = { [key: string]: number };
const MAX_GAME_COUNT = 120;
const CHOMBO_ELO_DEDUCTION = 15;

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
        checkPlayerListUnique(players);

        const playerList = await Promise.all(
            players.map((playerName) => {
                return findPlayerByUsernameOrEmail(playerName);
            }),
        );
        // Throws error if the player is not eligible for the game type
        if (gameType === GameType.RANKED) {
            for (const player of playerList) {
                if (!this.isEligible(player!)) {
                    throw new Error("Player not eligible for game type");
                }
                const gameCount = await this.playerGameDatabase.count({
                    where: {
                        playerId: player.id,
                        game: {
                            seasonId: seasonId,
                            type: gameType,
                        },
                    },
                });
                if (gameCount > MAX_GAME_COUNT) {
                    throw Error("Maximum Game Count exceeded for player " + player.username + "!");
                }
            }
        }
        const playersQuery = generatePlayerQuery(playerList);
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
    public async updateGame(id: string, state: any): Promise<any> {
        return this.gameDatabase.update({
            where: {
                id: id,
            },
            data: state, // VERY UNSAFE. Don't expose to anyone.
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
    public async submitGame(game: any): Promise<any> {
        const playerScores = this.getGameFinalScore(game);
        const calculatedElos = await this.getPlayerEloDeltas(game, playerScores);

        const playerElos = await this.updatePlayerGameElo(calculatedElos, game);

        const updatedGame = await this.gameDatabase.update({
            where: {
                id: game.id,
            },
            data: {
                status: GameStatus.FINISHED,
                endedAt: new Date(),
            },
        });
        return { playerElos, updatedGame };
    }
    abstract createRound(game: any, roundRequest: any): Promise<any>;
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
                    fullName: sanitizeFullName(player.player.firstName, player.player.lastName),
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds.map((round: any) => this.transformDBRound(round)),
            eloDeltas: orderedEloDeltas,
            currentRound: nextRound,
        };
    }

    public async getPlayerEloDeltas(game: any, playerScores: number[]) {
        if (game.status === GameStatus.FINISHED) {
            return await this.playerGameDatabase.findMany({
                select: {
                    playerId: true,
                    eloChange: true,
                },
                where: {
                    gameId: game.id,
                },
            });
        }
        const eloDict = await this.getSelectedPlayerElos(game.seasonId, game.players, game.type);
        return this.getEloDeltas(game.players, playerScores, eloDict);
    }

    private getEloDeltas(
        playerGames: { player: Player; wind: Wind }[],
        playerScores: number[],
        eloDict: EloDict,
    ) {
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            playerGames,
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
    public async getAllPlayerElos(seasonId: string, gameType: GameType): Promise<any[]> {
        const result = await this.playerGameDatabase.groupBy({
            by: "playerId",
            _sum: {
                eloChange: true,
                chomboCount: true,
            },
            _count: {
                eloChange: true,
            },
            where: {
                game: {
                    seasonId: seasonId,
                    status: GameStatus.FINISHED,
                    type: gameType,
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
                elo: player._sum.eloChange - CHOMBO_ELO_DEDUCTION * player._sum.chomboCount,
                gameCount: player._count.eloChange,
            };
        });
    }

    public async getSelectedPlayerElos(
        seasonId: string,
        playerGames: any[],
        gameType: GameType,
    ): Promise<EloDict> {
        const playerIds: string[] = playerGames.map((playerGame) => playerGame.playerId);
        const dbResult = await this.playerGameDatabase.groupBy({
            by: "playerId",
            _sum: {
                eloChange: true,
            },
            where: {
                game: {
                    seasonId: seasonId,
                    status: GameStatus.FINISHED,
                    type: gameType,
                },
                playerId: {
                    in: playerIds,
                },
            },
        });
        if (dbResult === undefined) {
            throw new Error("getSelectedPlayerElos dbResult undefined, seasonId = " + seasonId);
        }
        const resultDict: EloDict = {};
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
        return prisma.$transaction(
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
            gameType: GameType.RANKED,
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
        const eloDict: EloDict = {};
        const debugStats = []; // to be removed once it has been established that this is correct
        for (const game of finishedGames) {
            const playerScores = this.getGameFinalScore(game);
            const calculatedElos = this.getEloDeltas(game.players, playerScores, eloDict);

            for (const calculatedElo of calculatedElos) {
                if (!eloDict[calculatedElo.playerId]) {
                    eloDict[calculatedElo.playerId] = 0;
                }
                eloDict[calculatedElo.playerId] += calculatedElo.eloChange;
            }
            await this.updatePlayerGameElo(calculatedElos, game);
            debugStats.push(calculatedElos);
        }
        return { eloDict: eloDict, orderedGames: finishedGames, debugStats: debugStats };
    }
    abstract isEligible(player: Player): boolean;
    abstract getQualifiedPlayers(gameType: GameType): Promise<Player[]>;
    abstract getUserStatistics(seasonId: string, playerId: string): Promise<any>;

    public async setChombo(gameId: number, playerId: string, chomboCount: number): Promise<any> {
        return await this.playerGameDatabase.updateMany({
            where: {
                gameId: gameId,
                playerId: playerId,
            },
            data: {
                chomboCount: chomboCount,
            },
        });
    }
}

export { GameService };
