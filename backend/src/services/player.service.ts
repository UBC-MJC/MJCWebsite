import bcrypt from "bcryptjs";
import {RegisterType} from "../validation/player.validation";
import prisma from "../db";
import {Player} from "@prisma/client";


const createPlayer = async (player: RegisterType): Promise<Player> => {
    return bcrypt.hash(player.password, 12).then((hash) => {
        return prisma.player.create({
            data: {
                ...player,
                password: hash
            }
        })
    })
}

const findPlayerByEmail = (email: string): Promise<Player | null> => {
    return prisma.player.findUnique({
        where: {
            email,
        },
    });
}

const findPlayerById = (id: string): Promise<Player | null> => {
    return prisma.player.findUnique({
        where: {
            id,
        },
    });
}

const findPlayerByUsernames = (usernames: string[]): Promise<Player[]> => {
    return prisma.player.findMany({
        where: {
            username: {
                in: usernames
            }
        }
    });
}

const findPlayerByUsername = (username: string): Promise<Player | null> => {
    return prisma.player.findUnique({
        where: {
            username,
        },
    });
}

const findAllPlayers = (query: any): Promise<Player[]> => {
    return prisma.player.findMany(query);
}

export {createPlayer, findPlayerByEmail, findPlayerById, findPlayerByUsername, findPlayerByUsernames, findAllPlayers}
