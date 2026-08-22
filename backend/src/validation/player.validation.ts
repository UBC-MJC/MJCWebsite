import { z } from "zod";

const playerSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.email(),
    admin: z.boolean(),
    japaneseQualified: z.boolean(),
    hongKongQualified: z.boolean(),
});

type PlayerType = z.infer<typeof playerSchema>;

const registerSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.email(),
    password: z.string(),
});

type RegisterType = z.infer<typeof registerSchema>;

const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

type LoginType = z.infer<typeof loginSchema>;

const requestPasswordResetSchema = z.object({
    username: z.string().min(1),
});

const passwordResetSchema = z.object({
    playerId: z.string().min(1),
    token: z.string().min(1),
    newPassword: z.string().min(1),
});

const updateSettingsSchema = z.object({
    settings: z.object({
        legacyDisplayGame: z.boolean(),
    }),
});

const updateUsernameSchema = z.object({
    username: z.string().min(1),
});

export {
    playerSchema,
    PlayerType,
    registerSchema,
    RegisterType,
    loginSchema,
    LoginType,
    requestPasswordResetSchema,
    passwordResetSchema,
    updateSettingsSchema,
    updateUsernameSchema,
};
