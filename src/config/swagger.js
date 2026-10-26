import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ShipNow API',
            version: '1.0.0',
            description: 'Documentación de la API ShipNow para gestión de usuarios, pedidos, entregas, mocks, errores y logging.'
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Users', description: 'Gestión de usuarios y validación de credenciales' },
            { name: 'Orders', description: 'Gestión de pedidos' },
            { name: 'Deliveries', description: 'Gestión de entregas' },
            { name: 'Mocks', description: 'Previsualización e inserción de datos de prueba' },
            { name: 'Logger', description: 'Herramienta técnica para validar el registro de logs' }
        ],
                components: {
            schemas: {
                User: {
                    type: 'object',
                    description: 'Usuario devuelto por la API. La contraseña se almacena hasheada; no enviar ni asumir que se devuelve en las respuestas.',
                    properties: {
                        _id: { type: 'string', example: '68f1a2b3c4d5e6f7a8b9c0d1' },
                        firstName: { type: 'string', example: 'Ana' },
                        lastName: { type: 'string', example: 'Pérez' },
                        email: { type: 'string', format: 'email', example: 'ana.perez@test.com' },
                        role: { type: 'string', enum: ['customer', 'driver', 'admin', 'store'], example: 'customer' }
                    }
                },
                OrderItem: {
                    type: 'object',
                    required: ['name', 'quantity', 'price'],
                    properties: {
                        name: { type: 'string', example: 'Caja mediana' },
                        quantity: { type: 'integer', minimum: 1, example: 2 },
                        price: { type: 'number', minimum: 0, example: 1500 }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '68f1a2b3c4d5e6f7a8b9c0d1' },
                        customer: { type: 'string', description: 'ID del usuario con rol customer' },
                        deliveryAddress: { type: 'string', example: 'Av. Colón 1234, Córdoba' },
                        items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
                        total: { type: 'number', description: 'Calculado por el servidor a partir de items' }
                    }
                },
                Delivery: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        order: { type: 'string', description: 'ID del pedido asociado' },
                        driver: { type: 'string', nullable: true, description: 'ID del repartidor, cuando está asignado' },
                        status: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'] },
                        priority: { type: 'string', enum: ['low', 'normal', 'high'] },
                        deliveredAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    required: ['status', 'code', 'message', 'details'],
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: 'Falta información requerida.' },
                        details: { nullable: true, description: 'Detalles específicos del error; puede ser null, texto, objeto o lista según el error.' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { type: 'string', enum: ['success'] },
                        data: { description: 'Recurso o lista devuelta por la operación' },
                        message: { type: 'string' }
                    }
                },
                UserInput: {
                    type: 'object', required: ['firstName', 'lastName', 'email', 'password'],
                    properties: {
                        firstName: { type: 'string', example: 'Ana' },
                        lastName: { type: 'string', example: 'Pérez' },
                        email: { type: 'string', format: 'email', example: 'ana.perez@test.com' },
                        password: { type: 'string', minLength: 8, example: 'Coder123!' },
                        role: { type: 'string', enum: ['customer', 'driver', 'admin', 'store'], default: 'customer' }
                    }
                },
                OrderInput: {
                    type: 'object', required: ['customer', 'deliveryAddress', 'items'],
                    properties: {
                        customer: { type: 'string', description: 'ID de un usuario con rol customer' },
                        deliveryAddress: { type: 'string', example: 'Av. Colón 1234, Córdoba' },
                        items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/OrderItem' } }
                    }
                }
            }
        }
    },
    apis: []
}

const spec = swaggerJsdoc(options)
const pathParam = (name, description = 'Identificador del recurso') => ({
    name, in: 'path', required: true, description, schema: { type: 'string' }
})
const jsonBody = (schema) => ({
    required: true,
    content: { 'application/json': { schema } }
})
const success = (description = 'Operación exitosa') => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
})
const error = (description = 'La solicitud no pudo procesarse') => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
})

