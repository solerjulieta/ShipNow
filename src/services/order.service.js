import OrderRepository from '../repositories/orders.repository.js'
import UserRepository from '../repositories/user.repository.js'
import DeliveryRepository from '../repositories/delivery.repository.js'
import AppError from '../utils/AppError.js'
import { USER_ROLES, DELIVERY_STATUS, HTTP_STATUS } from '../constants/index.js'

class OrderService {
    constructor(){
        this.orderRepository = new OrderRepository()
        this.userRepository = new UserRepository()
        this.deliveryRepository = new DeliveryRepository()
    }

    async findAll(query = {}){
        // Traducimos lo que viene por querystring a un filtro de base de datos
        const filter = {}
        if(query.customer) filter.customer = query.customer

        return this.orderRepository.findAll(filter)
    }

    async getOrderById(id){
        const order = await this.orderRepository.findById(id)

        if(!order){
            throw new AppError('La orden no existe.', HTTP_STATUS.NOT_FOUND)
        }

        return order
    }

    async create(orderData){
        const { customer, deliveryAddress, items } = orderData

        if(!customer || !deliveryAddress || !items || items.length < 1){
            throw new AppError('Falta información requerida.', HTTP_STATUS.BAD_REQUEST)
        }

        const invalidItem = items.some(
            (item) =>
                !item.name ||
                !item.quantity ||
                item.quantity < 1 ||
                item.price === undefined ||
                item.price < 0
        )

        if(invalidItem){
            throw new AppError(
                'Todos los ítems deben tener nombre, cantidad y precio válidos.',
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const existentCustomer = await this.userRepository.findById(customer)

        if(!existentCustomer){
            throw new AppError('El cliente no existe.', HTTP_STATUS.NOT_FOUND)
        }

        if(existentCustomer.role !== USER_ROLES.CUSTOMER){
            throw new AppError('El usuario indicado no es un cliente.', HTTP_STATUS.BAD_REQUEST)
        }

        // El total lo calcula el negocio. Nunca se confía en el valor que manda el cliente.
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

        const order = await this.orderRepository.create({ customer, deliveryAddress, items, total })

        // Toda orden nace con su delivery en pending, si no queda huérfana
        await this.deliveryRepository.create({ order: order._id })

        return this.orderRepository.findById(order._id)
    }

    async update(id, orderData){
        await this.getOrderById(id)

        const delivery = await this.deliveryRepository.findByOrder(id)

        // Una vez que salió a la calle, la orden ya no se toca
        if(delivery && delivery.status !== DELIVERY_STATUS.PENDING){
            throw new AppError(
                'No se puede modificar una orden que ya fue asignada a un repartidor.',
                HTTP_STATUS.CONFLICT
            )
        }

        // El cliente y el total no se pueden cambiar por body
        const { customer, total, ...allowedData } = orderData

        // Si cambian los ítems, hay que recalcular el total
        if(allowedData.items){
            if(allowedData.items.length < 1){
                throw new AppError('La orden debe tener al menos un ítem.', HTTP_STATUS.BAD_REQUEST)
            }
            allowedData.total = allowedData.items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            )
        }

        return this.orderRepository.update(id, allowedData)
    }

    async delete(id){
        await this.getOrderById(id)

        const delivery = await this.deliveryRepository.findByOrder(id)

        if(delivery && delivery.status !== DELIVERY_STATUS.PENDING){
            throw new AppError(
                'No se puede eliminar una orden que ya está en proceso de entrega.',
                HTTP_STATUS.CONFLICT
            )
        }

        // Borramos primero la entrega para no dejar un delivery apuntando a la nada
        if(delivery){
            await this.deliveryRepository.delete(delivery._id)
        }

        return this.orderRepository.delete(id)
    }
}

export default OrderService
