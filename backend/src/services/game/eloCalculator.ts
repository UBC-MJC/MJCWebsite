import { WIND_ORDER } from "./game.util";
import { Wind } from "@prisma/client";

interface EloCalculatorInput {
    id: string;
    score: number;
    elo: number;
    wind: Wind;
}

interface EloChangeResult {
    playerId: string;
    eloChange: number;
}

type Placement = 1 | 2 | 3 | 4;

interface PlayerWithPlacement {
    playerId: string;
    score: number;
    elo: number;
    wind: Wind;
    placement: Placement;
}

/**
 * ===== Tunable constants =====
 *
 * ELO_DIVISOR:
 *   Standard Elo divisor for converting Elo to relative strength.
 *
 * SCORE_K:
 *   Weight of final table points on Elo change.
 *   If you want placement to dominate more strongly, reduce SCORE_K.
 */
const ELO_DIVISOR = 838; // So that a 100-point Elo difference corresponds to about 1.3x strength difference
const SCORE_K = 0.05;

/**
 * Placement Elo values.
 *
 * Under equal Elo (before adding score adjustments):
 *   1st -> about +20
 *   2nd -> about +10
 *   3rd -> about 0
 *   4th -> about -30
 *
 * Since the sum is 0, equal-strength tables are naturally zero-sum.
 */
const PLACEMENT_ELO_MAP: Record<Placement, number> = {
    1: 20,
    2: 10,
    3: 0,
    4: -30,
};

/**
 * Main API.
 *
 * Formula:
 *   EloChange =
 *     (actualPlacementElo - expectedPlacementElo)
 *     + SCORE_K * normalizedFinalScore
 *
 * where:
 *   expectedPlacementElo is computed from finish-place probabilities
 *   derived from a Plackett-Luce model based on Elo strengths.
 */
const getEloChanges = (
    playerInformation: EloCalculatorInput[],
    placingAdjustments: number[], // i.e. Uma in Riichi
    dividingConstant: number,
): EloChangeResult[] => {

    const totalScore = playerInformation.reduce((sum, player) => sum + player.score, 0);
    const startingScore = totalScore / playerInformation.length;

    const playersWithPlacement = getPlacementResults(playerInformation, placingAdjustments);

    const rawResults = playersWithPlacement.map((player) => {
        const actualPlacementElo = getActualPlacementElo(player.placement);
        const expectedPlacementElo = getExpectedPlacementElo(player, playersWithPlacement);

        const placementComponent = actualPlacementElo - expectedPlacementElo;

        /**
         * Final score component.
         *
         * Centered at startingScore, which equals to 25000 for Riichi, 750 for HK. 
         * This component sums to 0 across the table.
         */
        const normalizedFinalScore = (player.score - startingScore) / dividingConstant;
        const scoreComponent = SCORE_K * normalizedFinalScore;

        const eloChange = placementComponent + scoreComponent;

        return {
            playerId: player.playerId,
            eloChange,
        };
    });

    /**
     * Normalize for exact zero-sum at the table level.
     */
    const totalChange = rawResults.reduce((sum, result) => sum + result.eloChange, 0);
    const offset = totalChange / rawResults.length;

    return rawResults.map((result) => ({
        playerId: result.playerId,
        eloChange: result.eloChange - offset,
    }));
};

/**
 * Determine placement by adjusted score:
 *   adjustedScore = raw score + placing adjustment for final place
 *
 * If tied, earlier wind in WIND_ORDER ranks higher.
 */
const getPlacementResults = (
    playerInformation: EloCalculatorInput[],
    placingAdjustments: number[],
): PlayerWithPlacement[] => {
    const sortedByRawPlacement = playerInformation.sort((a, b) => {
        if (a.score === b.score) {
            return WIND_ORDER.indexOf(a.wind) - WIND_ORDER.indexOf(b.wind);
        }
        return b.score - a.score;
    });

    const playersWithAdjustedScore = sortedByRawPlacement.map((player, index) => ({
        ...player,
        adjustedScore: player.score + placingAdjustments[index],
    }));

    return playersWithAdjustedScore.map((player, index) => ({
        playerId: player.id,
        score: player.adjustedScore,
        elo: player.elo,
        wind: player.wind,
        placement: (index + 1) as Placement,
    }));
};

const getActualPlacementElo = (placement: Placement): number => {
    return PLACEMENT_ELO_MAP[placement];
};

/**
 * Convert Elo to Plackett-Luce strength weight.
 */
const getStrengthWeight = (elo: number): number => {
    return Math.pow(10, elo / ELO_DIVISOR);
};

/**
 * Generate all permutations of an array.
 * For 4 players there are only 24 permutations, so this is cheap.
 */
const getPermutations = <T>(items: T[]): T[][] => {
    if (items.length <= 1) {
        return [items];
    }

    const result: T[][] = [];

    for (let i = 0; i < items.length; i++) {
        const current = items[i];
        const remaining = items.slice(0, i).concat(items.slice(i + 1));
        const remainingPermutations = getPermutations(remaining);

        for (const permutation of remainingPermutations) {
            result.push([current, ...permutation]);
        }
    }

    return result;
};

/**
 * Probability of a full finishing order under the Plackett-Luce model.
 *
 * For order [A, B, C, D]:
 *   P = P(A first) * P(B second | A removed) * P(C third | A,B removed) * 1
 */
const getOrderProbability = (
    orderedPlayers: PlayerWithPlacement[],
): number => {
    const weights = orderedPlayers.map((player) => getStrengthWeight(player.elo));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const {probability} = weights.slice(0, -1).reduce(
        ({consumedWeight, probability}, weight) => {
            const remainingWeight = totalWeight - consumedWeight;
            return {
                consumedWeight: consumedWeight + weight,
                probability: probability * (weight / remainingWeight),
            };
        },
        { consumedWeight: 0, probability: 1 },
    );

    return probability;
};

/**
 * Expected placement Elo:
 *
 *   sum_over_all_orders(
 *      P(order) * placementElo(player's place in that order)
 *   )
 *
 * This exactly gives:
 * - under equal Elo: average of [20, 10, 0, -30] = 0
 * - under uneven Elo: stronger players get higher expected placement Elo
 */
const getExpectedPlacementElo = (
    player: PlayerWithPlacement,
    allPlayers: PlayerWithPlacement[],
): number => {
    const allOrders = getPermutations(allPlayers);
    let expectedPlacementElo = 0;

    for (const order of allOrders) {
        const probability = getOrderProbability(order);
        const placementIndex = order.findIndex((p) => p.playerId === player.playerId);

        const placement = (placementIndex + 1) as Placement;
        expectedPlacementElo += probability * PLACEMENT_ELO_MAP[placement];
    }

    return expectedPlacementElo;
};

export { getEloChanges, EloCalculatorInput };
