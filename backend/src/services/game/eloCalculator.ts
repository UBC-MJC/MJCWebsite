import { GAME_CONSTANTS, WIND_ORDER } from "./game.util";
import { Wind } from "@prisma/client";

const JAPANESE_ADJUSTMENT = [70000, 35000, 0, -105000];
const HONG_KONG_SCORE_ADJUSTMENT = [450, 150, -150, -450];

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

    const correlation = 0.25;
    const k_factor = 240;

    const result = scoreAfterPlacement.map((player) => {
        const eloDifference = fieldElo - player.elo;
        const firstCalculation =
            (player.score - GAME_CONSTANTS[gameVariant].STARTING_SCORE) /
            GAME_CONSTANTS[gameVariant].DIVIDING_CONSTANT;
        const eloChange = firstCalculation * correlation + eloDifference / k_factor;

        return {
            playerId: player.playerId,
            eloChange: eloChange,
        };
    });

    return result;
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
