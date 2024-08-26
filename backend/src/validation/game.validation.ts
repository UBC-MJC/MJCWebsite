import { array, InferType, mixed, number, object, string } from "yup";
import { GameType, HongKongTransactionType, JapaneseTransactionType, Wind } from "@prisma/client";

import { FullJapaneseGame } from "../services/game/japaneseGame.service";

const createGameSchema = object({
    gameType: mixed<GameType>().required(),
    players: array().of(string().required()).length(4).required(),
});

type CreateGameType = InferType<typeof createGameSchema>;

const JapaneseTransactionSchema = object({
    transactionType: mixed<JapaneseTransactionType>().required(),
    scoreDeltas: array().of(number().defined()).length(4).required(),
    paoPlayerIndex: number().optional(),
    hand: object({
        fu: number(),
        han: number(),
        dora: number(),
    }).optional(),
});

const ConcludedJapaneseRoundSchema = object({
    roundCount: number().required(),
    roundWind: mixed<Wind>().required(),
    roundNumber: number().required(),
    bonus: number().required(),
    startRiichiStickCount: number().required(),
    endRiichiStickCount: number().required(),
    riichis: array().of(number().defined()).required(),
    tenpais: array().of(number().defined()).required(),
    transactions: array().of(JapaneseTransactionSchema).min(0).required(),
});

const HongKongTransactionSchema = object({
    transactionType: mixed<HongKongTransactionType>().required(),
    scoreDeltas: array().of(number().defined()).length(4).required(),
    hand: number().optional(),
});

const ConcludedHongKongRoundSchema = object({
    roundCount: number().required(),
    roundWind: mixed<Wind>().required(),
    roundNumber: number().required(),
    transactions: array().of(HongKongTransactionSchema).min(0).required(),
});

type ConcludedJapaneseRoundT = InferType<typeof ConcludedJapaneseRoundSchema>;
type JapaneseTransactionT = InferType<typeof JapaneseTransactionSchema>;
type ConcludedHongKongRoundT = InferType<typeof ConcludedHongKongRoundSchema>;
type HongKongTransactionT = InferType<typeof HongKongTransactionSchema>;

type Transaction = JapaneseTransactionT | HongKongTransactionT;

const validateCreateRound = (round: any, game: any, gameVariant: string): void => {
    if (!round) {
        throw new Error("Round is required");
    }

    switch (gameVariant) {
        case "jp":
            validateCreateJapaneseRound(round, game);
            break;
        case "hk":
            validateCreateHongKongRound(round, game);
            break;
    }
};

const validateCreateJapaneseRound = (round: any, game: FullJapaneseGame): void => {
    round.transactions.forEach((transaction: JapaneseTransactionT) => {
        JapaneseTransactionSchema.validateSync(transaction);
    });
    ConcludedJapaneseRoundSchema.validateSync(round);
};

const validateCreateHongKongRound = (round: any, game: any): void => {
    try {
        ConcludedHongKongRoundSchema.validateSync(round);
        round.transactions.forEach((transaction: HongKongTransactionT) => {
            HongKongTransactionSchema.validateSync(transaction);
        });
    } catch (errors: any) {
        throw new Error("Invalid create Hong Kong round: " + errors);
    }
};

export {
    createGameSchema,
    CreateGameType,
    validateCreateRound,
    ConcludedJapaneseRoundT,
    JapaneseTransactionT,
    ConcludedHongKongRoundT,
    HongKongTransactionT,
    validateCreateJapaneseRound,
    validateCreateHongKongRound,
    Transaction,
};
