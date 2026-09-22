import { Router } from 'express'
import userRoutes from './user.routes.js'
import productRoutes from './product.routes.js'
import orderRoutes from './order.routes.js'
import deliveryRoutes from './delivery.routes.js'
import mockRoutes from './mock.routes.js'

const router = Router()

router.use('/user', userRoutes)
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)
router.use('/deliveries', deliveryRoutes)
router.use('/mocks', mockRoutes)

export default router