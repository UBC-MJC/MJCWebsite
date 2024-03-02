import {GameStatus, GameType, Player, Wind} from "@prisma/client";
import {findPlayerByUsername} from "../player.service";
import {EloCalculatorInput} from "./eloCalculator";
import {Transaction} from "../../validation/game.validation";

type GameVariant = "jp" | "hk";

type GameFilterArgs = {
    seasonId?: string;
    playerIds?: string[];
    gameType?: GameType;
    gameStatus?: GameStatus;
};

const WIND_ORDER: Wind[] = ["EAST", "SOUTH", "WEST", "NORTH"];

const GAME_CONSTANTS = {
    jp: {
        STARTING_SCORE: 25000,
        DIVIDING_CONSTANT: 1000,
    },
    hk: {
        STARTING_SCORE: 750,
        DIVIDING_CONSTANT: 5,
    },
} as const;

export const NUM_PLAYERS = 4;

export const RIICHI_STICK_VALUE = 1000;

export const STARTING_ELO = 1500;

// Throws error if the player list contains duplicates
const checkPlayerListUnique = (playerNameList: string[]): void => {
    if (new Set(playerNameList).size !== playerNameList.length) {
        throw new Error("Player list contains duplicates");
    }
};

// Throws error if the player is not eligible for the game type
const checkPlayerGameEligibility = (gameVariant: string, player: Player): void => {
    if (gameVariant === "jp" && player.japaneseQualified) {
        return;
    } else if (gameVariant === "hk" && player.hongKongQualified) {
        return;
    }

    throw new Error("Player not eligible for game type");
};

const generatePlayerQuery = async (
    gameVariant: string,
    originalPlayerNames: string[],
): Promise<any[]> => {
    checkPlayerListUnique(originalPlayerNames);

    const playerList = await Promise.all(
        originalPlayerNames.map((playerName) => {
            return findPlayerByUsername(playerName);
        }),
    );
    playerList.forEach((player) => checkPlayerGameEligibility(gameVariant, player!));
    return playerList.map((player, idx) => {
        return {
            wind: getWind(idx),
            player: {
                connect: {
                    id: player!.id,
                },
            },
        };
    });
};

const generateGameQuery = (filter: GameFilterArgs): any => {
    const query: any = {};
    if (typeof filter.seasonId !== "undefined") {
        query.seasonId = filter.seasonId;
    }
    if (typeof filter.playerIds !== "undefined") {
        query.players = {
            some: {
                playerId: {
                    in: filter.playerIds,
                },
            },
        };
    }
    if (typeof filter.gameType !== "undefined") {
        query.type = filter.gameType;
    }
    if (typeof filter.gameStatus !== "undefined") {
        query.status = filter.gameStatus;
    }
    return query;
};

const createEloCalculatorInputs = (
    players: { player: Player; wind: Wind }[],
    playerScores: number[],
    eloList: any[],
): EloCalculatorInput[] => {
    return players.map((player) => {
        let elo = STARTING_ELO;
        for (const eloEntry of eloList) {
            if (eloEntry.id === player.player.id) {
                elo += eloEntry.elo;
            }
        }

        return {
            id: player.player.id,
            elo: elo,
            score: playerScores[WIND_ORDER.indexOf(player.wind)],
            wind: player.wind,
        };
    });
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

export function transformEloStats(eloStats: any): any[] {
    const result = [];
    for (const [key, value] of Object.entries(eloStats)) {
        result.push({
            id: key,
            elo: value,
        });
    }
    return result;
}
export {
    checkPlayerGameEligibility,
    checkPlayerListUnique,
    generatePlayerQuery,
    generateGameQuery,
    createEloCalculatorInputs,
    getWind,
    GAME_CONSTANTS,
    WIND_ORDER,
    Wind,
    GameVariant,
    GameFilterArgs,
};
