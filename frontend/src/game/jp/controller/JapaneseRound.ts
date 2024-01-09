import { calculateHandValue, MANGAN_BASE_POINT } from "./Points";
import { NUM_PLAYERS } from "./Types";
import { JapaneseActions, JapaneseRoundType } from "../../common/constants";
import { addHonba } from "./HonbaProcessing";

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
        player0Riichi: riichiList.includes(0),
        player1Riichi: riichiList.includes(1),
        player2Riichi: riichiList.includes(2),
        player3Riichi: riichiList.includes(3),
    };

    const dealerIndex = currentRound.roundNumber - 1;
    const transactions: JapaneseTransactionInput[] = [];
    switch (roundType) {
        case JapaneseRoundType.DEAL_IN:
            transactions.push(addDealIn(roundActions.WINNER!, roundActions.LOSER!, dealerIndex, hand));
            break;
        case JapaneseRoundType.SELF_DRAW:
            transactions.push(addSelfDraw(roundActions.WINNER!, dealerIndex, hand));
            break;
        case JapaneseRoundType.DECK_OUT:
            transactions.push(addDeckOut(tenpaiList));
            break;
        case JapaneseRoundType.MISTAKE:
            transactions.push(addMistake(roundActions.LOSER!));
            break;
        case JapaneseRoundType.RESHUFFLE:
            break;
        case JapaneseRoundType.DEAL_IN_PAO:
            transactions.push(addPaoDealIn(roundActions.WINNER!, roundActions.LOSER!, roundActions.PAO!, dealerIndex, hand));
            break;
        case JapaneseRoundType.SELF_DRAW_PAO:
            transactions.push(addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, dealerIndex, hand));
            break;
    }

    if (hasSecondHand) {
        transactions.push(addDealIn(roundActions.WINNER_2!, roundActions.LOSER!, dealerIndex, secondHand));
    }

    result.transactions = transactions;
    result.keepDealership = checkKeepDealership(roundType, roundActions, tenpaiList, dealerIndex);
    result.endRiichiStickCount = getEndRiichiStickCount(roundType, roundActions, riichiList, currentRound.startRiichiStickCount);
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

const addDealIn = (winnerIndex: number, loserIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const handValue = calculateHandValue(multiplier, hand);
    scoreDeltas[winnerIndex] = handValue;
    scoreDeltas[loserIndex] = -handValue;
    return {
        type: "DEAL_IN",
        ...hand,
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addSelfDraw = (winnerIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
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
        type: "SELF_DRAW",
        ...hand,
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addDeckOut = (tenpaiList: number[]): JapaneseTransactionInput => {
    const tenpaiCount = tenpaiList.length;
    let positiveScore = 0
    let negativeScore = 0;
    if (tenpaiCount === 1) {
        positiveScore = 3000;
        negativeScore = -1000;
    } else if (tenpaiCount === 2) {
        positiveScore = 1500;
        negativeScore = -1500;
    } else if (tenpaiCount === 3) {
        positiveScore = 1000;
        negativeScore = -3000;
    }

    const scoreDeltas = [0, 0, 0, 0];
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (tenpaiList.includes(i)) {
            scoreDeltas[i] = positiveScore;
        } else {
            scoreDeltas[i] = negativeScore;
        }
    }
    return {
        type: "TENPAI",
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addMistake = (chomboPlayerIndex: number): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i !== chomboPlayerIndex) {
            scoreDeltas[i] = 2 * MANGAN_BASE_POINT;
            scoreDeltas[chomboPlayerIndex] -= 2 * MANGAN_BASE_POINT;
        }
    }
    return {
        type: "MISTAKE",
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addNagashiMangan = (winnerIndex: number, dealerIndex: number): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
    const isDealer = winnerIndex === dealerIndex;
    for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i !== winnerIndex) {
            const value = MANGAN_BASE_POINT * getSelfDrawMultiplier(i, dealerIndex, isDealer);
            scoreDeltas[i] = -value;
            scoreDeltas[winnerIndex] += value;
        }
    }
    return {
        type: "SELF_DRAW",
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addPaoDealIn = (winnerIndex: number, dealInPersonIndex: number, paoPersonIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    scoreDeltas[dealInPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[paoPersonIndex] = -calculateHandValue(multiplier / 2, hand);
    scoreDeltas[winnerIndex] += calculateHandValue(multiplier, hand);
    return {
        type: "PAO",
        paoPlayerIndex: paoPersonIndex,
        ...hand,
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addPaoSelfDraw = (winnerIndex: number, paoPersonIndex: number, dealerIndex: number, hand: JapaneseHandInput): JapaneseTransactionInput => {
    const scoreDeltas = [0, 0, 0, 0];
    const multiplier = getDealInMultiplier(winnerIndex, dealerIndex);
    const value = calculateHandValue(multiplier, hand);
    scoreDeltas[paoPersonIndex] = -value;
    scoreDeltas[winnerIndex] += value;
    return {
        type: "PAO",
        paoPlayerIndex: paoPersonIndex,
        ...hand,
        ...convertScoreDeltasToProperties(scoreDeltas),
    };
}

const addScoreDeltas = (scoreDelta1: number[], scoreDelta2: number[]): number[] => {
    const finalScoreDelta = [0, 0, 0, 0];
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

const checkKeepDealership = (roundType: JapaneseRoundType, roundActions: JapaneseActions, tenpaiList: number[], dealerIndex: number): boolean => {
    if (roundType === JapaneseRoundType.DECK_OUT) {
        return tenpaiList.includes(dealerIndex);
    }

    if (roundType === JapaneseRoundType.MISTAKE) {
        return true;
    }

    if (roundActions.WINNER! === dealerIndex) {
        return true;
    }

    if (typeof roundActions.WINNER_2 !== "undefined" && roundActions.WINNER_2 === dealerIndex) {
        return true;
    }

    return false;
}

const getEndRiichiStickCount = (roundType: JapaneseRoundType, roundActions: JapaneseActions, riichiList: number[], startRiichiStickCount: number): number => {
    if (roundType === JapaneseRoundType.DECK_OUT || roundType === JapaneseRoundType.RESHUFFLE || roundType === JapaneseRoundType.MISTAKE) {
        return 0;
    }

    return riichiList.length + startRiichiStickCount;
}

export {
    createJapaneseRoundRequest,
}
