import logger from '@/config/logger'
import { error } from '../utils/response'
import { Request, Response, NextFunction } from 'express'
import { JwtPayload, verifyAccessToken } from '@/utils/jwt'

declare global {
    namespace Express {
        interface Request {
            jwtUser?: JwtPayload
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            logger.warn('Access attempt without token', { ip: req.ip, path: req.path })
            return error(res, 'Access token is missing', null, 401)
        }
        const decoded = verifyAccessToken(token)
        req.jwtUser = decoded
        logger.debug('Token verified successfully', {
            userId: decoded.userId,
            email: decoded.email,
        })
        next()
    } catch (error: any) {
        logger.warn('Token verification failed', {
            error: error.message,
            ip: req.ip,
            path: req.path,
        })

        if (error.name === 'TokenExpiredError') {
            return error(res, 'Access token has expired', null, 401)
        }

        if (error.name === 'JsonWebTokenError') {
            return error(res, 'Invalid access token', null, 401)
        }

        return error(res, 'Token verification failed', null, 401)
    }
}
