import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { cleanDatabase } from './helpers.js'

describe('Mocks', function(){
    beforeEach(cleanDatabase)

    for (const endpoint of ['users', 'drivers', 'orders', 'deliveries']) {
        it(`GET /api/mocks/${endpoint} genera datos simulados`, async function () {
        const res = await request(app).get(`/api/mocks/${endpoint}?qty=2`).expect(200)
        expect(res.body).to.be.an('array').with.length(2)
        expect(res.body[0]).to.be.an('object')
        if (endpoint === 'users' || endpoint === 'drivers') expect(res.body[0]).to.include.keys('firstName', 'lastName', 'email', 'role')
        if (endpoint === 'orders') expect(res.body[0]).to.include.keys('customer', 'deliveryAddress', 'items')
        if (endpoint === 'deliveries') expect(res.body[0]).to.include.keys('order', 'status', 'priority')
        })

        it(`GET /api/mocks/${endpoint} rechaza cantidades inválidas`, async function () {
        const res = await request(app).get(`/api/mocks/${endpoint}?qty=0`).expect(400)
        expect(res.body).to.include({ status: 'error', code: 'INVALID_MOCK_QTY', message: 'La cantidad solicitada no es válida.' })
        expect(res.body).to.have.property('details')
        })
    }    
})

// El endpoint seed sí persiste información, pero sólo en la base temporal de testing.
describe('Mocks - seed', function(){
    beforeEach(cleanDatabase)

    it('POST /api/mocks/seed inserta usuarios de prueba', async function () {
        const res = await request(app).post('/api/mocks/seed').send({ qty: 2, collection: 'users' }).expect(201)
        expect(res.body).to.deep.equal({ insertados: 2, coleccion: 'usuarios' })
    })

    it('POST /api/mocks/seed rechaza una cantidad inválida', async function () {
        const res = await request(app).post('/api/mocks/seed').send({ qty: 0, collection: 'users' }).expect(400)
        expect(res.body).to.include({ status: 'error', code: 'INVALID_MOCK_QTY', message: 'La cantidad solicitada no es válida.' })
        expect(res.body).to.have.property('details')
    })
})