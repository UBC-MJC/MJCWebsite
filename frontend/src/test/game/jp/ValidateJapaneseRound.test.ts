import { describe, expect, it } from "vitest";

import { JP_UNDEFINED_HAND } from "@/game/common/constants";
import {
    addDealIn,
    addNagashiMangan,
    addPaoDealIn,
    addPaoSelfDraw,
    addSelfDraw,
} from "@/game/jp/controller/JapaneseRound";
import {
    validateJapaneseRound,
    validateTransaction,
} from "@/game/jp/controller/ValidateJapaneseRound";

// Transactions are built the same way the recording UI builds them, with East (0) dealing.
const DEALER = 0;
const hand = (han: number, fu: number, dora = 0) => ({ han, fu, dora });

describe("validateTransaction", () => {
    it.each([
        ["deal-in", addDealIn(1, 2, DEALER, hand(1, 30))],
        ["self-draw", addSelfDraw(1, DEALER, hand(1, 30))],
        ["pinfu self-draw", addSelfDraw(1, DEALER, hand(2, 20))],
        ["yakuman pao deal-in", addPaoDealIn(1, 2, 3, DEALER, hand(13, 30))],
        ["yakuman pao self-draw", addPaoSelfDraw(1, 3, DEALER, hand(13, 30))],
        ["nagashi mangan", addNagashiMangan(1, DEALER)],
    ])("accepts a %s", (_, transaction) => {
        expect(() => validateTransaction(transaction)).not.toThrow();
    });

    // Rounds start from JP_UNDEFINED_HAND; refusing it is what makes the recorder pick a hand.
    it.each([
        ["deal-in", addDealIn(1, 2, DEALER, JP_UNDEFINED_HAND)],
        ["self-draw", addSelfDraw(1, DEALER, JP_UNDEFINED_HAND)],
    ])("refuses a %s whose hand was never chosen", (_, transaction) => {
        expect(() => validateTransaction(transaction)).toThrow("Han is required");
    });

    it("refuses a deal-in where the winner is also the loser", () => {
        expect(() => validateTransaction(addDealIn(1, 1, DEALER, hand(1, 30)))).toThrow(
            "The winner cannot be the loser",
        );
    });

    it.each([
        ["20 fu deal-in", addDealIn(1, 2, DEALER, hand(2, 20)), "Invalid hand"],
        ["1 han 20 fu self-draw", addSelfDraw(1, DEALER, hand(1, 20)), "Invalid hand"],
        ["hand without fu", addDealIn(1, 2, DEALER, hand(1, 10)), "Han requires Fu"],
        [
            "hand that is all dora",
            addDealIn(1, 2, DEALER, hand(2, 30, 2)),
            "Dora must be fewer than Han",
        ],
        ["non-yakuman pao", addPaoDealIn(1, 2, 3, DEALER, hand(5, 30)), "Only yakuman can be pao"],
    ])("refuses a %s", (_, transaction, message) => {
        expect(() => validateTransaction(transaction)).toThrow(message);
    });
});

describe("validateJapaneseRound", () => {
    it("accepts a deck-out where every riichi player is tenpai", () => {
        expect(() => validateJapaneseRound([1, 2], [1], [])).not.toThrow();
    });

    it("refuses a deck-out where a riichi player is not tenpai", () => {
        expect(() => validateJapaneseRound([2], [1], [])).toThrow(
            "Cannot declare riichi and not be tenpai",
        );
    });

    it("accepts a double ron off one loser", () => {
        const transactions = [
            addDealIn(1, 3, DEALER, hand(1, 30)),
            addDealIn(2, 3, DEALER, hand(2, 30)),
        ];
        expect(() => validateJapaneseRound([], [], transactions)).not.toThrow();
    });

    it("refuses a deal-in mixed with a self-draw", () => {
        const transactions = [
            addDealIn(1, 3, DEALER, hand(1, 30)),
            addSelfDraw(2, DEALER, hand(1, 30)),
        ];
        expect(() => validateJapaneseRound([], [], transactions)).toThrow(
            "Incompatible transactions",
        );
    });
});
