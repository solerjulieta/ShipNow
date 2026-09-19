import { isValidId } from '../utils/isValidId.js'
import Order from '../models/orders.models.js'

export default class OrderRepository {
    // El populate del cliente nunca trae el password: la proyección está fija acá.
    async findAll(filter = {}){
        return Order.find(filter)
            .populate('customer', 'firstName lastName email')
            .populate('delivery')
            .sort({ createdAt: -1 })
    }

    async findById(id){
        if(!isValidId(id)) return null
        return Order.findById(id)
            .populate('customer', 'firstName lastName email')
            .populate('delivery')
    }

    async findByCustomer(customerId){
        if(!isValidId(customerId)) return []
        return this.findAll({ customer: customerId })
    }

    async create(orderData){
        return Order.create(orderData)
    }

    async update(id, orderData){
        if(!isValidId(id)) return null
        return Order.findByIdAndUpdate(id, orderData, { new: true, runValidators: true })
            .populate('customer', 'firstName lastName email')
            .populate('delivery')
    }

    async delete(id){
        if(!isValidId(id)) return null
        return Order.findByIdAndDelete(id)
    }
}