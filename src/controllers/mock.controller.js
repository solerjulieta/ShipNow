import MockService from '../services/mock.service.js'
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js'

const mockService = new MockService()

export const previewUsers = (req, res, next) => {
    try {
        const data = mockService.previewUsers(req.query.qty ?? 5, req.query.role)
        res.status(HTTP_STATUS.OK).json(data)
    } catch (error) {
        next(error)
    }
}

export const previewDrivers = (req, res, next) => {
    try {
        const data = mockService.previewUsers(req.query.qty ?? 5, USER_ROLES.DRIVER)
        res.status(HTTP_STATUS.OK).json(data)
    } catch (error) {
        next(error)
    }
}

export const previewOrders = (req, res, next) => {
    try {
        const data = mockService.previewOrders(req.query.qty ?? 5)
        res.status(HTTP_STATUS.OK).json(data)
    } catch (error) {
        next(error)
    }
}

export const previewDeliveries = (req, res, next) => {
    try {
        const data = mockService.previewDeliveries(req.query.qty ?? 5)
        res.status(HTTP_STATUS.OK).json(data)
    } catch (error) {
        next(error)
    }
}

export const seed = async (req, res, next) => {
    try {
        const qty = req.query.qty ?? req.body?.qty ?? 10
        const collection = req.query.collection ?? req.body?.collection
        const result = await mockService.seed(collection, qty)
        res.status(HTTP_STATUS.CREATED).json(result)
    } catch (error) {
        next(error)
    }
}