import { fakerES_MX as faker } from '@faker-js/faker'
import { USER_ROLES, DELIVERY_STATUS, DELIVERY_PRIORITY } from '../constants/index.js'

const ITEM_NAMES = [
    'Auriculares Bluetooth SoundBeat', 'Mouse inalámbrico ProClick', 'Teclado mecánico RGB',
    'Webcam Full HD', 'Parlante portátil Boom Mini', 'Smartwatch Fit X'
]

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Usuario simulado, el rol se puede forzar o usar uno al azar
export const buildFakeUser = (role) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'test.com' }).toLocaleLowerCase(),
        password: 'Coder123!',
        role: role ?? randomFrom(Object.values(USER_ROLES))
    }
}

export const buildFakeItems = () => {
    const itemsCount = randomInt(1, 3)
    return Array.from({ length: itemsCount }, () => ({
        name: randomFrom(ITEM_NAMES),
        quantity: randomInt(1, 5),
        price: Number(faker.commerce.price({ min: 100, max: 3000 }))
    }))
}

export const buildFakeOrder = (customerId) => ({
    customer: customerId,
    deliveryAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    items: buildFakeItems()
})

export const buildFakeDeliveryPreview = (orderId, driverId) => ({
    order: orderId,
    driver: driverId ?? null,
    status: driverId ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
    priority: randomFrom(Object.values(DELIVERY_PRIORITY))
})