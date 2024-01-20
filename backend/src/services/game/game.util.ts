import { JapaneseTransactionType, Player, Prisma, Wind } from "@prisma/client";
import HongKongGameService from "./hongKongGame.service";
import JapaneseGameService from "./japaneseGame.service";
import { findPlayerByUsernames } from "../player.service";
import { EloCalculatorInput } from "./eloCalculator";
import {
    JapaneseTransactionT,
    Transaction,
} from "../../validation/game.validation";

const fullJapaneseGame = Prisma.validator<Prisma.JapaneseGameDefaultArgs>()({
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

type FullJapaneseGame = Prisma.JapaneseGameGetPayload<typeof fullJapaneseGame>;

const fullJapaneseRound = Prisma.validator<Prisma.JapaneseRoundDefaultArgs>()({
    include: {
        transactions: true,
    },
});

type FullJapaneseRound = Prisma.JapaneseRoundGetPayload<
    typeof fullJapaneseRound
>;

const fullHongKongGame = Prisma.validator<Prisma.HongKongGameDefaultArgs>()({
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

type FullHongKongGame = Prisma.HongKongGameGetPayload<typeof fullHongKongGame>;

type GameVariant = "jp" | "hk";

const getGameService = (gameVariant: string): any => {
    switch (gameVariant) {
        case "jp":
            return new JapaneseGameService();
        case "hk":
            return new HongKongGameService();
        default:
            throw new Error("Invalid game variant");
    }
};

const WIND_ORDER: Wind[] = ["EAST", "SOUTH", "WEST", "NORTH"];

const GAME_CONSTANTS = {
    jp: {
        STARTING_SCORE: 25000,
        DIVIDING_CONSTANT: 1000,
    },
    hk: {
        STARTING_SCORE: 750,
        DIVIDING_CONSTANT: 16,
    },
} as const;

export const NUM_PLAYERS = 4;

// Throws error if the player list contains duplicates
const checkPlayerListUnique = (playerNameList: string[]): void => {
    if (new Set(playerNameList).size !== playerNameList.length) {
        throw new Error("Player list contains duplicates");
    }
};

// Throws error if the player is not eligible for the game type
const checkPlayerGameEligibility = (
    gameVariant: string,
    player: Player,
): void => {
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
    const playerList = await findPlayerByUsernames(originalPlayerNames);
    playerList.forEach((player) =>
        checkPlayerGameEligibility(gameVariant, player),
    );

    return playerList.map((player: Player) => {
        return {
            wind: getWind(originalPlayerNames.indexOf(player.username)),
            player: {
                connect: {
                    id: player.id,
                },
            },
        };
    });
};
const createEloCalculatorInputs = (
    players: { player: Player; wind: Wind }[],
    playerScores: number[],
    eloList: any[],
): EloCalculatorInput[] => {
    return players.map((player) => {
        let elo = 1500;
        const eloObject = eloList.find((x) => x.playerId === player.player.id);
        if (typeof eloObject !== "undefined") {
            elo += eloObject.elo;
        }

        return {
            playerId: player.player.id,
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

export function addScoreDeltas(
    scoreDelta1: number[],
    scoreDelta2: number[],
): number[] {
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

export function containingAny(
    transactions: JapaneseTransactionT[],
    transactionType: JapaneseTransactionType,
): JapaneseTransactionT | null {
    for (const transaction of transactions) {
        if (transaction.transactionType === transactionType) {
            return transaction;
        }
    }
    return null;
}

export {
    getGameService,
    checkPlayerGameEligibility,
    checkPlayerListUnique,
    generatePlayerQuery,
    createEloCalculatorInputs,
    getWind,
    GAME_CONSTANTS,
    WIND_ORDER,
    Wind,
    FullJapaneseGame,
    FullJapaneseRound,
    FullHongKongGame,
    GameVariant,
};
