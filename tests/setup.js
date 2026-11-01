import dotenv from 'dotenv'
import mongoose, { mongo } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { after } from 'mocha'

dotenv.config({ path: '.env.test' })
process.env.NODE_ENV = 'test'
process.env.PORT ??= '0'
process.env.JWT_SECRET ??= 'shipnow-test-secret'

const mongoServer = await MongoMemoryServer.create()
process.env.MONGODB_URI = mongoServer.getUri('shipnow_test')

const { connectDB } = await import('../src/config/db.js')
await connectDB()

after(async function(){
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    await mongoServer.stop()
})