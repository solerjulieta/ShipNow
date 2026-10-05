import mongoose from 'mongoose'
import { AppError, ERROR_CODES, ERROR_DICTIONARY } from '../errors/index.js'
import { config } from '../config/index.js'

export const errorHandler = (error, req, res, next) => {
    if(res.headersSent) return next(error)

    // Caso 1: errores propios del dominio (los que lanzan los Services)
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            status: 'error',
            code: error.code,
            message: error.message,
            details: error.details ?? null
        })
    }

    // Caso 2: validaciones de schema de Mongoose (required, min, enum, etc.)
    if(error instanceof mongoose.Error.ValidationError){
        const entry = ERROR_DICTIONARY[ERROR_CODES.VALIDATION_ERROR]
        return res.status(entry.statusCode).json({
            status: 'error',
            code: ERROR_CODES.VALIDATION_ERROR,
            message: entry.message,
            details: Object.values(error.errors).map((e) => e.message)
        })
    }

    // Caso 3: un id con formato inválido llegó hasta Mongoose sin que lo
    // frenara isValidId() (red de contención, no debería pasar en el flujo normal)
    if(error instanceof mongoose.Error.CastError){
        const entry = ERROR_DICTIONARY[ERROR_CODES.CAST_ERROR]
        return res.status(entry.statusCode).json({
            status: 'error',
            code: ERROR_CODES.CAST_ERROR,
            message: entry.message,
            details: null
        })
    }

    // Caso 4: índice único duplicado (ej. email repetido a nivel de base,
    // además de la verificación que ya hace el Service)
    if(error?.code === 11000){
        const entry = ERROR_DICTIONARY[ERROR_CODES.DUPLICATE_KEY]
        return res.status(entry.statusCode).json({
            status: 'error',
            code: ERROR_CODES.DUPLICATE_KEY,
            message: entry.message,
            details: error.keyValue ?? null
        })
    }

    // Caso 5: cualquier otra cosa no prevista. Se loguea completo en el
    // servidor (para poder debuggear) pero al cliente nunca le llega el
    // stack trace ni el mensaje interno en producción.
    console.error(error)

    const entry = ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR]
    return res.status(entry.statusCode).json({
        status: 'error',
        code: ERROR_CODES.INTERNAL_ERROR,
        message: config.nodeEnv === 'production' ? entry.message : error.message,
        details: null
    })
}

export default errorHandler