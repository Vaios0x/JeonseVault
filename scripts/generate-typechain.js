#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Generando archivos TypeChain...');

try {
    // Verificar si typechain-types existe
    const typechainPath = path.join(process.cwd(), 'typechain-types');
    
    if (!fs.existsSync(typechainPath)) {
        console.log('📦 Instalando dependencias de Hardhat...');
        execSync('npm install', { stdio: 'inherit' });
        
        console.log('🏗️ Compilando contratos...');
        execSync('npx hardhat compile', { stdio: 'inherit' });
        
        console.log('✅ Archivos TypeChain generados');
    } else {
        console.log('✅ Archivos TypeChain ya existen');
    }
    
    // Verificar que los archivos críticos existen
    const requiredFiles = [
        'typechain-types/index.ts',
        'typechain-types/hardhat.d.ts',
        'typechain-types/common.ts'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ Error: Archivo TypeChain requerido no encontrado: ${file}`);
            process.exit(1);
        }
    }
    
    console.log('✅ Todos los archivos TypeChain verificados');
    
} catch (error) {
    console.error('❌ Error generando TypeChain:', error.message);
    process.exit(1);
}
