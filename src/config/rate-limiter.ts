import { RateLimiterRedis } from 'rate-limiter-flexible'
import redis from './redis'

// General rate limiter
const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl_general',
    points: 100, // Number of requests
    duration: 900, // Per 15 minutes
    blockDuration: 900, // Block for 15 minutes
    execEvenly: true,
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
