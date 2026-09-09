import { z } from "zod";
import { GameType } from "@prisma/client";

const seasonIdSchema = z.string().regex(/\S/, "Invalid season id");

const createSeasonSchema = z.object({
    name: z.string(),
    type: z.enum(GameType),
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

export {
    seasonIdSchema,
    createSeasonSchema,
    CreateSeasonType,
    updateSeasonSchema,
    UpdateSeasonType,
};
