import AppError from './AppError.js'
import { ERROR_CODES } from './error-codes.js'

export class ValidationError extends AppError{
    constructor(message, details = null){
        super(ERROR_CODES.VALIDATION_ERROR, message, details)
    }
}

export class UserNotFoundError extends AppError {
    constructor(id){
        super(ERROR_CODES.USER_NOT_FOUND, id ? `El usuario con id "${id}" no existe.` : undefined)
    }
}

export class ProductNotFoundError extends AppError {
    constructor(id){
        super(ERROR_CODES.PRODUCT_NOT_FOUND, id ? `El producto con id "${id}" no existe.` : undefined)
    }
}

export class OrderNotFoundError extends AppError {
    constructor(id){
        super(ERROR_CODES.ORDER_NOT_FOUND, id ? `La orden con id "${id}" no existe.` : undefined)
    }
}

export class DeliveryNotFoundError extends AppError {
    constructor(id){
        super(ERROR_CODES.DELIVERY_NOT_FOUND, id ? `La entrega con id "${id}" no existe.` : undefined)
    }
}

export class DuplicateEmailError extends AppError {
    constructor(email){
        super(
            ERROR_CODES.DUPLICATE_EMAIL,
            email ? `Ya existe un usuario registrado con el email "${email}".` : undefined
        )
    }
}

export class InvalidCredentialsError extends AppError {
    constructor(){
        super(ERROR_CODES.INVALID_CREDENTIALS)
    }
}

export class InvalidRoleError extends AppError {
    constructor(role, allowedRoles = []){
        const allowedText = allowedRoles.length ? ` Debe ser uno de: ${allowedRoles.join(', ')}.` : ''
        super(ERROR_CODES.INVALID_ROLE, `El rol "${role}" no es válido.${allowedText}`)
    }
}

export class OrderLockedError extends AppError {
    constructor(){
        super(ERROR_CODES.ORDER_LOCKED)
    }
}

export class InsufficientStockError extends AppError {
    constructor(){
        super(ERROR_CODES.INSUFFICIENT_STOCK)
    }
}

export class InvalidDeliveryStatusError extends AppError {
    constructor(status, allowedStatuses = []){
        const allowedText = allowedStatuses.length ? ` Debe ser uno de: ${allowedStatuses.join(', ')}.` : ''
        super(ERROR_CODES.INVALID_DELIVERY_STATUS, `El estado "${status}" no es válido.${allowedText}`)
    }
}

export class InvalidStatusTransitionError extends AppError {
    constructor(from, to){
        super(ERROR_CODES.INVALID_STATUS_TRANSITION, `No se puede pasar de "${from}" a "${to}".`)
    }
}

export class InvalidDeliveryPriorityError extends AppError {
    constructor(priority, allowedPriorities = []){
        const allowedText = allowedPriorities.length ? ` Debe ser una de: ${allowedPriorities.join(', ')}.` : ''
        super(ERROR_CODES.INVALID_DELIVERY_PRIORITY, `La prioridad "${priority}" no es válida.${allowedText}`)
    }
}

export class DeliveryNotPendingError extends AppError {
    constructor(){
        super(ERROR_CODES.DELIVERY_NOT_PENDING)
    }
}

export class InvalidMockQuantityError extends AppError {
    constructor(qty, max){
        super(
            ERROR_CODES.INVALID_MOCK_QTY,
            `El parámetro "qty" (${qty}) debe ser un entero entre 1 y ${max}.`
        )
    }
}

export class InvalidMockCollectionError extends AppError {
    constructor(collection, allowedCollections = []){
        const allowedText = allowedCollections.length
            ? ` Debe ser una de: ${allowedCollections.join(', ')}.`
            : ''
        super(ERROR_CODES.INVALID_MOCK_COLLECTION, `La colección "${collection}" no es válida.${allowedText}`)
    }
}

export class MockSeedError extends AppError {
    constructor(originalError){
        super(ERROR_CODES.MOCK_SEED_FAILED, undefined, {
            cause: originalError?.message ?? String(originalError)
        })
    }
}

export class FileRequiredError extends AppError {
    constructor(){ super(ERROR_CODES.FILE_REQUIRED, 'El archivo es obligatorio.') }
}

export class FileTypeNotAllowedError extends AppError {
    constructor(mimeType){ super(ERROR_CODES.FILE_TYPE_NOT_ALLOWED, 'El tipo de archivo no está permitido.', { mimeType }) }
}

export class FileTooLargeError extends AppError {
    constructor(maxSize){ super(ERROR_CODES.FILE_TOO_LARGE, 'El archivo supera el tamaño máximo permitido.', { maxSizeBytes: maxSize }) }
}

export class UploadFieldError extends AppError {
    constructor(reason, field){ super(ERROR_CODES.UPLOAD_FIELD_INVALID, 'El campo de archivo enviado no es válido.', { reason, field }) }
}

export class InvalidDocumentTypeError extends AppError {
    constructor(type, allowed){ super(ERROR_CODES.DOCUMENT_TYPE_INVALID, 'El tipo de documento no es válido.', { received: type, allowed }) }
}

export class FileSaveError extends AppError {
    constructor(){ super(ERROR_CODES.FILE_SAVE_FAILED, 'No se pudo guardar la información del archivo.') }
}