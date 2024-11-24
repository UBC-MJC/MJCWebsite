import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { RegisterType } from "../validation/player.validation";
import prisma from "../db";
import { Player } from "@prisma/client";
import { sendResetPasswordEmail } from "./email/resetPasswordEmail";
import tokenCache from "../tokenCache";

const createPlayer = async (player: RegisterType): Promise<Player> => {
    return bcrypt.hash(player.password, 12).then((hash) => {
        return prisma.player.create({
            data: {
                firstName: player.firstName,
                lastName: player.lastName,
                username: player.username,
                email: player.email,
                password: hash,
            },
        });
    });
};

const updatePlayer = async (id: string, player: Partial<Player>): Promise<Player> => {
    return prisma.player.update({
        where: {
            id,
        },
        data: player,
    });
};
const deletePlayer = async (id: string): Promise<Player> => {
    return prisma.player.delete({
        where: {
            id,
        },
    });
};

const requestPasswordReset = async (player: Player, host: string) => {
    const resetToken = crypto.randomBytes(32).toString("hex");

    tokenCache[player.id] = await bcrypt.hash(resetToken, 12);

    const link = `${host}/password-reset?token=${resetToken}&id=${player.id}`;
    console.log("Link: ", link);
    await sendResetPasswordEmail(player, link);
};

const resetPassword = async (id: string, token: string, newPassword: string) => {
    if (tokenCache[id]) {
        const valid = await bcrypt.compare(token, tokenCache[id]);
        if (valid) {
            const hash = await bcrypt.hash(newPassword, 12);
            await prisma.player.update({
                where: {
                    id,
                },
                data: {
                    password: hash,
                },
            });
            delete tokenCache[id];
            return true;
        }
    }
    return false;
};

const findPlayerByEmail = (email: string): Promise<Player | null> => {
    return prisma.player.findUnique({
        where: {
            email,
        },
    });
};

const findPlayerById = (id: string): Promise<Player | null> => {
    return prisma.player.findUnique({
        where: {
            id,
        },
    });
};

const findPlayerByUsernames = (usernames: string[]): Promise<Player[]> => {
    return prisma.player.findMany({
        where: {
            username: {
                in: usernames,
            },
        },
    });
};

const findAllPlayers = (): Promise<Player[]> => {
    return prisma.player.findMany({});
};

function sanitizeFullName(firstName: string, lastName: string) {
    return `${firstName.trim()} ${lastName.trim()[0]}.`;
}

const findPlayerByUsernameOrEmail = async (token: string): Promise<Player | null> => {
    const result = await prisma.player.findUnique({
        where: {
            username: token,
        },
    });

    if (result) {
        return result;
    }

    return prisma.player.findUnique({
        where: {
            email: token,
        },
    });
};
export {
    createPlayer,
    updatePlayer,
    deletePlayer,
    requestPasswordReset,
    resetPassword,
    findPlayerByEmail,
    findPlayerById,
    findPlayerByUsernameOrEmail,
    findPlayerByUsernames,
    findAllPlayers,
    sanitizeFullName,
};
