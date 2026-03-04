# Restaurante App (DevOps)

Aplicación full-stack para gestión de **Restaurantes, Menús y Reservas**, con **API REST**, base de datos **PostgreSQL**, **CI/CD** (staging y producción), y ejecución reproducible con **Docker Compose**.

## Stack
**Backend**
- Node.js + TypeScript + Express
- Prisma ORM
- Zod (validación)
- PostgreSQL
- Jest + Supertest (tests + coverage)

**Frontend**
- React + Vite

**DevOps**
- GitHub Actions (CI/CD)
- Render (staging y producción)
- Docker + Docker Compose

---

## Arquitectura y entidades
- **Restaurantes**: datos base del restaurante.
- **Menús**: pertenecen a un restaurante (FK `restauranteId`).
- **Reservas**: pertenecen a un restaurante (FK `restauranteId`).

---

## Endpoints principales (Backend)
Base URL: `/`

### Health
- `GET /health` → `{ ok: true }`

### Restaurantes
- `GET /restaurantes`
- `GET /restaurantes/:id`
- `POST /restaurantes`
- `PUT /restaurantes/:id`
- `DELETE /restaurantes/:id`

Validaciones:
- `400 invalid_id` si `:id` no es numérico
- `400` si body no cumple esquema (Zod)
- `404 not_found` cuando no existe el recurso

### Menús
- `GET /menus`
- `GET /menus/:id`
- `POST /menus`
- `PUT /menus/:id`
- `DELETE /menus/:id`

Reglas:
- `POST/PUT` valida que `restauranteId` exista (`404 restaurante_not_found`)

### Reservas
- `GET /reservas`
- `GET /reservas/:id`
- `POST /reservas`
- `PUT /reservas/:id`
- `DELETE /reservas/:id`

Reglas:
- `POST/PUT` valida que `restauranteId` exista (`404 restaurante_not_found`)
- `fechaHora` debe ser ISO (Zod `.datetime()`)

---

## Variables de entorno
Backend:
- `DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?schema=public`
- `PORT=3000` (opcional, por defecto 3000)

Frontend:
- `VITE_API_URL=http://localhost:3000` (para local/docker)

Archivo sugerido:
- `.env.example` (no subir `.env`)

---

## Ejecutar en local (sin Docker)

### Backend
```bash
cd backend
npm ci
npx prisma generate
# Para entorno local: aplicar migraciones (si aplica en tu setup)
npx prisma migrate dev
npm run dev
Frontend
cd frontend
npm ci
npm run dev
Tests y cobertura

En backend:

cd backend
npm run test
npm run test:cov

Quality gates:

staging: coverage mínimo >= 60%

producción: coverage mínimo >= 85%

Ejecutar con Docker Compose (recomendado para demo)

Requisitos:

Docker + Docker Compose

Arranque:

docker compose up --build

Verificar:

Backend: http://localhost:3000/health

Frontend: http://localhost:5173

Apagar:

docker compose down
CI/CD (GitHub Actions)

Workflows (en /.github/workflows/):

CI Backend (Test): corre tests (y coverage) en Pull Requests.

Deploy Backend (Staging): se dispara con push a develop, corre tests y si pasa dispara deploy a staging (Render Deploy Hook).

Deploy Backend (Production): se dispara con push a main, corre tests y si pasa dispara deploy a producción (Render Deploy Hook).

Secrets (GitHub → Settings → Secrets and variables → Actions):

RENDER_STAGING_DEPLOY_HOOK_URL

RENDER_PROD_DEPLOY_HOOK_URL

Regla:

Si falla tests/coverage, NO despliega (el hook corre solo al final si todo pasó).

Ambientes (Render)

Staging: conectado a rama develop y base de datos de staging.

Producción: conectado a rama main y base de datos de producción (externa).

En producción/staging se recomienda usar prisma migrate deploy en el Start Command o al arrancar el contenedor.

Ramas y flujo recomendado

develop → staging (pruebas)

main → producción

Flujo:

Trabajar en feature branch

PR a develop (CI corre y valida)

Merge a develop (deploy staging)

PR develop → main (deploy prod al merge)

Autores

Daniel Lasso (y equipo si aplica)