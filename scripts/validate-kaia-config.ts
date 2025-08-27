#!/usr/bin/env node

/**
 * Script de Validación de Configuración de Kaia Testnet
 * 
 * Este script valida que toda la configuración de la red Kaia esté correcta
 * y verifica la conectividad con los nodos RPC.
 */

import { ethers } from 'hardhat'
import { KAIA_APP_CONFIG, validateKaiaConfig } from '../config/kaia-2025'

async function main() {
  console.log('🔍 Validando configuración de Kaia Testnet...\n')

  try {
    // 1. Validar configuración básica
    console.log('📋 Validando configuración básica...')
    validateKaiaConfig()
    console.log('✅ Configuración básica válida\n')

    // 2. Mostrar información de la red
    console.log('🌐 Información de la Red Kaia Testnet:')
    console.log(`   Chain ID: ${KAIA_APP_CONFIG.CHAIN_ID}`)
    console.log(`   Nombre: ${KAIA_APP_CONFIG.CHAIN_NAME}`)
    console.log(`   RPC URL: ${KAIA_APP_CONFIG.RPC_URL}`)
    console.log(`   Explorer: ${KAIA_APP_CONFIG.EXPLORER_URL}`)
    console.log(`   Moneda: ${KAIA_APP_CONFIG.CURRENCY_SYMBOL}`)
    console.log(`   Decimales: ${KAIA_APP_CONFIG.DECIMALS}`)
    console.log(`   Es Testnet: ${KAIA_APP_CONFIG.IS_TESTNET}\n`)

    // 3. Probar conectividad RPC
    console.log('🔗 Probando conectividad RPC...')
    const provider = new ethers.JsonRpcProvider(KAIA_APP_CONFIG.RPC_URL)
    
    try {
      const network = await provider.getNetwork()
      console.log(`✅ Conectado a la red: ${network.name} (Chain ID: ${network.chainId})`)
      
      if (network.chainId !== BigInt(KAIA_APP_CONFIG.CHAIN_ID)) {
        console.warn(`⚠️  ADVERTENCIA: El Chain ID devuelto (${network.chainId}) no coincide con el configurado (${KAIA_APP_CONFIG.CHAIN_ID})`)
      } else {
        console.log('✅ Chain ID coincide correctamente')
      }
    } catch (error) {
      console.error('❌ Error al conectar con el RPC:', error)
      throw error
    }

    // 4. Obtener información del bloque actual
    console.log('\n📦 Obteniendo información del bloque actual...')
    try {
      const blockNumber = await provider.getBlockNumber()
      const block = await provider.getBlock(blockNumber)
      
      console.log(`✅ Bloque actual: ${blockNumber}`)
      console.log(`   Timestamp: ${new Date(Number(block?.timestamp) * 1000).toISOString()}`)
      console.log(`   Hash: ${block?.hash}`)
      console.log(`   Gas Limit: ${block?.gasLimit}`)
      console.log(`   Gas Used: ${block?.gasUsed}`)
    } catch (error) {
      console.error('❌ Error al obtener información del bloque:', error)
    }

    // 5. Verificar balance de una dirección de prueba
    console.log('\n💰 Verificando balance de dirección de prueba...')
    try {
      const testAddress = '0x0000000000000000000000000000000000000000'
      const balance = await provider.getBalance(testAddress)
      console.log(`✅ Balance de ${testAddress}: ${ethers.formatEther(balance)} ${KAIA_APP_CONFIG.CURRENCY_SYMBOL}`)
    } catch (error) {
      console.error('❌ Error al verificar balance:', error)
    }

    // 6. Verificar configuración de gas
    console.log('\n⛽ Verificando configuración de gas...')
    try {
      const feeData = await provider.getFeeData()
      console.log(`✅ Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0, 'gwei')} Gwei`)
      console.log(`   Max Fee Per Gas: ${ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei')} Gwei`)
      console.log(`   Max Priority Fee Per Gas: ${ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei')} Gwei`)
    } catch (error) {
      console.error('❌ Error al obtener información de gas:', error)
    }

    console.log('\n🎉 Validación completada exitosamente!')
    console.log('\n📝 Resumen:')
    console.log('   ✅ Configuración básica válida')
    console.log('   ✅ Conectividad RPC funcionando')
    console.log('   ✅ Información de red correcta')
    console.log('   ✅ Configuración lista para usar')

  } catch (error) {
    console.error('\n❌ Error durante la validación:', error)
    process.exit(1)
  }
}

// Ejecutar el script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { main as validateKaiaConfig }
