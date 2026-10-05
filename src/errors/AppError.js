import { ERROR_CODES } from './error-codes.js'
import { ERROR_DICTIONARY } from './error-dictiorany.js'

export default class AppError extends Error{
    constructor(code = ERROR_CODES.INTERNAL_ERROR, message, details = null){
        const entry = ERROR_DICTIONARY[code] ?? ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR]

        super(message ?? entry.message)

        this.name = this.constructor.name
        this.code = code
        this.statusCode = entry.statusCode
        this.details = details
        this.isOperational = true

        if(Error.captureStackTrace){
            Error.captureStackTrace(this, this.constructor)
        }
    }
}