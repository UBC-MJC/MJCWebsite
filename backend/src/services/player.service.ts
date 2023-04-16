import bcrypt from "bcryptjs";
import {RegisterType} from "../validation/player.validation";
import prisma from "../db";


const createPlayer = (player: RegisterType) => {
    player.password = bcrypt.hashSync(player.password, 12);
    return prisma.player.create({
        data: player,
    }).catch((err: any) => {
        throw new Error("Username/email already exists");
    });
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

const findPlayerByUsername = (username: string) => {
    return prisma.player.findUnique({
        where: {
            username,
        },
    });
}

const findAllPlayers = async () => {
    return prisma.player.findMany();
}

export {createPlayer, findPlayerByEmail, findPlayerById, findPlayerByUsername, findAllPlayers}
