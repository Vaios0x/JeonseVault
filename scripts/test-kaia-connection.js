#!/usr/bin/env node

/**
 * Script simple para probar la conexión a Kaia Testnet
 */

const { ethers } = require('ethers');

async function testKaiaConnection() {
  console.log('🔍 Probando conexión a Kaia Testnet...\n');

  // Configuración de Kaia Testnet
  const KAIROS_RPC_URL = 'https://public-en-kairos.node.kaia.io';
  const KAIROS_CHAIN_ID = 1001;

  try {
    // Crear provider
    const provider = new ethers.JsonRpcProvider(KAIROS_RPC_URL);
    
    console.log('📡 Conectando al RPC...');
    
    // Obtener información de la red
    const network = await provider.getNetwork();
    console.log(`✅ Conectado a: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== BigInt(KAIROS_CHAIN_ID)) {
      console.warn(`⚠️  ADVERTENCIA: Chain ID devuelto (${network.chainId}) no coincide con el esperado (${KAIROS_CHAIN_ID})`);
    } else {
      console.log('✅ Chain ID coincide correctamente');
    }
    
    // Obtener bloque actual
    const blockNumber = await provider.getBlockNumber();
    console.log(`📦 Bloque actual: ${blockNumber}`);
    
    // Obtener información de gas
    const feeData = await provider.getFeeData();
    console.log(`⛽ Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0, 'gwei')} Gwei`);
    
    console.log('\n🎉 Conexión exitosa! La configuración de Kaia está correcta.');
    
  } catch (error) {
    console.error('❌ Error al conectar:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verificar que la URL del RPC sea correcta');
    console.log('   2. Verificar conectividad a internet');
    console.log('   3. Verificar que el nodo Kaia esté funcionando');
    process.exit(1);
  }
}

// Ejecutar el script
testKaiaConnection();
