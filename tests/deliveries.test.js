import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { cleanDatabase, createCustomer, createOrder } from './helpers.js'

describe('Deliveries - actualización de estado', function(){
    beforeEach(cleanDatabase)

    it('PATCH /api/deliveries/:did/status actualiza una transición válida', async function(){
        const customer = await createCustomer()
        const { delivery } = await createOrder(customer._id)
        const driver = await (await import('../src/models/user.model.js')).default.create({ firstName: 'Dario', lastName: 'Driver', email: 'driver@test.com', password: 'hashed-password', role: 'driver' })
        await request(app).patch(`/api/deliveries/${delivery._id}/assign`).send({ driver: driver._id }).expect(200)
        const res = await request(app).patch(`/api/deliveries/${delivery._id}/status`).send({ status: 'in_transit' }).expect(200)
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.include({ status: 'in_transit' })
        expect(res.body.data).to.have.property('_id', delivery._id.toString())
    })

    it('PATCH /api/deliveries/:did/status rechaza un estado inválido', async function () {
        const customer = await createCustomer()
        const { delivery } = await createOrder(customer._id)
        const res = await request(app).patch(`/api/deliveries/${delivery._id}/status`).send({ status: 'volando' }).expect(400)
        expect(res.body).to.include({
            status: 'error',
            code: 'INVALID_DELIVERY_STATUS',
            message: 'El estado "volando" no es válido. Debe ser uno de: pending, assigned, in_transit, delivered.'
        })
        expect(res.body).to.have.property('details')
    })    
})