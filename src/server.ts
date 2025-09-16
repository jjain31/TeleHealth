import express from 'express'
import dotenv from 'dotenv'
import logger from './config/logger'
import { register } from './config/prometheus'
dotenv.config()
const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
const PORT = process.env.PORT || 3000

app.get('/health', (req, res) => {
    res.send('Welcome to the Auth User Service')
})
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})
app.listen(PORT, () => {
    logger.info(`Auth User Service is running on port ${PORT}`)
})
