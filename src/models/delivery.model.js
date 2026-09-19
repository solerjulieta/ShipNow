import mongoose from 'mongoose'
import { DELIVERY_STATUS, DELIVERY_PRIORITY } from '../constants/index.js'

const deliverySchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'El pedido es requerido.'],
            unique: true
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        status: {
            type: String,
            enum: Object.values(DELIVERY_STATUS),
            default: DELIVERY_STATUS.PENDING
        },
        priority: {
            type: String,
            enum: Object.values(DELIVERY_PRIORITY),
            default: DELIVERY_PRIORITY.NORMAL
        },
        assignedAt: {
            type: Date,
            default: null
        },
        deliveredAt: {
            type: Date,
            default: null
        }
    }, 
    { timestamps: true } 
)

export default mongoose.model('Delivery', deliverySchema)