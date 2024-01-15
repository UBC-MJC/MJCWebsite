import { array, InferType, mixed, number, object, string } from "yup";
import { GameType, JapaneseTransactionType, Wind } from "@prisma/client";
import { FullJapaneseGame } from "../services/game/game.util";

const createGameSchema = object({
    gameType: mixed<GameType>()
        .oneOf([GameType.RANKED, GameType.PLAY_OFF, GameType.TOURNEY])
        .required(),
    players: array().of(string().required()).length(4).required(),
});

type CreateGameType = InferType<typeof createGameSchema>;

const JapaneseTransactionSchema = object({
    // type: mixed<JapaneseTransactionType>().oneOf(["DEAL_IN", "SELF_DRAW", "DEAL_IN_PAO", "SELF_DRAW_PAO", "NAGASHI_MANGAN", "INROUND_RYUUKYOKU"]).required(),
    transactionType: mixed<JapaneseTransactionType>().required(),
    scoreDeltas: array().of(number().defined()).length(4).required(),
    paoPlayerIndex: number().optional(),
    hand: object({
        fu: number().required(),
        points: number().required(),
        dora: number().required()
    }).optional()
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
    transactions: array().of(
        JapaneseTransactionSchema
    ).min(0).required()
});

type ConcludedJapaneseRoundT = InferType<typeof ConcludedJapaneseRoundSchema>;
type JapaneseTransactionT = InferType<typeof JapaneseTransactionSchema>;

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
        ConcludedJapaneseRoundSchema.validateSync(round);
    } catch (errors: any) {
        throw new Error("Invalid create Japanese round: " + errors);
    }
};

const validateCreateHongKongRound = (round: any, game: any): void => {};

export {
    createGameSchema,
    CreateGameType,
    validateCreateRound,
    ConcludedJapaneseRoundT,
    JapaneseTransactionT,
    validateCreateJapaneseRound
};
