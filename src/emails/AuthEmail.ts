import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token:string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user:IEmail) => {
        const info = await transporter.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: user.email,
            subject: "UpTask - Confirm your email",
            text: "UpTask -  Confirm your email",
            html: `<p>Hola ${user.name}, You have created your account on UpTask,
                everything is almost ready, you just need to confirm your account
            </p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
            <p>Enter your code: <b>${user.token}</b></p>
            <p>This token expire at 10 minutes</p>
            `
        })

        console.log("Message sent", info.messageId)
    }

    static sendPasswordResetToken = async (user:IEmail) => {
        const info = await transporter.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: user.email,
            subject: "UpTask - Reset your password",
            text: "UpTask -  Reset your password",
            html: `<p>Hola ${user.name}, You have requested to reset ypur password on UpTask
            </p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
            <p>Enter your code: <b>${user.token}</b></p>
            <p>This token expire at 10 minutes</p>
            `
        })

        console.log("Message sent", info.messageId)
    }
}