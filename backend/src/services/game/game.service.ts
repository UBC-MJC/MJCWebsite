import { GameStatus, GameType, Player, Prisma, Wind } from "@prisma/client";
import {
    checkPlayerListUnique,
    GameFilterArgs,
    generateGameQuery,
    generatePlayerQuery,
    STARTING_ELO,
    WIND_ORDER,
} from "./game.util";
import prisma from "../../db";
import { findPlayerByUsernameOrEmail } from "../player.service";
import { InvalidGameInputError } from "../../errors/domain.error";

export type EloDict = Record<string, number>;

interface GamePlayerWithPlayer {
    id: string;
    playerId: string;
    wind: Wind;
    player: Player;
}

interface GameWithRelations {
    id: number;
    seasonId: string;
    type: GameType;
    status: GameStatus;
    recordedById: string;
    createdAt: Date;
    endedAt: Date | null;
    players: GamePlayerWithPlayer[];
    rounds: { id: string }[];
}

interface MappedGame<TTransformedRound, TNextRound> {
    id: number;
    type: GameType;
    status: GameStatus;
    recordedById: string;
    createdAt: Date;
    players: { id: string; username: string; trueWind: Wind }[];
    rounds: TTransformedRound[];
    eloDeltas: Record<string, number>;
    currentRound: TNextRound;
}

interface EloCalculatorInput {
    id: string;
    score: number;
    elo: number;
    wind: Wind;
}

interface EloChange {
    playerId: string;
    eloChange: number;
}

interface PlayerGameEloUpdate {
    playerGameId: string;
    eloChange: number;
}

interface GameRecord {
    id: number;
    seasonId: string;
    type: GameType;
    status: GameStatus;
    recordedById: string;
    createdAt: Date;
    endedAt: Date | null;
}

interface GameDatabase<TGame> {
    create(args: object): Prisma.PrismaPromise<GameRecord>;
    update(args: object): Prisma.PrismaPromise<GameRecord>;
    findUnique(args: object): Prisma.PrismaPromise<TGame | null>;
    findMany(args: object): Prisma.PrismaPromise<TGame[]>;
    delete(args: object): Prisma.PrismaPromise<unknown>;
}

interface PlayerGameDatabase {
    findMany(args: object): Prisma.PrismaPromise<EloChange[]>;
    groupBy<TResult>(args: object): Prisma.PrismaPromise<TResult>;
    update(args: object): Prisma.PrismaPromise<unknown>;
    updateMany(args: object): Prisma.PrismaPromise<unknown>;
}

interface PlayerEloAggregate {
    playerId: string;
    _sum: {
        eloChange: number;
        chomboCount: number;
    };
    _count: {
        eloChange: number;
    };
}

interface PlayerEloSummary {
    id: string;
    username: string;
    elo: number;
    chomboCount: number;
    gameCount: number;
}

interface RecalculatedSeason {
    eloDict: EloDict;
    orderedGames: GameWithRelations[];
    debugStats: EloChange[][];
}

abstract class GameService<
    TGame extends GameWithRelations = GameWithRelations,
    TConcludedRound = never,
    TTransformedRound = unknown,
    TNextRound = unknown,
    TCreatedRound = unknown,
