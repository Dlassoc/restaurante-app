# Restaurante App 🍽️ (DevOps / CI-CD)
#prueba del hook
Aplicación fullstack para gestión de **Restaurantes**, **Menús** y **Reservas**.

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Base de datos:** PostgreSQL (Docker)
- **Frontend:** React + Vite + TypeScript
- **CI:** GitHub Actions (tests + coverage gate)

---

## 🚀 Funcionalidades

### Backend (API REST)
- CRUD de **Restaurantes**
- CRUD de **Menús** (asociados a Restaurante)
- CRUD de **Reservas** (asociadas a Restaurante)
- Validaciones con **Zod**

### Frontend (Web)
- Formulario + listado de **Restaurantes**
- Formulario + listado de **Menús** (con filtro por restaurante)
- Formulario + listado de **Reservas** (con filtro por restaurante)

---

## 🧱 Arquitectura del repositorio

```text
.
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  ├─ routes/
│  ├─ tests/
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend/
│  ├─ src/
│  ├─ package.json
│  └─ vite.config.ts
├─ docker-compose.yml
└─ README.md
✅ Requisitos

Node.js 20+

Docker + Docker Compose

Git

En Windows se recomienda Docker Desktop con WSL2 habilitado.

🐘 Levantar PostgreSQL con Docker

Desde la raíz del repo:

docker compose up -d
docker ps

Esto levanta PostgreSQL en localhost:5432.

🔧 Backend - instalación y ejecución
1) Instalar dependencias
cd backend
npm install
2) Configurar variables de entorno

Crea el archivo backend/.env:

DATABASE_URL=postgresql://app:app@localhost:5432/appdb?schema=public
PORT=3000

Ajusta el puerto si tu docker-compose.yml usa otro (ej. 5433:5432).

3) Migraciones + Prisma Client
npx prisma generate
npx prisma migrate dev --name init
4) Ejecutar backend en modo desarrollo
npm run dev

Backend disponible en:

http://localhost:3000/health

http://localhost:3000/restaurantes

🎨 Frontend - instalación y ejecución
1) Instalar dependencias
cd frontend
npm install
2) Configurar variable de entorno

Crea frontend/.env:

VITE_API_URL=http://localhost:3000
3) Ejecutar frontend
npm run dev

Frontend disponible en:

http://localhost:5173

🔌 Endpoints principales (API)
Restaurantes

GET /restaurantes

GET /restaurantes/:id

POST /restaurantes

PUT /restaurantes/:id

DELETE /restaurantes/:id

Ejemplo POST /restaurantes:

{
  "nombre": "La 70",
  "direccion": "Calle 70 #10-20",
  "telefono": "3001234567"
}
Menús

GET /menus

GET /menus/:id

POST /menus

PUT /menus/:id

DELETE /menus/:id

Ejemplo POST /menus:

{
  "restauranteId": 1,
  "nombre": "Menu Ejecutivo",
  "precio": 25000,
  "disponible": true
}
Reservas

GET /reservas

GET /reservas/:id

POST /reservas

PUT /reservas/:id

DELETE /reservas/:id

Ejemplo POST /reservas (fecha ISO 8601):

{
  "restauranteId": 1,
  "nombreCliente": "Ana",
  "personas": 2,
  "fechaHora": "2026-03-04T19:30:00.000Z",
  "notas": "Mesa cerca a la ventana"
}
🧪 Pruebas y cobertura

En backend/:

npm test
npm run test:cov

El reporte de cobertura queda en backend/coverage/.

🤖 CI (GitHub Actions)

El repositorio incluye un workflow de CI para backend que:

instala dependencias

levanta PostgreSQL como servicio

ejecuta migraciones

corre tests con coverage gate

Workflow:

.github/workflows/ci-backend-test.yml

Rama objetivo típica:

develop → ambiente de pruebas (coverage mínimo 60%)

main → producción (coverage mínimo 85%) (pendiente al configurar CD)

🌍 Ambientes (Test / Prod)

Para cumplir separación de ambientes:

URLs distintas: api-test vs api-prod / web-test vs web-prod

BD distinta por ambiente (dos PostgreSQL distintos)

Variables/Secrets separados por environment

(Se completará al configurar el despliegue en Render/Railway/otro proveedor.)

🧹 Apagar servicios Docker

Desde la raíz:

docker compose down

⚠️ Borrar datos (volúmenes):

docker compose down -v
🧾 Evidencia (Git)

Commits con GitMoji

Trabajo en ramas:

develop (pruebas)

main (producción)

CI visible en GitHub Actions



👤 Autor
Daniel Lasso