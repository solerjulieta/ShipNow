import User from '../src/models/user.model.js'
import Order from '../src/models/orders.models.js'
import Delivery from '../src/models/delivery.model.js'
import Product from '../src/models/product.model.js'

export async function cleanDatabase(){
    await Promise.all([User.deleteMany({}), Order.deleteMany({}), Delivery.deleteMany({}), Product.deleteMany({})])
}

export async function createCustomer(overrides = {}){
    return User.create({ firstName: 'Ana', lastName: 'Test', email: `ana-${Date.now()}-${Math.random()}@test.com`, password: 'hashed-password', role: 'customer', ...overrides })
}

export async function createDriver(){
    return User.create({ firstName: 'Karen', lastName: 'Driver', email: `driver-${Date.now()}-${Math.random()}@test.com`, password: 'hashed-password', role: 'driver' })
}

export async function createOrder(customerId){
    const order = await Order.create({ customer: customerId, deliveryAddress: 'Av. Colón 123, Córdoba', items: [{ name: 'Caja', quantity: 2, price: 1500 }], total: 3000 })
    const delivery = await Delivery.create({ order: order._id })
    return { order, delivery }
}