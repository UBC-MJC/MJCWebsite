import {GameStatus, GameType, JapaneseTransactionType, Player, Prisma, Wind,} from "@prisma/client";
import HongKongGameService, {getHongKongGameFinalScore, updateHongKongPlayerGameElo,} from "./hongKongGame.service";
import JapaneseGameService, {getJapaneseGameFinalScore, updateJapanesePlayerGameElo,} from "./japaneseGame.service";
import {findPlayerByUsername} from "../player.service";
import {EloCalculatorInput, getEloChanges} from "./eloCalculator";
import {JapaneseTransactionT, Transaction} from "../../validation/game.validation";
import {getAllPlayerElos} from "../leaderboard.service";
import GameService from "./game.service";

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

type FullJapaneseRound = Prisma.JapaneseRoundGetPayload<typeof fullJapaneseRound>;

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

const fullHongKongRound = Prisma.validator<Prisma.HongKongRoundDefaultArgs>()({
    include: {
        transactions: true,
    },
});

type FullHongKongRound = Prisma.HongKongRoundGetPayload<typeof fullHongKongRound>;

type GameVariant = "jp" | "hk";

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

const getPlayerEloDeltas = async (
    game: FullJapaneseGame | FullHongKongGame,
    playerScores: number[],
    gameVariant: GameVariant,
    overridingEloList?: any[],
) => {
    let eloList = overridingEloList;
    if (eloList === undefined) {
        eloList = await getAllPlayerElos(gameVariant, game.seasonId);
    }
    const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
        game.players,
        playerScores,
        eloList,
    );
    return getEloChanges(eloCalculatorInput, gameVariant);
};

const createEloCalculatorInputs = (
    players: { player: Player; wind: Wind }[],
    playerScores: number[],
    eloList: any[],
): EloCalculatorInput[] => {
    return players.map((player) => {
        let elo = STARTING_ELO;
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

export function getGameFinalScore(game: any, gameVariant: GameVariant): number[] {
    if (gameVariant === "jp") {
        return getJapaneseGameFinalScore(game);
    }
    if (gameVariant === "hk") {
        return getHongKongGameFinalScore(game);
    }
    throw new Error(`Invalid game variant ${gameVariant}`);
}

async function updateGamePlayerElo(calculatedElos: any[], game: any, gameVariant: GameVariant) {
    if (gameVariant === "jp") {
        await updateJapanesePlayerGameElo(calculatedElos, game);
        return;
    }
    if (gameVariant === "hk") {
        await updateHongKongPlayerGameElo(calculatedElos, game);
        return;
    }
    throw new Error(`Invalid game variant ${gameVariant}`);
}

export async function recalcSeason(seasonId: string, gameVariant: GameVariant): Promise<any> {
    const finishedGames = await getGameService(gameVariant).getGames({
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
        const playerScores = getGameFinalScore(game, gameVariant);
        const calculatedElos = await getPlayerEloDeltas(
            game,
            playerScores,
            gameVariant,
            transformEloStats(eloStats),
        );

        for (const calculatedElo of calculatedElos) {
            if (!(calculatedElo.playerId in eloStats)) {
                eloStats[calculatedElo.playerId] = 0;
            }
            eloStats[calculatedElo.playerId] =
                eloStats[calculatedElo.playerId] + calculatedElo.eloChange;
        }
        await updateGamePlayerElo(calculatedElos, game, gameVariant);
        debugStats.push(calculatedElos);
    }
    return { eloStats: eloStats, orderedGames: finishedGames, debugStats: debugStats };
}

function transformEloStats(eloStats: any): any[] {
    const result = [];
    for (const [key, value] of Object.entries(eloStats)) {
        result.push({
            playerId: key,
            elo: value,
        });
    }
    return result;
}
export {
    getGameService,
    checkPlayerGameEligibility,
    checkPlayerListUnique,
    generatePlayerQuery,
    generateGameQuery,
    getPlayerEloDeltas,
    createEloCalculatorInputs,
    getWind,
    GAME_CONSTANTS,
    WIND_ORDER,
    Wind,
    FullJapaneseGame,
    FullJapaneseRound,
    FullHongKongGame,
    FullHongKongRound,
    GameVariant,
    GameFilterArgs,
};
