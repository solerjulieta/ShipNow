# ShipNow API

API REST de ShipNow organizada en capas (**Router → Controller → Service → Repository → Model**). El proyecto incluye gestión de usuarios, pedidos y entregas, endpoints de prueba con datos mock, manejo centralizado de errores y logging con Winston.

## Requisitos

- Node.js 18 o superior.
- MongoDB local o Atlas.
- Variables de entorno configuradas en `.env`.

## Instalación y ejecución

```bash
git clone <url-del-repositorio>
cd ShipNow
npm install
```

Copiar `.env.example` a `.env` y completar los valores requeridos:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor |
| `NODE_ENV` | Entorno (`development` o `production`) |
| `MONGODB_URI` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Variable requerida por la configuración actual; no implica que JWT esté implementado |

Iniciar el servidor:

```bash
npm run dev
# o
npm start
```

El servidor utiliza el puerto configurado en `PORT` (8080 en la configuración de ejemplo). La API se monta bajo `/api`.

## Documentación interactiva Swagger / OpenAPI

Con el servidor iniciado, abrir:

**http://localhost:8080/api/docs**

Swagger UI permite consultar y probar los endpoints documentados. La especificación OpenAPI se configura por separado de las rutas en `src/config/swagger.js`; la interfaz se monta desde `app.js`.

La documentación está agrupada en estos tags:

- **Users:** listado, detalle, creación, actualización, eliminación y validación de credenciales.
- **Orders:** listado, detalle, creación, actualización y eliminación de pedidos.
- **Deliveries:** listado, detalle, consulta por repartidor, asignación y actualización de estado/prioridad.
- **Mocks:** previsualización de usuarios, repartidores, pedidos y entregas; inserción de datos de prueba.
- **Logger:** endpoint técnico para generar registros de prueba en los niveles del logger.

Se incluyen schemas reutilizables para `User`, `Order`, `Delivery`, `OrderItem`, `ErrorResponse` y `SuccessResponse`, además de esquemas de entrada para crear usuarios y pedidos.

## Endpoints principales

Las rutas siguientes se expresan relativas a `http://localhost:8080/api`.

### Users — `/user`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/user` | Lista usuarios. Filtro opcional `?role=customer`, `driver` o `admin`. |
| GET | `/user/:uid` | Obtiene un usuario por ID. |
| POST | `/user` | Crea un usuario. Requiere `firstName`, `lastName`, `email` y `password` (mínimo 8 caracteres); `role` es opcional. |
| POST | `/user/login` | Valida `email` y `password`. No emite tokens. |
| PUT | `/user/:uid` | Actualiza un usuario. |
| DELETE | `/user/:uid` | Elimina un usuario. |

Ejemplo de body para crear usuario:

```json
{
  "firstName": "Ana",
  "lastName": "Pérez",
  "email": "ana.perez@test.com",
  "password": "Coder123!",
  "role": "customer"
}
```

### Orders — `/orders`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/orders` | Lista pedidos. Filtro opcional `?customer=<id>`. |
| GET | `/orders/:oid` | Obtiene un pedido por ID. |
| POST | `/orders` | Crea un pedido y su entrega asociada. |
| PUT | `/orders/:oid` | Actualiza un pedido mientras su entrega siga en `pending`. |
| DELETE | `/orders/:oid` | Elimina un pedido y su entrega asociada si sigue en `pending`. |

Ejemplo de body para crear pedido:

```json
{
  "customer": "<id-de-un-usuario-customer>",
  "deliveryAddress": "Av. Colón 1234, Córdoba",
  "items": [
    { "name": "Caja mediana", "quantity": 2, "price": 1500 },
    { "name": "Cinta de embalar", "quantity": 1, "price": 500 }
  ]
}
```

El `total` se calcula en el servidor; no se envía en el body.

### Deliveries — `/deliveries`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/deliveries` | Lista entregas. Admite filtros `status`, `driver` y `priority`. |
| GET | `/deliveries/:did` | Obtiene una entrega por ID. |
| GET | `/deliveries/driver/:driverId` | Lista entregas de un repartidor. |
| PATCH | `/deliveries/:did/assign` | Asigna un repartidor. Body: `{ "driver": "<id>" }`. |
| PATCH | `/deliveries/:did/status` | Actualiza el estado. Body: `{ "status": "in_transit" }`. |
| PATCH | `/deliveries/:did/priority` | Actualiza la prioridad. Body: `{ "priority": "high" }`. |

Estados documentados por el modelo/servicio: `pending`, `assigned`, `in_transit`, `delivered`. Las transiciones de estado están restringidas por las reglas del servicio. Prioridades: `low`, `normal`, `high`.

### Mocks — `/mocks`

