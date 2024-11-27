import { object, string, InferType, mixed } from "yup";
import { GameType } from "@prisma/client";

const createSeasonSchema = object({
    name: string().required(),
    type: mixed<GameType>().required(),
    startDate: string().required(),
    endDate: string().required(),
});

type CreateSeasonType = InferType<typeof createSeasonSchema>;

const updateSeasonSchema = object({
    id: string().required(),
    name: string().required(),
    startDate: string().required(),
    endDate: string().required(),
});

type UpdateSeasonType = InferType<typeof updateSeasonSchema>;

export { createSeasonSchema, CreateSeasonType, updateSeasonSchema, UpdateSeasonType };
