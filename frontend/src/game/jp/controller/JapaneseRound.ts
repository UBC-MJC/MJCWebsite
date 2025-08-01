import { calculateHandValue, MANGAN_BASE_POINT } from "./Points";
import {
    getEmptyScoreDelta,
    getJapaneseStartingScore,
    JapaneseTransactionType,
    NUM_PLAYERS,
    JAPANESE_RETURNING_POINT,
    RIICHI_STICK_VALUE,
    Wind,
} from "../../common/constants";
import { containingAny, findHeadbumpWinner, transformTransactions } from "./HonbaProcessing";

import { range } from "../../../common/Utils";

const createJapaneseRoundRequest = (
    currentRound: PartialJapaneseRound,
    transactions: JapaneseTransaction[],
    tenpaiList: number[],
    riichiList: number[],
): JapaneseRound => {
    return {
        ...currentRound,
        riichis: riichiList,
        tenpais: tenpaiList,
        transactions: transformTransactions(transactions, currentRound.bonus),
        endRiichiStickCount: getFinalRiichiSticks(
            transactions,
            currentRound.startRiichiStickCount,
            riichiList,
        ),
    };
};

const getDealInMultiplier = (personIndex: number, dealerIndex: number): number => {
    if (personIndex === dealerIndex) {
        return 6;
    }
    return 4;
};

const getSelfDrawMultiplier = (
    personIndex: number,
    dealerIndex: number,
    isDealer: boolean,
): number => {
    if (isDealer || personIndex === dealerIndex) {
        return 2;
    }
    return 1;
};

const addDealIn = (
    winnerIndex: number,
    loserIndex: number,
    dealerIndex: number,
    hand: JapaneseHandInput,
): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const handValue = calculateHandValue(multiplier, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] -= handValue;
    return {
        transactionType: JapaneseTransactionType.DEAL_IN,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

const addSelfDraw = (
    winnerIndex: number,
    dealerIndex: number,
    hand: JapaneseHandInput,
): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const isDealer = winnerIndex === dealerIndex;
    let totalScore = 0;
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i !== winnerIndex) {
            const value = calculateHandValue(getSelfDrawMultiplier(i, dealerIndex, isDealer), hand);
            totalScore += value;
            scoreDeltas[i] = -value;
        }
    }
    scoreDeltas[winnerIndex] = totalScore;
    return {
        transactionType: JapaneseTransactionType.SELF_DRAW,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
};

const addInRoundRyuukyoku = (): JapaneseTransaction => {
    return {
        transactionType: JapaneseTransactionType.INROUND_RYUUKYOKU,
        scoreDeltas: getEmptyScoreDelta(),
    };
};

const addNagashiMangan = (winnerIndex: number, dealerIndex: number): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const isDealer = winnerIndex === dealerIndex;
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i !== winnerIndex) {
            const value = MANGAN_BASE_POINT * getSelfDrawMultiplier(i, dealerIndex, isDealer);
            scoreDeltas[i] = -value;
            scoreDeltas[winnerIndex] += value;
        }
    }
    return {
        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
        scoreDeltas: scoreDeltas,
    };
};

const addPaoDealIn = (
    winnerIndex: number,
    dealInPersonIndex: number,
    paoPlayerIndex: number,
    dealerIndex: number,
    hand: JapaneseHandInput,
): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    scoreDeltas[dealInPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[paoPlayerIndex] -= calculateHandValue(multiplier / 2, hand);
    scoreDeltas[winnerIndex] += calculateHandValue(multiplier, hand);
    return {
        transactionType: JapaneseTransactionType.DEAL_IN_PAO,
        hand: hand,
        paoPlayerIndex: paoPlayerIndex,
        scoreDeltas: scoreDeltas,
    };
};

const addPaoSelfDraw = (
    winnerIndex: number,
    paoPlayerIndex: number,
    dealerIndex: number,
    hand: JapaneseHandInput,
): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const value = calculateHandValue(multiplier, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: JapaneseTransactionType.SELF_DRAW_PAO,
        hand: hand,
        paoPlayerIndex: paoPlayerIndex,
        scoreDeltas: scoreDeltas,
    };
};

