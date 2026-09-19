import mongoose from 'mongoose'
import { USER_ROLES } from '../constants.index.js'

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'El nombre es requerido.'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'El apellido es requerido.'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El email es requerido.'],
            unique: true,
            trim: true,
            lowercase: true
        }, 
        password: {
            type: String,
            required: [true, 'La contraseña es requerida.']
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.CUSTOMER
        },
        documents: {
            type: [
                {
                    name: { type: String },
                    reference: { type: String }
                }
            ],
            default: []
        }
    }, { timestamps: true }
)

export default mongoose.model('User', userSchema)