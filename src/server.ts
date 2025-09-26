import express from 'express'
import dotenv, { config } from 'dotenv'
import logger from './config/logger'
import { register } from './config/prometheus'
import redis from './config/redis'
import rateLimiter from './config/rate-limiter'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.config'
import authRoutes from './routes/auth'
import oauthRoutes from './routes/oauth'
import { error } from './utils/response'
import passport from 'passport'
import configurePassport from './config/passport'
dotenv.config()
const app = express()

// Trust proxy for proper IP detection
app.set('trust proxy', 1)

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(passport.initialize())
configurePassport()
const PORT = process.env.PORT || 3000

redis.connect().catch((err) => {
    logger.error('Redis connection error', err)
})

// Rate limiting middleware
app.use((req, res, next) => {
    if (
        req.path === '/health' ||
        req.path === '/metrics' ||
        req.path.startsWith('/api-docs')
    ) {
        return next()
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress

    rateLimiter
        .consume(ip as string, 1)
        .then(() => {
            logger.debug(`Rate limit check passed for IP: ${ip}`)
            next()
        })
        .catch((err) => {
            logger.warn(`Rate limit exceeded for IP: ${ip}`)
            return error(
                res,
                'Too Many Requests',
                {
                    retryAfter: Math.round(err.msBeforeNext / 1000) || 60,
                },
                429,
            )
        })
})

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRoutes)
app.use('/oauth', oauthRoutes)
app.get('/health', async (req, res) => {
    try {
        await redis.ping()
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: 'connected',
                database: 'connected',
            },
        })
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: 'disconnected',
            },
        })
    }
})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})

app.listen(PORT, () => {
    logger.info(`Auth User Service is running on port ${PORT}`)
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`)
})
