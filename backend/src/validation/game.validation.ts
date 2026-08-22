import * as z from "zod";

import { GameType, HongKongTransactionType, JapaneseTransactionType, Wind } from "@prisma/client";
import { FullJapaneseGame } from "../services/game/japaneseGame.service";

const gameVariantSchema = z.enum(["jp", "hk"]);

const createGameSchema = z.object({
    gameType: z.enum(GameType),
    players: z.array(z.string()).length(4),
});

const JapaneseTransactionBaseSchema = z.object({
    scoreDeltas: z.array(z.number()).length(4),
});

const JapaneseHandSchema = z.object({
    fu: z.number(),
    han: z.number(),
    dora: z.number(),
});

const JapaneseTransactionSchema = z.discriminatedUnion("transactionType", [
    JapaneseTransactionBaseSchema.extend({
        transactionType: z.enum([
            JapaneseTransactionType.DEAL_IN,
            JapaneseTransactionType.SELF_DRAW,
        ]),
        hand: JapaneseHandSchema,
    }).strict(),
    JapaneseTransactionBaseSchema.extend({
        transactionType: z.enum([
            JapaneseTransactionType.DEAL_IN_PAO,
            JapaneseTransactionType.SELF_DRAW_PAO,
        ]),
        hand: JapaneseHandSchema,
        paoPlayerIndex: z.number(),
    }).strict(),
    JapaneseTransactionBaseSchema.extend({
        transactionType: z.enum([
            JapaneseTransactionType.NAGASHI_MANGAN,
            JapaneseTransactionType.INROUND_RYUUKYOKU,
        ]),
    }).strict(),
]);

const ConcludedJapaneseRoundSchema = z.object({
    roundCount: z.int(),
    roundWind: z.enum(Wind),
    roundNumber: z.int(),
    bonus: z.int(),
    startRiichiStickCount: z.int(),
    endRiichiStickCount: z.int(),
    riichis: z.array(z.int()),
    tenpais: z.array(z.int()),
    transactions: z.array(JapaneseTransactionSchema),
});

const HongKongTransactionSchema = z.object({
    transactionType: z.enum(HongKongTransactionType),
    scoreDeltas: z.array(z.int()).length(4),
    hand: z.int().optional(),
});

const ConcludedHongKongRoundSchema = z.object({
    roundCount: z.int(),
    roundWind: z.enum(Wind),
    roundNumber: z.int(),
    transactions: z.array(HongKongTransactionSchema),
});

type GameVariant = z.infer<typeof gameVariantSchema>;
type ConcludedJapaneseRoundT = z.infer<typeof ConcludedJapaneseRoundSchema>;
type JapaneseTransactionT = z.infer<typeof JapaneseTransactionSchema>;
type ConcludedHongKongRoundT = z.infer<typeof ConcludedHongKongRoundSchema>;
type HongKongTransactionT = z.infer<typeof HongKongTransactionSchema>;

type Transaction = JapaneseTransactionT | HongKongTransactionT;

const validateCreateJapaneseRound = (round: any, game: FullJapaneseGame): void => {
    round.transactions.forEach((transaction: JapaneseTransactionT) => {
        JapaneseTransactionSchema.parse(transaction);
    });
    ConcludedJapaneseRoundSchema.parse(round);
};

const validateCreateHongKongRound = (round: any, game: any): void => {
    try {
        ConcludedHongKongRoundSchema.parse(round);
        round.transactions.forEach((transaction: HongKongTransactionT) => {
            HongKongTransactionSchema.parse(transaction);
        });
    } catch (errors: any) {
        throw new Error("Invalid create Hong Kong round: " + errors);
    }
};

export {
    createGameSchema,
    gameVariantSchema,
    JapaneseTransactionSchema,
    GameVariant,
    ConcludedJapaneseRoundT,
    JapaneseTransactionT,
    ConcludedHongKongRoundT,
    HongKongTransactionT,
    validateCreateJapaneseRound,
    validateCreateHongKongRound,
    Transaction,
};
