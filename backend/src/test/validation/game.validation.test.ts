import { JapaneseTransactionType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { createGameSchema, JapaneseTransactionSchema } from "../../validation/game.validation";

const scoreDeltas = [-1000, 0, 1000, 0];
const hand = { dora: 0, fu: 30, han: 1 };

describe("JapaneseTransactionSchema", () => {
    it.each([JapaneseTransactionType.DEAL_IN, JapaneseTransactionType.SELF_DRAW])(
        "requires a hand for %s",
        (transactionType) => {
            expect(
                JapaneseTransactionSchema.safeParse({ transactionType, scoreDeltas, hand }).success,
            ).toBe(true);
            expect(
                JapaneseTransactionSchema.safeParse({ transactionType, scoreDeltas }).success,
            ).toBe(false);
        },
    );

    it.each([JapaneseTransactionType.DEAL_IN_PAO, JapaneseTransactionType.SELF_DRAW_PAO])(
        "requires a hand and pao player for %s",
        (transactionType) => {
            expect(
                JapaneseTransactionSchema.safeParse({
                    transactionType,
                    scoreDeltas,
                    hand,
                    paoPlayerIndex: 0,
                }).success,
            ).toBe(true);
            expect(
                JapaneseTransactionSchema.safeParse({ transactionType, scoreDeltas, hand }).success,
            ).toBe(false);
        },
    );

    it.each([JapaneseTransactionType.NAGASHI_MANGAN, JapaneseTransactionType.INROUND_RYUUKYOKU])(
        "does not accept hand data for %s",
        (transactionType) => {
            expect(
                JapaneseTransactionSchema.safeParse({ transactionType, scoreDeltas }).success,
            ).toBe(true);
            expect(
                JapaneseTransactionSchema.safeParse({ transactionType, scoreDeltas, hand }).success,
            ).toBe(false);
        },
    );

    it("does not accept a pao player on a non-pao transaction", () => {
        expect(
            JapaneseTransactionSchema.safeParse({
                transactionType: JapaneseTransactionType.DEAL_IN,
                scoreDeltas,
                hand,
                paoPlayerIndex: 0,
            }).success,
        ).toBe(false);
    });
});

describe("createGameSchema season selection", () => {
    const request = { gameType: "RANKED", players: ["east", "south", "west", "north"] };

    it("preserves an explicitly selected season", () => {
        expect(createGameSchema.parse({ ...request, seasonId: "selected-season" }).seasonId).toBe(
            "selected-season",
        );
    });

    it("accepts existing clients without a season selection", () => {
        expect(createGameSchema.parse(request).seasonId).toBeUndefined();
    });

    it.each(["", 123, null])("rejects an invalid season selection: %s", (seasonId) => {
        expect(createGameSchema.safeParse({ ...request, seasonId }).success).toBe(false);
    });
});
