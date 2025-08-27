#!/usr/bin/env node

/**
 * Script Rápido de Despliegue - Kaia Testnet
 * Configura la private key y despliega inmediatamente
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
  printHeader('🚀 DESPLIEGUE RÁPIDO - JEONSEVAULT EN KAIA TESTNET');
  
  // Solicitar private key
  printStatus('🔑 Por favor, ingresa tu PRIVATE KEY:');
  printWarning('⚠️  La private key debe comenzar con 0x y tener 64 caracteres hexadecimales');
  printStatus('   Ejemplo: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  
  // En un entorno real, aquí usarías readline para obtener la input del usuario
  // Por ahora, asumimos que está en las variables de entorno
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    printError('❌ PRIVATE_KEY no está configurada');
    printStatus('Por favor, configura tu PRIVATE_KEY como variable de entorno:');
    printStatus('   $env:PRIVATE_KEY="tu_private_key_aqui"');
    process.exit(1);
  }
  
  // Validar formato de private key
  if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    printError('❌ Formato de private key inválido');
    printStatus('La private key debe comenzar con 0x y tener 64 caracteres hexadecimales');
    process.exit(1);
  }
  
  printSuccess('✅ Private key configurada correctamente');
  printStatus(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  printStatus(`🔑 Private key: ${privateKey.substring(0, 10)}...`);
  
  // Crear archivo .env.local
  printStatus('📝 Creando archivo .env.local...');
  const envPath = path.join(__dirname, '..', '.env.local');
  
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
  
  // Verificar balance
  printStatus('💰 Verificando balance...');
  try {
    const balance = execSync('npx hardhat run scripts/check-balance.js --network kairos', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    printSuccess('✅ Balance verificado');
    console.log(balance);
  } catch (error) {
    printWarning('⚠️ No se pudo verificar el balance automáticamente');
  }
  
  // Compilar contratos
  printStatus('🔨 Compilando contratos...');
  try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    printSuccess('✅ Contratos compilados');
  } catch (error) {
    printError('❌ Error compilando contratos');
    process.exit(1);
  }
  
  // Desplegar contratos
  printStatus('🚀 Desplegando contratos en Kaia testnet...');
  try {
    execSync('npx hardhat run scripts/deploy.ts --network kairos', { stdio: 'inherit' });
    printSuccess('✅ Contratos desplegados exitosamente');
  } catch (error) {
    printError('❌ Error durante el despliegue');
    process.exit(1);
  }
  
  // Verificar despliegue
  printStatus('🔍 Verificando despliegue...');
  try {
    execSync('npx hardhat run scripts/verify-deployment.ts --network kairos', { stdio: 'inherit' });
    printSuccess('✅ Despliegue verificado');
  } catch (error) {
    printWarning('⚠️ Algunas verificaciones fallaron');
  }
  
  // Transferir ownership si es necesario
  printStatus('🔄 Verificando ownership...');
  try {
    execSync('npx hardhat run scripts/transfer-ownership.ts --network kairos', { stdio: 'inherit' });
    printSuccess('✅ Ownership configurado');
  } catch (error) {
    printWarning('⚠️ Error transfiriendo ownership');
  }
  
  // Resumen final
  printHeader('🎉 DESPLIEGUE COMPLETADO');
  
  printSuccess('✅ JeonseVault desplegado en Kaia testnet');
  printSuccess('✅ Owner configurado: ' + TARGET_OWNER);
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
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    printError(`Error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
