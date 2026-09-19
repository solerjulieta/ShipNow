import mongoose from 'mongoose'

// Subdocumento: un item no existe sin su orden, va embebido y sin _id propio

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido.']
        },
        quantity: {
            type: Number,
            required: [true, 'La cantidad es requerida.'],
            min: [1, 'La cantidad mínima es 1.']
        },
        price: {
            type: Number,
            required: [true, 'El precio es requerido.'],
            min: [0, 'El precio no puede ser un número negativo.']
        }
    }, { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El cliente es requerido.']
        },
        items: {
            type: [itemSchema],
            validate: {
                validator: (items) => items.length > 0,
                message: 'La orden debe tener al menos un ítem.'
            }
        },
        deliveryAddress: {
            type: String,
            required: [true, 'La dirección de entrega es requerida.'],
            trim: true
        },
        total: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Delivery guarda la referencia a Order, no al revés.
// Este virtual permite hacer populate('delivery') desde la orden.
orderSchema.virtual('delivery', {
    ref: 'Delivery',
    localField: '_id',
    foreignField: 'order',
    justOne: true
})

export default mongoose.model('Order', orderSchema)