import { Player, Prisma, Wind } from "@prisma/client";
import HongKongGameService from "./hongKongGame.service";
import JapaneseGameService from "./japaneseGame.service";
import { findPlayerByUsernames } from "../player.service";
import { EloCalculatorInput } from "./eloCalculator";

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
    const playerList = await findPlayerByUsernames(originalPlayerNames);
    playerList.forEach((player) => checkPlayerGameEligibility(gameVariant, player));

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

const getWind = (index: number): Wind => {
    if (index < 0 || index > 3) {
        throw new Error("Invalid wind index");
    }

    return WIND_ORDER[index];
};

const getDealerPlayerId = (
    game: FullJapaneseGame | FullHongKongGame,
    roundNumber: number,
): string => {
    return game.players.find((player) => player.wind === getWind(roundNumber - 1))!.player.id;
};

const getPropertyFromIndex = (index: number) => {
    switch (index) {
        case 0:
            return "trueEastScoreChange";
        case 1:
            return "trueSouthScoreChange";
        case 2:
            return "trueWestScoreChange";
        case 3:
            return "trueNorthScoreChange";
        default:
            throw new Error("Invalid index");
    }
}

const requiresHand = (roundType: string): boolean => {
    return (
        roundType === "SELF_DRAW" ||
        roundType === "DEAL_IN" ||
        roundType === "DEAL_IN_PAO" ||
        roundType === "SELF_DRAW_PAO" ||
        roundType === "PAO"
    );
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

export {
    getGameService,
    checkPlayerGameEligibility,
    checkPlayerListUnique,
    generatePlayerQuery,
    getWind,
    getDealerPlayerId,
    requiresHand,
    createEloCalculatorInputs,
    getPropertyFromIndex,
    GAME_CONSTANTS,
    WIND_ORDER,
    Wind,
    FullJapaneseGame,
    FullJapaneseRound,
    FullHongKongGame,
    GameVariant,
};
