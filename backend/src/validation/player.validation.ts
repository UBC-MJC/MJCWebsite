import { object, string, InferType } from 'yup';

const registerSchema = object({
    firstName: string(),
    lastName: string(),
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

export { registerSchema, RegisterType, loginSchema, LoginType }
