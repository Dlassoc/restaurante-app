# Restaurante App (DevOps)

Aplicacion full-stack para gestion de Restaurantes, Menus y Reservas, con API REST, PostgreSQL, CI/CD y ejecucion reproducible con Docker Compose.

## Stack
Backend:
- Node.js + TypeScript + Express
- Prisma ORM
- Zod
- PostgreSQL
- Jest + Supertest

Frontend:
- React + Vite

DevOps:
- GitHub Actions
- Render
- Docker + Docker Compose

## API V2
Base URL oficial: `/api/v2`

Health:
- `GET /api/v2/health` -> `{ "ok": true, "version": "v2" }`
- `GET /api/v2/health/db` -> `{ "ok": true, "db": "up" }`

Restaurantes:
- `GET /api/v2/restaurantes`
- `GET /api/v2/restaurantes/:id`
- `POST /api/v2/restaurantes`
- `PUT /api/v2/restaurantes/:id`
- `PATCH /api/v2/restaurantes/:id`
- `DELETE /api/v2/restaurantes/:id`

Menus:
- `GET /api/v2/menus`
- `GET /api/v2/menus/:id`
- `POST /api/v2/menus`
- `PUT /api/v2/menus/:id`
- `PATCH /api/v2/menus/:id`
- `DELETE /api/v2/menus/:id`

Reservas:
- `GET /api/v2/reservas`
- `GET /api/v2/reservas/:id`
- `POST /api/v2/reservas`
- `PUT /api/v2/reservas/:id`
- `PATCH /api/v2/reservas/:id`
- `DELETE /api/v2/reservas/:id`

## Payloads de ejemplo
Crear restaurante (`POST /api/v2/restaurantes`):

```json
{
	"nombre": "La 70",
	"direccion": "Calle 70 #10-20",
	"telefono": "3001234567"
}
```

Actualizar restaurante parcial (`PATCH /api/v2/restaurantes/:id`):

```json
{
	"telefono": "3109998877"
}
```

Crear menu (`POST /api/v2/menus`):

```json
{
	"restauranteId": 1,
	"nombre": "Menu Ejecutivo",
	"precio": 25000,
	"disponible": true
}
```

Actualizar menu parcial (`PATCH /api/v2/menus/:id`):

```json
{
	"precio": 28000,
	"disponible": false
}
```

Crear reserva (`POST /api/v2/reservas`):

```json
{
	"restauranteId": 1,
	"nombreCliente": "Ana",
	"personas": 2,
	"fechaHora": "2026-04-14T19:30:00.000Z",
	"notas": "Mesa cerca de la ventana"
}
```

Actualizar reserva parcial (`PATCH /api/v2/reservas/:id`):

```json
{
	"personas": 4,
	"notas": "Cumpleanos"
}
```

## Reglas y respuestas
- `400 invalid_id` cuando `:id` no es numerico.
- `400` cuando el body no cumple el esquema Zod o llega vacio en `PUT/PATCH`.
- `404 not_found` cuando no existe el recurso.
- `404 restaurante_not_found` cuando `restauranteId` no existe.

## Variables de entorno
Backend:
- `DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?schema=public`
- `PORT=3000`

Frontend:
- `VITE_API_URL=http://localhost:3000/api/v2`

## Ejecutar en local
Backend:

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate dev
npm run dev
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

Tests:

```bash
cd backend
npm run test
npm run test:cov
```

## Docker Compose

```bash
docker compose up --build
```

Verificar:
- Backend: `http://localhost:3000/api/v2/health`
- Frontend: `http://localhost:5173`

Apagar:

```bash
docker compose down
```