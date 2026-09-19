import { isValidId } from '../utils/isValidId.js'
import User from '../models/user.model.js'

export default class UserRepository {
    async findAll(filter = {}){
        return User.find(filter).select('-password').sort({ createdAt: -1 })
    }

    async findById(id){
        if(!isValidId(id)) return null
        return User.findById(id).select('-password')
    }

    async findByEmail(email){
        if(!email) return null
        return User.findOne({ email: email.toLowerCase().trim() }).select('-password')
    }

    // Único método que expone el password. El nombre lo deja claro.
    async findByEmailWithPassword(email){
        if(!email) return null
        return User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    }

    async create(userData){
        const user = await User.create(userData)
        return this.findById(user._id)
    }

    async update(id, userData){
        if(!isValidId(id)) return null
        return User.findByIdAndUpdate(id, userData, { new: true, runValidators: true }).select('-password')
    }

    async delete(id){
        if(!isValidId(id)) return null
        return User.findByIdAndDelete(id).select('-password')
    }
}