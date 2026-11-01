import { expect } from 'chai'
import request from 'supertest'
import app from '../app.js'

describe('Infraestructura', function(){
    it('GET /api/logger-test ejecuta el logger y devuelve el resumen esperado', async function () {
        const res = await request(app).get('/api/logger-test').expect(200)
        expect(res.body).to.include({ status: 'success', message: 'Se generaron registros de prueba en todos los niveles.', logsDirectory: 'logs/' })
        expect(res.body.levels).to.deep.equal(['debug', 'http', 'info', 'warning', 'error', 'fatal'])
    })

    it('POST /api/logger-test devuelve 404 porque el endpoint sólo admite GET', async function () {
        const res = await request(app).post('/api/logger-test').expect(404)
        expect(res.body).to.include({ status: 'error', code: 'ROUTE_NOT_FOUND', message: 'La ruta solicitada no existe.' })
        expect(res.body.details).to.include({ method: 'POST', path: '/api/logger-test' })
    })

    it('GET /api/docs expone Swagger UI', async function () {
        const res = await request(app).get('/api/docs/').expect(200)
        expect(res.text).to.include('swagger-ui')
    })

    it('una ruta inexistente devuelve 404 con formato de error', async function () {
        const res = await request(app).get('/api/no-existe').expect(404)
        expect(res.body).to.include({ status: 'error', code: 'ROUTE_NOT_FOUND', message: 'La ruta solicitada no existe.' })
        expect(res.body.details).to.include({ method: 'GET', path: '/api/no-existe' })
    })
})