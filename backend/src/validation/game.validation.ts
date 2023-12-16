import { object, string, mixed, InferType, array, number } from "yup";
import { GameType, JapaneseTransactionType } from "@prisma/client";
import { FullJapaneseGame } from "../services/game/game.util";

const createGameSchema = object({
    gameType: mixed<GameType>()
        .oneOf([GameType.RANKED, GameType.PLAY_OFF, GameType.TOURNEY])
        .required(),
    players: array().of(string().required()).length(4).required(),
});

type CreateGameType = InferType<typeof createGameSchema>;

const createJapaneseRoundSchema = object({
    transactions: array().of(
        object({
            type: mixed<JapaneseTransactionType>().oneOf(["DEAL_IN", "SELF_DRAW", "TENPAI", "MISTAKE", "PAO"]).required(),
            amount: number().required().positive().integer(),
            payer: string().required(),
            payee: string().required(),
            handIndex: number().optional().min(0).max(2)
        }),
    ).min(0).required(),
    hands: array().of(
        object({
            fu: mixed<number>().required(),
            points: mixed<number>().required(),
            dora: mixed<number>().required()
        }),
    ).min(0).max(3).required(),
    riichis: array().of(string().required()).min(0).max(4).required()
});

type CreateJapaneseRoundType = InferType<typeof createJapaneseRoundSchema>;

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
    try {
        createJapaneseRoundSchema.validateSync(round);
    } catch (errors: any) {
        throw new Error("Invalid create Japanese round: " + errors);
    }

    // const transactions = round.transactions;
    // const hands = round.hands;
    // const riichis = round.riichis;
    //
    // if (transactions.length > 0) {
    //     validateTransactions(transactions, game);
    // }
    //
    // if (riichis.length > 0) {
    //     validateRiichis(riichis, game);
    // }
};

const validateCreateHongKongRound = (round: any, game: any): void => {};

export { createGameSchema, CreateGameType, validateCreateRound, CreateJapaneseRoundType, validateCreateJapaneseRound };
