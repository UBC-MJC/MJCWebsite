import {object, string, mixed, InferType, array} from 'yup';
import {GameType, GameVariant} from "@prisma/client";

const createGameSchema = object({
    gameType: mixed<GameType>().oneOf([GameType.RANKED, GameType.PLAY_OFF, GameType.TOURNEY]).required(),
    gameVariant: mixed<GameVariant>().oneOf([GameVariant.JAPANESE, GameVariant.HONG_KONG]).required(),
    players: array().of(string().required()).length(4).required()
})

type CreateGameType = InferType<typeof createGameSchema>

export {createGameSchema, CreateGameType}
