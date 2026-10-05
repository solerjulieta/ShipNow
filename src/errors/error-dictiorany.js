import { ERROR_CODES } from './error-codes.js'
import { HTTP_STATUS } from '../constants/index.js'

// Diccionario de errores
export const ERROR_DICTIONARY = Object.freeze({
    [ERROR_CODES.VALIDATION_ERROR]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Los datos enviados no son válidos.'
    },
    [ERROR_CODES.USER_NOT_FOUND]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'El usuario no existe.'
    },
    [ERROR_CODES.PRODUCT_NOT_FOUND]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'El producto no existe.'
    },
    [ERROR_CODES.ORDER_NOT_FOUND]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'La orden no existe.'
    },
    [ERROR_CODES.DELIVERY_NOT_FOUND]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'La entrega no existe.'
    },
    [ERROR_CODES.DUPLICATE_EMAIL]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'Ya existe un usuario con ese email.'
    },
    [ERROR_CODES.DUPLICATE_CREDENTIALS]: {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'Email o contraseña incorrectos.'
    },
    [ERROR_CODES.INVALID_CREDENTIALS]: {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: 'El rol indicado no es válido.'
    },
    [ERROR_CODES.ORDER_LOCKED]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'La orden ya tiene una entrega en curso y no se puede modificar.'
    },
    [ERROR_CODES.INSUFFICIENT_STOCK]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'No hay stock suficiente para completar la operación.'
    },
    [ERROR_CODES.INVALID_DELIVERY_STATUS]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'El estado indicado no es válido.'
    },
    [ERROR_CODES.INVALID_STATUS_TRANSITION]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'No se puede realizar esa transición de estado.'
    },
    [ERROR_CODES.INVALID_DELIVERY_PRIORITY]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'La prioridad indicada no es válida.'
    },
    [ERROR_CODES.DELIVERY_NOT_PENDING]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'Solo se puede asignar un repartidor a una entrega pendiente.'
    },
    [ERROR_CODES.INVALID_MOCK_QTY]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'La cantidad solicitada no es válida.'
    },
    [ERROR_CODES.INVALID_MOCK_COLLECTION]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'La colección indicada no es válida.'
    },
    [ERROR_CODES.MOCK_SEED_FAILED]: {
        statusCode: HTTP_STATUS.INTERNAL_ERROR,
        message: 'No se pudo completar la carga de datos de prueba.'
    },
    [ERROR_CODES.ROUTE_NOT_FOUND]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'La ruta solicitada no existe.'
    },
    [ERROR_CODES.CAST_ERROR]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'El identificador enviado no tiene un formato válido.'
    },
    [ERROR_CODES.DUPLICATE_KEY]: {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'Ya existe un registro con ese valor.'
    },
    [ERROR_CODES.INTERNAL_ERROR]: {
        statusCode: HTTP_STATUS.INTERNAL_ERROR,
        message: 'Error interno del servidor.'
    }
})

export default ERROR_DICTIONARY