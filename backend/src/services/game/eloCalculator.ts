import { WIND_ORDER } from "./game.util";
import { Wind } from "@prisma/client";

interface EloCalculatorInput {
    id: string;
    score: number;
    elo: number;
    wind: Wind;
}

const getEloChanges = (
    playerInformation: EloCalculatorInput[],
    placingAdjustments: number[],
    dividingConstant: number,
) => {
    const avgElo = playerInformation.reduce((sum, player) => sum + player.elo, 0) / 4;

    const scoreAfterPlacement = addPlacementAdjustment(playerInformation, placingAdjustments);

    const magnitude = 0.35;
    const eloSignificance = 0.03;

    return scoreAfterPlacement.map((player) => {
        const rawScore = player.score / dividingConstant;
        const eloDifference = avgElo - player.elo;
        const eloChange = magnitude * (rawScore + eloSignificance * eloDifference);
        return {
            playerId: player.playerId,
            eloChange: eloChange,
        };
    });
};

const addPlacementAdjustment = (
    playerInformation: EloCalculatorInput[],
    placingAdjustments: number[],
) => {
    const sortedPlayers = playerInformation.sort((a, b) => {
        if (a.score === b.score) {
            return WIND_ORDER.indexOf(a.wind) - WIND_ORDER.indexOf(b.wind);
        }
        return a.score < b.score ? 1 : -1;
    });

    return sortedPlayers.map((player, index) => {
        return {
            playerId: player.id,
            elo: player.elo,
            score: player.score + placingAdjustments[index],
        };
    });
};

export { getEloChanges, EloCalculatorInput };
