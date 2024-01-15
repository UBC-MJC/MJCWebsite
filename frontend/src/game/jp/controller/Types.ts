export function getEmptyScoreDelta(): number[] {
    return Array(NUM_PLAYERS).fill(0);
}

export function getStartingScore(): number[] {
    return Array(NUM_PLAYERS).fill(STARTING_POINT);
}
export const NUM_PLAYERS = 4;
export const STARTING_POINT = 25000;

export const RETURNING_POINT = 30000; // kaeshi, genten
