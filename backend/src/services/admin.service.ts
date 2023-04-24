import prisma from "../db";
import bcrypt from "bcryptjs";
import {Player} from "@prisma/client";

// creates an admin account if one does not already exist
const createAdmin = async (): Promise<Player> => {
    return prisma.player.upsert({
        where: {
            username: process.env.ADMIN_USERNAME || 'admin'
        },
        update: {},
        create: {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'password', 12),
            firstName: 'Admin',
            lastName: 'Account',
            email: process.env.ADMIN_EMAIL || 'example@example.com',
            admin: true,
            japaneseQualified: true,
            hongKongQualified: true
        }
    })
}



export {createAdmin}
