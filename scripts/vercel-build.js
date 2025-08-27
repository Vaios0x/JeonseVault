#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de Vercel...');

try {
    // Limpiar cache de npm si existe
    const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(cachePath)) {
        console.log('🧹 Limpiando cache de npm...');
        fs.rmSync(cachePath, { recursive: true, force: true });
    }

    // Verificar que los archivos críticos existen
    console.log('🔍 Verificando archivos críticos...');
    const requiredFiles = [
        'components/ui/Button.tsx',
        'hooks/useWeb3.ts',
        'components/dashboard/DepositCard.tsx',
        'components/dashboard/StatsWidget.tsx',
        'components/ui/Loading.tsx'
    ];

    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ Error: Archivo requerido no encontrado: ${file}`);
            process.exit(1);
        }
    }

    console.log('✅ Todos los archivos críticos encontrados');

    // Ejecutar build de Next.js
    console.log('🏗️ Ejecutando build de Next.js...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('✅ Build completado exitosamente!');
} catch (error) {
    console.error('❌ Error durante el build:', error.message);
    process.exit(1);
}
