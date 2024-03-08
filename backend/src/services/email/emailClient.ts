import nodemailer from 'nodemailer';

const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'ubcmahjongreset@gmail.com',
        pass: 'ujgk qbam bnol mhyl',
    },
});
emailTransporter.verify().then(console.log).catch(console.error);

export { emailTransporter };
