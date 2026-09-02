import { GameStatus, GameType, Player, Wind } from "@prisma/client";
import { Transaction } from "../../validation/game.validation";
import { InvalidGameInputError } from "../../errors/domain.error";
interface GameFilterArgs {
    seasonId?: string;
    playerIds?: string[];
    gameType?: GameType;
    gameStatus?: GameStatus;
}

const WIND_ORDER: Wind[] = ["EAST", "SOUTH", "WEST", "NORTH"];

export const NUM_PLAYERS = 4;

export const STARTING_ELO = 1500;

// Throws error if the player list contains duplicates
const checkPlayerListUnique = (playerNameList: string[]): void => {
    if (new Set(playerNameList).size !== playerNameList.length) {
        throw new InvalidGameInputError("Player list contains duplicates");
    }
};

const generatePlayerQuery = (playerList: Player[]) => {
    return playerList.map((player, idx) => {
        return {
            wind: getWind(idx),
            player: {
                connect: {
                    id: player.id,
                },
            },
        };
    });
};

const generateGameQuery = (filter: GameFilterArgs) => {
    const query: {
        seasonId?: string;
        type?: GameType;
        status?: GameStatus;
        AND?: { players: { some: { playerId: string } } }[];
    } = {};
    if (typeof filter.seasonId !== "undefined") {
        query.seasonId = filter.seasonId;
    }
    if (typeof filter.playerIds !== "undefined") {
        query.AND = filter.playerIds.map((playerId) => {
            return {
                players: {
                    some: {
                        playerId: playerId,
                    },
                },
            };
        });
    }
    if (typeof filter.gameType !== "undefined") {
        query.type = filter.gameType;
    }
    if (typeof filter.gameStatus !== "undefined") {
        query.status = filter.gameStatus;
    }
    return query;
};

export function range(end: number) {
    return Array.from({ length: end }, (_, i) => i);
}

export function getEmptyScoreDelta(): number[] {
    return Array(NUM_PLAYERS).fill(0);
}

export function addScoreDeltas(scoreDelta1: number[], scoreDelta2: number[]): number[] {
    const finalScoreDelta = getEmptyScoreDelta();
    for (const index of range(NUM_PLAYERS)) {
        finalScoreDelta[index] += scoreDelta1[index] + scoreDelta2[index];
    }
    return finalScoreDelta;
}

export function reduceScoreDeltas(transactions: Transaction[]): number[] {
    return transactions.reduce<number[]>(
        (result, current) => addScoreDeltas(result, current.scoreDeltas),
        getEmptyScoreDelta(),
    );
}

const getWind = (index: number): Wind => {
    if (index < 0 || index > 3) {
        throw new Error("Invalid wind index");
    }

    return WIND_ORDER[index];
};

export const getNextRoundWind = (wind: Wind): Wind => {
    return getWind((WIND_ORDER.indexOf(wind) + 1) % NUM_PLAYERS);
};
export {
    checkPlayerListUnique,
    generatePlayerQuery,
    generateGameQuery,
    getWind,
    WIND_ORDER,
    Wind,
    GameFilterArgs,
};
