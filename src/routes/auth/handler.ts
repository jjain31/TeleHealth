import { Request, Response } from 'express'
import { registerSchema } from './validation'
import { UserService } from '../../services/user/userService'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
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
            role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        // Store refresh token in Redis
        const refreshTokenKey = `refresh_token:${user.id}`
        await redis.setex(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken) // 7 days

        logger.info('User registered successfully', {
            userId: user.id,
            email: user.email,
            role: user.role,
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
                    role: user.role,
                    createdAt: user.createdAt,
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
