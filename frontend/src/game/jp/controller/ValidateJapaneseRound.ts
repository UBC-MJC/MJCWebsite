import { JapaneseActions, JapaneseRoundType } from "../../common/constants";

const validateCreateJapaneseRound = (
    roundType: JapaneseRoundType,
    roundActions: JapaneseActions,
    tenpaiList: number[],
    riichiList: number[],
    hand: JapaneseHandInput,
    hasSecondHand: boolean,
    secondHand: JapaneseHandInput,
) => {
    switch (roundType) {
        case JapaneseRoundType.DEAL_IN:
            if (roundActions.WINNER === undefined || roundActions.LOSER === undefined) {
                throw new Error("Deal in must have a winner and a loser");
            }
            checkHand(hand);
            break;
        case JapaneseRoundType.SELF_DRAW:
            if (roundActions.WINNER === undefined) {
                throw new Error("Self draw must have a winner");
            }
            checkHand(hand);
            break;
        case JapaneseRoundType.DECK_OUT:
            riichiList.forEach((riichi) => {
                if (!tenpaiList.includes(riichi)) {
                    throw new Error("Riichi player must be tenpai");
                }
            });
            break;
        case JapaneseRoundType.RESHUFFLE:
            break;
        case JapaneseRoundType.DEAL_IN_PAO:
            if (roundActions.WINNER === undefined || roundActions.LOSER === undefined || roundActions.PAO === undefined) {
                throw new Error("Deal in pao must have a winner, loser, and pao player");
            }
            checkHand(hand);
            break;
        case JapaneseRoundType.SELF_DRAW_PAO:
            if (roundActions.WINNER === undefined || roundActions.PAO === undefined) {
                throw new Error("Self draw pao must have a winner and pao player");
            }
            checkHand(hand);
            break;
    }

    if (hasSecondHand) {
        if (roundActions.WINNER_2 === undefined) {
            throw new Error("Second hand must have a winner");
        }
        checkHand(secondHand);
    }
}

const checkHand = (hand: JapaneseHandInput): void => {
    if (hand.han === -1 || hand.fu === -1) {
        throw new Error("Hand must have han and fu");
    }

    if (hand.dora === -1) {
        throw new Error("Hand must have dora");
    }
}

export {
    validateCreateJapaneseRound,
}
