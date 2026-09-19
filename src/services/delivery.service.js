import DeliveryRepository from '../repositories/delivery.repository.js'
import UserRepository from '../repositories/user.repository.js'
import AppError from '../utils/AppError.js'
import {
    USER_ROLES,
    DELIVERY_STATUS,
    DELIVERY_PRIORITY,
    ALLOWED_STATUS_TRANSITIONS,
    HTTP_STATUS
} from '../constants/index.js'

class DeliveryService {
    constructor(){
        this.deliveryRepository = new DeliveryRepository()
        this.userRepository = new UserRepository()
    }

    async findAll(query = {}){
        const filter = {}
        if(query.status) filter.status = query.status
        if(query.driver) filter.driver = query.driver
        if(query.priority) filter.priority = query.priority

        return this.deliveryRepository.findAll(filter)
    }

    async getDeliveryById(id){
        const delivery = await this.deliveryRepository.findById(id)

        if(!delivery){
            throw new AppError('La entrega no existe.', HTTP_STATUS.NOT_FOUND)
        }

        return delivery
    }

    // Asignar un repartidor: valida que exista, que sea driver y que el estado lo permita
    async assignDriver(deliveryId, driverId){
        const delivery = await this.getDeliveryById(deliveryId)

        if(delivery.status !== DELIVERY_STATUS.PENDING){
            throw new AppError(
                'Solo se puede asignar un repartidor a una entrega pendiente.',
                HTTP_STATUS.CONFLICT
            )
        }

        const driver = await this.userRepository.findById(driverId)

        if(!driver){
            throw new AppError('El repartidor no existe.', HTTP_STATUS.NOT_FOUND)
        }

        if(driver.role !== USER_ROLES.DRIVER){
            throw new AppError(
                'El usuario indicado no es un repartidor.',
                HTTP_STATUS.BAD_REQUEST
            )
        }

        return this.deliveryRepository.update(deliveryId, {
            driver: driverId,
            status: DELIVERY_STATUS.ASSIGNED,
            assignedAt: new Date()
        })
    }

    // El estado avanza solo según el diccionario de transiciones permitidas
    async updateStatus(deliveryId, newStatus){
        const delivery = await this.getDeliveryById(deliveryId)

        if(!Object.values(DELIVERY_STATUS).includes(newStatus)){
            throw new AppError(
                `El estado debe ser uno de: ${Object.values(DELIVERY_STATUS).join(', ')}.`,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const allowed = ALLOWED_STATUS_TRANSITIONS[delivery.status]

        if(!allowed.includes(newStatus)){
            throw new AppError(
                `No se puede pasar de "${delivery.status}" a "${newStatus}".`,
                HTTP_STATUS.CONFLICT
            )
        }

        const updateData = { status: newStatus }

        // La fecha de entrega la pone el sistema, no el body
        if(newStatus === DELIVERY_STATUS.DELIVERED){
            updateData.deliveredAt = new Date()
        }

        return this.deliveryRepository.update(deliveryId, updateData)
    }

    async updatePriority(deliveryId, priority){
        await this.getDeliveryById(deliveryId)

        if(!Object.values(DELIVERY_PRIORITY).includes(priority)){
            throw new AppError(
                `La prioridad debe ser una de: ${Object.values(DELIVERY_PRIORITY).join(', ')}.`,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        return this.deliveryRepository.update(deliveryId, { priority })
    }

    async getByDriver(driverId){
        const driver = await this.userRepository.findById(driverId)

        if(!driver){
            throw new AppError('El repartidor no existe.', HTTP_STATUS.NOT_FOUND)
        }

        return this.deliveryRepository.findByDriver(driverId)
    }
}

export default DeliveryService