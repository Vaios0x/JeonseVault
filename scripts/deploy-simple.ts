/**
 * Script de Despliegue Simplificado para JeonseVault en Kaia Testnet
 * 
 * @author JeonseVault Team
 * @version 2.0.0
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

interface DeployedContracts {
  [key: string]: {
    address: string
    constructorArgs: any[]
    deploymentTx: string
    blockNumber: number
  }
}

async function main() {
  console.log('🚀 Iniciando despliegue de contratos JeonseVault en Kaia Testnet...')
  console.log('')

  try {
    // Obtener signer
    const [deployer] = await ethers.getSigners()
    console.log(`👤 Desplegando desde: ${deployer.address}`)
    
    // Verificar balance
    const balance = await deployer.provider.getBalance(deployer.address)
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`)
    console.log('')

    if (balance < ethers.parseEther('0.1')) {
      throw new Error('Balance insuficiente para deployment. Necesitas al menos 0.1 ETH')
    }

    const deployedContracts: DeployedContracts = {}

    // 1. Desplegar PropertyOracle
    console.log('🏠 Desplegando PropertyOracle...')
    const PropertyOracle = await ethers.getContractFactory('PropertyOracle')
    const propertyOracle = await PropertyOracle.deploy()
    await propertyOracle.waitForDeployment()
    const propertyOracleAddress = await propertyOracle.getAddress()
    
    deployedContracts['PropertyOracle'] = {
      address: propertyOracleAddress,
      constructorArgs: [],
      deploymentTx: propertyOracle.deploymentTransaction()?.hash || '',
      blockNumber: propertyOracle.deploymentTransaction()?.blockNumber || 0
    }
    console.log(`✅ PropertyOracle desplegado en: ${propertyOracleAddress}`)

    // 2. Desplegar ComplianceModule
    console.log('🔒 Desplegando ComplianceModule...')
    const ComplianceModule = await ethers.getContractFactory('ComplianceModule')
    const complianceModule = await ComplianceModule.deploy()
    await complianceModule.waitForDeployment()
    const complianceModuleAddress = await complianceModule.getAddress()
    
    deployedContracts['ComplianceModule'] = {
      address: complianceModuleAddress,
      constructorArgs: [],
      deploymentTx: complianceModule.deploymentTransaction()?.hash || '',
      blockNumber: complianceModule.deploymentTransaction()?.blockNumber || 0
    }
    console.log(`✅ ComplianceModule desplegado en: ${complianceModuleAddress}`)

    // 3. Desplegar InvestmentPool
    console.log('💰 Desplegando InvestmentPool...')
    const InvestmentPool = await ethers.getContractFactory('InvestmentPool')
    const investmentPool = await InvestmentPool.deploy()
    await investmentPool.waitForDeployment()
    const investmentPoolAddress = await investmentPool.getAddress()
    
    deployedContracts['InvestmentPool'] = {
      address: investmentPoolAddress,
      constructorArgs: [],
      deploymentTx: investmentPool.deploymentTransaction()?.hash || '',
      blockNumber: investmentPool.deploymentTransaction()?.blockNumber || 0
    }
    console.log(`✅ InvestmentPool desplegado en: ${investmentPoolAddress}`)

    // 4. Desplegar JeonseVault
    console.log('🏦 Desplegando JeonseVault...')
    const JeonseVault = await ethers.getContractFactory('JeonseVault')
    const jeonseVault = await JeonseVault.deploy(
      propertyOracleAddress,
      complianceModuleAddress,
      investmentPoolAddress
    )
    await jeonseVault.waitForDeployment()
    const jeonseVaultAddress = await jeonseVault.getAddress()
    
    deployedContracts['JeonseVault'] = {
      address: jeonseVaultAddress,
      constructorArgs: [propertyOracleAddress, complianceModuleAddress, investmentPoolAddress],
      deploymentTx: jeonseVault.deploymentTransaction()?.hash || '',
      blockNumber: jeonseVault.deploymentTransaction()?.blockNumber || 0
    }
    console.log(`✅ JeonseVault desplegado en: ${jeonseVaultAddress}`)

    // 5. Configurar roles y permisos
    console.log('🔧 Configurando roles y permisos...')
    
    // Configurar roles en PropertyOracle
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"))
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"))
    
    await propertyOracle.grantRole(ORACLE_ROLE, deployer.address)
    await propertyOracle.grantRole(VERIFIER_ROLE, deployer.address)
    console.log('✅ Roles configurados en PropertyOracle')

    // Configurar roles en ComplianceModule
    const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"))
    
    await complianceModule.grantRole(VERIFIER_ROLE, deployer.address)
    await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, deployer.address)
    console.log('✅ Roles configurados en ComplianceModule')

    // Configurar roles en InvestmentPool
    const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"))
    
    await investmentPool.grantRole(VAULT_ROLE, jeonseVaultAddress)
    console.log('✅ Roles configurados en InvestmentPool')

    // 6. Guardar información de deployment
    console.log('💾 Guardando información de deployment...')
    
    const deploymentInfo = {
      network: 'kairos',
      deployer: deployer.address,
      deploymentDate: new Date().toISOString(),
      contracts: deployedContracts
    }

    // Guardar en archivo JSON
    const deploymentPath = path.join(__dirname, '..', 'deployment-kairos.json')
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
    console.log(`✅ Información guardada en: ${deploymentPath}`)

    // 7. Generar archivo de configuración para frontend
    console.log('⚙️ Generando configuración para frontend...')
    
    const envConfig = `# ============================================================================
# CONFIGURACIÓN DE DESPLIEGUE - KAIA TESTNET
# ============================================================================
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# ============================================================================
# WALLET Y PRIVATE KEY
# ============================================================================
PRIVATE_KEY=a664aeeb847952b84144df7b9fdecec732e834fc89487b9e0db11deb26fcceba
WALLET_ADDRESS=0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1

# ============================================================================
# RED KAIA TESTNET
# ============================================================================
NEXT_PUBLIC_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_CHAIN_ID=1001
NEXT_PUBLIC_EXPLORER_URL=https://baobab.klaytnscope.com

# ============================================================================
# CONTRATOS DESPLEGADOS EN KAIA TESTNET
# ============================================================================
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x6287ac251C19bFDfc7AE8247D64B952727855Dae
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0xF38701CCCE9190D1445c8cB3561104e811CB1468
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0xf18Fa2873244423cb2247C2b64B5992418001702

# ============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================================
NEXT_PUBLIC_APP_NAME=JeonseVault
NEXT_PUBLIC_APP_DESCRIPTION=Plataforma de depósitos Jeonse con blockchain
NEXT_PUBLIC_APP_URL=https://jeonsevault.com

# ============================================================================
# CONFIGURACIÓN DE DESARROLLO
# ============================================================================
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_TESTNET=true`

    const envPath = path.join(__dirname, '..', '.env.local')
    fs.writeFileSync(envPath, envConfig)
    console.log(`✅ Configuración guardada en: ${envPath}`)

    // 8. Resumen final
    console.log('')
    console.log('🎉 ¡Despliegue completado exitosamente!')
    console.log('')
    console.log('📋 Resumen de contratos desplegados:')
    console.log(`   🏦 JeonseVault: ${jeonseVaultAddress}`)
    console.log(`   💰 InvestmentPool: ${investmentPoolAddress}`)
    console.log(`   🏠 PropertyOracle: ${propertyOracleAddress}`)
    console.log(`   🔒 ComplianceModule: ${complianceModuleAddress}`)
    console.log('')
    console.log('🔗 Explorer: https://baobab.klaytnscope.com')
    console.log('')
    console.log('🚀 Próximos pasos:')
    console.log('   1. Copiar las direcciones de contratos al archivo .env.local')
    console.log('   2. Ejecutar: npm run build')
    console.log('   3. Ejecutar: npm run start')
    console.log('   4. Probar la aplicación en http://localhost:3000')

  } catch (error) {
    console.error('❌ Error durante el despliegue:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
