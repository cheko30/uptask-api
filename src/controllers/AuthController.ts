import type { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { transporter } from '../config/nodemailer';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //Check if user already exists
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error("User already exists")
                res.status(409).json({error: error.message})
                return
            }

            //Create new user
            const user = new User(req.body)

            //Hash Password
            user.password = await hashPassword(password)

            //Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Send email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send("Account created succesfully")
        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error creating account"})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})

            if(!tokenExists) {
                const error = new Error("Invalid token")
                res.status(401).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send("Account confirmed succesfully")

        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error creating account"})
        }
    }

}