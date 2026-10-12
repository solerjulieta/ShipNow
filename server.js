import app from './app.js'
import { connectDB } from './src/config/db.js'
import { config } from './src/config/index.js'
import logger from './src/config/logger.js'

const startServer = async () => {
    try {
        await connectDB()
        app.listen(config.port, () => {
            logger.info(`Servidor escuchando en el puerto ${config.port}`)
        })
    } catch (error) {
        logger.fatal('No se pudo iniciar ShipNow', { message: error.message, stack: error.stack })
        process.exit(1)
    }
}

startServer()