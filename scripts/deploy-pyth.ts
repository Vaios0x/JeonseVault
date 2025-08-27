#!/usr/bin/env ts-node

/**
 * Script de Despliegue con Pyth Network para JeonseVault
 * Despliega contratos usando Pyth Network como oráculo real
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

import { ethers } from 'hardhat'
import hre from 'hardhat'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { getPythConfig, DEFAULT_PYTH_CONFIG } from '../config/pyth'

// Cargar variables de entorno
config()

interface DeploymentConfig {
  network: string
  gasPrice?: string
  gasLimit?: number
  verify: boolean
  saveDeployment: boolean
  usePyth: boolean
}

interface DeployedContracts {
  [key: string]: {
    address: string
    constructorArgs: any[]
    verified: boolean
    deploymentTx: string
    blockNumber: number
  }
}

class PythContractDeployer {
  private deployedContracts: DeployedContracts = {}
  private deployer: any
  private network: string

  constructor(private config: DeploymentConfig) {
    this.network = config.network
  }

  async deploy() {
    console.log('🚀 Iniciando despliegue de contratos JeonseVault con Pyth Network...')
    console.log(`📡 Red: ${this.network}`)
    console.log(`🔗 Oracle: ${this.config.usePyth ? 'Pyth Network' : 'Chainlink'}`)
    console.log(`⛽ Gas Price: ${this.config.gasPrice || 'auto'}`)
    console.log(`🔍 Verificar: ${this.config.verify}`)
    console.log('')

    try {
      // Obtener signer
      const [deployer] = await ethers.getSigners()
      this.deployer = deployer

      console.log(`👤 Desplegando desde: ${deployer.address}`)
      console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`)
      console.log('')

      // Desplegar contratos en orden
      await this.deployPropertyOracle()
      await this.deployComplianceModule()
      await this.deployInvestmentPool()
      await this.deployJeonseVault()

      // Configurar roles y permisos
      await this.setupRoles()

      // Verificar contratos si es necesario
      if (this.config.verify) {
        await this.verifyContracts()
      }

      // Guardar información de despliegue
      if (this.config.saveDeployment) {
        await this.saveDeploymentInfo()
      }

      // Generar archivo de configuración
      await this.generateConfigFile()

      console.log('✅ Despliegue completado exitosamente!')
      this.printDeploymentSummary()

    } catch (error) {
      console.error('❌ Error durante el despliegue:', error)
      process.exit(1)
    }
  }

  private async getPythConfig(chainId: number) {
    const config = getPythConfig(chainId)
    if (!config) {
      console.log(`⚠️  No se encontró configuración de Pyth para chainId ${chainId}`)
      console.log(`🔧 Usando configuración por defecto para desarrollo`)
      return DEFAULT_PYTH_CONFIG
    }
    return config
  }

  private async deployPropertyOracle() {
    console.log('🏠 Desplegando PropertyOracle con Pyth Network...')
    
    // Obtener configuración de Pyth para la red actual
    const chainId = await this.deployer.provider.getNetwork().then((net: any) => net.chainId)
    const pythConfig = await this.getPythConfig(chainId)
    
    console.log(`🔗 Configuración Pyth: ${pythConfig.description}`)
    console.log(`📍 Contrato Pyth: ${pythConfig.pythContract}`)
    console.log(`💰 KRW/USD Price ID: ${pythConfig.krwUsdPriceId}`)
    console.log('')

    const PropertyOracle = await ethers.getContractFactory('PythOracle')
    const propertyOracle = await PropertyOracle.deploy()
    await propertyOracle.waitForDeployment()

    const address = await propertyOracle.getAddress()
    const deploymentTx = propertyOracle.deploymentTransaction()?.hash || ''

    this.deployedContracts['PythOracle'] = {
      address,
      constructorArgs: [],
      verified: false,
      deploymentTx,
      blockNumber: await propertyOracle.deploymentTransaction()?.blockNumber || 0
    }

    console.log(`✅ PythOracle desplegado en: ${address}`)
    console.log(`📝 TX: ${deploymentTx}`)
    console.log('')
  }

  private async deployComplianceModule() {
    console.log('🔒 Desplegando ComplianceModule...')
    
    const ComplianceModule = await ethers.getContractFactory('ComplianceModule')
    const complianceModule = await ComplianceModule.deploy()
    await complianceModule.waitForDeployment()

    const address = await complianceModule.getAddress()
    const deploymentTx = complianceModule.deploymentTransaction()?.hash || ''

    this.deployedContracts['ComplianceModule'] = {
      address,
      constructorArgs: [],
      verified: false,
      deploymentTx,
      blockNumber: await complianceModule.deploymentTransaction()?.blockNumber || 0
    }

    console.log(`✅ ComplianceModule desplegado en: ${address}`)
    console.log(`📝 TX: ${deploymentTx}`)
    console.log('')
  }

  private async deployInvestmentPool() {
    console.log('💰 Desplegando InvestmentPool...')
    
    const InvestmentPool = await ethers.getContractFactory('InvestmentPool')
    const investmentPool = await InvestmentPool.deploy()
    await investmentPool.waitForDeployment()

    const address = await investmentPool.getAddress()
    const deploymentTx = investmentPool.deploymentTransaction()?.hash || ''

    this.deployedContracts['InvestmentPool'] = {
      address,
      constructorArgs: [],
      verified: false,
      deploymentTx,
      blockNumber: await investmentPool.deploymentTransaction()?.blockNumber || 0
    }

    console.log(`✅ InvestmentPool desplegado en: ${address}`)
    console.log(`📝 TX: ${deploymentTx}`)
    console.log('')
  }

  private async deployJeonseVault() {
    console.log('🏦 Desplegando JeonseVault...')
    
    const propertyOracleAddress = this.deployedContracts['PythOracle'].address
    const complianceModuleAddress = this.deployedContracts['ComplianceModule'].address
    const investmentPoolAddress = this.deployedContracts['InvestmentPool'].address

    const JeonseVault = await ethers.getContractFactory('JeonseVault')
    const jeonseVault = await JeonseVault.deploy(
      propertyOracleAddress,
      complianceModuleAddress,
      investmentPoolAddress
    )
    await jeonseVault.waitForDeployment()

    const address = await jeonseVault.getAddress()
    const deploymentTx = jeonseVault.deploymentTransaction()?.hash || ''

    this.deployedContracts['JeonseVault'] = {
      address,
      constructorArgs: [propertyOracleAddress, complianceModuleAddress, investmentPoolAddress],
      verified: false,
      deploymentTx,
      blockNumber: await jeonseVault.deploymentTransaction()?.blockNumber || 0
    }

    console.log(`✅ JeonseVault desplegado en: ${address}`)
    console.log(`📝 TX: ${deploymentTx}`)
    console.log('')
  }

  private async setupRoles() {
    console.log('🔧 Configurando roles y permisos...')

    try {
      // Obtener instancias de contratos
      const propertyOracle = await ethers.getContractAt('PythOracle', this.deployedContracts['PythOracle'].address)
      const complianceModule = await ethers.getContractAt('ComplianceModule', this.deployedContracts['ComplianceModule'].address)
      const investmentPool = await ethers.getContractAt('InvestmentPool', this.deployedContracts['InvestmentPool'].address)
      const jeonseVault = await ethers.getContractAt('JeonseVault', this.deployedContracts['JeonseVault'].address)

      // Configurar roles en PropertyOracle
      const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"))
      const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"))
      
      await propertyOracle.grantRole(ORACLE_ROLE, this.deployer.address)
      await propertyOracle.grantRole(VERIFIER_ROLE, this.deployer.address)
      console.log('✅ Roles configurados en PythOracle')

      // Configurar roles en ComplianceModule
      await complianceModule.grantRole(VERIFIER_ROLE, this.deployer.address)
      const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"))
      await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, this.deployer.address)
      console.log('✅ Roles configurados en ComplianceModule')

      // Configurar roles en InvestmentPool
      const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"))
      await investmentPool.grantRole(VAULT_ROLE, this.deployedContracts['JeonseVault'].address)
      console.log('✅ Roles configurados en InvestmentPool')

      console.log('✅ Todos los roles configurados correctamente')
      console.log('')

    } catch (error) {
      console.error('❌ Error configurando roles:', error)
      throw error
    }
  }

  private async verifyContracts() {
    console.log('🔍 Verificando contratos en el explorador...')

    for (const [contractName, contractInfo] of Object.entries(this.deployedContracts)) {
      try {
        console.log(`🔍 Verificando ${contractName}...`)
        
        await this.verifyContract(contractName, contractInfo.address, contractInfo.constructorArgs)
        
        this.deployedContracts[contractName].verified = true
        console.log(`✅ ${contractName} verificado`)
        
      } catch (error) {
        console.warn(`⚠️ No se pudo verificar ${contractName}:`, error)
      }
    }

    console.log('')
  }

  private async verifyContract(contractName: string, address: string, constructorArgs: any[]) {
    try {
      await hre.run('verify:verify', {
        address,
        constructorArguments: constructorArgs,
      })
    } catch (error: any) {
      if (error.message.includes('Already Verified')) {
        console.log(`ℹ️ ${contractName} ya está verificado`)
      } else {
        throw error
      }
    }
  }

  private async saveDeploymentInfo() {
    const deploymentInfo = {
      network: this.network,
      deployer: this.deployer.address,
      timestamp: new Date().toISOString(),
      oracle: 'Pyth Network',
      contracts: this.deployedContracts
    }

    const deploymentPath = path.join(__dirname, '..', 'deployments', `${this.network}-pyth.json`)
    
    // Crear directorio si no existe
    const deploymentDir = path.dirname(deploymentPath)
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true })
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
    console.log(`📄 Información de despliegue guardada en: ${deploymentPath}`)
  }

  private async generateConfigFile() {
    const configContent = `// Configuración generada automáticamente después del despliegue con Pyth
export const DEPLOYED_CONTRACTS = {
  JEONSE_VAULT: '${this.deployedContracts['JeonseVault'].address}',
  INVESTMENT_POOL: '${this.deployedContracts['InvestmentPool'].address}',
  PYTH_ORACLE: '${this.deployedContracts['PythOracle'].address}',
  COMPLIANCE_MODULE: '${this.deployedContracts['ComplianceModule'].address}',
} as const

export const DEPLOYMENT_INFO = {
  network: '${this.network}',
  deployer: '${this.deployer.address}',
  timestamp: '${new Date().toISOString()}',
  oracle: 'Pyth Network',
  contracts: ${JSON.stringify(this.deployedContracts, null, 2)}
} as const
`

    const configPath = path.join(__dirname, '..', 'lib', 'deployed-contracts-pyth.ts')
    fs.writeFileSync(configPath, configContent)
    console.log(`📄 Archivo de configuración generado: ${configPath}`)
  }

  private printDeploymentSummary() {
    console.log('📊 RESUMEN DEL DESPLIEGUE CON PYTH')
    console.log('==================================')
    console.log(`🌐 Red: ${this.network}`)
    console.log(`🔗 Oracle: Pyth Network`)
    console.log(`👤 Desplegador: ${this.deployer.address}`)
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`)
    console.log('')
    console.log('📋 Contratos Desplegados:')
    
    for (const [contractName, contractInfo] of Object.entries(this.deployedContracts)) {
      console.log(`   ${contractName}: ${contractInfo.address}`)
      console.log(`   📝 TX: ${contractInfo.deploymentTx}`)
      console.log(`   🔍 Verificado: ${contractInfo.verified ? '✅' : '❌'}`)
      console.log('')
    }

    console.log('🔗 Variables de entorno a configurar:')
    console.log(`NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=${this.deployedContracts['JeonseVault'].address}`)
    console.log(`NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=${this.deployedContracts['InvestmentPool'].address}`)
    console.log(`NEXT_PUBLIC_PYTH_ORACLE_ADDRESS=${this.deployedContracts['PythOracle'].address}`)
    console.log(`NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=${this.deployedContracts['ComplianceModule'].address}`)
    console.log('')
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2)
  
  // Configuración por defecto
  const config: DeploymentConfig = {
    network: hre.network.name,
    gasPrice: undefined,
    gasLimit: undefined,
    verify: args.includes('--verify') || args.includes('-v'),
    saveDeployment: true,
    usePyth: true
  }

  // Procesar argumentos
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Script de Despliegue con Pyth Network - JeonseVault

Uso: npx hardhat run scripts/deploy-pyth.ts --network <network> [opciones]

Opciones:
  --verify, -v     Verificar contratos en el explorador
  --no-save        No guardar información de despliegue
  --gas-price      Especificar gas price (en wei)
  --gas-limit      Especificar gas limit
  --help, -h       Mostrar esta ayuda

Ejemplos:
  npx hardhat run scripts/deploy-pyth.ts --network kairos
  npx hardhat run scripts/deploy-pyth.ts --network mainnet --verify
  npx hardhat run scripts/deploy-pyth.ts --network localhost --gas-price 20000000000
    `)
    return
  }

  // Crear y ejecutar deployer
  const deployer = new PythContractDeployer(config)
  await deployer.deploy()
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { PythContractDeployer }
export type { DeploymentConfig, DeployedContracts }
