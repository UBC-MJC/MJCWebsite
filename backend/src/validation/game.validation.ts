import {object, string, mixed, InferType, array} from 'yup';
import {GameType} from "@prisma/client";

const createGameSchema = object({
    gameType: mixed<GameType>().oneOf(['RIICHI', 'HONG_KONG']).required(),
    players: array().of(string().required()).length(4).required()
})

type CreateGameType = InferType<typeof createGameSchema>

export {createGameSchema, CreateGameType}
