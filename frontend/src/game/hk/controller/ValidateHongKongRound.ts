import type { HongKongTransaction } from "@/types";
import type { HongKongActions } from "@/game/common/constants";
import { HongKongTransactionType } from "@/game/common/constants";
import type { RoundRequirement } from "@/game/common/RoundRequirements";

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
    if (hand === -1) {
        throw new Error("Hand unset");
    }
    if (totalScoreDelta !== 0) {
        throw new Error("Winner and loser set to same person");
    }
    if (absScoreDelta === 0) {
        throw new Error("Nothing prominent happened despite having hand");
    }
    return true;
};

/**
 * Soft, non-throwing counterpart to {@link validateHongKongRound}: returns the
 * requirements not yet met for the round currently being entered, so the UI can
 * gray out the Submit button and explain what's missing. Mirrors the Japanese
 * {@link getUnmetJapaneseRoundRequirements}, but the Hong Kong rule set is a
 * subset — only player roles matter (the points wheel always carries a valid
 * hand). Deck Out can proceed with nobody prominent, so it reports nothing here
 * and continues to rely on the throwing validator at submit time.
 */
export const getUnmetHongKongRoundRequirements = (
    transactionType: HongKongTransactionType,
    roundActions: HongKongActions,
): RoundRequirement[] => {
    const isDealIn = transactionType === HongKongTransactionType.DEAL_IN;
    const isDealInPao = transactionType === HongKongTransactionType.DEAL_IN_PAO;
    const isSelfDraw = transactionType === HongKongTransactionType.SELF_DRAW;
    const isSelfDrawPao = transactionType === HongKongTransactionType.SELF_DRAW_PAO;

    // Pao variants mirror their non-pao counterparts plus a pao player.
    const needsWinner = isDealIn || isDealInPao || isSelfDraw || isSelfDrawPao;
    const needsLoser = isDealIn || isDealInPao;
    const needsPao = isDealInPao || isSelfDrawPao;

    const requirements: RoundRequirement[] = [];

    // 1. A winner is required.
    if (needsWinner && roundActions.WINNER === undefined) {
        requirements.push({ id: "winner", description: "Select a Winner." });
    }
    // 2. A loser is required for deal-ins.
    if (needsLoser && roundActions.LOSER === undefined) {
        requirements.push({ id: "loser", description: "Select a Loser." });
    }
    // 3. Pao variants require a pao player, who cannot be the winner.
    if (needsPao) {
        if (roundActions.PAO === undefined) {
            requirements.push({ id: "pao", description: "Select a Pao Player." });
        } else if (roundActions.PAO === roundActions.WINNER) {
            requirements.push({ id: "pao-winner", description: "Pao cannot be the Winner." });
        }
    }
    return requirements;
};

export { validateHongKongRound };
