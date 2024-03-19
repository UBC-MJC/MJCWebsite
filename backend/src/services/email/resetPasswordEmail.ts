import nodemailer from "nodemailer";
import { Player } from "@prisma/client";

const sendResetPasswordEmail = async (player: Player, link: string) => {
    const emailTransporter = nodemailer.createTransport({
        host: "smtp.zohocloud.ca",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    return emailTransporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: player.email,
        subject: "Reset UBC Mahjong Password",
        text: `Hi ${player.firstName},\nYou requested to reset your password.\nPlease, click the link below to reset your password\n${link}`,
        html: `
            <html>
                <head>
                    <style>
            
                    </style>
                </head>
                <body>
                    <p>Hi ${player.firstName},</p>
                    <p>You requested to reset your password.</p>
                    <p>Please, click the link below to reset your password</p>
                    <a href="${link}">Reset Password</a>
                </body>
            </html>
        `,
    });
};

export { sendResetPasswordEmail };
