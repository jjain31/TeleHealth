import express from 'express'
import dotenv from 'dotenv'
import logger from './config/logger'
import { register } from './config/prometheus'
import redis from './config/redis'
dotenv.config()
const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
const PORT = process.env.PORT || 3000
redis.connect().catch((err) => {
    logger.error('Redis connection error', err)
})
app.get('/health', async (req, res) => {
    try {
        await redis.ping()
        await redis.set('test-key', 'test-value', 'EX', 60) // expires in 60 seconds
        const value = await redis.get('test-key')

        res.json({
            status: 'healthy',
            redis: 'connected',
            test: value,
        })
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            redis: 'disconnected',
        })
    }
})
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})
app.listen(PORT, () => {
    logger.info(`Auth User Service is running on port ${PORT}`)
})
