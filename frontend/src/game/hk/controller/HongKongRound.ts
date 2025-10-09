import {
    getEmptyScoreDelta,
    getHongKongStartingScore,
    HongKongActions,
    HongKongTransactionType,
    NUM_PLAYERS,
    Wind,
} from "../../common/constants";

import { range } from "../../../common/Utils";
import type {
    HongKongRound,
    PartialHongKongRound,
    HongKongTransaction,
    HongKongHandInput,
} from "../../../types";

const createHongKongRoundRequest = (
    roundType: HongKongTransactionType,
    roundActions: HongKongActions,
    point: HongKongHandInput,
    currentRound: PartialHongKongRound,
) => {
    const transactions: HongKongTransaction[] = [];
    switch (roundType) {
        case HongKongTransactionType.DEAL_IN:
            transactions.push(addDealIn(roundActions.WINNER!, roundActions.LOSER!, point));
            break;
        case HongKongTransactionType.SELF_DRAW:
            transactions.push(addSelfDraw(roundActions.WINNER!, point));
            break;
        case HongKongTransactionType.DECK_OUT:
            break;
        case HongKongTransactionType.DEAL_IN_PAO:
            transactions.push(
                addPaoDealIn(roundActions.WINNER!, roundActions.LOSER!, roundActions.PAO!, point),
            );
            break;
        case HongKongTransactionType.SELF_DRAW_PAO:
            transactions.push(addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, point));
            break;
    }
    return {
        ...currentRound,
        transactions,
    };
};

const calculateHandValue = (multiplier: number, point: number): number => {
    if (point % 2 === 0) {
        return Math.pow(2, point / 2 + 2) * multiplier;
    }
    return (calculateHandValue(multiplier, point - 1) * 3) / 2;
};

const addDealIn = (
    winnerIndex: number,
    loserIndex: number,
    hand: HongKongHandInput,
): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const handValue = calculateHandValue(3, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] = -handValue;
    return {
        transactionType: HongKongTransactionType.DEAL_IN,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

const addSelfDraw = (winnerIndex: number, hand: HongKongHandInput): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i !== winnerIndex) {
            scoreDeltas[i] = -calculateHandValue(1, hand);
        }
    }
    scoreDeltas[winnerIndex] = calculateHandValue(3, hand);
    return {
        transactionType: HongKongTransactionType.SELF_DRAW,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

const addPaoDealIn = (
    winnerIndex: number,
    dealInPersonIndex: number,
    paoPlayerIndex: number,
    hand: HongKongHandInput,
): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const value = calculateHandValue(3, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: HongKongTransactionType.DEAL_IN_PAO,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

const addPaoSelfDraw = (
    winnerIndex: number,
    paoPlayerIndex: number,
    hand: HongKongHandInput,
): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const value = calculateHandValue(3, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: HongKongTransactionType.SELF_DRAW_PAO,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

export function addScoreDeltas(scoreDelta1: number[], scoreDelta2: number[]): number[] {
    const finalScoreDelta = getEmptyScoreDelta();
    for (const index of range(NUM_PLAYERS)) {
        finalScoreDelta[index] += scoreDelta1[index] + scoreDelta2[index];
    }
    return finalScoreDelta;
}

function reduceScoreDeltas(transactions: HongKongTransaction[]): number[] {
    return transactions.reduce<number[]>(
        (result, current) => addScoreDeltas(result, current.scoreDeltas),
        getEmptyScoreDelta(),
    );
}

export function generateOverallScoreDelta(concludedGame: HongKongRound) {
    return reduceScoreDeltas(concludedGame.transactions);
}

const generateHongKongCurrentScore = (rounds: HongKongRound[]) => {
    return rounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getHongKongStartingScore(),
    );
};

const isHongKongGameEnd = (
    currentRound: PartialHongKongRound,
    rounds: HongKongRound[],
): boolean => {
    const totalScore = rounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getHongKongStartingScore(),
    );
    for (const score of totalScore) {
        if (score < 0) {
            return true;
        }
    }
    if (!(currentRound.roundWind === Wind.EAST && currentRound.roundNumber === 1)) {
        return false;
    }
    for (const round of rounds) {
        if (!(round.roundWind === Wind.EAST && round.roundNumber === 1)) {
            return true;
        }
    }
    return false;
};

export { createHongKongRoundRequest, isHongKongGameEnd, generateHongKongCurrentScore };
