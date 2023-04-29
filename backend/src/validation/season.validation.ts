import {object, string, InferType, number} from 'yup';

const createSeasonSchema = object({
    name: string().required(),
    startDate: string().required(),
    endDate: string().required()
})

type CreateSeasonType = InferType<typeof createSeasonSchema>

const updateSeasonSchema = object({
    id: string().required(),
    name: string().required(),
    startDate: string().required(),
    endDate: string().required()
})

type UpdateSeasonType = InferType<typeof updateSeasonSchema>

export {createSeasonSchema, CreateSeasonType, updateSeasonSchema, UpdateSeasonType}
