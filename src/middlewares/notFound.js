import logger from '../config/logger.js'
import { HTTP_STATUS } from '../constants/index.js'
import { ERROR_CODES, ERROR_DICTIONARY } from '../errors/index.js'

// Si ninguna ruta coincidió, llegamos acá
export const notFound = (req, res) => {
    logger.warning('Ruta inexistente', { method: req.method, path: req.originalUrl })
    const error = ERROR_DICTIONARY[ERROR_CODES.ROUTE_NOT_FOUND]
    res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        code: ERROR_CODES.ROUTE_NOT_FOUND,
        message: error.message,
        details: { method: req.method, path: req.originalUrl }
    })
}

export default notFound