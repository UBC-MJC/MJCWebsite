import { object, string, mixed, InferType, array, number, boolean } from "yup";
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
            player0ScoreChange: number().required(),
            player1ScoreChange: number().required(),
            player2ScoreChange: number().required(),
            player3ScoreChange: number().required(),
            fu: number().optional(),
            points:number().optional(),
            dora: number().optional()
        }),
    ).min(0).required(),
    player0Riichi: boolean().required(),
    player1Riichi: boolean().required(),
    player2Riichi: boolean().required(),
    player3Riichi: boolean().required(),
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
};

const validateCreateHongKongRound = (round: any, game: any): void => {};

export { createGameSchema, CreateGameType, validateCreateRound, CreateJapaneseRoundType, validateCreateJapaneseRound };
