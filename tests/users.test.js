import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'
import { cleanDatabase, createCustomer } from './helpers.js'

describe('Users', function(){
    beforeEach(cleanDatabase)

    it('GET /api/user devuelve un listado con estructura success/data', async function(){
        await createCustomer()
        const res = await request(app).get('/api/user').expect(200)
        expect(res.body).to.have.property('status', 'success')
        expect(res.body.data).to.be.an('array').with.length(1)
        expect(res.body.data[0]).to.include.keys('firstName', 'lastName', 'email', 'role', '_id')
        expect(res.body.data[0]).not.to.have.property('password')
    })

    it('GET /api/user/:uid responde 404 con código y mensaje si no existe', async function () {
        const res = await request(app).get('/api/user/507f1f77bcf86cd799439011').expect(404)
        expect(res.body).to.include({
            status: 'error',
            code: 'USER_NOT_FOUND',
            message: 'El usuario con id "507f1f77bcf86cd799439011" no existe.'
        })
        expect(res.body).to.have.property('details')
    })    
})
