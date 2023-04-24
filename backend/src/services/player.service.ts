import bcrypt from "bcryptjs";
import {RegisterType} from "../validation/player.validation";
import prisma from "../db";


const createPlayer = async (player: RegisterType) => {
    return bcrypt.hash(player.password, 12).then((hash) => {
        return prisma.player.create({
            data: {
                ...player,
                password: hash
            }
        })
    })
}

const findPlayerByEmail = (email: string) => {
    return prisma.player.findUnique({
        where: {
            email,
        },
    });
}

const findPlayerById = (id: string) => {
    return prisma.player.findUnique({
        where: {
            id,
        },
    });
}

const findPlayerByUsernames = (usernames: string[]) => {
    return prisma.player.findMany({
        where: {
            username: {
                in: usernames
            }
        }
    });
}

const findPlayerByUsername = (username: string) => {
    return prisma.player.findUnique({
        where: {
            username,
        },
    });
}

const findAllPlayers = (query: any) => {
    return prisma.player.findMany(query);
}

export {createPlayer, findPlayerByEmail, findPlayerById, findPlayerByUsername, findPlayerByUsernames, findAllPlayers}
