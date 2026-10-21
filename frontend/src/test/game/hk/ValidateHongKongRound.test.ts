import { describe, expect, it } from "vitest";

import { HK_UNDEFINED_HAND, HongKongTransactionType, Wind } from "@/game/common/constants";
import type { HongKongActions } from "@/game/common/constants";
import { createHongKongRoundRequest } from "@/game/hk/controller/HongKongRound";
import { validateHongKongRound } from "@/game/hk/controller/ValidateHongKongRound";

const currentRound = { roundCount: 1, roundNumber: 1, roundWind: Wind.EAST };

// Transactions are built the same way the recording UI builds them.
const transactionsFor = (
    roundType: HongKongTransactionType,
    roundActions: HongKongActions,
    point: number,
) => createHongKongRoundRequest(roundType, roundActions, point, currentRound).transactions;

describe("validateHongKongRound", () => {
    it.each([
        ["deal-in", HongKongTransactionType.DEAL_IN, { WINNER: 0, LOSER: 1 }],
        ["self-draw", HongKongTransactionType.SELF_DRAW, { WINNER: 0 }],
        ["pao deal-in", HongKongTransactionType.DEAL_IN_PAO, { WINNER: 0, LOSER: 1, PAO: 2 }],
        ["pao self-draw", HongKongTransactionType.SELF_DRAW_PAO, { WINNER: 0, PAO: 2 }],
    ])("accepts a %s", (_, roundType, roundActions) => {
        expect(validateHongKongRound(transactionsFor(roundType, roundActions, 3))).toBe(true);
    });

    it("accepts a deck-out", () => {
        expect(
            validateHongKongRound(
                transactionsFor(HongKongTransactionType.DECK_OUT, {}, HK_UNDEFINED_HAND),
            ),
        ).toBe(true);
    });

    // Rounds start from HK_UNDEFINED_HAND; refusing it is what makes the recorder pick a hand.
    it.each([
        ["deal-in", HongKongTransactionType.DEAL_IN, { WINNER: 0, LOSER: 1 }],
        ["self-draw", HongKongTransactionType.SELF_DRAW, { WINNER: 0 }],
    ])("refuses a %s whose hand was never chosen", (_, roundType, roundActions) => {
        expect(() =>
            validateHongKongRound(transactionsFor(roundType, roundActions, HK_UNDEFINED_HAND)),
        ).toThrow("Hand unset");
    });

    it("refuses a deal-in where the winner is also the loser", () => {
        expect(() =>
            validateHongKongRound(
                transactionsFor(HongKongTransactionType.DEAL_IN, { WINNER: 0, LOSER: 0 }, 3),
            ),
        ).toThrow("Winner and loser set to same person");
    });
});
