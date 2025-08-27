#!/usr/bin/env node

import { ethers } from "hardhat"
import hre from "hardhat"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

async function main() {
  console.log("🚀 Iniciando deployment completo de JeonseVault...\n")

  // Obtener signers
  const [deployer] = await ethers.getSigners()
  console.log(`📝 Deployer: ${deployer.address}`)
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} KAIA\n`)

  // 1. Deploy PropertyOracle
  console.log("🏗️  Deploying PropertyOracle...")
  const PropertyOracle = await ethers.getContractFactory("PropertyOracle")
  const propertyOracle = await PropertyOracle.deploy()
  await propertyOracle.waitForDeployment()
  const propertyOracleAddress = await propertyOracle.getAddress()
  console.log(`✅ PropertyOracle deployed to: ${propertyOracleAddress}`)

  // 2. Deploy ComplianceModule
  console.log("\n🏗️  Deploying ComplianceModule...")
  const ComplianceModule = await ethers.getContractFactory("ComplianceModule")
  const complianceModule = await ComplianceModule.deploy()
  await complianceModule.waitForDeployment()
  const complianceModuleAddress = await complianceModule.getAddress()
  console.log(`✅ ComplianceModule deployed to: ${complianceModuleAddress}`)

  // 3. Deploy InvestmentPool
  console.log("\n🏗️  Deploying InvestmentPool...")
  const InvestmentPool = await ethers.getContractFactory("InvestmentPool")
  const investmentPool = await InvestmentPool.deploy()
  await investmentPool.waitForDeployment()
  const investmentPoolAddress = await investmentPool.getAddress()
  console.log(`✅ InvestmentPool deployed to: ${investmentPoolAddress}`)

  // 4. Deploy JeonseVault
  console.log("\n🏗️  Deploying JeonseVault...")
  const JeonseVault = await ethers.getContractFactory("JeonseVault")
  const jeonseVault = await JeonseVault.deploy(
    propertyOracleAddress,
    complianceModuleAddress,
    investmentPoolAddress
  )
  await jeonseVault.waitForDeployment()
  const jeonseVaultAddress = await jeonseVault.getAddress()
  console.log(`✅ JeonseVault deployed to: ${jeonseVaultAddress}`)

  // 5. Configurar roles
  console.log("\n🔐 Configurando roles...")
  
  // PropertyOracle roles
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"))
  const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"))
  
  await propertyOracle.grantRole(ORACLE_ROLE, deployer.address)
  await propertyOracle.grantRole(VERIFIER_ROLE, deployer.address)
  console.log("✅ PropertyOracle roles configured")

  // ComplianceModule roles
  const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"))
  
  await complianceModule.grantRole(VERIFIER_ROLE, deployer.address)
  await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, deployer.address)
  console.log("✅ ComplianceModule roles configured")

  // InvestmentPool roles
  const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"))
  
  await investmentPool.grantRole(VAULT_ROLE, jeonseVaultAddress)
  console.log("✅ InvestmentPool roles configured")

  // 6. Configurar datos de prueba
  console.log("\n📊 Configurando datos de prueba...")

  // Registrar propiedades de prueba
  const testProperties = [
    {
      id: "demo-property-001",
      address: "서울특별시 강남구 역삼동 101호",
      value: ethers.parseEther("500000000"), // 500M KRW
      type: 0 // Apartment
    },
    {
      id: "demo-property-002", 
      address: "서울특별시 서초구 서초동 202호",
      value: ethers.parseEther("800000000"), // 800M KRW
      type: 0 // Apartment
    },
    {
      id: "demo-property-003",
      address: "서울특별시 마포구 합정동 303호", 
      value: ethers.parseEther("300000000"), // 300M KRW
      type: 1 // House
    }
  ]

  for (const prop of testProperties) {
    await propertyOracle.registerProperty(
      prop.id,
      prop.address,
      deployer.address,
      prop.value,
      prop.type
    )
    await propertyOracle.verifyProperty(prop.id)
    console.log(`✅ Property registered: ${prop.id}`)
  }

  // Verificar usuarios de prueba
  const testUsers = [
    {
      address: deployer.address,
      name: "테스트 사용자",
      idNumber: ethers.keccak256(ethers.toUtf8Bytes("test-id-001")),
      phone: "010-1234-5678",
      bank: "테스트은행 123-456-789",
      level: 2 // Premium
    }
  ]

  for (const user of testUsers) {
    await complianceModule.verifyUser(
      user.address,
      user.name,
      user.idNumber,
      user.phone,
      user.bank,
      user.level
    )
    console.log(`✅ User verified: ${user.name}`)
  }

  // 7. Guardar direcciones de contratos
  console.log("\n💾 Guardando direcciones de contratos...")
  
  const deploymentInfo = {
    network: "kairos",
    deployer: deployer.address,
    contracts: {
      JeonseVault: jeonseVaultAddress,
      InvestmentPool: investmentPoolAddress,
      PropertyOracle: propertyOracleAddress,
      ComplianceModule: complianceModuleAddress
    },
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  }

  // Crear directorio deployments si no existe
  const deploymentsDir = join(__dirname, "..", "deployments")
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true })
  }

  // Guardar información de deployment
  writeFileSync(
    join(deploymentsDir, "kairos.json"),
    JSON.stringify(deploymentInfo, null, 2)
  )

  // Generar archivo .env con las direcciones
  const envContent = `# Contract Addresses - Kaia Testnet (Kairos)
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x6287ac251C19bFDfc7AE8247D64B952727855Dae
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0xF38701CCCE9190D1445c8cB3561104e811CB1468
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0xf18Fa2873244423cb2247C2b64B5992418001702

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1001
NEXT_PUBLIC_KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
`

  writeFileSync(
    join(__dirname, "..", ".env.local"),
    envContent
  )

  console.log("✅ Deployment info saved to deployments/kairos.json")
  console.log("✅ Environment variables saved to .env.local")

  // 8. Verificar contratos (opcional)
  console.log("\n🔍 Verificando contratos...")
  
  try {
    // Verificar PropertyOracle
    await hre.run("verify:verify", {
      address: propertyOracleAddress,
      constructorArguments: [],
    })
    console.log("✅ PropertyOracle verified")

    // Verificar ComplianceModule
    await hre.run("verify:verify", {
      address: complianceModuleAddress,
      constructorArguments: [],
    })
    console.log("✅ ComplianceModule verified")

    // Verificar InvestmentPool
    await hre.run("verify:verify", {
      address: investmentPoolAddress,
      constructorArguments: [],
    })
    console.log("✅ InvestmentPool verified")

    // Verificar JeonseVault
    await hre.run("verify:verify", {
      address: jeonseVaultAddress,
      constructorArguments: [
        propertyOracleAddress,
        complianceModuleAddress,
        investmentPoolAddress
      ],
    })
    console.log("✅ JeonseVault verified")
  } catch (error) {
    console.log("⚠️  Contract verification failed (this is normal for testnets)")
    console.log("   Error:", error instanceof Error ? error.message : String(error))
  }

  // 9. Resumen final
  console.log("\n🎉 Deployment completado exitosamente!")
  console.log("\n📋 Resumen:")
  console.log(`   JeonseVault: ${jeonseVaultAddress}`)
  console.log(`   InvestmentPool: ${investmentPoolAddress}`)
  console.log(`   PropertyOracle: ${propertyOracleAddress}`)
  console.log(`   ComplianceModule: ${complianceModuleAddress}`)
  
  console.log("\n🔗 Explorer URLs:")
  console.log(`   JeonseVault: https://baobab.klaytnscope.com/address/${jeonseVaultAddress}`)
  console.log(`   InvestmentPool: https://baobab.klaytnscope.com/address/${investmentPoolAddress}`)
  console.log(`   PropertyOracle: https://baobab.klaytnscope.com/address/${propertyOracleAddress}`)
  console.log(`   ComplianceModule: https://baobab.klaytnscope.com/address/${complianceModuleAddress}`)
  
  console.log("\n📝 Próximos pasos:")
  console.log("   1. Copia las direcciones de .env.local a tu entorno")
  console.log("   2. Ejecuta 'npm run dev' para iniciar el frontend")
  console.log("   3. Conecta tu wallet a Kaia Testnet")
  console.log("   4. Prueba las funcionalidades de la aplicación")
  
  console.log("\n🚀 ¡JeonseVault está listo para usar!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
