import { Router } from 'express'
import {
    previewUsers,
    previewDrivers,
    previewOrders,
    previewDeliveries,
    seed
} from '../controllers/mock.controller.js'

const router = Router()

// Simulación
router.get('/users', previewUsers)
router.get('/drivers', previewDrivers)
router.get('/orders', previewOrders)
router.get('/deliveries', previewDeliveries)

// Inserción real en MongoDB
router.post('/seed', seed)

export default router