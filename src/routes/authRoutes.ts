import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({min:8}).withMessage('Password must be at least 8 characters long'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    }),
    body('email').isEmail().withMessage('Email is not valid'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('Token is required'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').notEmpty().withMessage('Passwordd  is required'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('Email is not valid'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('Token is required'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token is not valid'),
    body('password').isLength({min:8}).withMessage('Password must be at least 8 characters long'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

export default router