Los endpoints de previsualización generan datos simulados y no los insertan en MongoDB. El parámetro `qty` es opcional, por defecto vale `5` y debe ser un entero entre `1` y `50`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/mocks/users?qty=5` | Previsualiza usuarios mock. Admite `role` opcional. |
| GET | `/mocks/drivers?qty=5` | Previsualiza repartidores mock. |
| GET | `/mocks/orders?qty=5` | Previsualiza pedidos mock. |
| GET | `/mocks/deliveries?qty=5` | Previsualiza entregas mock. |
| POST | `/mocks/seed` | Inserta datos de prueba en MongoDB. |

Para `/mocks/seed`, se puede enviar `qty` y `collection` por query string o en el body JSON. `qty` por defecto es `10`; `collection` por defecto es `users`. Las colecciones admitidas por el servicio son `users`, `drivers`, `orders` y `deliveries`.

Ejemplo:

```json
{
  "qty": 5,
  "collection": "users"
}
```

Las cantidades fuera del rango válido y los valores de colección no admitidos se responden como errores de la API.

### Logger — `/logger-test`

`GET /logger-test` genera eventos de prueba para los niveles `debug`, `http`, `info`, `warning`, `error` y `fatal`. Devuelve un resumen de la prueba y la ruta lógica del directorio de logs (`logs/`). Es una herramienta de validación técnica, no una funcionalidad de negocio.

## Respuestas y errores

Las respuestas exitosas de los módulos de usuarios, pedidos y entregas suelen utilizar el formato:

```json
{
  "status": "success",
  "data": {}
}
```

Las respuestas de error de negocio y los errores internos procesados por el middleware incluyen `status`, `code`, `message` y `details`. La ruta inexistente usa `status` y `message`. Los códigos HTTP concretos dependen del error y del endpoint; Swagger documenta las respuestas previstas para cada operación.

Entre los casos manejados se encuentran datos inválidos, recursos inexistentes, credenciales inválidas en login, conflictos por datos duplicados, transiciones de estado no permitidas, cantidades inválidas para mocks y errores internos. No hay autenticación JWT aplicada a los endpoints en esta entrega.

## Logging

Winston escribe los registros en consola y en `logs/error.log`. El archivo se rota por tamaño (5 MB) y se conservan hasta cinco archivos según la configuración de Winston. El directorio `logs/` se crea automáticamente al inicializar el logger; no hace falta un archivo `.gitkeep`.

## Estructura relevante

```text
├── app.js
├── server.js
├── src/
│   ├── config/
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── controllers/
│   ├── errors/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
└── README.md
```

La documentación se mantiene en `src/config/swagger.js`, separada de la lógica de enrutamiento. Al probar operaciones que consultan o modifican datos, se necesita una conexión válida a MongoDB y los IDs referenciados deben existir.

## Testing funcional

La suite valida los endpoints principales mediante pruebas HTTP automatizadas, sin iniciar manualmente un puerto y sin utilizar la base de datos de desarrollo.

### Herramientas

- **Mocha:** organiza y ejecuta los casos de prueba.
- **Chai:** valida status HTTP, estructura del body y propiedades relevantes.
- **Supertest:** realiza peticiones HTTP directamente sobre la aplicación Express.
- **MongoDB Memory Server:** levanta una instancia MongoDB temporal en memoria para cada ejecución de la suite.

### Instalación y ejecución

Instalar las dependencias del proyecto: `npm install`. Luego ejecutar:

```bash
npm test
```

El script configura `NODE_ENV=test`, carga `tests/setup.js`, inicia MongoDB en memoria, conecta Mongoose y ejecuta todos los archivos `tests/*.test.js`. Al finalizar, elimina la base temporal, cierra la conexión y detiene el servidor MongoDB. No es necesario iniciar `npm run dev` ni `npm start`.

### Módulos cubiertos

- **Users:** listado de usuarios y respuesta 404 al consultar un usuario inexistente.
- **Orders:** listado, creación con cliente de prueba, consulta por ID, datos incompletos y pedido inexistente.
- **Deliveries:** actualización válida de estado y rechazo de un estado inválido.
- **Mocks:** previsualización de usuarios, repartidores, pedidos y entregas; inserción controlada con `/mocks/seed`; cantidades inválidas.
- **Logger:** respuesta del endpoint técnico y niveles informados.
- **Swagger:** acceso a la interfaz de documentación en `/api/docs/`.
- **Rutas inexistentes:** respuesta 404 con el contrato estándar de error.

Cada grupo limpia las colecciones que utiliza antes de sus pruebas. Los usuarios, pedidos y entregas necesarios se crean dentro de la propia suite; los endpoints de previsualización de mocks no insertan información en la base. Por eso, los tests no dependen de datos manuales ni del orden de ejecución.

### Base de datos y variables de entorno

No se requiere una instancia local ni Atlas para ejecutar los tests: `mongodb-memory-server` crea una base temporal aislada llamada `shipnow_test`. La URI se genera automáticamente y se asigna a `MONGODB_URI` antes de importar la aplicación.

El setup establece `NODE_ENV=test`, `PORT=0` y `JWT_SECRET` con valores exclusivos de testing. Si se desea personalizarlos, se puede crear `.env.test` a partir de `.env.test.example`; este archivo está excluido de Git. No se debe configurar aquí la URI de desarrollo: la suite la reemplaza por la URI temporal en memoria.

La aplicación Express se exporta desde `app.js` y el levantamiento del servidor permanece en `server.js`, por lo que Supertest puede importar la aplicación sin abrir un puerto manualmente.