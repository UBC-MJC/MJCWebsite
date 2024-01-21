import { getEmptyScoreDelta, JapaneseTransactionType, NUM_PLAYERS } from "../../common/constants";
import { range } from "../../../common/Utils";

export function containingAny(
    transactions: JapaneseTransaction[],
    transactionType: JapaneseTransactionType,
): JapaneseTransaction | null {
    for (const transaction of transactions) {
        if (transaction.transactionType === transactionType) {
            return transaction;
        }
    }
    return null;
}

export function transformTransactions(transactions: JapaneseTransaction[], honba: number) {
    if (transactions.length === 0) {
        return [];
    }
    const transaction: JapaneseTransaction = determineHonbaTransaction(transactions);
    const newTransaction: JapaneseTransaction = addHonba(transaction, honba);
    for (const index of range(NUM_PLAYERS)) {
        if (transactions[index] === transaction) {
            transactions[index] = newTransaction;
        }
    }
    return transactions;
}

function determineHonbaTransaction(transactions: JapaneseTransaction[]) {
    if (transactions.length === 1) {
        return transactions[0];
    }
    const potentialTsumo = containingAny(transactions, JapaneseTransactionType.SELF_DRAW);
    if (potentialTsumo) {
        return potentialTsumo;
    }
    const headbumpWinner = findHeadbumpWinner(transactions);
    for (const transaction of transactions) {
        if (
            transaction.scoreDeltas[headbumpWinner] > 0 &&
            transaction.transactionType !== JapaneseTransactionType.DEAL_IN_PAO
        ) {
            return transaction;
        }
    }
    for (const transaction of transactions) {
        if (transaction.scoreDeltas[headbumpWinner] > 0) {
            return transaction;
        }
    }
    throw new Error("Should not reach here." + transactions);
}

function handleDealIn(newTransaction: JapaneseTransaction, honbaCount: number) {
    for (const index of range(NUM_PLAYERS)) {
        if (
            newTransaction.paoPlayerIndex !== undefined &&
            newTransaction.paoPlayerIndex === index
        ) {
            continue;
        }
        if (newTransaction.scoreDeltas[index] > 0) {
            newTransaction.scoreDeltas[index] += 300 * honbaCount;
        } else if (newTransaction.scoreDeltas[index] < 0) {
            newTransaction.scoreDeltas[index] -= 300 * honbaCount;
        }
    }
}

export function addHonba(transaction: JapaneseTransaction, honbaCount: number) {
    const newTransaction: JapaneseTransaction = {
        transactionType: transaction.transactionType,
        scoreDeltas: getEmptyScoreDelta(),
    };
    if (transaction.hand) {
        newTransaction.hand = transaction.hand;
    }
    if (transaction.paoPlayerIndex !== undefined) {
        newTransaction.paoPlayerIndex = transaction.paoPlayerIndex;
    }
    for (const index of range(NUM_PLAYERS)) {
        newTransaction.scoreDeltas[index] = transaction.scoreDeltas[index];
    }
    switch (newTransaction.transactionType) {
        case JapaneseTransactionType.NAGASHI_MANGAN:
        case JapaneseTransactionType.INROUND_RYUUKYOKU:
            break;
        case JapaneseTransactionType.SELF_DRAW:
            for (const index of range(NUM_PLAYERS)) {
                if (newTransaction.scoreDeltas[index] > 0) {
                    newTransaction.scoreDeltas[index] += 300 * honbaCount;
                } else {
                    newTransaction.scoreDeltas[index] -= 100 * honbaCount;
                }
            }
            break;
        case JapaneseTransactionType.DEAL_IN:
        case JapaneseTransactionType.DEAL_IN_PAO:
            handleDealIn(newTransaction, honbaCount);
            break;
        case JapaneseTransactionType.SELF_DRAW_PAO:
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
export function findHeadbumpWinner(transactions: JapaneseTransaction[]) {
    const winners = new Set<number>();
    const losers = new Set<number>();
    for (const transaction of transactions) {
        for (let index = 0; index < transaction.scoreDeltas.length; index++) {
            if (transaction.paoPlayerIndex !== undefined && transaction.paoPlayerIndex === index) {
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
    const [loser] = losers; // should only have one real loser
    return getClosestWinner(loser, winners);
}

function getClosestWinner(loserLocalPos: number, winners: Set<number>) {
    let [closestWinnerIndex] = winners;
    for (const winnerIndex of winners) {
        if (
            (winnerIndex - loserLocalPos) % NUM_PLAYERS <
            (closestWinnerIndex - loserLocalPos) % NUM_PLAYERS
        ) {
            closestWinnerIndex = winnerIndex;
        }
    }
    return closestWinnerIndex;
}
