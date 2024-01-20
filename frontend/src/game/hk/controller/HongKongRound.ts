import { HongKongActions, HongKongRoundType, Wind } from "../../common/constants";
import { getEmptyScoreDelta, NUM_PLAYERS } from "../../jp/controller/Types";
import { range } from "../../jp/controller/Range";

const createHongKongRoundRequest = (
    roundType: HongKongRoundType,
    roundActions: HongKongActions,
    point: HongKongHandInput,
    currentRound: PartialHongKongRound
) => {
    const result: any = currentRound;
    const transactions: HongKongTransaction[] = [];
    switch (roundType) {
        case HongKongRoundType.DEAL_IN:
            transactions.push(addDealIn(roundActions.WINNER!, roundActions.LOSER!, point));
            break;
        case HongKongRoundType.SELF_DRAW:
            transactions.push(addSelfDraw(roundActions.WINNER!, point));
            break;
        case HongKongRoundType.DECK_OUT:
            break;
        case HongKongRoundType.DEAL_IN_PAO:
            transactions.push(addPaoDealIn(roundActions.WINNER!, roundActions.LOSER!, roundActions.PAO!, point));
            break;
        case HongKongRoundType.SELF_DRAW_PAO:
            transactions.push(addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, point));
            break;
    }
    result.transactions = transactions;
    return result;
};

const calculateHandValue = (multiplier: number, point: number): number => {
    if (point % 2 === 0) {
        return Math.pow(2, (point / 2 + 2)) * multiplier;
    }
    return calculateHandValue(multiplier, point - 1) * 3 / 2;
}


const addDealIn = (winnerIndex: number, loserIndex: number, hand: HongKongHandInput): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const handValue = calculateHandValue(2, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] = -handValue;
    return {
        transactionType: HongKongTransactionType.DEAL_IN,
        hand: hand,
        scoreDeltas: scoreDeltas
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
        scoreDeltas: scoreDeltas
    };
};

const addPaoDealIn = (winnerIndex: number, dealInPersonIndex: number, paoPlayerIndex: number, hand: HongKongHandInput): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const value = calculateHandValue(3, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: HongKongTransactionType.DEAL_IN_PAO,
        hand: hand,
        scoreDeltas: scoreDeltas
    };
};

const addPaoSelfDraw = (winnerIndex: number, paoPlayerIndex: number, hand: HongKongHandInput): HongKongTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const value = calculateHandValue(3, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: HongKongTransactionType.SELF_DRAW_PAO,
        hand: hand,
        scoreDeltas: scoreDeltas
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
        getEmptyScoreDelta()
    );
}

export function generateOverallScoreDelta(concludedGame: HongKongRound) {
    return addScoreDeltas(reduceScoreDeltas(concludedGame.transactions), getEmptyScoreDelta());
}


export function getStartingScore() {
    return [750, 750, 750, 750]
}

const isHongKongGameEnd = (currentRound: PartialHongKongRound, rounds: HongKongRound[]): boolean => {
    const totalScore = rounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getStartingScore()
    );
    for (const score of totalScore) {
        if (score < 0) {
            return true;
        }
    }
    if (!(currentRound.roundWind === Wind.EAST && currentRound.roundCount === 1)) {
        return false;
    }
    for (const round of rounds) {
        if (!(currentRound.roundWind === Wind.EAST && currentRound.roundCount === 1)) {
            return true;
        }
    }
    return false;
}

export {
    createHongKongRoundRequest,
    isHongKongGameEnd
};
