import {object, string, InferType, boolean} from 'yup';

const playerSchema = object({
    id: string().required(),
    firstName: string().required(),
    lastName: string().required(),
    username: string().required(),
    email: string().email().required(),
    admin: boolean().required(),
    japaneseQualified: boolean().required(),
    hongKongQualified: boolean().required()
})

type PlayerType = InferType<typeof playerSchema>

const registerSchema = object({
    firstName: string().required(),
    lastName: string().required(),
    username: string().required(),
    email: string().email().required(),
    password: string().required()
})

type RegisterType = InferType<typeof registerSchema>

const loginSchema = object({
    username: string().required(),
    password: string().required()
})

type LoginType = InferType<typeof loginSchema>

export { playerSchema, PlayerType, registerSchema, RegisterType, loginSchema, LoginType }
