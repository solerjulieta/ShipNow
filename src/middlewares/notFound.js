import { HTTP_STATUS } from '../constants/index.js'

// Si ninguna ruta coincidió, llegamos acá
export const notFound = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: `La ruta ${req.method} ${req.originalUrl} no existe.`
    })
}