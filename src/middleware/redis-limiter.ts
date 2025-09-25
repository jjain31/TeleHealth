import { Request, Response, NextFunction } from 'express'
import { authRateLimiter } from '../config/rate-limiter'
import { RateLimiterRes } from 'rate-limiter-flexible'
import logger from '../config/logger'
import { error } from '../utils/response'

export const authRateLimit = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress

    try {
        await authRateLimiter.consume(ip as string, 1)
        logger.debug(`Auth rate limit check passed for IP: ${ip}`)
        return next()
    } catch (err) {
        if (err instanceof RateLimiterRes) {
            logger.warn(`Auth rate limit exceeded for IP: ${ip}`, {
                remainingPoints: err.remainingPoints,
                msBeforeNext: err.msBeforeNext,
            })

            res.set({
                'Retry-After': Math.round(err.msBeforeNext / 1000),
                'X-RateLimit-Limit': '5',
                'X-RateLimit-Remaining': err.remainingPoints?.toString() || '0',
            })

            return error(
                res,
                'Too many authentication attempts. Please try again later.',
                {
                    retryAfter: Math.round(err.msBeforeNext / 1000),
                },
                429,
            )
        }

        logger.error('Rate limiter error:', err)
        return next()
    }
}

export const generalRateLimit = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Skip rate limiting for health checks and metrics
    if (
        req.path === '/health' ||
        req.path === '/metrics' ||
        req.path.startsWith('/api-docs')
    ) {
        return next()
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip'

    const rateLimiter = (await import('../config/rate-limiter')).default

    try {
        await rateLimiter.consume(ip)
        logger.debug(`General rate limit check passed for IP: ${ip}`)
        next()
    } catch (err) {
        if (err instanceof RateLimiterRes) {
            logger.warn(`General rate limit exceeded for IP: ${ip}`)

            return error(
                res,
                'Too many requests. Please try again later.',
                {
                    retryAfter: Math.round(err.msBeforeNext / 1000),
                },
                429,
            )
        }

        logger.error('General rate limiter error:', err)
        return next() // Continue on rate limiter errors
    }
}
