import prisma from "../db";
import bcrypt from "bcryptjs";

const makeDummyAdmins = async () => {
    return prisma.player.createMany({
        data: [
            {
                username: process.env.ADMIN_USERNAME || "admin",
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "password", 12),
                firstName: "Admin",
                lastName: "Account",
                email: process.env.ADMIN_EMAIL || "example@example.com",
                admin: true,
                japaneseQualified: true,
                hongKongQualified: true,
            },
            {
                username: "admin1",
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "password", 12),
                firstName: "Admin1",
                lastName: "Account",
                email: "example1@example.com",
                admin: true,
                japaneseQualified: true,
                hongKongQualified: true,
            },
            {
                username: "admin2",
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "password", 12),
                firstName: "Admin2",
                lastName: "Account",
                email: "example2@example.com",
                admin: true,
                japaneseQualified: true,
                hongKongQualified: true,
            },
            {
                username: "admin3",
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "password", 12),
                firstName: "Admin3",
                lastName: "Account",
                email: "example3@example.com",
                admin: true,
                japaneseQualified: true,
                hongKongQualified: true,
            },
        ],
        skipDuplicates: true,
    });
};

export { makeDummyAdmins };
