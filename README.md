# ShipNow API

API REST de ShipNow refactorizada a una arquitectura en capas (**Controller → Service → Repository**), con configuración de entorno validada al arranque.

Pre-entrega Módulo 1 (arquitectura por capas), Módulo 2 (mocking y carga de datos de prueba) y Módulo 3 (manejo profesional de errores).

## Requisitos

- Node.js 18 o superior
- MongoDB (local o Atlas)

## Cómo correr el proyecto localmente

```bash
# 1. Clonar el repositorio e instalar dependencias
git clone <url-del-repositorio>
cd shipnow
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env

# 3. Completar los valores en el .env (sobre todo MONGODB_URI)

# 4. Levantar el servidor
npm run dev     # modo desarrollo, se recarga al guardar
npm start       # modo normal
```

El servidor queda en `http://localhost:8080` y la API en `http://localhost:8080/api`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor |
| `NODE_ENV` | `development` / `production` |
| `MONGODB_URI` | String de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar tokens (se usará en el próximo módulo) |

Las cuatro son obligatorias. Si falta alguna, **la aplicación no arranca** y muestra un error descriptivo:

```
Error: Falta configurar la variable de entorno: MONGODB_URI. Copiá el archivo .env.example a .env y completá los valores.
```

## Estructura del proyecto

```
├── server.js              # Levanta el servidor y conecta la base
├── app.js                 # Configura Express y monta las rutas
├── .env.example
└── src/
    ├── config/            # dotenv + validación de entorno y conexión a Mongo
    ├── constants/         # Objetos congelados: roles, estados, prioridades
    ├── errors/            # AppError, clases de error de dominio, códigos y diccionario
    ├── models/            # Solo los esquemas de Mongoose
    ├── repositories/      # Único lugar que conoce Mongoose
    ├── services/          # Lógica de negocio
    ├── controllers/       # Manejan req y res
    ├── routes/            # Conectan el path con el método del controller
    ├── middlewares/       # errorHandler (único lugar que arma una respuesta de error) y rutas inexistentes
    └── utils/             # Helpers y el generador de datos falsos
```

El flujo de dependencias va en una sola dirección:

```
Router → Controller → Service → Repository → Model → MongoDB
```

El Controller nunca importa Mongoose.

## Endpoints

### Usuarios — `/api/users`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista usuarios. Filtro opcional: `?role=driver` |
| GET | `/:uid` | Detalle de un usuario |
| POST | `/` | Crea un usuario (la contraseña se guarda hasheada) |
| POST | `/login` | Verifica credenciales |
| PUT | `/:uid` | Actualiza un usuario |
| DELETE | `/:uid` | Elimina un usuario |

### Productos — `/api/products`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista productos. Por defecto solo muestra `available`. Filtros: `?category=`, `?status=` |
| GET | `/:pid` | Detalle de un producto |
| POST | `/` | Crea un producto |
| PUT | `/:pid` | Actualiza un producto |
| DELETE | `/:pid` | Elimina un producto |

El `status` (`available` / `out_of_stock` / `discontinued`) no se manda por body: lo calcula el Service a partir del `stock`. Si el stock llega a 0, el producto pasa solo a `out_of_stock`.

### Órdenes — `/api/orders`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista órdenes. Filtro opcional: `?customer=<id>` |
| GET | `/:oid` | Detalle de una orden |
| POST | `/` | Crea una orden y su entrega asociada |
| PUT | `/:oid` | Actualiza una orden (solo si la entrega sigue en `pending`) |
| DELETE | `/:oid` | Elimina la orden y su entrega |

Ejemplo de creación:

```json
POST /api/orders
{
    "customer": "68f1a2b3c4d5e6f7a8b9c0d1",
    "deliveryAddress": "Av. Colón 1234, Córdoba",
    "items": [
        { "name": "Caja mediana", "quantity": 2, "price": 1500 },
        { "name": "Cinta de embalar", "quantity": 1, "price": 500 }
    ]
}
```

