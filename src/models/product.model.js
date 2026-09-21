import mongoose from 'mongoose'
import { PRODUCT_STATUS } from '../constants/index.js'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido.'],
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'El precio es requerido.'],
            min: [0, 'El precio no puede ser un número negativo.']
        },
        stock: {
            type: Number,
            required: [true, 'El stock es requerido.'],
            min: [0, 'El stock no puede ser negativo.'],
            default: 0
        },
        category: {
            type: String,
            required: [true, 'La categoría es requerida.'],
            trim: true,
            lowercase: true
        },
        // El status se deriva del stock en el Service, no se confía en lo que manda el body
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.AVAILABLE
        }
    },
    { timestamps: true }
)

export default mongoose.model('Product', productSchema)