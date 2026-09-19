import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = ['PORT', 'NODE_ENV', 'MONGODB_URI', 'JWT_SECRET']

requiredEnvVars.forEach((envVar) => {
    if(!process.env[envVar]){
        throw new Error(
            `Falta configurar la variable de entorno: ${envVar}`
        )
    }
})

export const config = {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development'
}

export default config