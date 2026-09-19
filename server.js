import app from './app.js'
import { connectDB } from './src/config/db.js'
import { config } from './src/config/index.js'

connectDB()

app.listen(config.port, () => {
    console.log(`Servidor iniciado http://localhost:${config.port}`)
})