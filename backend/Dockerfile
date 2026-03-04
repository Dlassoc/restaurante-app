# backend/Dockerfile

# 1) Dependencias (incluye dev para build)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build TypeScript + Prisma Client
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# genera prisma client para el build (y runtime)
RUN npx prisma generate
RUN npm run build

# 3) Runner (solo prod deps)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia package files y prisma schema
COPY package*.json ./
COPY prisma ./prisma

# Instala SOLO dependencias de producción
RUN npm ci --omit=dev

# Copia build ya compilado
COPY --from=build /app/dist ./dist

# Prisma Client ya viene en node_modules, pero si tu generator depende del schema en runtime,
# lo dejamos listo (no requiere prisma CLI en runtime).
EXPOSE 3000

# Usa el path correcto según tu package.json
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]