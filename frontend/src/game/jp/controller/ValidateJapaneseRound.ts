const errInvalidHand = "Invalid hand";
const errNoWinner = "Winner is required";
const errNoLoser = "Loser is required";
const errWinLoseSame = "Winner and loser must be different";
const errNoHan = "Han is required";
const errNoFu = "han requires fu";

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
            throw new Error("Riichi player must be tenpai");
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
};

export { validateCreateJapaneseRound };