El `total` no se manda: lo calcula el Service.

### Entregas — `/api/deliveries`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista entregas. Filtros: `?status=`, `?driver=`, `?priority=` |
| GET | `/:did` | Detalle de una entrega |
| GET | `/driver/:driverId` | Entregas de un repartidor |
| PATCH | `/:did/assign` | Asigna un repartidor. Body: `{ "driver": "<id>" }` |
| PATCH | `/:did/status` | Cambia el estado. Body: `{ "status": "in_transit" }` |
| PATCH | `/:did/priority` | Cambia la prioridad. Body: `{ "priority": "high" }` |

El estado avanza solo en este orden:

```
pending → assigned → in_transit → delivered
```

Cualquier salto (por ejemplo, de `pending` a `delivered`) devuelve un 409 con el motivo.

### Mocking y carga de datos de prueba — `/api/mocks`

Genera datos con forma de usuarios, repartidores, pedidos y entregas para no tener que cargarlos a mano. Usa [`@faker-js/faker`](https://fakerjs.dev/) (locale `es_MX`) para nombres, emails y direcciones.

Hay dos tipos de endpoint:

**Previsualización — `GET`, nunca escriben en la base.** Sirven para ver la forma del dato antes de decidir si lo cargás.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=` | Usuarios simulados. `?role=` opcional (`admin`, `customer`, `driver`, `store`); sin ese parámetro, el rol sale al azar |
| GET | `/api/mocks/drivers?qty=` | Atajo de lo anterior, forzando `role: driver` |
| GET | `/api/mocks/orders?qty=` | Pedidos simulados, con ítems y dirección. El `customer` es un ID inventado (no corresponde a un usuario real): esto es solo previsualización |
| GET | `/api/mocks/deliveries?qty=` | Entregas simuladas, con `status` y `priority` válidos. La mitad, aproximadamente, trae un `driver` asignado |

`qty` es opcional (default `5`, tope `50`).

```bash
curl "http://localhost:8080/api/mocks/users?qty=2"
```
```json
[
  { "firstName": "Ana", "lastName": "Pérez", "email": "ana.perez@test.com", "password": "Coder123!", "role": "customer" },
  { "firstName": "Luis", "lastName": "Gómez", "email": "luis.gomez@test.com", "password": "Coder123!", "role": "driver" }
]
```

**Carga real — `POST /api/mocks/seed`, inserta en MongoDB.** A diferencia de la previsualización, este endpoint pasa los datos generados por los Services reales (`UserService`, `OrderService`, `DeliveryService`): la contraseña se hashea igual que en un registro real, el total del pedido se calcula igual, y cada pedido nace con su entrega en `pending` igual que si lo hubiera creado una persona.

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?qty=10&collection=users"
```
```json
{ "insertados": 10, "coleccion": "usuarios" }
```

`collection` acepta `users` (default), `drivers`, `orders` o `deliveries`:

| `collection` | Qué inserta | Relaciones que arma solo |
|---|---|---|
| `users` | Usuarios con rol `customer` | — |
| `drivers` | Usuarios con rol `driver` | — |
| `orders` | Pedidos completos (con su delivery en `pending`) | Si no hay suficientes clientes en la base, crea los que faltan antes de generar los pedidos |
| `deliveries` | No crea entregas sueltas (nacen con el pedido): toma entregas `pending` existentes y a la mitad les asigna un repartidor real | Si no hay suficientes entregas pendientes, genera los pedidos que faltan primero; si no hay repartidores, los crea |

Esto es lo que hace que se cumplan las relaciones pedidas por la consigna sin tener que armarlas a mano: un pedido siempre apunta a un cliente que existe de verdad, y una entrega asignada siempre apunta a un repartidor (rol `driver`) real.

Ejemplo de secuencia para tener datos de prueba completos:

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?qty=5&collection=users"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=3&collection=drivers"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=8&collection=orders"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=4&collection=deliveries"
```

## Modelos

Son cuatro, y la decisión de qué va junto y qué va separado se tomó por ciclo de vida:

- **User**: usuarios del sistema con su rol (`admin`, `customer`, `driver`, `store`).
- **Product**: el catálogo. Tiene vida propia y se consulta de forma independiente, por eso es colección propia y no un subdocumento.
- **Order**: la orden, con los **ítems embebidos** como subdocumentos. Un ítem no existe sin su orden ni se consulta por separado, así que no merece colección propia.
- **Delivery**: **colección aparte**, porque tiene vida propia: cambia de estado, se le asigna un repartidor y tiene sus propias fechas. Guarda la referencia a la orden, y la orden la expone con un campo virtual.

## Por qué separé Service y Repository

El criterio que usé fue preguntarme: **si mañana cambio MongoDB por otra base de datos, ¿este código se tiene que reescribir?** Si la respuesta es sí, va en el Repository. Si no, va en el Service.

**En el Repository quedó el acceso a datos:** las consultas, los `populate` con su proyección fija (el `populate` del cliente nunca trae el password), el `select('-password')` de usuarios, y la validación del formato de los ObjectId. Este último punto evita que un id mal escrito como `/api/orders/123` termine en un `CastError` de Mongoose: el repositorio devuelve `null` y el Service solo tiene que decidir qué hacer cuando algo no existe.

**En el Service quedaron las reglas de negocio**, que son las que realmente definen cómo funciona ShipNow:

- **El status de un producto.** No se acepta del body: se calcula a partir del `stock` (0 unidades pasa a `out_of_stock` solo). Igual que con el total de la orden, si el cliente pudiera mandarlo, cualquiera podría marcar un producto sin stock como disponible.
- **El cálculo del total de la orden.** Es el ejemplo más claro. El total se calcula recorriendo los ítems, y el valor que venga en el body se descarta. Si lo aceptáramos, cualquiera podría mandar `"total": 0` y pagar nada. Un Repository no debería hacer este cálculo: su trabajo es guardar el número, no decidirlo.
- **La creación automática del Delivery** al crear una orden. Que toda orden nazca con una entrega en `pending` es una regla del negocio, no de la base.
- **Las validaciones de rol:** que el `customer` de una orden sea realmente un usuario con rol `customer`, y que el `driver` de una entrega tenga rol `driver`.
- **Las transiciones de estado válidas** de la entrega, definidas en un diccionario de constantes.
- **El hasheo de contraseñas** y la verificación de emails duplicados.
- **La regla de que una orden ya asignada no se modifica ni se borra.** Requiere consultar dos repositorios distintos (Order y Delivery), algo que ningún repositorio debería hacer por su cuenta.

La ganancia concreta es que toda la lógica de ShipNow está en un solo lugar y se puede leer sin saber nada de Mongoose.

## Manejo de errores

Toda la gestión de errores vive en `src/errors/`, separada del resto de las capas:

```
src/errors/
├── error-codes.js       # catálogo de códigos (USER_NOT_FOUND, VALIDATION_ERROR, etc.)
├── error-dictionary.js  # por cada código: su status HTTP y su mensaje por defecto
├── AppError.js           # clase base: arma el error a partir de un código del diccionario
├── domainErrors.js       # una clase por cada caso real del dominio (hereda de AppError)
└── index.js               # punto único de import para todo lo anterior
```

**Ningún Controller ni ninguna ruta arma una respuesta de error.** Los Services son los únicos que detectan un problema y lo señalan, lanzando una clase de error con nombre propio:

```js
// src/services/order.service.js
import { OrderNotFoundError } from '../errors/index.js'

const order = await this.orderRepository.findById(id)
if(!order) throw new OrderNotFoundError(id)
```

Los Controllers nunca atrapan ese error para responderlo: solo lo reenvían.

```js
// src/controllers/order.controller.js
export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.oid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: order })
    } catch (error) {
        next(error)   // nunca se arma la respuesta de error acá
    }
}
```

`next(error)` termina siempre en `errorHandler` (`src/middlewares/errorHandler.js`), que es el **único** lugar de todo el proyecto que escribe una respuesta de error. Ahí se decide el status HTTP, nunca antes.

### Estructura de la respuesta

Toda respuesta de error, sin excepción (un recurso que no existe, un dato inválido, una ruta que no existe, una falla inesperada), tiene esta forma:

```json
{
  "status": "error",
  "code": "ORDER_NOT_FOUND",
  "message": "La orden con id \"68f1...\" no existe.",
  "details": null
}
```

- `code`: siempre uno de los valores de `ERROR_CODES` (`src/errors/error-codes.js`). Pensado para que el cliente (frontend, Postman, un test automatizado) pueda reaccionar por código, sin tener que parsear el texto de `message`.
- `message`: en español, pensado para una persona.
- `details`: `null` casi siempre; trae información extra en los errores de validación (por ejemplo, qué campos faltaron) o cuando se envuelve una falla real de MongoDB (ver más abajo).

### Errores personalizados del dominio

Cada clase en `domainErrors.js` representa un caso concreto, no un mensaje distinto del mismo error genérico:

| Clase | Código | Status | Cuándo se lanza |
|---|---|---|---|
| `ValidationError` | `VALIDATION_ERROR` | 400 | Falta un campo requerido, o un valor no pasa una regla (ítems de un pedido, precio/stock negativo, etc.) |
| `UserNotFoundError` | `USER_NOT_FOUND` | 404 | El usuario (o cliente, o repartidor) indicado no existe |
| `ProductNotFoundError` | `PRODUCT_NOT_FOUND` | 404 | El producto no existe |
| `OrderNotFoundError` | `ORDER_NOT_FOUND` | 404 | El pedido no existe |
| `DeliveryNotFoundError` | `DELIVERY_NOT_FOUND` | 404 | La entrega no existe |
| `DuplicateEmailError` | `DUPLICATE_EMAIL` | 409 | Ya existe un usuario con ese email |
| `InvalidCredentialsError` | `INVALID_CREDENTIALS` | 401 | Login con email o contraseña incorrectos |
| `InvalidRoleError` | `INVALID_ROLE` | 400 | Rol que no está en `USER_ROLES` |
| `OrderLockedError` | `ORDER_LOCKED` | 409 | Se intenta editar/borrar un pedido cuya entrega ya salió de `pending` |
| `InsufficientStockError` | `INSUFFICIENT_STOCK` | 409 | No hay stock suficiente para reservar |
| `InvalidDeliveryStatusError` | `INVALID_DELIVERY_STATUS` | 400 | Estado que no está en `DELIVERY_STATUS` |
| `InvalidStatusTransitionError` | `INVALID_STATUS_TRANSITION` | 409 | Transición de estado no permitida (ver `ALLOWED_STATUS_TRANSITIONS`) |
| `InvalidDeliveryPriorityError` | `INVALID_DELIVERY_PRIORITY` | 400 | Prioridad que no está en `DELIVERY_PRIORITY` |
| `DeliveryNotPendingError` | `DELIVERY_NOT_PENDING` | 409 | Se intenta asignar repartidor a una entrega que no está `pending` |
| `InvalidMockQuantityError` | `INVALID_MOCK_QTY` | 400 | `qty` no es un entero entre 1 y 50 (cubre tanto negativos como valores fuera de rango) |
| `InvalidMockCollectionError` | `INVALID_MOCK_COLLECTION` | 400 | `collection` no es `users`, `drivers`, `orders` ni `deliveries` |
| `MockSeedError` | `MOCK_SEED_FAILED` | 500 | Falló algo inesperado de MongoDB mientras se insertaban datos de prueba (ver abajo) |

A esto se suman tres códigos que no tienen clase propia porque no los lanza un Service, sino que los detecta directamente el `errorHandler` al reconocer un error que vino de Mongoose o de Express:

| Código | Status | De dónde sale |
|---|---|---|
| `CAST_ERROR` | 400 | Un `CastError` de Mongoose (id con formato inválido que logró esquivar la validación previa) |
| `DUPLICATE_KEY` | 409 | Error `11000` de MongoDB (índice único duplicado a nivel de base) |
| `ROUTE_NOT_FOUND` | 404 | Ninguna ruta coincidió (lo emite `notFound.js`, con la misma estructura) |
| `INTERNAL_ERROR` | 500 | Cualquier error no previsto; en producción no expone el mensaje real |

### El módulo de mocks: validación y fallas controladas

`POST /api/mocks/seed` es el único endpoint que escribe en la base, así que es el que más puede fallar. Cubre los tres casos que pide la consigna:

- **Cantidad inválida**: `qty=abc`, `qty=0` o un `qty` que no sea entero → `InvalidMockQuantityError` (400).
- **Valores negativos**: `qty=-5` → el mismo chequeo de cantidad lo atrapa, porque `-5 < 1` (400). Lo mismo corre para `collection` fuera de la lista válida → `InvalidMockCollectionError` (400).
- **Fallas durante la carga en MongoDB**: si algo inesperado pasa mientras se están insertando los datos (se cae la conexión, un timeout, etc.), `MockService.seed()` lo atrapa y lo envuelve en `MockSeedError` (500) en vez de dejar que el stack trace crudo de Mongo llegue al cliente. El mensaje original queda guardado en `details.cause`, para debug:

```json
{
  "status": "error",
  "code": "MOCK_SEED_FAILED",
  "message": "No se pudo completar la carga de datos de prueba.",
  "details": { "cause": "connection timed out" }
}
```

Importante: esto **no** enmascara un error de negocio legítimo. Si durante el seed un email generado chocara con uno existente, eso sigue respondiendo como `DuplicateEmailError` (409) tal cual, porque ya es un `AppError` y no algo inesperado.

### Cómo probar los casos inválidos

```bash
# Cantidad inválida (incluye negativos)
curl "http://localhost:8080/api/mocks/users?qty=0"
curl "http://localhost:8080/api/mocks/users?qty=-5"
curl "http://localhost:8080/api/mocks/users?qty=999"     # excede el tope de 50

