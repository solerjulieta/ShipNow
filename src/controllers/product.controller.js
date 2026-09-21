import ProductService from '../services/product.service.js'
import { HTTP_STATUS } from '../constants/index.js'

const productService = new ProductService()

export const getProducts = async (req, res, next) => {
    try {
        const products = await productService.findAll(req.query)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: products })
    } catch (error) {
        next(error)
    }
}

export const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.pid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: product })
    } catch (error) {
        next(error)
    }
}

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.create(req.body)
        res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: product })
    } catch (error) {
        next(error)
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.update(req.params.pid, req.body)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: product })
    } catch (error) {
        next(error)
    }
}

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await productService.delete(req.params.pid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Producto eliminado exitosamente.' })
    } catch (error) {
        next(error)
    }
}