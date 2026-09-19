import DeliveryService from '../services/delivery.service.js'
import { HTTP_STATUS } from '../constants/index.js'

const deliveryService = new DeliveryService()

export const getDeliveries = async (req, res, next) => {
    try {
        const deliveries = await deliveryService.findAll(req.query)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: deliveries })
    } catch (error) {
        next(error)
    }
}

export const getDeliveryById = async (req, res, next) => {
    try {
        const delivery = await deliveryService.getDeliveryById(req.params.did)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: delivery })
    } catch (error) {
        next(error)
    }
}

export const assignDriver = async (req, res, next) => {
    try {
        const delivery = await deliveryService.assignDriver(req.params.did, req.body.driver)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: delivery })
    } catch (error) {
        next(error)
    }
}

export const updateStatus = async (req, res, next) => {
    try {
        const delivery = await deliveryService.updateStatus(req.params.did, req.body.status)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: delivery })        
    } catch (error) {
        next(error)
    }
}

export const updatePriority = async (req, res, next) => {
    try {
        const delivery = await deliveryService.updatePriority(req.params.did, req.body.priority)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: delivery })        
    } catch (error) {
        next(error)
    }
}

export const getDeliveriesByDriver = async (req, res, next) => {
    try {
        const deliveries = await deliveryService.getByDriver(req.params.driverId)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: deliveries })        
    } catch (error) {
        next(error)
    }
}