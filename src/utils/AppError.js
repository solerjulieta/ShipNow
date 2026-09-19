// Error con status code. El middleware de errores lo traduce a la respuesta HTTP.
export default class AppError extends Error {
    constructor(message, statusCode = 500){
        super(message)
        this.statusCode = statusCode
    }
}