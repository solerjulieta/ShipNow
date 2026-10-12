import mongoose from 'mongoose'
import { config } from './index.js'
import logger from './logger.js'

export const connectDB = async () => {
    try {
       await mongoose.connect(config.mongoUri)
       logger.info('Conexión a MongoDB establecida')
    } catch (error) {
        logger.fatal('Error al conectar con MongoDB', { message: error.message })
        throw error
    }
}