const errInvalidHand = "Invalid hand";
const errNoWinner = "A winner is required";
const errNoLoser = "A loser is required";
const errWinLoseSame = "The winner cannot also be the loser";
const errNoHan = "Han is required";
const errNoFu = "Han requires Fu";
const errRiichiNoTen = "Cannot declare riichi and not be tenpai";
const errInvalidDora = "Dora must be fewer than Han";

const validateCreateJapaneseRound = (
    tenpaiList: number[],
    riichiList: number[],
    transactions: JapaneseTransaction[],
) => {

    if (transactions.length === 0) { // exhaustive draw
        checkRiichiTenpai(tenpaiList, riichiList);
    }

    transactions.forEach((trans) => {
        let noWinner = true;
        let noLoser = true;
        const hand = trans.hand;
        const scoreDeltas = trans.scoreDeltas;
        

        switch (trans.transactionType) {
            case "DEAL_IN":
                if (hand === undefined) {
                    throw new Error(errInvalidHand); // never reaches this
                }
                
                scoreDeltas.forEach((playerDelta) => {
                    if (playerDelta < 0) {
                        noLoser = false;
                    } else if (playerDelta > 0) {
                        noWinner = false;
                    }
                });

                if (noWinner && !noLoser) {
                    throw new Error("Winner, loser, and hand are required");
                }

                if (!noWinner && noLoser) {
                    if (hand.han === -2) {
                        throw new Error("Winner, loser, and hand are required");
                    }
                    throw new Error(errNoLoser);
                }
                

                if (noWinner && noLoser) { // nothing selected or winner and loser are same
                    if (hand.han === -2 && hand.fu === 10) {
                        throw new Error("Winner, loser, and hand are required");
                    } else {
                        throw new Error(errWinLoseSame);
                    }
                }
                
                checkHand(hand);

                if (hand.fu === 20) {
                    throw new Error(errInvalidHand);
                }
                if (hand.fu === 25) {
                    if (hand.han < hand.dora + 2) {
                        throw new Error(errInvalidHand);
                    }
                }

                break;

            case "SELF_DRAW":

                if (hand === undefined) {
                    throw new Error(errInvalidHand); // never reaches this
                }

                scoreDeltas.forEach((playerDelta) => {
                    if (playerDelta < 0) {
                        noLoser = false;
                    } else if (playerDelta > 0) {
                        noWinner = false;
                    }
                });
                
                if (noWinner) {
                    throw new Error(errNoWinner);
                }

                checkHand(hand);

                if (hand.fu === 20 && hand.han === 1) {
                    throw new Error(errInvalidHand);
                }
                if (hand.fu === 25) {
                    if (hand.han < hand.dora + 3) {
                        throw new Error(errInvalidHand);
                    }
                }

                break;

            case "DEAL_IN_PAO":
                break;

            case "SELF_DRAW_PAO":
                break;

            case "NAGASHI_MANGAN":
                scoreDeltas.forEach((playerDelta) => {
                    if (playerDelta > 0) {
                        noWinner = false;
                    }
                });

                if (noWinner) {
                    throw new Error(errNoWinner);
                }

                checkRiichiTenpai(tenpaiList, riichiList);
                break;

            case "INROUND_RYUUKYOKU":
                break;
        }
    });
};

const checkRiichiTenpai = (tenpaiList: number[], riichiList: number[]): void => {
    riichiList.forEach((riichi) => {
        if (!tenpaiList.includes(riichi)) {
            throw new Error(errRiichiNoTen);
        }
    });
};

const checkHand = (hand: JapaneseHandInput): void => {
    if (hand.han === -2) {
        throw new Error(errNoHan);
    }
    if (hand.han > 0 && hand.han < 5) {
        if (hand.fu == 10) {
            throw new Error(hand.han + errNoFu);
        }
    }
    if (hand.han <= hand.dora) {
        throw new Error(errInvalidDora);
    }
};

export { validateCreateJapaneseRound };
