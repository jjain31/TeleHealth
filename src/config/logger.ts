import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize, errors, json } = format

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
})

// File rotation transport
const fileRotateTransport = new DailyRotateFile({
    filename: 'logs/%DATE%-app.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m', //rotates log when it exceeds 20 MB.
    maxFiles: '14d', // keep logs for 14 days
    zippedArchive: true, //compresses old logs to save space.
})

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // capture stack traces
    ),
    transports: [
        new transports.Console({
            format: combine(colorize(), consoleFormat),
        }),
        fileRotateTransport,
    ],
    exitOnError: false,
})

export default logger
