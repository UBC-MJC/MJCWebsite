import bcrypt from "bcryptjs";
import {RegisterType} from "../validation/player.validation";
import prisma from "../db";


const createPlayer = async (player: RegisterType) => {
    player.password = await bcrypt.hash(player.password, 12);
    return prisma.player.create({
        data: player,
    }).catch((err: any) => {
        throw new Error("Username/email already exists");
    });
}

const findPlayerByEmail = async (email: string) => {
    return prisma.player.findUnique({
        where: {
            email,
        },
    });
}

const findPlayerById = async (id: string) => {
    return prisma.player.findUnique({
        where: {
            id,
        },
    });
}

const findPlayerByUsernames = async (usernames: string[]) => {
    return prisma.player.findMany({
        where: {
            username: {
                in: usernames
            }
        }
    });
}

const findPlayerByUsername = async (username: string) => {
    return prisma.player.findUnique({
        where: {
            username,
        },
    });
}

const findAllPlayers = async () => {
    return prisma.player.findMany();
}

export {createPlayer, findPlayerByEmail, findPlayerById, findPlayerByUsername, findPlayerByUsernames, findAllPlayers}