function getFinalRiichiSticks(
    transactions: JapaneseTransaction[],
    startingRiichiSticks: number,
    riichis: number[],
): number {
    const winningTransactions: JapaneseTransactionType[] = [
        JapaneseTransactionType.DEAL_IN,
        JapaneseTransactionType.SELF_DRAW,
        JapaneseTransactionType.DEAL_IN_PAO,
        JapaneseTransactionType.SELF_DRAW_PAO,
    ];

    for (const transaction of transactions) {
        if (winningTransactions.includes(transaction.transactionType as JapaneseTransactionType)) {
            return 0;
        }
    }
    return startingRiichiSticks + riichis.length;
}

export function addScoreDeltas(scoreDelta1: number[], scoreDelta2: number[]): number[] {
    const finalScoreDelta = getEmptyScoreDelta();
    for (const index of range(NUM_PLAYERS)) {
        finalScoreDelta[index] += scoreDelta1[index] + scoreDelta2[index];
    }
    return finalScoreDelta;
}

function reduceScoreDeltas(transactions: Transaction[]): number[] {
    return transactions.reduce<number[]>(
        (result, current) => addScoreDeltas(result, current.scoreDeltas),
        getEmptyScoreDelta(),
    );
}

function generateTenpaiScoreDeltas(tenpais: number[]) {
    const scoreDeltas = getEmptyScoreDelta();
    if (tenpais.length === 0 || tenpais.length === NUM_PLAYERS) {
        return scoreDeltas;
    }
    for (const index of range(NUM_PLAYERS)) {
        if (tenpais.includes(index)) {
            scoreDeltas[index] = 3000 / tenpais.length;
        } else {
            scoreDeltas[index] = -3000 / (4 - tenpais.length);
        }
    }
    return scoreDeltas;
}

export function generateOverallScoreDelta(concludedRound: JapaneseRound) {
    const rawScoreDeltas = reduceScoreDeltas(concludedRound.transactions);
    for (const id of concludedRound.riichis) {
        rawScoreDeltas[id] -= RIICHI_STICK_VALUE;
    }
    if (containingAny(concludedRound.transactions, JapaneseTransactionType.NAGASHI_MANGAN)) {
        return rawScoreDeltas;
    }
    const riichiDeltas = addScoreDeltas(
        generateTenpaiScoreDeltas(concludedRound.tenpais),
        rawScoreDeltas,
    );
    const headbumpWinner = findHeadbumpWinner(concludedRound.transactions);
    if (concludedRound.endRiichiStickCount === 0) {
        riichiDeltas[headbumpWinner] +=
            (concludedRound.startRiichiStickCount + concludedRound.riichis.length) *
            RIICHI_STICK_VALUE;
    }
    return riichiDeltas;
}

export function generateJapaneseCurrentScore(rounds: JapaneseRound[]) {
    return rounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getJapaneseStartingScore(),
    );
}

const isJapaneseGameEnd = (
    newRound: PartialJapaneseRound,
    concludedRounds: JapaneseRound[],
): boolean => {
    if (newRound.roundWind === Wind.NORTH) {
        // ends at north regardless of what happens
        return true;
    }
    const totalScore = generateJapaneseCurrentScore(concludedRounds);
    let exceedsHanten = false;
    for (const score of totalScore) {
        if (score < 0) {
            return true;
        }
        if (score >= JAPANESE_RETURNING_POINT) {
            exceedsHanten = true;
        }
    }
    if (!exceedsHanten) {
        return false;
    }
    // At least one person is more than 30k
    if (newRound.roundWind === Wind.WEST) {
        return true; // dealership gone; someone's more than 30k
    }
    const lastRound = concludedRounds[concludedRounds.length - 1];
    if (lastRound.roundWind !== Wind.SOUTH || lastRound.roundNumber !== NUM_PLAYERS) {
        return false; // not even S4 yet
    }
    for (let i = 0; i < totalScore.length - 1; i++) {
        if (totalScore[i] >= totalScore[totalScore.length - 1]) {
            // winning by position
            return false;
        }
    }
    return true;
};

export {
    createJapaneseRoundRequest,
    getFinalRiichiSticks,
    addDealIn,
    addSelfDraw,
    addNagashiMangan,
    addPaoDealIn,
    addPaoSelfDraw,
    addInRoundRyuukyoku,
    isJapaneseGameEnd,
};
