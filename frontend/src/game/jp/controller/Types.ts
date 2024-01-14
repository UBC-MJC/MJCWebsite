import { Wind } from "../../common/constants";

export function getEmptyScoreDelta(): number[] {
    return Array(NUM_PLAYERS).fill(0);
}

export function getStartingScore(): number[] {
    return Array(NUM_PLAYERS).fill(STARTING_POINT);
}
export const NUM_PLAYERS = 4;
export const STARTING_POINT = 25000;

export const RETURNING_POINT = 30000; // kaeshi, genten

export enum ActionType {
    RON = "DEAL_IN",
    TSUMO = "SELF_DRAW",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
    NAGASHI_MANGAN = "NAGASHI_MANGAN",
    INROUND_RYUUKYOKU = "INROUND_RYUUKYOKU"
}

export type Transaction = {
    actionType: ActionType;
    hand?: JapaneseHandInput;
    paoTarget?: number;
    scoreDeltas: number[];
}

export type ConcludedRound = {
    /**
     * The frontend sends the backend this after the transaction.
     * @param roundWind The wind of the completed round.
     * @param roundNumber The number of the completed round.
     * @param honba The honba of the completed round.
     * @param startingRiichiSticks The number of riichi sticks before the round happened.
     * @param endingRiichiSticks The number of riichi sticks after the round concluded.
     * @param riichis A list of player indexes who have riichied during the completed round.
     * @param tenpais A list of player indexes who were tenpai during the completed round. Set explicitly; otherwise null
     * @param transactions A list of transactions that happened during the completed round.
     */
    roundWind: Wind;
    roundNumber: number;
    honba: number;
    startingRiichiSticks: number;
    riichis: number[];
    tenpais: number[];
    endingRiichiSticks: number;
    transactions: Transaction[];
}

export type NewRound = {
    roundWind: Wind;
    roundNumber: number;
    honba: number;
    startingRiichiSticks: number;
}
