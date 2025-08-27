#!/bin/bash

# Script de build optimizado para Vercel
set -e

echo "🚀 Iniciando build de Vercel..."

# Limpiar cache de npm si existe
if [ -d "node_modules/.cache" ]; then
    echo "🧹 Limpiando cache de npm..."
    rm -rf node_modules/.cache
fi

# Instalar dependencias con legacy peer deps
echo "📦 Instalando dependencias..."
npm ci --legacy-peer-deps --prefer-offline --no-audit

# Verificar que los archivos críticos existen
echo "🔍 Verificando archivos críticos..."
required_files=(
    "components/ui/Button.tsx"
    "hooks/useWeb3.ts"
    "components/dashboard/DepositCard.tsx"
    "components/dashboard/StatsWidget.tsx"
    "components/ui/Loading.tsx"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Archivo requerido no encontrado: $file"
        exit 1
    fi
done

echo "✅ Todos los archivos críticos encontrados"

# Ejecutar build de Next.js
echo "🏗️ Ejecutando build de Next.js..."
npm run build

echo "✅ Build completado exitosamente!"
