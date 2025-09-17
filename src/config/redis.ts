import Redis from 'ioredis'
import logger from './logger'

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
})

redis.on('connect', () => logger.info('Connected to Redis'))
redis.on('error', (err) => logger.error('Redis error', err))

export default redis
