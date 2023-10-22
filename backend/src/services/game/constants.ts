export const JAPANESE_STARTING_POINT = 25000;
export const JAPANESE_SCORE_ADJUSTMENTS = [55000, 25000, -5000, -75000];
export const JAPANESE_DIVISOR = 1000;
export const JAPANESE_ADJUSTMENT_FACTOR = 0.35;
export const JAPANESE_ELO_IMPACT_FACTOR = 0.03;

export const HONGKONG_STARTING_POINT = 750;
export const HONGKONG_SCORE_ADJUSTMENTS = [100, 0, 0, -100];
export const HONGKONG_DIVISOR = 1;
export const HONGKONG_ADJUSTMENT_FACTOR = 0.05;
export const HONGKONG_ELO_IMPACT_FACTOR = 0.03;


export const ruleVariantTable = {
    "jp": {
        startingPoint: JAPANESE_STARTING_POINT,
        scoreAdjustments: JAPANESE_SCORE_ADJUSTMENTS,
        divisor: JAPANESE_DIVISOR,
        adjustmentFactor: JAPANESE_ADJUSTMENT_FACTOR,
        eloImpactFactor: JAPANESE_ELO_IMPACT_FACTOR
    },
    "hk": {
        startingPoint: HONGKONG_STARTING_POINT,
        scoreAdjustments: HONGKONG_SCORE_ADJUSTMENTS,
        divisor: HONGKONG_DIVISOR,
        adjustmentFactor: HONGKONG_ADJUSTMENT_FACTOR,
        eloImpactFactor: HONGKONG_ELO_IMPACT_FACTOR
    }
}
