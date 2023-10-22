import { FullHongKongGame, FullJapaneseGame, windOrder } from "./game.util";
import { Wind } from "@prisma/client";
import { ruleVariantTable } from "./constants";

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
    const specificsTable = ruleVariantTable[gameVariant];
    const scoreAfterPlacement = addPlacementAdjustment(playerInformation, gameVariant);

    const adjustment = specificsTable.adjustmentFactor;
    const impactFactor = specificsTable.eloImpactFactor;

    const result = scoreAfterPlacement.map((player) => {
        const eloDifference = fieldElo - player.elo;
        const firstCalculation =
            (player.score - specificsTable.startingPoint) / specificsTable.divisor;
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
    const placingAdjustments = ruleVariantTable[gameVariant].scoreAdjustments;

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
