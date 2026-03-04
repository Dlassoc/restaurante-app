# backend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

# Instala dependencias (cacheable)
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Solo lo necesario para correr
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Prisma necesita runtime libs en algunos casos
RUN npx prisma generate

EXPOSE 3000

# Recomendación: correr migraciones al arrancar (simple para entrega)
# En Render también puedes poner esto en Start Command.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]