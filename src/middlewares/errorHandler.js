import AppError from '../utils/AppError.js'
import { HTTP_STATUS } from '../constants/index.js'
import { config } from '../config/index.js'

export const errorHandler = (error, req, res, next) => {
    // Errores que lanzo a propósito
    if(error instanceof AppError){
        return res.status(error.statusCode).json({ status: 'error', message: error.message })
    }

    // Validaciones del schema de Mongoose (required, min, enum, etc)
    if(error.name === 'ValidationError'){
        const messages = Object.values(error.errors).map((e) => e.message)
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: 'error',
            message: 'Datos inválidos.',
            errors: messages        
        })
    }

    // Índice único duplicado (por ejemplo, email repetido)
    if(error.code === 11000){
        return res.status(HTTP_STATUS.CONFLICT).json({
            status: 'error',
            message: 'Ya existe un registro con ese valor.'
        })
    }   
    
    console.error(error)

    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        status: 'error',
        message: config.nodeEnv === 'production' ? 'Error interno del servidor.' : error.message
    })    
}