import path from 'node:path'
import { fileURLToPath } from 'node:url'
import winston from 'winston'
import { config } from './index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logsDirectory = path.resolve(__dirname, '../../logs')

fstat.mkdirSync(logsDirectory, { recursive: true })

const customLevels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
        const extra = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : ''
        return `${timestamp} [${level}] ${message}${stack ? `\n${stack}` : ''}${extra}`
    })
)

const isProduction = config.nodeEnv === 'production'

const logger = winston.createLogger({
    levels: customLevels,
    level: isProduction ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            level: isProduction ? 'info' : 'debug'
        }),
        // El nivel error incluye error y fatal por la jerarquía customLevels.
        // Winston rota estos archivos por tamaño y conserva hasta cinco archivos.
        new winston.transports.File({
            filename: path.join(logsDirectory, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
            tailable: true
        })
    ],
    exitOnError: false
})

export default logger