> {
    public readonly gameDatabase: GameDatabase<TGame>;
    public readonly playerGameDatabase: PlayerGameDatabase;
    protected constructor(gameDatabase: unknown, playerGameDatabase: unknown) {
        this.gameDatabase = gameDatabase as GameDatabase<TGame>;
        this.playerGameDatabase = playerGameDatabase as PlayerGameDatabase;
    }

    public async createGame(
        gameType: GameType,
        players: string[],
        recorderId: string,
        seasonId: string,
    ): Promise<GameRecord> {
        checkPlayerListUnique(players);

        const playerList = await Promise.all(
            players.map((playerName) => {
                return findPlayerByUsernameOrEmail(playerName);
            }),
        );
        const foundPlayers = playerList.map((player, index) => {
            if (!player) {
                throw new InvalidGameInputError(`Player not found: ${players[index]}`);
            }
            return player;
        });
        // Throws error if the player is not eligible for the game type
        if (gameType === GameType.RANKED) {
            for (const player of foundPlayers) {
                if (!this.isEligible(player)) {
                    throw new InvalidGameInputError("Player not eligible for game type");
                }
            }
        }
        const playersQuery = generatePlayerQuery(foundPlayers);
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
    public async updateGame(id: number, state: Record<string, unknown>): Promise<GameRecord> {
        return this.gameDatabase.update({
            where: {
                id: id,
            },
            data: state, // VERY UNSAFE. Don't expose to anyone.
        });
    }
    public async getGame(id: number): Promise<TGame | null> {
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

    public async getGameOrThrow(id: number): Promise<TGame> {
        const game = await this.getGame(id);
        if (!game) {
            throw new Error(`Game not found: ${id}`);
        }
        return game;
    }

    public async getGames(filter: GameFilterArgs): Promise<TGame[]> {
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
    public async submitGame(game: TGame): Promise<{
        playerElos: unknown[];
        updatedGame: unknown;
    }> {
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
    abstract createRound(
        game: Pick<TGame, "id">,
        concludedRound: TConcludedRound,
    ): Promise<TCreatedRound>;
    abstract deleteRound(id: string): Promise<void>;
    public async mapGameObject(game: TGame): Promise<MappedGame<TTransformedRound, TNextRound>> {
        const nextRound = this.getNextRound(game);
        const playerScores = this.getGameFinalScore(game);
        const eloDeltas = await this.getPlayerEloDeltas(game, playerScores);
        const orderedEloDeltas = eloDeltas.reduce<Record<string, number>>((result, deltaObject) => {
            result[deltaObject.playerId] = deltaObject.eloChange;
            return result;
        }, {});
        return {
            id: game.id,
            type: game.type,
            status: game.status,
            recordedById: game.recordedById,
            createdAt: game.createdAt,
            players: game.players.map((player) => {
                return {
                    id: player.player.id,
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds.map((round) => this.transformDBRound(round)),
            eloDeltas: orderedEloDeltas,
            currentRound: nextRound,
        };
    }

    public async getPlayerEloDeltas(game: TGame, playerScores: number[]): Promise<EloChange[]> {
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

    protected abstract calculateEloChanges: (
        playerInformation: EloCalculatorInput[],
    ) => EloChange[];

    private getEloDeltas(
        playerGames: { player: Player; wind: Wind }[],
        playerScores: number[],
        eloDict: EloDict,
    ): EloChange[] {
        const eloCalculatorInputs = this.createEloCalculatorInputs(
            playerGames,
            playerScores,
            eloDict,
        );
        return this.calculateEloChanges(eloCalculatorInputs);
    }

    private createEloCalculatorInputs(
        playerGames: { player: Player; wind: Wind }[],
        playerScores: number[],
        eloDict: EloDict,
    ): EloCalculatorInput[] {
        return playerGames.map(({ player, wind }) => ({
            id: player.id,
            elo: STARTING_ELO + (player.id in eloDict ? eloDict[player.id] : 0),
            score: playerScores[WIND_ORDER.indexOf(wind)],
            wind,
        }));
    }

    abstract getNextRound(game: TGame): TNextRound;
    public async getAllPlayerElos(
        seasonId: string,
        gameType: GameType,
    ): Promise<PlayerEloSummary[]> {
        const result = await this.playerGameDatabase.groupBy<PlayerEloAggregate[]>({
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
        const usernameDict: Record<string, string> = {};
        for (const playerObj of allPlayers) {
            usernameDict[playerObj.id] = playerObj.username;
        }
        return result.map((player) => ({
            id: player.playerId,
            username: usernameDict[player.playerId],
            elo: player._sum.eloChange,
            chomboCount: player._sum.chomboCount,
            gameCount: player._count.eloChange,
        }));
    }

    public async getSelectedPlayerElos(
        seasonId: string,
        playerGames: Pick<GamePlayerWithPlayer, "playerId">[],
        gameType: GameType,
    ): Promise<EloDict> {
        const playerIds: string[] = playerGames.map((playerGame) => playerGame.playerId);
        const dbResult = await this.playerGameDatabase.groupBy<
            { playerId: string; _sum: { eloChange: number } }[]
        >({
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

    abstract getGameFinalScore(game: TGame): number[];

    public async updatePlayerGameElo(calculatedElos: EloChange[], game: TGame): Promise<unknown[]> {
        return this.updatePlayerGameElos(this.getPlayerGameEloUpdates(calculatedElos, game));
    }

    private getPlayerGameEloUpdates(
        calculatedElos: EloChange[],
        game: TGame,
    ): PlayerGameEloUpdate[] {
        return calculatedElos.map((eloObject) => {
            const playerGame = game.players.find(
                (player) => player.playerId === eloObject.playerId,
            );
            if (!playerGame) {
                throw new Error(
                    `Player ${eloObject.playerId} is not associated with game ${game.id}`,
                );
            }
            return {
                playerGameId: playerGame.id,
                eloChange: eloObject.eloChange,
            };
        });
    }

    private async updatePlayerGameElos(updates: PlayerGameEloUpdate[]): Promise<unknown[]> {
        if (updates.length === 0) {
            return [];
        }
        return prisma.$transaction(
            updates.map((update) => {
                return this.playerGameDatabase.update({
                    where: {
                        id: update.playerGameId,
                    },
                    data: {
                        eloChange: update.eloChange,
                    },
                });
            }),
        );
    }

    abstract transformDBRound(dbRound: TGame["rounds"][number]): TTransformedRound;
    public async recalcSeason(seasonId: string): Promise<RecalculatedSeason> {
        const finishedGames = await this.getGames({
            seasonId: seasonId,
            gameType: GameType.RANKED,
            gameStatus: GameStatus.FINISHED,
        });
        finishedGames.sort((a, b) => {
            const date1 = a.endedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const date2 = b.endedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return date1 - date2;
        });
        const eloDict: EloDict = {};
        const debugStats: EloChange[][] = []; // to be removed once it has been established that this is correct
        const eloUpdates: PlayerGameEloUpdate[] = [];
        for (const game of finishedGames) {
            const playerScores = this.getGameFinalScore(game);
            const calculatedElos = this.getEloDeltas(game.players, playerScores, eloDict);

            for (const calculatedElo of calculatedElos) {
                if (!eloDict[calculatedElo.playerId]) {
                    eloDict[calculatedElo.playerId] = 0;
                }
                eloDict[calculatedElo.playerId] += calculatedElo.eloChange;
            }
            eloUpdates.push(...this.getPlayerGameEloUpdates(calculatedElos, game));
            debugStats.push(calculatedElos);
        }
        await this.updatePlayerGameElos(eloUpdates);
        return { eloDict: eloDict, orderedGames: finishedGames, debugStats: debugStats };
    }
    abstract isEligible(player: Player): boolean;
    abstract getQualifiedPlayers(gameType: GameType): Promise<Player[]>;
    abstract getUserStatistics(seasonId: string | "", playerId: string): Promise<unknown>;
    abstract getPlacementHistory(seasonId: string | "", playerId: string): Promise<unknown[]>;

    public async setChombo(
        gameId: number,
        playerId: string,
        chomboCount: number,
    ): Promise<unknown> {
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

export { EloCalculatorInput, EloChange, GameService, GameWithRelations, MappedGame };
