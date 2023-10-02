import { Player, Prisma, Wind } from "@prisma/client";
import HongKongGameService from "./hongKongGame.service";
import JapaneseGameService from "./japaneseGame.service";
import { findPlayerByUsernames } from "../player.service";

const fullJapaneseGame = Prisma.validator<Prisma.JapaneseGameDefaultArgs>()({
    include: {
        players: {
            include: {
                player: true,
            },
        },
        rounds: {
            include: {
                scores: true,
                hand: true,
            },
        },
    },
});

type FullJapaneseGame = Prisma.JapaneseGameGetPayload<typeof fullJapaneseGame>;

const fullHongKongGame = Prisma.validator<Prisma.HongKongGameDefaultArgs>()({
    include: {
        players: {
            include: {
                player: true,
            },
        },
        rounds: {
            include: {
                scores: true,
                hand: true,
            },
        },
    },
});

type FullHongKongGame = Prisma.HongKongGameGetPayload<typeof fullHongKongGame>;

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

const windOrder: Wind[] = ["EAST", "SOUTH", "WEST", "NORTH"];

const getWind = (index: number): Wind => {
    if (index < 0 || index > 3) {
        throw new Error("Invalid wind index");
    }

    return windOrder[index];
};

const getDealerPlayerId = (
    game: FullJapaneseGame | FullHongKongGame,
    roundNumber: number,
): string => {
    return game.players.find((player) => player.wind === getWind(roundNumber - 1))!.player.id;
};

const requiresHand = (roundType: string): boolean => {
    return (
        roundType === "SELF_DRAW" ||
        roundType === "DEAL_IN" ||
        roundType === "DEAL_IN_PAO" ||
        roundType === "SELF_DRAW_PAO"
    );
};

const getPlayerScores = (game: FullJapaneseGame | FullHongKongGame) => {
    const result: { [key: string]: number } = {};
    game.players.forEach((player) => {
        result[player.player.id] = 25000;
    });

    game.rounds.forEach((round) => {
        round.scores.forEach((score) => {
            result[score.playerId] += score.scoreChange;
        });
    });

    return result;
};

export {
    getGameService,
    checkPlayerGameEligibility,
    checkPlayerListUnique,
    generatePlayerQuery,
    getWind,
    getDealerPlayerId,
    requiresHand,
    getPlayerScores,
    windOrder,
    Wind,
    FullJapaneseGame,
    FullHongKongGame,
};
