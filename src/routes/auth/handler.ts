import { Request, Response } from 'express'
import { loginSchema, refreshTokenSchema, registerSchema } from './validation'
import { UserService } from '../../services/user/userService'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../../utils/jwt'
import { success, error } from '../../utils/response'
import logger from '../../config/logger'
import redis from '../../config/redis'

export const registerHandler = async (req: Request, res: Response) => {
    try {
        // Validate input
        const validationResult = registerSchema.safeParse(req.body)

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))

            return error(res, 'Validation failed', errors, 400)
        }

        const userData = validationResult.data

        // Create user
        const user = await UserService.createUser(userData)

        // Generate tokens using your existing jwt.ts
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: 'PATIENT' as const,
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        // Store refresh token in Redis
        const refreshTokenKey = `refresh_token:${user.id}`
        await redis.setex(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken) // 7 days

        logger.info('User registered successfully', {
            userId: user.id,
            email: user.email,
            role: 'PATIENT',
            ip: req.ip,
        })

        return success(
            res,
            'User registered successfully',
            {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: 'PATIENT',
                },
            },
            201,
        )
    } catch (err: any) {
        if (err.message === 'User with this email already exists') {
            return error(res, 'User with this email already exists', null, 409)
        }

        logger.error('Registration error:', err)
        return error(res, 'Internal server error', null, 500)
    }
}
export const loginHandler = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const validationResult = loginSchema.safeParse(req.body)
        console.log(validationResult)
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))
            return error(res, 'Validataion failed', errors, 400)
        }
        const data = validationResult.data
        const user = await UserService.getUserByEmailAndPassword(
            data.email,
            data.password,
        )
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: 'PATIENT' as const,
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        // Store refresh token in Redis
        const refreshTokenKey = `refresh_token:${user.id}`
        await redis.setex(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken) // 7 days
        logger.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            role: 'PATIENT',
        })
        return success(res, 'User logged in successfully', {
            refreshToken,
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: 'PATIENT',
            },
        })
    } catch (err: any) {
        if (err.message === 'User not found' || err.message === 'Invalid password') {
            return error(res, 'Invalid email or password', null, 401)
        }
        return error(res, 'Internal server error', null, 500)
    }
}
export const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const validationResult = refreshTokenSchema.safeParse(req.body)

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))
            return error(res, 'Validation failed', errors, 400)
        }

        const { refreshToken } = validationResult.data
        let payload
        try {
            payload = verifyRefreshToken(refreshToken)
        } catch (err: any) {
            logger.warn('Invalid refresh token provided', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            })
            return error(res, 'Invalid or expired refresh token', null, 401)
        }
        const refreshTokenKey = `refresh_token:${payload.userId}`
        const storedToken = await redis.get(refreshTokenKey)
        if (!storedToken || storedToken !== refreshToken) {
            logger.warn('Refresh token not found or does not match', {
                userId: payload.userId,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            })
            return error(res, 'Invalid or expired refresh token', null, 401)
        }
        const accessToken = generateAccessToken({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        })
        logger.info('Access token refreshed successfully', {
            userId: payload.userId,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        })
        return success(res, 'Access token refreshed successfully', { accessToken })
    } catch (err: any) {
        logger.error('Refresh token error:', err)
        return error(res, 'Internal server error', null, 500)
    }
}
