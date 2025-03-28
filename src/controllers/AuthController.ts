import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

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
                return
            }

            const user = await User.findById(tokenExists.user)
            console.log(user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send("Account confirmed succesfully")

        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error confirm account"})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password} = req.body
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error("User not found")
                res.status(404).json({error: error.message})
                return
            }

            if(!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //Send email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error("User not confirmed, confirmation email sent")
                res.status(401).json({error: error.message})
                return
            }

            //Check password
            const isPassword = await checkPassword(password, user.password)
            if(!isPassword) {
                const error = new Error("Password is incorrect")
                res.status(401).json({error: error.message})
                return
            }

            const token = generateJWT({id: user.id})

            res.send(token)

        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error creating account"})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Check if user exists
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error("User not registered")
                res.status(404).json({error: error.message})
                return
            }

            if(user.confirmed) {
                const error = new Error("User already confirmed")
                res.status(403).json({error: error.message})
                return
            }

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
            res.send("A new token has been sent to your email")
        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error creating account"})
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Check if user exists
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error("User not registered")
                res.status(404).json({error: error.message})
                return
            }

            //Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            //Send email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send("Check your email for the password reset")
        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error creating account"})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})

            if(!tokenExists) {
                const error = new Error("Invalid token")
                res.status(401).json({error: error.message})
                return
            }

            res.send("Token is valid, you can reset your password")

        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error confirm account"})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenExists = await Token.findOne({token})

            if(!tokenExists) {
                const error = new Error("Invalid token")
                res.status(401).json({error: error.message})
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send("The password has been updated succesfully")

        } catch (error) {
            console.error(error)
            res.status(500).json({error: "Error confirm account"})
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body
        req.user.name = name
        req.user.email = email

        try {
            const userExists = await User.findOne({email})
            if(userExists && userExists.id.toString() !== req.user.id.toString()) {
                const error = new Error("This email is already in use")
                res.status(401).json({error: error.message})
                return
            }
            await req.user.save()
            res.send("Profile updated succesfully")
        } catch (error) {
            res.status(500).json({error: "Error updating profile"})
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        
        try {
            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(current_password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error("Current password is incorrect")
                res.status(401).json({error: error.message})
                return
            }

            user.password = await hashPassword(password)
            await user.save()

            res.send("Password updated succesfully")

        } catch (error) {
            res.status(500).json({error: "Error updating password"})
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        
        try {
            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Passsword is incorrect')
                res.status(401).json({error: error.message})
                return
            }

            res.send('Passowrd is correct')

        } catch (error) {
            res.status(500).json({error: "Error updating password"})
        }
    }
}