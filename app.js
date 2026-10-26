import express from 'express'
import cors from 'cors'
import routes from './src/routes/index.routes.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import { notFound } from './src/middlewares/notFound.js'
import swaggerUi from 'swagger-ui-express'
//import { swaggerSpecs } from './src/docs/swagger.config.js'
import swaggerSpec from './src/config/swagger.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app