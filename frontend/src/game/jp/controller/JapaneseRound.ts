import { calculateHandValue, MANGAN_BASE_POINT } from "./Points";
import {getEmptyScoreDelta, getStartingScore, NUM_PLAYERS} from "./Types";
import {JapaneseActions, JapaneseRoundType, Wind} from "../../common/constants";
import {findHeadbumpWinner, transformTransactions} from "./HonbaProcessing";
import {range} from "./Range";

const createJapaneseRoundRequest = (
    roundType: JapaneseRoundType,
    roundActions: JapaneseActions,
    tenpaiList: number[],
    riichiList: number[],
    hand: JapaneseHandInput,
    hasSecondHand: boolean,
    secondHand: JapaneseHandInput,
    currentRound: PartialJapaneseRound,
) => {
    const result: any = {
        ...currentRound,
        riichis: riichiList,
        tenpais: tenpaiList
    };

    const dealerIndex = currentRound.roundNumber - 1;
    const transactions: JapaneseTransaction[] = [];
    switch (roundType) {
        case JapaneseRoundType.DEAL_IN:
            transactions.push(addDealIn(roundActions.WINNER!, roundActions.LOSER!, dealerIndex, hand));
            break;
        case JapaneseRoundType.SELF_DRAW:
            transactions.push(addSelfDraw(roundActions.WINNER!, dealerIndex, hand));
            break;
        case JapaneseRoundType.DECK_OUT:
            break;
        case JapaneseRoundType.RESHUFFLE:
            transactions.push(addInRoundRyuukyoku());
            break;
        case JapaneseRoundType.DEAL_IN_PAO:
            transactions.push(addPaoDealIn(roundActions.WINNER!, roundActions.LOSER!, roundActions.PAO!, dealerIndex, hand));
            break;
        case JapaneseRoundType.SELF_DRAW_PAO:
            transactions.push(addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, dealerIndex, hand));
            break;
        case JapaneseRoundType.NAGASHI_MANGAN:
            transactions.push(addNagashiMangan(roundActions.WINNER!, dealerIndex))
            break;
    }

    if (hasSecondHand) {
        transactions.push(addDealIn(roundActions.WINNER_2!, roundActions.LOSER!, dealerIndex, secondHand));
    }
    result.transactions = transformTransactions(transactions, currentRound.bonus);
    result.endRiichiStickCount = getFinalRiichiSticks(transactions, currentRound.startRiichiStickCount, riichiList);
    return result;
};

const getDealInMultiplier = (personIndex: number, dealerIndex: number): number => {
    if (personIndex === dealerIndex) {
        return 6;
    }
    return 4;
}

const getSelfDrawMultiplier = (personIndex: number, dealerIndex: number, isDealer: boolean): number => {
    if (isDealer || personIndex === dealerIndex) {
        return 2;
    }
    return 1;
}

const addDealIn = (winnerIndex: number, loserIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const handValue = calculateHandValue(multiplier, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] = -handValue;
    return {
        transactionType: "DEAL_IN",
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
}

const addSelfDraw = (winnerIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransaction => {
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
        transactionType: "SELF_DRAW",
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
}

function addInRoundRyuukyoku(): JapaneseTransaction {
    return {
        transactionType: "INROUND_RYUUKYOKU",
        scoreDeltas: getEmptyScoreDelta(),
    }
}

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
        transactionType: "NAGASHI_MANGAN",
        scoreDeltas: scoreDeltas,
    };
}

const addPaoDealIn = (winnerIndex: number, dealInPersonIndex: number, paoPlayerIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    scoreDeltas[dealInPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[paoPlayerIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[winnerIndex] += calculateHandValue(multiplier, hand);
    return {
        transactionType: "DEAL_IN_PAO",
        hand: hand,
        paoPlayerIndex: paoPlayerIndex,
        scoreDeltas: scoreDeltas,
    };
}

const addPaoSelfDraw = (winnerIndex: number, paoPlayerIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const value = calculateHandValue(multiplier, hand);
    scoreDeltas[paoPlayerIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        transactionType: "SELF_DRAW_PAO",
        hand: hand,
        paoPlayerIndex: paoPlayerIndex,
        scoreDeltas: scoreDeltas,
    };
}

function getFinalRiichiSticks(transactions: JapaneseTransaction[], startingRiichiSticks: number, riichis: number[]): number {
    const winningTransactions: JapaneseTransactionType[] = ["DEAL_IN", "SELF_DRAW", "SELF_DRAW_PAO", "DEAL_IN_PAO"];

    for (const transaction of transactions) {
        if (winningTransactions.includes(<JapaneseTransactionType>transaction.transactionType)) {
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

function reduceScoreDeltas(transactions: JapaneseTransaction[]): number[] {
    return transactions.reduce<number[]>(
        (result, current) => addScoreDeltas(result, current.scoreDeltas),
        getEmptyScoreDelta()
    );
}

export function generateOverallScoreDelta(concludedGame: JapaneseRound) {
    const riichiDeltas = getEmptyScoreDelta();
    for (const id of concludedGame.riichis) {
        riichiDeltas[id] -= 1000;
    }
    const headbumpWinner = findHeadbumpWinner(concludedGame.transactions);
    if (concludedGame.endRiichiStickCount === 0) {
        riichiDeltas[headbumpWinner] += (concludedGame.startRiichiStickCount + concludedGame.riichis.length) * 1000;
    }
    return addScoreDeltas(reduceScoreDeltas(concludedGame.transactions), riichiDeltas);
}

const isGameEnd = (newRound: PartialJapaneseRound, concludedRounds: JapaneseRound[]): boolean => {
    if (newRound.roundWind === Wind.NORTH) {
        // ends at north regardless of what happens
        return true;
    }
    const totalScore = concludedRounds.reduce<number[]>(
        (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
        getStartingScore()
    );
    let exceedsHanten = false;
    for (const score of totalScore) {
        if (score < 0) {
            return true;
        }
        if (score >= 30000) {
            exceedsHanten = true;
        }
    }
    if (!exceedsHanten) {
        return false;
    }
    if (newRound.roundWind === Wind.EAST || newRound.roundWind === Wind.SOUTH) {
        return false;
    }
    return true; // west, and one person's score exceeds 30k
}

export {
    createJapaneseRoundRequest,
    getFinalRiichiSticks,
    addDealIn, addSelfDraw, addNagashiMangan, addPaoDealIn, addPaoSelfDraw, isGameEnd
}