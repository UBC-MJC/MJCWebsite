import { FullHongKongGame, FullJapaneseGame, windOrder } from "./game.util";
import { Wind } from "@prisma/client";

const JAPANESE_ADJUSTMENT = [55000, 25000, -5000, -75000];
const HONG_KONG_SCORE_ADJUSTMENT = [450, 150, -150, -450];

type EloCalculatorInput = {
    playerId: string;
    score: number;
    elo: number;
    wind: Wind;
};

const getEloChanges = (playerInformation: EloCalculatorInput[], gameVariant: string) => {
    let fieldElo = 0.0;
    playerInformation.forEach((player) => {
        fieldElo += player.elo;
    });
    fieldElo = fieldElo / 4;

    const scoreAfterPlacement = addPlacementAdjustment(playerInformation, gameVariant);

    const adjustment = 0.35;
    const impactFactor = 0.03;

    const result = scoreAfterPlacement.map((player) => {
        const eloDifference = fieldElo - player.elo;
        const firstCalculation = (player.score - 25000) / 1000;
        const eloChange = (firstCalculation + eloDifference * impactFactor) * adjustment;

        return {
            playerId: player.playerId,
            eloChange: eloChange,
            position: player.position,
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
            return windOrder.indexOf(a.wind) - windOrder.indexOf(b.wind);
        }
        return a.score < b.score ? 1 : -1;
    });

    return sortedPlayers.map((player, index) => {
        return {
            playerId: player.playerId,
            elo: player.elo,
            score: player.score + placingAdjustments[index],
            position: index + 1,
        };
    });
};

export { getEloChanges, EloCalculatorInput };
