import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { cleanDatabase, createCustomer, createOrder } from './helpers.js'

describe('Orders', function(){
    beforeEach(cleanDatabase)

    it('GET /api/orders devuelve listado', async function(){
        const customer = await createCustomer()
        await createOrder(customer._id)
        const res = await request(app).get('/api/orders').expect(200)
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.an('array').with.length(1)
        expect(res.body.data[0]).to.include.keys('_id', 'customer', 'deliveryAddress', 'items', 'total')
    })

    it('POST /api/orders crea pedido y entrega asociada con datos válidos', async function () {
        const customer = await createCustomer()
        const res = await request(app).post('/api/orders').send({ customer: customer._id, deliveryAddress: 'San Martín 100, Córdoba', items: [{ name: 'Monitor', quantity: 2, price: 10000 }] }).expect(200)
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.include.keys('_id', 'customer', 'deliveryAddress', 'items', 'total', 'delivery')
        expect(res.body.data.total).to.equal(20000)
    })

    it('POST /api/orders rechaza datos incompletos con VALIDATION_ERROR', async function () {
        const res = await request(app).post('/api/orders').send({ deliveryAddress: 'Sin cliente' }).expect(400)
        expect(res.body).to.include({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Falta información requerida.'
        })
        expect(res.body.details).to.be.an('object')
    })

    it('GET /api/orders/:oid consulta el pedido por ID', async function () {
        const customer = await createCustomer()
        const { order } = await createOrder(customer._id)
        const res = await request(app).get(`/api/orders/${order._id}`).expect(200)
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.equal(order._id.toString())
        expect(res.body.data.total).to.equal(3000)
    })

    it('GET /api/orders/:oid devuelve 404 si el pedido no existe', async function () {
        const res = await request(app).get('/api/orders/507f1f77bcf86cd799439011').expect(404)
        expect(res.body).to.include({
            status: 'error',
            code: 'ORDER_NOT_FOUND',
            message: 'La orden con id "507f1f77bcf86cd799439011" no existe.'
        })
        expect(res.body).to.have.property('details')
    })    
})