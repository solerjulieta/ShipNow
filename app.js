import express from 'express'
import cors from 'cors'
import routes from './src/routes/index.routes.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import { notFound } from './src/middlewares/notFound.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app