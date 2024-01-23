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

const validateCreateJapaneseRound = (
    tenpaiList: number[],
    riichiList: number[],
    transactions: JapaneseTransaction[],
) => {
    if (transactions.length > 0) {
        const firstTransactionType = transactions[0].transactionType;
        let indexPrevWin = -1;
        let indexPrevLose = -1;
    
        for (let i = 0; i < transactions.length; i++) {
    
            const hand = transactions[i].hand;
            const scoreDeltas = transactions[i].scoreDeltas;
            const transactionType = transactions[i].transactionType;
            const indexPao = transactions[i].paoPlayerIndex;
            
            let deltaSum = 0;
            let indexWin = -1;
            let indexLose = -1;
            
            switch (firstTransactionType) {
    
                case "NAGASHI_MANGAN":
                    if (transactionType === "NAGASHI_MANGAN") {
                        for (let j = 0; j < scoreDeltas.length; j++) {
                            if (scoreDeltas[j] > 0) {
                                indexWin = j;
                            }
                        }
                        if (indexWin === -1) {
                            throw new Error(E_NOWIN);
                        }
                        checkRiichiTenpai(tenpaiList, riichiList);
                    } else {
                        throw new Error(E_INVTRAN);
                    }
                break;
    
                case "DEAL_IN":
                case "DEAL_IN_PAO":
                    if (hand === undefined) {
                        throw new Error(E_INVHAND); // never reaches this
                    }
                    if (transactionType === "DEAL_IN") {
                        for (let j = 0; j < scoreDeltas.length; j++) {
                            if (scoreDeltas[j] > 0) {
                                indexWin = j;
                            } else if (scoreDeltas[j] < 0) {
                                indexLose = j;
                            }
                        }
                        indexPrevLose = checkLoserConsistency(indexLose, indexPrevLose);
                        if (indexWin === -1 && indexLose != -1) {
                            if (hand.han === -2) {
                                throw new Error("Winner, loser, and hand are required");
                            }
                            throw new Error(E_NOWIN);
                        }
                        if (indexWin != -1 && indexLose === -1) {
                            if (hand.han === -2) {
                                throw new Error("Winner, loser, and hand are required");
                            }
                            throw new Error(E_NOLOSE);
                        }
                        if (indexWin === -1 && indexLose === -1) { // nothing selected or winner and loser are same
                            if (hand.han === -2 && hand.fu === 10) {
                                throw new Error("Winner, loser, and hand are required");
                            }
                            throw new Error(E_WLSAME);
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
                    } else if (transactionType === "DEAL_IN_PAO") {
                        for (let j = 0; j < scoreDeltas.length; j++) {
                            if (scoreDeltas[j] > 0) {
                                indexWin = j;
                            } else if (scoreDeltas[j] < 0 && j != indexPao) {
                                indexLose = j;
                            }
                            deltaSum += scoreDeltas[j];
                        }
                        indexPrevLose = checkLoserConsistency(indexLose, indexPrevLose);
                        if (deltaSum != 0) {
                            throw new Error("Winner, loser, pao player, and hand are required");
                        }
                        if (indexWin === indexPao) {
                            throw new Error(E_WPSAME);
                        }
                        if (indexLose === -1) {
                            throw new Error("Winner, loser, and pao player must be different");
                        }
                        checkPao(hand);
                    } else {
                        throw new Error(E_INVTRAN);
                    }
                break;
    
                case "SELF_DRAW":
                case "SELF_DRAW_PAO":
                    if (hand === undefined) {
                        throw new Error(E_INVHAND); // never reaches this
                    }
                    if (transactionType === "SELF_DRAW") {
                        for (let j = 0; j < scoreDeltas.length; j++) {
                            if (scoreDeltas[j] > 0) {
                                indexWin = j;
                            }
                        }
                        indexPrevWin = checkWinnerConsistency(indexWin, indexPrevWin);
                        if (indexWin === -1) {
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
                    } else if (transactionType === "SELF_DRAW_PAO") {
                        for (let i = 0; i < scoreDeltas.length; i++) {
                            if (scoreDeltas[i] > 0) {
                                indexWin = i;
                            }
                        }
                        indexPrevWin = checkWinnerConsistency(indexWin, indexPrevWin);
                        if (indexWin === -1) {
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
                    } else {
                        throw new Error(E_INVTRAN);
                    }
                break;
            }
        }
    } else { // exhaustive draw
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

const checkWinnerConsistency = (indexWin: number, indexPrevWin: number): number => {
    if (indexWin != -1) {
        if (indexPrevWin === -1) {
            return indexWin;
        } else if (indexWin != indexPrevWin) {
            throw new Error(E_MULWIN);
        }
    }
    return indexPrevWin;
}

const checkLoserConsistency = (indexLose: number, indexPrevLose: number): number => {
    if (indexLose != -1) {
        if (indexPrevLose === -1) {
            return indexLose;
        } else if (indexLose != indexPrevLose) {
            throw new Error(E_MULLOSE);
        }
    }
    return indexPrevLose;
}

export { validateCreateJapaneseRound };