# Rol inválido
curl "http://localhost:8080/api/mocks/users?role=inventado"

# Colección inválida en el seed
curl.exe -X POST "http://localhost:8080/api/mocks/seed?collection=inventado"

# Recurso que no existe, en cualquier entidad
curl "http://localhost:8080/api/users/000000000000000000000000"
curl "http://localhost:8080/api/orders/000000000000000000000000"
curl "http://localhost:8080/api/deliveries/000000000000000000000000"

# Ruta que no existe
curl "http://localhost:8080/api/esto-no-existe"
```

Todas estas respuestas tienen que verse con la misma forma: `{ "status": "error", "code": "...", "message": "...", "details": ... }`, cambiando solo el `code`, el `message` y el status HTTP según el caso. Si alguna vez un error no sigue este formato, es una señal de que algo quedó respondiendo por fuera del `errorHandler`.

## Constantes

No hay strings sueltos. Roles, estados, prioridades, transiciones permitidas y códigos HTTP están en `src/constants/index.js`, todos con `Object.freeze`:

```js
import { USER_ROLES, DELIVERY_STATUS } from '../constants/index.js'

if(driver.role !== USER_ROLES.DRIVER){ /* ... */ }
```

Los `enum` de los modelos también se arman desde ahí (`enum: Object.values(USER_ROLES)`), así que si cambia un valor, cambia en un solo lugar.

## Notas

- `.env` está en el `.gitignore`; el repositorio solo incluye `.env.example`.
- `process.env` se lee **únicamente** en `src/config/env.config.js`.