import logger from '../config/logger.js'
import { HTTP_STATUS } from '../constants/index.js'

export const testLogger = (req, res) => {
    logger.debug('Prueba del logger: evento debug')
    logger.http('Prueba del logger: evento http')
    logger.info('Prueba del logger: evento info')
    logger.warning('Prueba del logger: evento warning')
    logger.error('Prueba del logger: evento error')
    logger.fatal('Prueba del logger: evento fatal')

    res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Se generaron registros de prueba en todos los niveles.',
        levels: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
        logsDirectory: 'logs/'
    })
}