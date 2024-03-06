import { GameStatus, GameType, Player, Wind } from "@prisma/client";
import { findPlayerByUsername } from "../player.service";
import { EloCalculatorInput } from "./eloCalculator";
import { Transaction } from "../../validation/game.validation";
import { JapaneseGameService } from "./japaneseGame.service";
import { HongKongGameService } from "./hongKongGame.service";
import { GameService } from "./game.service";
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
        SCORE_ADJUSTMENT: [55000, 25000, -5000, -75000],
    },
    hk: {
        STARTING_SCORE: 750,
        DIVIDING_CONSTANT: 5,
        SCORE_ADJUSTMENT: [100, 0, 0, -100],
    },
} as const;

export const NUM_PLAYERS = 4;

export const STARTING_ELO = 1500;

// Throws error if the player list contains duplicates
const checkPlayerListUnique = (playerNameList: string[]): void => {
    if (new Set(playerNameList).size !== playerNameList.length) {
        throw new Error("Player list contains duplicates");
    }
};

// Throws error if the player is not eligible for the game type
const generatePlayerQuery = async (
    originalPlayerNames: string[],
    checkEligibilityFunction: (x: Player) => boolean,
): Promise<any[]> => {
    checkPlayerListUnique(originalPlayerNames);

    const playerList = await Promise.all(
        originalPlayerNames.map((playerName) => {
            return findPlayerByUsername(playerName);
        }),
    );
    playerList.forEach((player) => {
        if (!checkEligibilityFunction(player!)) {
            throw new Error("Player not eligible for game type");
        }
    });
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
    playerGames: { player: Player; wind: Wind }[],
    playerScores: number[],
    eloDict: any,
): EloCalculatorInput[] => {
    return playerGames.map(({ player, wind }) => {
        return {
            id: player.id,
            elo: STARTING_ELO + player.id in eloDict ? eloDict[player.id] : 0,
            score: playerScores[WIND_ORDER.indexOf(wind)],
            wind: wind,
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
const getGameService = (gameVariant: string): GameService => {
    switch (gameVariant) {
        case "jp":
            return new JapaneseGameService() as GameService;
        case "hk":
            return new HongKongGameService() as GameService;
        default:
            throw new Error(`Invalid game variant ${gameVariant}`);
    }
};
export {
    checkPlayerListUnique,
    generatePlayerQuery,
    generateGameQuery,
    createEloCalculatorInputs,
    getWind,
    GAME_CONSTANTS,
    WIND_ORDER,
    Wind,
    GameFilterArgs,
    getGameService,
};