spec.paths = {
    '/user': {
        get: {
            tags: ['Users'], summary: 'Listar usuarios', description: 'Lista usuarios; admite filtro opcional por rol.',
            parameters: [{ name: 'role', in: 'query', required: false, schema: { type: 'string', enum: ['customer', 'driver', 'admin', 'store'] } }],
            responses: { 200: success('Lista de usuarios'), 500: error('Error interno') }
        },
        post: {
            tags: ['Users'], summary: 'Crear usuario', requestBody: jsonBody({ $ref: '#/components/schemas/UserInput' }),
            responses: { 200: success('Usuario creado'), 400: error('Datos inválidos'), 409: error('Email duplicado'), 500: error('Error interno') }
        }
    },
    '/user/login': {
        post: {
            tags: ['Users'], summary: 'Validar credenciales', description: 'Valida email y contraseña. Este endpoint no emite tokens.',
            requestBody: jsonBody({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } }),
            responses: { 200: success('Credenciales válidas'), 400: error('Faltan email o contraseña'), 500: error('Error interno; la implementación actual no asigna un status específico al código INVALID_CREDENTIALS') }
        }
    },
    '/user/{uid}': {
        parameters: [pathParam('uid', 'ID del usuario')],
        get: { tags: ['Users'], summary: 'Obtener usuario', responses: { 200: success('Usuario encontrado'), 404: error('Usuario no encontrado'), 500: error('Error interno') } },
        put: { tags: ['Users'], summary: 'Actualizar usuario', description: 'Actualiza los campos permitidos; email y password se procesan de forma específica por el servicio.',
            requestBody: jsonBody({ type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 }, role: { type: 'string', enum: ['customer', 'driver', 'admin', 'store'] } } }),
            responses: { 200: success('Usuario actualizado'), 400: error('Datos inválidos'), 409: error('Email duplicado'), 404: error('Usuario no encontrado'), 500: error('Error interno') } },
        delete: { tags: ['Users'], summary: 'Eliminar usuario', responses: { 200: success('Usuario eliminado'), 404: error('Usuario no encontrado'), 500: error('Error interno') } }
    },
    '/orders': {
        get: { tags: ['Orders'], summary: 'Listar pedidos', parameters: [{ name: 'customer', in: 'query', required: false, description: 'Filtrar por ID de cliente', schema: { type: 'string' } }], responses: { 200: success('Lista de pedidos'), 500: error('Error interno') } },
        post: { tags: ['Orders'], summary: 'Crear pedido y entrega asociada', description: 'El total se calcula en el servidor; no debe enviarse en el body.',
            requestBody: jsonBody({ $ref: '#/components/schemas/OrderInput' }),
            responses: { 200: success('Pedido creado'), 400: error('Datos inválidos'), 404: error('Cliente no encontrado'), 500: error('Error interno') } }
    },
    '/orders/{oid}': {
        parameters: [pathParam('oid', 'ID del pedido')],
        get: { tags: ['Orders'], summary: 'Obtener pedido', responses: { 200: success('Pedido encontrado'), 404: error('Pedido no encontrado'), 500: error('Error interno') } },
        put: { tags: ['Orders'], summary: 'Actualizar pedido', description: 'Solo se puede modificar mientras la entrega asociada esté en estado pending.',
            requestBody: jsonBody({ type: 'object', properties: { deliveryAddress: { type: 'string' }, items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/OrderItem' } } } }),
            responses: { 200: success('Pedido actualizado'), 400: error('Datos inválidos'), 404: error('Pedido no encontrado'), 409: error('Pedido bloqueado por el estado de la entrega'), 500: error('Error interno') } },
        delete: { tags: ['Orders'], summary: 'Eliminar pedido', description: 'Solo se puede eliminar mientras la entrega asociada esté pending.',
            responses: { 200: success('Pedido eliminado'), 404: error('Pedido no encontrado'), 409: error('Pedido bloqueado por el estado de la entrega'), 500: error('Error interno') } }
    },
    '/deliveries': {
        get: { tags: ['Deliveries'], summary: 'Listar entregas', description: 'Admite filtros status, driver y priority.',
            parameters: [
                { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'] } },
                { name: 'driver', in: 'query', schema: { type: 'string' } },
                { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'normal', 'high'] } }
            ], responses: { 200: success('Lista de entregas'), 500: error('Error interno') } }
    },
    '/deliveries/driver/{driverId}': {
        parameters: [pathParam('driverId', 'ID del repartidor')],
        get: { tags: ['Deliveries'], summary: 'Listar entregas por repartidor', responses: { 200: success('Entregas del repartidor'), 404: error('Repartidor no encontrado'), 500: error('Error interno') } }
    },
    '/deliveries/{did}': {
        parameters: [pathParam('did', 'ID de la entrega')],
        get: { tags: ['Deliveries'], summary: 'Obtener entrega', responses: { 200: success('Entrega encontrada'), 404: error('Entrega no encontrada'), 500: error('Error interno') } }
    },
    '/deliveries/{did}/assign': {
        parameters: [pathParam('did', 'ID de la entrega')],
        patch: { tags: ['Deliveries'], summary: 'Asignar repartidor', requestBody: jsonBody({ type: 'object', required: ['driver'], properties: { driver: { type: 'string', description: 'ID de un usuario con rol driver' } } }),
            responses: { 200: success('Repartidor asignado'), 400: error('Datos o rol inválidos'), 404: error('Entrega o repartidor no encontrado'), 409: error('Estado incompatible con la asignación'), 500: error('Error interno') } }
    },
    '/deliveries/{did}/status': {
        parameters: [pathParam('did', 'ID de la entrega')],
        patch: { tags: ['Deliveries'], summary: 'Actualizar estado de entrega', requestBody: jsonBody({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'] } } }),
            responses: { 200: success('Estado actualizado'), 400: error('Estado inválido'), 404: error('Entrega no encontrada'), 409: error('Transición de estado no permitida'), 500: error('Error interno') } }
    },
    '/deliveries/{did}/priority': {
        parameters: [pathParam('did', 'ID de la entrega')],
        patch: { tags: ['Deliveries'], summary: 'Actualizar prioridad de entrega', requestBody: jsonBody({ type: 'object', required: ['priority'], properties: { priority: { type: 'string', enum: ['low', 'normal', 'high'] } } }),
            responses: { 200: success('Prioridad actualizada'), 400: error('Prioridad inválida'), 404: error('Entrega no encontrada'), 500: error('Error interno') } }
    },
    '/mocks/users': {
        get: { tags: ['Mocks'], summary: 'Previsualizar usuarios mock', description: 'Devuelve datos simulados sin insertarlos. qty es opcional (por defecto 5; rango válido 1–50) y role es opcional.',
            parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 5 } }, { name: 'role', in: 'query', schema: { type: 'string', enum: ['customer', 'driver', 'admin', 'store'] } }],
            responses: { 200: { description: 'Array de usuarios simulados' }, 400: error('Cantidad inválida'), 500: error('Error interno; un rol inválido no tiene status específico configurado') } }
    },
    '/mocks/drivers': {
        get: { tags: ['Mocks'], summary: 'Previsualizar repartidores mock', parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 5 } }], responses: { 200: { description: 'Array de repartidores simulados' }, 400: error('Cantidad inválida'), 500: error('Error interno') } }
    },
    '/mocks/orders': {
        get: { tags: ['Mocks'], summary: 'Previsualizar pedidos mock', parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 5 } }], responses: { 200: { description: 'Array de pedidos simulados' }, 400: error('Cantidad inválida'), 500: error('Error interno') } }
    },
    '/mocks/deliveries': {
        get: { tags: ['Mocks'], summary: 'Previsualizar entregas mock', parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 5 } }], responses: { 200: { description: 'Array de entregas simuladas' }, 400: error('Cantidad inválida'), 500: error('Error interno') } }
    },
    '/mocks/seed': {
        post: { tags: ['Mocks'], summary: 'Insertar datos de prueba', description: 'Inserta datos en MongoDB. qty puede enviarse por query o body; collection también puede enviarse por query o body. Si se omiten, qty es 10 y collection es users.',
            parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } }, { name: 'collection', in: 'query', schema: { type: 'string', enum: ['users', 'drivers', 'orders', 'deliveries'] } }],
            requestBody: {
                required: false,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                qty: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
                                collection: { type: 'string', enum: ['users', 'drivers', 'orders', 'deliveries'] }
                            }
                        }
                    }
                }
            },
            responses: { 201: { description: 'Datos insertados', content: { 'application/json': { schema: { type: 'object', properties: { insertados: { type: 'integer' }, coleccion: { type: 'string' } } } } } }, 400: error('Cantidad o colección inválidas'), 500: error('Error interno') } }
    },
    '/loggerTest': {
        get: {
            tags: ['Logger'],
            summary: 'Validar niveles del logger',
            description: 'Herramienta técnica de validación: genera registros de prueba en varios niveles. No es una funcionalidad de negocio.',
            responses: {
                200: {
                    description: 'Se generaron registros de prueba',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'success' },
                                    message: { type: 'string' },
                                    levels: { type: 'array', items: { type: 'string' } },
                                    logsDirectory: { type: 'string', example: 'logs/' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
export default spec