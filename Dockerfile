# ============================================================================
# JeonseVault Production Dockerfile
# Multi-stage build optimizado para producción
# ============================================================================

# ============================================================================
# STAGE 1: DEPENDENCIES
# ============================================================================
FROM node:18-alpine AS deps

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY contracts/package.json ./contracts/
COPY scripts/package.json ./scripts/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# ============================================================================
# STAGE 2: SMART CONTRACT COMPILATION
# ============================================================================
FROM node:18-alpine AS contracts

# Instalar dependencias de desarrollo para compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de contratos
COPY contracts/ ./contracts/
COPY hardhat.config.ts ./
COPY package.json package-lock.json* ./

# Instalar dependencias de desarrollo
RUN npm ci

# Compilar contratos
RUN npx hardhat compile

# ============================================================================
# STAGE 3: FRONTEND BUILD
# ============================================================================
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Copiar contratos compilados
COPY --from=contracts /app/artifacts ./artifacts
COPY --from=contracts /app/typechain-types ./typechain-types

# Generar assets PWA
RUN node scripts/generate-pwa-assets.js

# Optimizar imágenes
RUN node scripts/optimize-images.js

# Construir aplicación
RUN npm run build

# ============================================================================
# STAGE 4: PRODUCTION
# ============================================================================
FROM node:18-alpine AS runner

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar archivos de configuración
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/middleware.ts ./

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno para el contenedor
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# ============================================================================
# STAGE 5: DEVELOPMENT (opcional)
# ============================================================================
FROM node:18-alpine AS development

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Comando de inicio para desarrollo
CMD ["npm", "run", "dev"]
