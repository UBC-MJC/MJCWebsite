const validateHongKongRound = (transactions: HongKongTransaction[]) => {
    if (transactions.length === 0) {
        return true;
    }
    const [transaction] = transactions;
    const hand = transaction.hand;
    const scoreDeltas = transaction.scoreDeltas;
    const totalScoreDelta = scoreDeltas.reduce<number>((prev, current) => prev + current, 0);
    const absScoreDelta = scoreDeltas.reduce<number>(
        (prev, current) => prev + Math.abs(current),
        0,
    );
    if (hand! === -1) {
        throw new Error("Hand unset");
    }
    if (totalScoreDelta !== 0) {
        throw new Error("Winner and loser set to same person");
    }
    if (absScoreDelta === 0) {
        console.log(scoreDeltas.toString());
        throw new Error("Nothing prominent happened despite having hand");
    }
    return true;
};

export { validateHongKongRound };
