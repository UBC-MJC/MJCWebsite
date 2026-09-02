import { WIND_ORDER } from "./game.util";
import type { EloCalculatorInput, EloChange } from "./game.service";

interface PlayerWithAdjustedScore {
    playerId: string;
    score: number;
    elo: number;
}

/**
 * ===== Tunable constants =====
 *
 * MAGNITUDE:
 *   Overall weight applied to the Elo change.
 *
 * ELO_SIGNIFICANCE:
 *   Weight of the difference between the table's average Elo and the player's Elo.
 *
 * SCORE_DIVISOR:
 *   Converts Hong Kong final scores into the scale used by the Elo formula.
 */
const MAGNITUDE = 0.35;
const ELO_SIGNIFICANCE = 0.03;
const SCORE_DIVISOR = 5;
const PLACING_ADJUSTMENTS = [100, 0, 0, -100];

/**
 * Main API.
 *
 * Formula:
 *   EloChange =
 *     MAGNITUDE *
 *     (adjustedFinalScore / SCORE_DIVISOR
 *      + ELO_SIGNIFICANCE * (averageTableElo - playerElo))
 */
const getHongKongEloChanges = (playerInformation: EloCalculatorInput[]): EloChange[] => {
    const averageElo =
        playerInformation.reduce((sum, player) => sum + player.elo, 0) / playerInformation.length;

    const playersWithAdjustedScores = addPlacementAdjustments(playerInformation);

    return playersWithAdjustedScores.map((player) => {
        const normalizedScore = player.score / SCORE_DIVISOR;
        const eloDifference = averageElo - player.elo;
        const eloChange = MAGNITUDE * (normalizedScore + ELO_SIGNIFICANCE * eloDifference);

        return {
            playerId: player.playerId,
            eloChange,
        };
    });
};

/**
 * Apply placement adjustments to final scores.
 * If tied, earlier wind in WIND_ORDER ranks higher.
 */
const addPlacementAdjustments = (
    playerInformation: EloCalculatorInput[],
): PlayerWithAdjustedScore[] => {
    const sortedPlayers = playerInformation.sort((a, b) => {
        if (a.score === b.score) {
            return WIND_ORDER.indexOf(a.wind) - WIND_ORDER.indexOf(b.wind);
        }
        return b.score - a.score;
    });

    return sortedPlayers.map((player, index) => ({
        playerId: player.id,
        elo: player.elo,
        score: player.score + PLACING_ADJUSTMENTS[index],
    }));
};

export { getHongKongEloChanges };
