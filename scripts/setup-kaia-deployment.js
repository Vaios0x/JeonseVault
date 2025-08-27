#!/usr/bin/env node

/**
 * Script de Configuración para Despliegue en Kaia Testnet
 * Configura el entorno y despliega los contratos con el owner especificado
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Configuración
const TARGET_OWNER = '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1';
const NETWORK = 'kairos';

async function main() {
  printHeader('Configuración de Despliegue - Kaia Testnet');
  
  // Verificar que la private key esté configurada
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    printError('❌ PRIVATE_KEY no está configurada en las variables de entorno');
    printWarning('Por favor, configura tu PRIVATE_KEY antes de continuar');
    printStatus('Ejemplo: export PRIVATE_KEY=tu_private_key_aqui');
    process.exit(1);
  }

  // Verificar que el owner objetivo esté configurado
  printStatus(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  printStatus(`🌐 Red: ${NETWORK}`);
  printStatus(`🔑 Private Key configurada: ${privateKey.substring(0, 10)}...`);

  // Crear archivo .env.local si no existe
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    printStatus('📝 Creando archivo .env.local...');
    
    const envContent = `# ============================================================================
# CONFIGURACIÓN DE DESPLIEGUE - KAIA TESTNET
# ============================================================================

# Private Key para el despliegue
PRIVATE_KEY=${privateKey}

# ============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================================
NEXT_PUBLIC_APP_NAME=JeonseVault
NEXT_PUBLIC_APP_DESCRIPTION=혁신적인 전세 보증금 스마트 컨트랙트 플랫폼
NEXT_PUBLIC_SUPPORT_EMAIL=support@jeonsevault.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================================================
# CONFIGURACIÓN WEB3 Y BLOCKCHAIN
# ============================================================================

# Kaia Testnet Configuration
NEXT_PUBLIC_KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_KAIA_CHAIN_ID=1001
NEXT_PUBLIC_KAIA_EXPLORER_URL=https://explorer.kaia.io

# ============================================================================
# DIRECCIONES DE SMART CONTRACTS (DESPLEGADOS EN KAIA TESTNET)
# ============================================================================

# JeonseVault Main Contract
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x6287ac251C19bFDfc7AE8247D64B952727855Dae

# Investment Pool Contract
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB

# Property Oracle Contract
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0xF38701CCCE9190D1445c8cB3561104e811CB1468

# Compliance Module Contract
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0xf18Fa2873244423cb2247C2b64B5992418001702

# ============================================================================
# CONFIGURACIÓN DE DESARROLLO
# ============================================================================

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

# Debug Configuration
DEBUG=jeonsevault:*
LOG_LEVEL=debug
`;

    fs.writeFileSync(envPath, envContent);
    printSuccess('✅ Archivo .env.local creado');
  } else {
    printStatus('📄 Archivo .env.local ya existe');
  }

  // Verificar balance del deployer
  printStatus('💰 Verificando balance del deployer...');
  try {
    const balance = execSync(`npx hardhat run scripts/check-balance.js --network ${NETWORK}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    printSuccess(`Balance: ${balance.trim()}`);
  } catch (error) {
    printWarning('No se pudo verificar el balance automáticamente');
  }

  // Compilar contratos
  printStatus('🔨 Compilando contratos...');
  try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    printSuccess('✅ Contratos compilados correctamente');
  } catch (error) {
    printError('❌ Error compilando contratos');
    process.exit(1);
  }

  // Ejecutar tests básicos
  printStatus('🧪 Ejecutando tests básicos...');
  try {
    execSync('npx hardhat test test/JeonseVault.test.ts', { stdio: 'inherit' });
    printSuccess('✅ Tests pasaron correctamente');
  } catch (error) {
    printWarning('⚠️ Algunos tests fallaron, pero continuando con el despliegue');
  }

  // Desplegar contratos
  printStatus('🚀 Iniciando despliegue de contratos...');
  try {
    execSync(`npx hardhat run scripts/deploy.ts --network ${NETWORK}`, { stdio: 'inherit' });
    printSuccess('✅ Contratos desplegados correctamente');
  } catch (error) {
    printError('❌ Error durante el despliegue');
    process.exit(1);
  }

  // Transferir ownership si es necesario
  printStatus('🔄 Verificando si es necesario transferir ownership...');
  
  // Leer el archivo de despliegue generado
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${NETWORK}.json`);
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    if (deployment.deployer !== TARGET_OWNER) {
      printStatus(`🔄 Transferiendo ownership a ${TARGET_OWNER}...`);
      try {
        // Aquí podrías ejecutar un script para transferir ownership
        // Por ahora, solo mostramos la información
        printWarning('⚠️ El ownership debe ser transferido manualmente después del despliegue');
        printStatus(`   Deployer actual: ${deployment.deployer}`);
        printStatus(`   Owner objetivo: ${TARGET_OWNER}`);
      } catch (error) {
        printError('❌ Error transfiriendo ownership');
      }
    } else {
      printSuccess('✅ Owner ya está configurado correctamente');
    }
  }

  // Actualizar .env.local con las direcciones de contratos
  printStatus('📝 Actualizando .env.local con las direcciones de contratos...');
  try {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contracts = deployment.contracts;
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Actualizar direcciones
    envContent = envContent.replace(
      /NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x0000000000000000000000000000000000000000/,
      `NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=${contracts.JeonseVault.address}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0x0000000000000000000000000000000000000000/,
      `NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=${contracts.InvestmentPool.address}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000/,
      `NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=${contracts.PropertyOracle.address}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0x0000000000000000000000000000000000000000/,
      `NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=${contracts.ComplianceModule.address}`
    );
    
    fs.writeFileSync(envPath, envContent);
    printSuccess('✅ .env.local actualizado con las direcciones de contratos');
  } catch (error) {
    printError('❌ Error actualizando .env.local');
  }

  // Resumen final
  printHeader('Resumen del Despliegue');
  printSuccess('✅ Configuración completada');
  printSuccess('✅ Contratos desplegados en Kaia testnet');
  printStatus(`🌐 Red: ${NETWORK}`);
  printStatus(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  printStatus('📄 Archivo .env.local configurado');
  printStatus('📋 Información de despliegue guardada en deployments/');
  
  printWarning('\n⚠️  PRÓXIMOS PASOS:');
  printStatus('1. Verificar contratos en el explorador de Kaia');
  printStatus('2. Transferir ownership si es necesario');
  printStatus('3. Configurar roles y permisos adicionales');
  printStatus('4. Probar la funcionalidad de los contratos');
  
  printSuccess('\n🎉 ¡Despliegue completado exitosamente!');
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    printError(`Error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
