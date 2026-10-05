import DeliveryRepository from '../repositories/delivery.repository.js'
import UserRepository from '../repositories/user.repository.js'
import {
    ValidationError,
    DeliveryNotFoundError,
    UserNotFoundError,
    DeliveryNotPendingError,
    InvalidDeliveryStatusError,
    InvalidStatusTransitionError,
    InvalidDeliveryPriorityError
} from '../errors/index.js'
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
            throw new DeliveryNotFoundError(id)
        }

        return delivery
    }

    // Asignar un repartidor: valida que exista, que sea driver y que el estado lo permita
    async assignDriver(deliveryId, driverId){
        const delivery = await this.getDeliveryById(deliveryId)

        if(delivery.status !== DELIVERY_STATUS.PENDING){
            throw new DeliveryNotPendingError()
        }

        const driver = await this.userRepository.findById(driverId)

        if(!driver){
            throw new UserNotFoundError(driverId)
        }

        if(driver.role !== USER_ROLES.DRIVER){
            throw new ValidationError('El usuario indicado no es un repartidor.', {
                field: 'driver',
                role: driver.role
            })
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
            throw new InvalidDeliveryStatusError(newStatus, Object.values(DELIVERY_STATUS))
        }

        const allowed = ALLOWED_STATUS_TRANSITIONS[delivery.status]

        if(!allowed.includes(newStatus)){
            throw new InvalidStatusTransitionError(delivery.status, newStatus)
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
            throw new InvalidDeliveryPriorityError(priority, Object.values(DELIVERY_PRIORITY))
        }

        return this.deliveryRepository.update(deliveryId, { priority })
    }

    async getByDriver(driverId){
        const driver = await this.userRepository.findById(driverId)

        if(!driver){
            throw new UserNotFoundError(driverId)
        }

        return this.deliveryRepository.findByDriver(driverId)
    }
}

export default DeliveryService