import { z } from "zod";

const createSeasonSchema = z.object({
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});

type CreateSeasonType = z.infer<typeof createSeasonSchema>;

const updateSeasonSchema = z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});

type UpdateSeasonType = z.infer<typeof updateSeasonSchema>;

export { createSeasonSchema, CreateSeasonType, updateSeasonSchema, UpdateSeasonType };
