import bcrypt from "bcryptjs";
import { RegisterType } from "../validation/player.validation";
import prisma from "../db";
import { Player } from "@prisma/client";

const createPlayer = async (player: RegisterType): Promise<Player> => {
    return bcrypt.hash(player.password, 12).then((hash) => {
        return prisma.player.create({
            data: {
                ...player,
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
    findPlayerByEmail,
    findPlayerById,
    findPlayerByUsernameOrEmail,
    findPlayerByUsernames,
    findAllPlayers,
};
