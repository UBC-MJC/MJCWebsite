import { calculateHandValue, MANGAN_BASE_POINT } from "./Points";
import { getEmptyScoreDelta, NUM_PLAYERS } from "./Types";
import { JapaneseActions, JapaneseRoundType } from "../../common/constants";
import { transformTransactions } from "./HonbaProcessing";

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
        transactionType: JapaneseTransactionType.DEAL_IN,
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
        transactionType: JapaneseTransactionType.SELF_DRAW,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
}

function addInRoundRyuukyoku(): JapaneseTransaction {
    return {
        transactionType: JapaneseTransactionType.INROUND_RYUUKYOKU,
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
        transactionType: JapaneseTransactionType.NAGASHI_MANGAN,
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
        transactionType: JapaneseTransactionType.DEAL_IN_PAO,
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
        transactionType: JapaneseTransactionType.SELF_DRAW_PAO,
        hand: hand,
        paoPlayerIndex: paoPlayerIndex,
        scoreDeltas: scoreDeltas,
    };
}

function getFinalRiichiSticks(transactions: JapaneseTransaction[], startingRiichiSticks: number, riichis: number[]): number {
    for (const transaction of transactions) {
        if (
            [JapaneseTransactionType.DEAL_IN, JapaneseTransactionType.SELF_DRAW, JapaneseTransactionType.SELF_DRAW_PAO, JapaneseTransactionType.DEAL_IN_PAO].includes(
                transaction.transactionType
            )
        ) {
            return 0;
        }
    }
    return startingRiichiSticks + riichis.length;
}

export {
    createJapaneseRoundRequest,
    getFinalRiichiSticks,
    addDealIn, addSelfDraw, addNagashiMangan, addPaoDealIn, addPaoSelfDraw
}