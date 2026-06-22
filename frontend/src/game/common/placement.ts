import { palette, placement } from "@/theme/tokens";

/** "1st" / "2nd" / "3rd" / "4th" from a 0-based place index. */
export const placeLabel = (idx: number) => {
    switch (idx) {
        case 0:
            return "1st";
        case 1:
            return "2nd";
        case 2:
            return "3rd";
        default:
            return `${idx + 1}th`;
    }
};

/** Finishing-position colors (1st–4th) shared by the summary and live footer. */
export const PLACE_COLORS = [
    { bg: palette.medal.gold.bg, text: palette.medal.gold.text, border: "#F5D060" },
    { bg: palette.medal.silver.bg, text: palette.medal.silver.text, border: "#C0C0C0" },
    { bg: palette.medal.bronze.bg, text: palette.medal.bronze.text, border: "#CD7F32" },
    { bg: "rgba(140,140,146,0.12)", text: placement[4], border: placement[4] },
] as const;

export const placeColor = (idx: number) => PLACE_COLORS[idx] ?? PLACE_COLORS[3];

/**
 * Ranks players by value (highest first) and returns each player's 0-based
 * place, keyed by the player's original index. Ties resolve by original order.
 */
export const computePlaces = (values: number[]): number[] => {
    const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
    const places: number[] = new Array(values.length);
    order.forEach((playerIndex, rank) => {
        places[playerIndex] = rank;
    });
    return places;
};
