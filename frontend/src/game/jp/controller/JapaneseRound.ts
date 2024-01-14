import { calculateHandValue, MANGAN_BASE_POINT } from "./Points";
import { ActionType, getEmptyScoreDelta, NUM_PLAYERS, Transaction } from "./Types";
import { JapaneseActions, JapaneseRoundType } from "../../common/constants";
import { transformTransactions } from "./HonbaProcessing";

type JapaneseTransactionInput = Omit<JapaneseTransaction, "id">;

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
        startRiichiStickCount: currentRound.startRiichiStickCount,
        player0Riichi: riichiList.includes(0),
        player1Riichi: riichiList.includes(1),
        player2Riichi: riichiList.includes(2),
        player3Riichi: riichiList.includes(3),
        player0Tenpai: tenpaiList.includes(0),
        player1Tenpai: tenpaiList.includes(1),
        player2Tenpai: tenpaiList.includes(2),
        player3Tenpai: tenpaiList.includes(3),
    };

    const dealerIndex = currentRound.roundNumber - 1;
    const transactions: Transaction[] = [];
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
    result.transactions = transformTransactions(transactions, currentRound.bonus).map((transaction) => inputTransaction(transaction));
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

const addDealIn = (winnerIndex: number, loserIndex: number, dealerIndex: number, hand: JapaneseHandInput): Transaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const handValue = calculateHandValue(multiplier, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] = -handValue;
    return {
        actionType: ActionType.RON,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
}

const addSelfDraw = (winnerIndex: number, dealerIndex: number, hand: JapaneseHandInput): Transaction => {
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
        actionType: ActionType.TSUMO,
        hand: hand,
        scoreDeltas: scoreDeltas,
    };
}

function addInRoundRyuukyoku(): Transaction {
    return {
        actionType: ActionType.INROUND_RYUUKYOKU,
        scoreDeltas: getEmptyScoreDelta(),
    }
}

const addNagashiMangan = (winnerIndex: number, dealerIndex: number): Transaction => {
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
        actionType: ActionType.NAGASHI_MANGAN,
        scoreDeltas: scoreDeltas,
    };
}

const addPaoDealIn = (winnerIndex: number, dealInPersonIndex: number, paoPersonIndex: number, dealerIndex: number, hand: JapaneseHandInput): Transaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    scoreDeltas[dealInPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[paoPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[winnerIndex] += calculateHandValue(multiplier, hand);
    return {
        actionType: ActionType.NAGASHI_MANGAN,
        hand: hand,
        paoTarget: paoPersonIndex,
        scoreDeltas: scoreDeltas,
    };
}

const addPaoSelfDraw = (winnerIndex: number, paoPersonIndex: number, dealerIndex: number, hand: JapaneseHandInput): Transaction => {
    const scoreDeltas = getEmptyScoreDelta();
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const value = calculateHandValue(multiplier, hand);
    scoreDeltas[paoPersonIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        actionType: ActionType.NAGASHI_MANGAN,
        hand: hand,
        paoTarget: paoPersonIndex,
        scoreDeltas: scoreDeltas,
    };
}

const addScoreDeltas = (scoreDelta1: number[], scoreDelta2: number[]): number[] => {
    const finalScoreDelta = getEmptyScoreDelta();
    for (const i in finalScoreDelta) {
        finalScoreDelta[i] += scoreDelta1[i] + scoreDelta2[i];
    }
    return finalScoreDelta;
}

const convertScoreDeltasToProperties = (scoreDeltas: number[]): any => {
    return {
        player0ScoreChange: scoreDeltas[0],
        player1ScoreChange: scoreDeltas[1],
        player2ScoreChange: scoreDeltas[2],
        player3ScoreChange: scoreDeltas[3],
    };
}

function inputTransaction(transaction: Transaction): JapaneseTransactionInput {
    return {
        ...transaction.hand,
        paoPlayerIndex: transaction.paoTarget,
        ...convertScoreDeltasToProperties(transaction.scoreDeltas),
        type: transaction.actionType.toString(),
    };
}

function getFinalRiichiSticks(transactions: Transaction[], startingRiichiSticks: number, riichis: number[]): number {
    for (const transaction of transactions) {
        if (
            [ActionType.RON, ActionType.TSUMO, ActionType.SELF_DRAW_PAO, ActionType.DEAL_IN_PAO].includes(
                transaction.actionType
            )
        ) {
            return 0;
        }
    }
    return startingRiichiSticks + riichis.length;
}

export {
    createJapaneseRoundRequest,
    inputTransaction,
    getFinalRiichiSticks,
    addDealIn, addSelfDraw, addNagashiMangan, addPaoDealIn, addPaoSelfDraw
}