import { Router } from 'express'
import {
    getDeliveries,
    getDeliveryById,
    assignDriver,
    updateStatus,
    updatePriority,
    getDeliveriesByDriver
} from '../controllers/delivery.controller.js'

const router = Router()

router.get('/', getDeliveries)
router.get('/driver/:driverId', getDeliveriesByDriver)
router.get('/:did', getDeliveryById)
router.patch('/:did/assign', assignDriver)
router.patch('/:did/status', updateStatus)
router.patch('/:did/priority', updatePriority)

export default router