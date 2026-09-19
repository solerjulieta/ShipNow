import { isValidId } from '../utils/isValidId.js'
import Delivery from '../models/delivery.model.js'

export default class DeliveryRepository {
    async findAll(filter = {}){
        return Delivery.find(filter)
            .populate('order')
            .populate('driver', 'firstName lastName email')
            .sort({ createdAt: -1 })
    }

    async findById(id){
        if(!isValidId(id)) return null
        return Delivery.findById(id)
            .populate('order')
            .populate('driver', 'firstName lastName email')
    }

    async findByOrder(orderId){
        if(!isValidId(orderId)) return null
        return Delivery.findOne({ order: orderId }).populate('driver', 'firstName lastName email')
    }

    async findByDriver(driverId){
        if(!isValidId(driverId)) return []
        return this.findAll({ driver: driverId })
    }

    async create(deliveryData){
        const delivery = await Delivery.create(deliveryData)
        return this.findById(delivery._id)
    }

    async update(id, deliveryData){
        if(!isValidId(id)) return null
        return Delivery.findByIdAndUpdate(id, deliveryData, { new: true, runValidators: true })
            .populate('order')
            .populate('driver', 'firstName lastName email')
    }

    async delete(id){
        if(!isValidId(id)) return null
        return Delivery.findByIdAndDelete(id)
    }
}