import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'atss-mail',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    ignoreTLS: true,
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@acetel.edu.ng',
            to,
            subject,
            text,
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
