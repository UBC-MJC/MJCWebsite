import { object, string, mixed, InferType, array } from "yup";
import { GameType } from "@prisma/client";

const createGameSchema = object({
    gameType: mixed<GameType>()
        .oneOf([GameType.RANKED, GameType.PLAY_OFF, GameType.TOURNEY])
        .required(),
    players: array().of(string().required()).length(4).required(),
});

type CreateGameType = InferType<typeof createGameSchema>;

const validateRound = (round: any, game: any, gameVariant: string): void => {
    if (!round) {
        throw new Error("Round is required");
    }

    switch (gameVariant) {
        case "jp":
            validateJapaneseRound(round, game);
            break;
        case "hk":
            validateHongKongRound(round, game);
            break;
    }
};

const validateJapaneseRound = (round: any, game: any): void => {
    // if (!round.type || typeof pointsValue.fu === "undefined") {
    //     throw new Error("Fu is required")
    // }
    // if (typeof pointsValue.points === "undefined") {
    //     throw new Error("Points are required")
    // }
    // if (typeof pointsValue.dora === "undefined") {
    //     throw new Error("Dora is required")
    // }
    //
    // validateRoundSelectors(roundValue)
};

const validateHongKongRound = (round: any, game: any): void => {};

export { createGameSchema, CreateGameType, validateRound };
