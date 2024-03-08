import { emailTransporter } from "./emailClient";

const createResetPasswordEmail = async (toAddress: string) => {
    return emailTransporter.sendMail({
        from: '"UBC Mahjong" <ubcmahjongreset@gmail.com>',
        to: toAddress,
        subject: "Reset UBC Mahjong Password",
        text: "There is a new article. It's heck it out!",
        html: "<b>There is a new article. It's about sending emails, check it out!</b>",
    })
};

export { createResetPasswordEmail };
