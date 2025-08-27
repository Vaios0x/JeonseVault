#!/bin/bash

# Script de build optimizado para Vercel
# Maneja conflictos de dependencias y optimiza el proceso de build

set -e

echo "🚀 Iniciando build optimizado para Vercel..."

# Limpiar cache de npm si existe
if [ -d "node_modules/.cache" ]; then
    echo "🧹 Limpiando cache de npm..."
    rm -rf node_modules/.cache
fi

# Instalar dependencias con legacy peer deps
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps --production=false

# Verificar que las dependencias críticas estén instaladas
echo "🔍 Verificando dependencias críticas..."
if [ ! -d "node_modules/next" ]; then
    echo "❌ Error: Next.js no está instalado"
    exit 1
fi

if [ ! -d "node_modules/react" ]; then
    echo "❌ Error: React no está instalado"
    exit 1
fi

# Ejecutar build de Next.js
echo "🏗️ Ejecutando build de Next.js..."
npm run build

echo "✅ Build completado exitosamente!"
