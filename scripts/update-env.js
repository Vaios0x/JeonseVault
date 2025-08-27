#!/usr/bin/env node

/**
 * Script para actualizar el archivo .env.local con las direcciones de contratos
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📝 Actualizando archivo .env.local...');

  try {
    // Leer información de despliegue
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'kairos.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('No se encontró información de despliegue.');
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    // Crear contenido del archivo .env.local
    const envContent = `# ============================================================================
# CONFIGURACIÓN DE DESPLIEGUE - KAIA TESTNET
# ============================================================================

# Private Key para el despliegue
PRIVATE_KEY=tu_private_key_aqui

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
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=${deployment.contracts.JeonseVault.address}

# Investment Pool Contract
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=${deployment.contracts.InvestmentPool.address}

# Property Oracle Contract
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=${deployment.contracts.PropertyOracle.address}

# Compliance Module Contract
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=${deployment.contracts.ComplianceModule.address}

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

    // Escribir archivo .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Archivo .env.local actualizado correctamente');
    console.log('');
    console.log('📋 Direcciones de contratos:');
    console.log(`   JeonseVault: ${deployment.contracts.JeonseVault.address}`);
    console.log(`   InvestmentPool: ${deployment.contracts.InvestmentPool.address}`);
    console.log(`   PropertyOracle: ${deployment.contracts.PropertyOracle.address}`);
    console.log(`   ComplianceModule: ${deployment.contracts.ComplianceModule.address}`);
    console.log('');
    console.log('⚠️ Recuerda configurar tu PRIVATE_KEY en el archivo .env.local');

  } catch (error) {
    console.error('❌ Error actualizando .env.local:', error);
    throw error;
  }
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
