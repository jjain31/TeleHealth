import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import redis from './redis'
// General rate limiter
const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'middleware',
    points: 100, // max 100 requests
    duration: 60, // per 60 seconds
    blockDuration: 300, // block for 5 minutes
})

// Auth specific rate limiter
export const authRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl_auth',
    points: 5, // 5 login attempts
    duration: 900, // Per 15 minutes
    blockDuration: 1800, // Block for 30 minutes
})

export default rateLimiter
