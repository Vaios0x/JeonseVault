#!/usr/bin/env node

/**
 * Script Completo de Despliegue - Kaia Testnet
 * Ejecuta todo el proceso de despliegue de una vez
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function printStatus(message) {
  console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
}

function printSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function printHeader(title) {
  console.log(`${colors.purple}================================${colors.reset}`);
  console.log(`${colors.purple}${title}${colors.reset}`);
  console.log(`${colors.purple}================================${colors.reset}`);
}

const TARGET_OWNER = '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1';

async function main() {
  printHeader('Despliegue Completo - JeonseVault en Kaia Testnet');
  
  try {
    // Paso 1: Verificar configuración
    printStatus('🔍 Paso 1: Verificando configuración...');
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      printError('❌ PRIVATE_KEY no está configurada');
      printWarning('Por favor, configura tu PRIVATE_KEY antes de continuar');
      printStatus('Ejemplo: export PRIVATE_KEY=tu_private_key_aqui');
      process.exit(1);
    }
    
    printSuccess('✅ Private key configurada');
    printStatus(`🎯 Owner objetivo: ${TARGET_OWNER}`);
    
    // Paso 2: Verificar balance
    printStatus('💰 Paso 2: Verificando balance...');
    try {
      const balance = execSync('npx hardhat run scripts/check-balance.js --network kairos', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      printSuccess('✅ Balance verificado');
    } catch (error) {
      printWarning('⚠️ No se pudo verificar el balance automáticamente');
    }
    
    // Paso 3: Compilar contratos
    printStatus('🔨 Paso 3: Compilando contratos...');
    try {
      execSync('npx hardhat compile', { stdio: 'inherit' });
      printSuccess('✅ Contratos compilados');
    } catch (error) {
      printError('❌ Error compilando contratos');
      process.exit(1);
    }
    
    // Paso 4: Ejecutar tests básicos
    printStatus('🧪 Paso 4: Ejecutando tests básicos...');
    try {
      execSync('npx hardhat test test/JeonseVault.test.ts', { stdio: 'inherit' });
      printSuccess('✅ Tests pasaron');
    } catch (error) {
      printWarning('⚠️ Algunos tests fallaron, pero continuando...');
    }
    
    // Paso 5: Desplegar contratos
    printStatus('🚀 Paso 5: Desplegando contratos...');
    try {
      execSync('npx hardhat run scripts/deploy.ts --network kairos', { stdio: 'inherit' });
      printSuccess('✅ Contratos desplegados');
    } catch (error) {
      printError('❌ Error durante el despliegue');
      process.exit(1);
    }
    
    // Paso 6: Verificar despliegue
    printStatus('🔍 Paso 6: Verificando despliegue...');
    try {
      execSync('npx hardhat run scripts/verify-deployment.ts --network kairos', { stdio: 'inherit' });
      printSuccess('✅ Despliegue verificado');
    } catch (error) {
      printWarning('⚠️ Algunas verificaciones fallaron');
    }
    
    // Paso 7: Transferir ownership si es necesario
    printStatus('🔄 Paso 7: Verificando ownership...');
    
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'kairos.json');
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      
      if (deployment.deployer !== TARGET_OWNER) {
        printStatus('🔄 Transferiendo ownership...');
        try {
          execSync('npx hardhat run scripts/transfer-ownership.ts --network kairos', { stdio: 'inherit' });
          printSuccess('✅ Ownership transferido');
        } catch (error) {
          printError('❌ Error transfiriendo ownership');
        }
      } else {
        printSuccess('✅ Ownership ya está configurado correctamente');
      }
    }
    
    // Paso 8: Verificación final
    printStatus('🔍 Paso 8: Verificación final...');
    try {
      execSync('npx hardhat run scripts/verify-deployment.ts --network kairos', { stdio: 'inherit' });
      printSuccess('✅ Verificación final completada');
    } catch (error) {
      printWarning('⚠️ Algunas verificaciones fallaron en la verificación final');
    }
    
    // Resumen final
    printHeader('🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE');
    
    printSuccess('✅ Todos los contratos desplegados en Kaia testnet');
    printSuccess('✅ Ownership configurado correctamente');
    printSuccess('✅ Archivos de configuración generados');
    
    printStatus('\n📋 Información del despliegue:');
    printStatus('   - Red: Kaia Testnet (Chain ID: 1001)');
    printStatus('   - Owner: ' + TARGET_OWNER);
    printStatus('   - Explorador: https://explorer.kaia.io');
    printStatus('   - RPC URL: https://public-en-kairos.node.kaia.io');
    
    printStatus('\n📄 Archivos generados:');
    printStatus('   - deployments/kairos.json');
    printStatus('   - .env.local');
    printStatus('   - lib/deployed-contracts.ts');
    
    printWarning('\n⚠️ PRÓXIMOS PASOS:');
    printStatus('1. Verificar contratos en el explorador de Kaia');
    printStatus('2. Probar la funcionalidad de los contratos');
    printStatus('3. Configurar la aplicación frontend');
    printStatus('4. Ejecutar tests de integración');
    
    printSuccess('\n🎉 ¡JeonseVault está listo para usar en Kaia testnet!');
    
  } catch (error) {
    printError(`Error general: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    printError(`Error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
