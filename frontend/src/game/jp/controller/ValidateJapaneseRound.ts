import type { JapaneseTransaction, JapaneseHandInput } from "../../../types";
import { findProminentPlayerRound, findProminentPlayers } from "./HonbaProcessing";
import { JapaneseTransactionType } from "../../common/constants";

const E_NOWIN = "A winner is required";
const E_NOLOSE = "A loser is required";
const E_NOPAO = "A pao player is required";
const E_WLSAME = "The winner cannot be the loser";
const E_WPSAME = "The winner cannot be the pao player";
const E_RIINOTEN = "Cannot declare riichi and not be tenpai";
const E_NOHAN = "Han is required";
const E_NOFU = "Han requires Fu";
const E_INVDORA = "Dora must be fewer than Han";
const E_INVHAND = "Invalid hand";
const E_INVTRAN = "Incompatible transactions";
const E_MULWIN = "There should only be one winner";
const E_MULTRON = "Multi ron should not have a single winner";
const E_MULLOSE = "There should only be one loser";
const E_MULNAGM = "There should only be one nagashi mangan per player";

const validateTransaction = (transaction: JapaneseTransaction) => {
    const hand = transaction.hand;
    const scoreDeltas = transaction.scoreDeltas;
    const transactionType = transaction.transactionType;
    const indexPao = transaction.paoPlayerIndex;

    const deltaSum = scoreDeltas.reduce<number>((score, prev) => prev + score, 0);
    const { roundWinners, roundLosers } = findProminentPlayerRound(transaction);
    const [indexWin] = roundWinners;
    const [indexLose] = roundLosers;

    switch (transactionType) {
        case JapaneseTransactionType.DEAL_IN:
            if (hand === undefined) {
                throw new Error(E_INVHAND); // never reaches this
            }

            if (hand.han === -2) {
                if (indexWin === undefined || indexLose === undefined) {
                    throw new Error("Winner, loser, and hand are required");
                }
            } else {
                if (indexWin === undefined && indexLose === undefined) {
                    throw new Error(E_WLSAME);
                }
                if (indexWin === undefined) {
                    throw new Error(E_NOWIN);
                }
                if (indexLose === undefined) {
                    throw new Error(E_NOLOSE);
                }
            }
            checkHand(hand);
            if (hand.fu === 20) {
                throw new Error(E_INVHAND);
            }
            if (hand.fu === 25) {
                if (hand.han < hand.dora + 2) {
                    throw new Error(E_INVHAND);
                }
            }
            break;
        case JapaneseTransactionType.SELF_DRAW:
            if (hand === undefined) {
                throw new Error(E_INVHAND); // never reaches this
            }
            if (indexWin === undefined) {
                throw new Error(E_NOWIN);
            }
            checkHand(hand);
            if (hand.fu === 20 && hand.han === 1) {
                throw new Error(E_INVHAND);
            }
            if (hand.fu === 25) {
                if (hand.han < hand.dora + 3) {
                    throw new Error(E_INVHAND);
                }
            }
            break;
        case JapaneseTransactionType.DEAL_IN_PAO:
            if (hand === undefined) {
                throw new Error(E_INVHAND); // never reaches this
            }
            if (deltaSum !== 0) {
                throw new Error("Winner, loser, pao player, and hand are required");
            }
            if (indexWin === undefined) {
                throw new Error(E_WPSAME);
            }
            if (indexLose === undefined) {
                throw new Error("Winner, loser, and pao player must be different");
            }
            if (indexPao === undefined) {
                throw new Error(E_NOPAO);
            }
            checkPao(hand);
            break;
        case JapaneseTransactionType.SELF_DRAW_PAO:
            if (hand === undefined) {
                throw new Error(E_INVHAND); // never reaches this
            }
            if (indexWin === undefined) {
                if (indexPao === undefined) {
                    throw new Error("Winner, pao player, and hand are required");
                } else if (scoreDeltas[indexPao] < 0) {
                    throw new Error(E_NOWIN);
                }
                throw new Error(E_WPSAME);
            } else if (indexPao === undefined) {
                throw new Error(E_NOPAO);
            }
            checkPao(hand);
            break;
        case JapaneseTransactionType.NAGASHI_MANGAN:
            if (indexWin === undefined) {
                throw new Error(E_NOWIN);
            }
            break;
        case JapaneseTransactionType.INROUND_RYUUKYOKU:
            break;
    }
};

const validateJapaneseRound = (
    tenpaiList: number[],
    riichiList: number[],
    transactions: JapaneseTransaction[],
) => {
    if (transactions.length === 0) {
        checkRiichiTenpai(tenpaiList, riichiList);
        return;
    }
    const { winners, losers } = findProminentPlayers(transactions);
    const firstTransactionType = transactions[0].transactionType;

    switch (firstTransactionType) {
        case JapaneseTransactionType.DEAL_IN:
        case JapaneseTransactionType.DEAL_IN_PAO:
            transactions.forEach((transaction) => {
                if (
                    transaction.transactionType !== JapaneseTransactionType.DEAL_IN &&
                    transaction.transactionType !== JapaneseTransactionType.DEAL_IN_PAO
                ) {
                    throw new Error(E_INVTRAN);
                }
            });
            if (losers.size > 1) {
                throw new Error(E_MULLOSE);
            }
            if (winners.size === 1 && transactions.length > 1) {
                for (const transaction of transactions) {
                    if (transaction.transactionType === JapaneseTransactionType.DEAL_IN_PAO) {
                        break;
                    }
                }
                throw new Error(E_MULTRON); // comprised of solely normal dealins (multiron) - only single winner
            }
            break;
        case JapaneseTransactionType.SELF_DRAW:
        case JapaneseTransactionType.SELF_DRAW_PAO:
            transactions.forEach((transaction) => {
                if (
                    transaction.transactionType !== JapaneseTransactionType.SELF_DRAW &&
                    transaction.transactionType !== JapaneseTransactionType.SELF_DRAW_PAO
                ) {
                    throw new Error(E_INVTRAN);
                }
            });
            if (winners.size > 1) {
                throw new Error(E_MULWIN);
            }
            break;
        case JapaneseTransactionType.NAGASHI_MANGAN:
            if (winners.size !== transactions.length) {
                throw new Error(E_MULNAGM);
            }
            transactions.forEach((transaction) => {
                if (transaction.transactionType !== JapaneseTransactionType.NAGASHI_MANGAN) {
                    throw new Error(E_INVTRAN);
                }
                checkRiichiTenpai(tenpaiList, riichiList);
            });
            break;
    }
};

const checkRiichiTenpai = (tenpaiList: number[], riichiList: number[]): void => {
    riichiList.forEach((riichi) => {
        if (!tenpaiList.includes(riichi)) {
            throw new Error(E_RIINOTEN);
        }
    });
};

const checkHand = (hand: JapaneseHandInput): void => {
    if (hand.han === -2) {
        throw new Error(E_NOHAN);
    }
    if (hand.han > 0 && hand.han < 5) {
        if (hand.fu === 10) {
            throw new Error(hand.han + E_NOFU);
        }
    }
    if (hand.han <= hand.dora) {
        throw new Error(E_INVDORA);
    }
};

const checkPao = (hand: JapaneseHandInput): void => {
    if (hand.han === -2) {
        throw new Error(E_NOHAN);
    }
    if (hand.han < 13) {
        throw new Error("Only yakuman can be pao");
    }
};

export { validateTransaction, validateJapaneseRound };
