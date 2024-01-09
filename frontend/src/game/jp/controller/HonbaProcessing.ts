import {ActionType, getEmptyScoreDelta, NUM_PLAYERS, Transaction} from "./Types";
import {range} from "./Range";

function containingAny(transactions: Transaction[], actionType: ActionType): Transaction | null {
    for (const transaction of transactions) {
        if (transaction.actionType === actionType) {
            return transaction;
        }
    }
    return null;
}

export function transformTransactions(transactions: Transaction[], honba: number) {
    const transaction: Transaction = determineHonbaTransaction(transactions);
    const newTransaction: Transaction = addHonba(transaction, honba);
    for (const index of range(NUM_PLAYERS)) {
        if (transactions[index] === transaction) {
            transactions[index] = newTransaction;
        }
    }
    return transactions;
}

export function findHeadbumpWinner(transactions: Transaction[]) {
    const winners = new Set<number>();
    const losers = new Set<number>();
    for (const transaction of transactions) {
        for (let index = 0; index < transaction.scoreDeltas.length; index++) {
            if (transaction.paoTarget !== undefined && transaction.paoTarget === index) {
                // is pao target
                continue;
            }
            if (transaction.scoreDeltas[index] < 0) {
                losers.add(index);
            } else if (transaction.scoreDeltas[index] > 0) {
                winners.add(index);
            }
        }
    }
    const loser = losers.values().next().value; // should only have one real loser
    return getClosestWinner(loser, winners);
}

function determineHonbaTransaction(transactions: Transaction[]) {
    if (transactions.length === 1) {
        return transactions[0];
    }
    const potentialTsumo = containingAny(transactions, ActionType.TSUMO);
    if (potentialTsumo) {
        return potentialTsumo;
    }
    const headbumpWinner = findHeadbumpWinner(transactions);
    for (const transaction of transactions) {
        if (transaction.scoreDeltas[headbumpWinner] > 0) {
            return transaction;
        }
    }
    throw new Error("Should not reach here." + transactions);
}

function handleDealIn(newTransaction: Transaction, honbaCount: number) {
    for (const index of range(NUM_PLAYERS)) {
        if (newTransaction.paoTarget !== undefined && newTransaction.paoTarget === index) {
            continue;
        }
        if (newTransaction.scoreDeltas[index] > 0) {
            newTransaction.scoreDeltas[index] += 300 * honbaCount;
        } else if (newTransaction.scoreDeltas[index] < 0) {
            newTransaction.scoreDeltas[index] -= 300 * honbaCount;
        }
    }
}

export function addHonba(transaction: Transaction, honbaCount: number) {
    const newTransaction: Transaction = {
        actionType: transaction.actionType,
        scoreDeltas: getEmptyScoreDelta(),
    };
    if (transaction.hand) {
        newTransaction.hand = transaction.hand;
    }
    if (transaction.paoTarget) {
        newTransaction.paoTarget = transaction.paoTarget;
    }
    for (const index of range(NUM_PLAYERS)) {
        newTransaction.scoreDeltas[index] = transaction.scoreDeltas[index];
    }
    switch (newTransaction.actionType) {
        case ActionType.CHOMBO:
        case ActionType.NAGASHI_MANGAN:
        case ActionType.TENPAI:
            break;
        case ActionType.TSUMO:
            for (const index of range(NUM_PLAYERS)) {
                if (newTransaction.scoreDeltas[index] > 0) {
                    newTransaction.scoreDeltas[index] += 300 * honbaCount;
                } else {
                    newTransaction.scoreDeltas[index] -= 100 * honbaCount;
                }
            }
            break;
        case ActionType.RON:
        case ActionType.DEAL_IN_PAO:
            handleDealIn(newTransaction, honbaCount);
            break;
        case ActionType.SELF_DRAW_PAO:
            for (const index of range(NUM_PLAYERS)) {
                if (newTransaction.scoreDeltas[index] > 0) {
                    newTransaction.scoreDeltas[index] += 300 * honbaCount;
                } else if (newTransaction.scoreDeltas[index] < 0) {
                    newTransaction.scoreDeltas[index] -= 300 * honbaCount;
                }
            }
            break;
    }
    return newTransaction;
}

function getClosestWinner(loserLocalPos: number, winners: Set<number>) {
    // code below triggers typescript error

    // let [closestWinnerIndex] = winners;
    // for (const winnerIndex of winners) {
    //     if ((winnerIndex - loserLocalPos) % NUM_PLAYERS < (closestWinnerIndex - loserLocalPos) % NUM_PLAYERS) {
    //         closestWinnerIndex = winnerIndex;
    //     }
    // }
    // return closestWinnerIndex;
    return -1;
}

export function dealershipRetains(transactions: Transaction[], dealerIndex: number) {
    for (const transaction of transactions) {
        if (
            [ActionType.RON, ActionType.TSUMO, ActionType.SELF_DRAW_PAO, ActionType.DEAL_IN_PAO].includes(
                transaction.actionType
            ) &&
            transaction.scoreDeltas[dealerIndex] > 0
        ) {
            return true;
        }
        if (transaction.actionType === ActionType.CHOMBO) {
            return true;
        }
        if (transaction.actionType === ActionType.NAGASHI_MANGAN) {
            return true;
        }
    }
    return false;
}

export function getNewHonbaCount(dealerIndex: number, transactions: Transaction[], honba: number) {
    for (const transaction of transactions) {
        if (
            [ActionType.RON, ActionType.TSUMO, ActionType.SELF_DRAW_PAO, ActionType.DEAL_IN_PAO].includes(
                transaction.actionType
            ) &&
            transaction.scoreDeltas[dealerIndex] > 0
        ) {
            return honba + 1;
        }
        if (transaction.actionType === ActionType.CHOMBO) {
            return honba;
        }
    }
    return 0;
}