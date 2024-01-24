import { findProminentPlayerRound, findProminentPlayers } from "./HonbaProcessing";

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
const E_MULLOSE = "There should only be one loser";
const E_MULNAGM = "There should only be one nagashi mangan per player";

const validateCreateTransaction = (transaction: JapaneseTransaction) => {
    
    const hand = transaction.hand;
    const scoreDeltas = transaction.scoreDeltas;
    const transactionType = transaction.transactionType;
    const indexPao = transaction.paoPlayerIndex;

    let deltaSum = 0;
    const {roundWinners, roundLosers} = findProminentPlayerRound(transaction);
    const [indexWin] = roundWinners;
    const [indexLose] = roundLosers;

    switch (transactionType) {
        case "DEAL_IN":
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
        case "SELF_DRAW":
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
        case "DEAL_IN_PAO":
            if (hand === undefined) {
                throw new Error(E_INVHAND); // never reaches this
            }
            for (let i = 0; i < scoreDeltas.length; i++) {
                deltaSum += scoreDeltas[i];
            }
            if (deltaSum != 0) {
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
        case "SELF_DRAW_PAO":
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
        case "NAGASHI_MANGAN":
            if (indexWin === undefined) {
                throw new Error(E_NOWIN);
            }
            break;
        case "INROUND_RYUUKYOKU":
            break;
    }
};

const validateCreateJapaneseRound = (
    tenpaiList: number[],
    riichiList: number[],
    transactions: JapaneseTransaction[],
) => {
    if (transactions.length > 0) {
        transactions.forEach((transaction) => {
            validateCreateTransaction(transaction);
        });
        const {winners, losers} = findProminentPlayers(transactions);
        const firstTransactionType = transactions[0].transactionType;

        switch (firstTransactionType) {
            case "DEAL_IN":
            case "DEAL_IN_PAO":
                transactions.forEach((transaction) => {
                    if (transaction.transactionType != "DEAL_IN" && transaction.transactionType != "DEAL_IN_PAO") {
                        throw new Error(E_INVTRAN);
                    }
                });
                if (losers.size > 1) {
                    throw new Error(E_MULLOSE);
                }
                break;
            case "SELF_DRAW":
            case "SELF_DRAW_PAO":
                transactions.forEach((transaction) => {
                    if (transaction.transactionType != "SELF_DRAW" && transaction.transactionType != "SELF_DRAW_PAO") {
                        throw new Error(E_INVTRAN);
                    }
                });
                if (winners.size > 1) {
                    throw new Error(E_MULWIN);
                }
                break;
            case "NAGASHI_MANGAN":
                if (winners.size !== transactions.length) {
                    throw new Error(E_MULNAGM);
                }
                transactions.forEach((transaction) => {
                    if (transaction.transactionType != "NAGASHI_MANGAN") {
                        throw new Error(E_INVTRAN);
                    }
                    checkRiichiTenpai(tenpaiList, riichiList);
                });
                break;
        }
    } else {
        // exhaustive draw
        checkRiichiTenpai(tenpaiList, riichiList);
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
        if (hand.fu == 10) {
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

export { validateCreateTransaction, validateCreateJapaneseRound };
