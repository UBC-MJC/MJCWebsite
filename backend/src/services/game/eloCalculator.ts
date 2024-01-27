import { GAME_CONSTANTS, WIND_ORDER } from "./game.util";
import { Wind } from "@prisma/client";

const JAPANESE_ADJUSTMENT = [55000, 25000, -5000, -75000];
const HONG_KONG_SCORE_ADJUSTMENT = [100, 0, 0, -100];

type EloCalculatorInput = {
    playerId: string;
    score: number;
    elo: number;
    wind: Wind;
};

const getEloChanges = (playerInformation: EloCalculatorInput[], gameVariant: "jp" | "hk") => {
    let fieldElo = playerInformation.reduce((sum, player) => sum + player.elo, 0);
    fieldElo = fieldElo / 4;

    const scoreAfterPlacement = addPlacementAdjustment(playerInformation, gameVariant);

    const magnitude = 0.35;
    const eloSignificance = 0.03;

    return scoreAfterPlacement.map((player) => {
        const rawScore = player.score / GAME_CONSTANTS[gameVariant].DIVIDING_CONSTANT;
        const eloDifference = fieldElo - player.elo;
        const eloChange = magnitude * (rawScore + eloSignificance * eloDifference);

        return {
            playerId: player.playerId,
            eloChange: eloChange,
        };
    });
};

const addPlacementAdjustment = (playerInformation: EloCalculatorInput[], gameVariant: string) => {
    let placingAdjustments: number[];
    if (gameVariant === "jp") {
        placingAdjustments = JAPANESE_ADJUSTMENT;
    } else if (gameVariant === "hk") {
        placingAdjustments = HONG_KONG_SCORE_ADJUSTMENT;
    } else {
        throw new Error("Invalid game variant");
    }

    const sortedPlayers = playerInformation.sort((a, b) => {
        if (a.score === b.score) {
            return WIND_ORDER.indexOf(a.wind) - WIND_ORDER.indexOf(b.wind);
        }
        return a.score < b.score ? 1 : -1;
    });

    return sortedPlayers.map((player, index) => {
        return {
            playerId: player.playerId,
            elo: player.elo,
            score: player.score + placingAdjustments[index],
        };
    });
};

export { getEloChanges, EloCalculatorInput };
