import mongoose from 'mongoose'
import UserService from './user.service.js'
import OrderService from './order.service.js'
import DeliveryService from './delivery.service.js'
import UserRepository from '../repositories/user.repository.js'
import DeliveryRepository from '../repositories/delivery.repository.js'
import AppError from '../utils/AppError.js'
import { buildFakeDeliveryPreview, buildFakeOrder, buildFakeDeliveryPreview, buildFakeUser } from '../utils/mockGenerator.js'
import {
    USER_ROLES,
    DELIVERY_STATUS,
    MOCK_COLLECTIONS,
    MOCK_COLLECTION_LABELS,
    HTTP_STATUS
} from '../constants/index.js'

const MAX_QTY = 50

class MockService {
    constructor(){
        this.userService = new UserService()
        this.orderService = new OrderService()
        this.deliveryService = new DeliveryService()

        this.userRepository = new UserRepository()
        this.deliveryRepository = new DeliveryRepository()
    }

    #parseQty(qty){
        const total = Number(qty)

        if(!Number.isInteger(total) || total < 1){
            throw new AppError('El parámetro "qty" debe ser un entero mayor a 0.', HTTP_STATUS.BAD_REQUEST)
        }
        if(total > MAX_QTY){
            throw new AppError(`El parámetro "qty" no puede ser mayor a ${MAX_QTY}.`, HTTP_STATUS.BAD_REQUEST)
        }

        return total
    }

    #resolveRole(role){
        if(role === undefined) return undefined

        if(!Object.values(USER_ROLES).includes(role)){
            throw new AppError(
                `El rol debe ser uno de: ${Object.values(USER_ROLES).join(', ')}.`,
                HTTP_STATUS.BAD_REQUEST                
            )
        }

        return role
    }

    previewUsers(qty, role){
        const total = this.#parseQty(qty)
        const validRole = this.#resolveRole(role)

        return Array.from({ length: total }, () => buildFakeUser(validRole))
    }

    previewOrders(qty){
        const total = this.#parseQty(qty)

        return Array.from({ length: total }, () => buildFakeOrder(new mongoose.Types.ObjectId().toString()))
    }

    previewDeliveries(qty){
        const total = this.#parseQty(qty)
        
        return Array.from({ length: total }, () => {
            const hasDriver = Math.random() > 0.5
            return buildFakeDeliveryPreview(
                new mongoose.Types.ObjectId().toString(),
                hasDriver ? new mongoose.Types.ObjectId().toString() : null
            )
        })
    }

    // Inserción real en MongoDB

    async #seedUsers(qty, role){
        const total = this.#parseQty(qty)
        const created = []

        for(let i = 0; i < total; i++){
            created.push(await this.userService.create(buildFakeUser(role)))
        }

        return created
    }

    async #ensureCustomers(minimum){
        const existing = await this.userRepository.findAll({ role: USER_ROLES.CUSTOMER })
        const missing = minimum - existing.length
        if(missing <= 0) return existing

        const created = await this.#seedUsers(missing, USER_ROLES.CUSTOMER)
        return [...existing, ...created]
    }

    async #ensureDrivers(minimum){
        const existing = await this.userRepository.findAll({ role: USER_ROLES.DRIVER })
        const missing = minimum - existing.length
        if(missing <= 0) return existing

        const created = await this.#seedUsers(missing, USER_ROLES.DRIVER)
        return [...existing, ...created]        
    }

    async #seedOrders(qty){
        const total = this.#parseQty(qty)

        const customers = await this.#ensureCustomers(Math.min(total, 5))

        const created = []
        for(let i = 0; i < total; i++){
            const customer = customers[i % customers.length]
            created.push(await this.orderService.create(buildFakeOrder(customer._id)))
        }

        return created
    }

    async #seedDeliveries(qty){
        const total = this.#parseQty(qty)

        let pending = await this.deliveryRepository.findAll({ status: DELIVERY_STATUS.PENDING })

        if(pending.length < total){
            await this.#seedOrders(total - pending.length)
            pending = await this.deliveryRepository.findAll({ status: DELIVERY_STATUS.PENDING })
        }

        const drivers = await this.#ensureDrivers(Math.max(1, Math.ceil(total / 2)))

        const affected = []
        for(let i = 0; i < total && i < pending.length; i++){
            if(i % 2 === 0){
                const driver = drivers[i % drivers.length]
                affected.push(await this.deliveryService.assignDriver(pending[i]._id, driver._id))
            } else {
                affected.push(pending[i])
            }
        }
        
        return affected
    }

    async seed(collection, qty){
        const target = collection ?? MOCK_COLLECTIONS.USERS 

        if(!Object.values(MOCK_COLLECTIONS).includes(target)){
            throw new AppError(
                `La colección debe ser una de: ${Object.values(MOCK_COLLECTIONS).join(', ')}.`,
                HTTP_STATUS.BAD_REQUEST
            )            
        }

        let created 

        switch(target){
            case MOCK_COLLECTIONS.USERS:
                created = await this.#seedUsers(qty, USER_ROLES.CUSTOMER)
                break
            case MOCK_COLLECTIONS.DRIVERS:
                created = await this.#seedUsers(qty, USER_ROLES.DRIVER)
                break
            case MOCK_COLLECTIONS.ORDERS:
                created = await this.#seedOrders(qty)
                break
            case MOCK_COLLECTIONS.DELIVERIES:
                created = await this.#seedDeliveries(qty)
                break
        }

        return {
            insertados: created.length,
            coleccion: MOCK_COLLECTION_LABELS[target]
        }
    }
}

export default MockService