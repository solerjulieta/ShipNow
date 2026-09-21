import OrderService from '../services/order.service.js'
import { HTTP_STATUS } from '../constants/index.js'

const orderService = new OrderService()

export const getOrders = async (req, res, next) => {
    try {
        const orders = await orderService.findAll(req.query)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: orders })
    } catch (error) {
        next(error)
    }
}

export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.oid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: order })
    } catch (error) {
        next(error)
    }
}

export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.create(req.body)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: order })
    } catch (error) {
        next(error)
    }
}

export const updateOrder = async (req, res, next) => {
    try {
        const order = await orderService.update(req.params.oid, req.body)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: order })
    } catch (error) {
        next(error)
    }
}

export const deleteOrder = async (req, res, next) => {
    try {
        await orderService.delete(req.params.oid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Orden eliminada exitosamente.' })
    } catch (error) {
        next(error)
    }
}