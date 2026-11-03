import multer from 'multer'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'node:url'
import logger from '../config/logger.js'
import { FileTypeNotAllowedError, FileTooLargeError, UploadFieldError  } from '../errors/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.resolve(__dirname, '../../uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024
export const DOCUMENT_TYPES = Object.freeze(['identity', 'license', 'other'])
const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
]

const directories = {
    documents: path.join(uploadsRoot, 'documents'),
    proofs: path.join(uploadsRoot, 'proofs')
}
Object.values(directories).forEach((directory) => fs.mkdirSync(directory, { recursive: true }))

const createUpload = (folder) => multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, directories[folder]),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname).toLowerCase()
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`)
        }
    }),
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) { logger.warning('Intento de carga con tipo no permitido', { mimeType: file.mimetype, originalName: file.originalname }); return cb(new FileTypeNotAllowedError(file.mimetype)) }
        cb(null, true)
    },
    limits: { fileSize: MAX_FILE_SIZE, files: 1 }
})

const documentUpload = createUpload('documents').single('document')
const proofUpload = createUpload('proofs').single('proof')

const handleUpload = (upload) => (req, res, next) => {
    upload(req, res, (error) => {
        if (!error) { if(req.file) logger.info('Archivo recibido por Multer', { originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size }); return next() }
        logger.warning('Error durante la carga de archivo', { message: error.message, code: error.code })
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') return next(new FileTooLargeError(MAX_FILE_SIZE))
            return next(new UploadFieldError(error.code, error.field))
        }
        next(error)
    })
}

export const uploadDocument = handleUpload(documentUpload)
export const uploadProof = handleUpload(proofUpload)
export { MAX_FILE_SIZE, uploadsRoot }