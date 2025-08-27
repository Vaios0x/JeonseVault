#!/usr/bin/env node

/**
 * Script de Despliegue - JeonseVault en Kaia Testnet
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

const TARGET_OWNER = '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1';

async function main() {
  console.log('🚀 Iniciando despliegue de JeonseVault en Kaia testnet...');
  console.log(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  console.log('');

  try {
    // Obtener signer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Desplegando desde: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
    console.log('');

    // Desplegar PropertyOracle
    console.log('🏠 Desplegando PropertyOracle...');
    const PropertyOracle = await ethers.getContractFactory('PropertyOracle');
    const propertyOracle = await PropertyOracle.deploy();
    await propertyOracle.waitForDeployment();
    const propertyOracleAddress = await propertyOracle.getAddress();
    console.log(`✅ PropertyOracle desplegado en: ${propertyOracleAddress}`);

    // Desplegar ComplianceModule
    console.log('🔒 Desplegando ComplianceModule...');
    const ComplianceModule = await ethers.getContractFactory('ComplianceModule');
    const complianceModule = await ComplianceModule.deploy();
    await complianceModule.waitForDeployment();
    const complianceModuleAddress = await complianceModule.getAddress();
    console.log(`✅ ComplianceModule desplegado en: ${complianceModuleAddress}`);

    // Desplegar InvestmentPool
    console.log('💰 Desplegando InvestmentPool...');
    const InvestmentPool = await ethers.getContractFactory('InvestmentPool');
    const investmentPool = await InvestmentPool.deploy();
    await investmentPool.waitForDeployment();
    const investmentPoolAddress = await investmentPool.getAddress();
    console.log(`✅ InvestmentPool desplegado en: ${investmentPoolAddress}`);

    // Desplegar JeonseVault
    console.log('🏦 Desplegando JeonseVault...');
    const JeonseVault = await ethers.getContractFactory('JeonseVault');
    const jeonseVault = await JeonseVault.deploy(
      propertyOracleAddress,
      complianceModuleAddress,
      investmentPoolAddress
    );
    await jeonseVault.waitForDeployment();
    const jeonseVaultAddress = await jeonseVault.getAddress();
    console.log(`✅ JeonseVault desplegado en: ${jeonseVaultAddress}`);

    // Configurar roles
    console.log('🔧 Configurando roles...');
    
    // PropertyOracle roles
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));
    await propertyOracle.grantRole(ORACLE_ROLE, deployer.address);
    await propertyOracle.grantRole(VERIFIER_ROLE, deployer.address);
    console.log('✅ Roles configurados en PropertyOracle');

    // ComplianceModule roles
    const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"));
    await complianceModule.grantRole(VERIFIER_ROLE, deployer.address);
    await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, deployer.address);
    console.log('✅ Roles configurados en ComplianceModule');

    // InvestmentPool roles
    const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"));
    await investmentPool.grantRole(VAULT_ROLE, jeonseVaultAddress);
    console.log('✅ Roles configurados en InvestmentPool');

    // Guardar información de despliegue
    const deploymentInfo = {
      network: 'kairos',
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        PropertyOracle: {
          address: propertyOracleAddress,
          constructorArgs: [],
          deploymentTx: propertyOracle.deploymentTransaction()?.hash || '',
          blockNumber: propertyOracle.deploymentTransaction()?.blockNumber || 0
        },
        ComplianceModule: {
          address: complianceModuleAddress,
          constructorArgs: [],
          deploymentTx: complianceModule.deploymentTransaction()?.hash || '',
          blockNumber: complianceModule.deploymentTransaction()?.blockNumber || 0
        },
        InvestmentPool: {
          address: investmentPoolAddress,
          constructorArgs: [],
          deploymentTx: investmentPool.deploymentTransaction()?.hash || '',
          blockNumber: investmentPool.deploymentTransaction()?.blockNumber || 0
        },
        JeonseVault: {
          address: jeonseVaultAddress,
          constructorArgs: [propertyOracleAddress, complianceModuleAddress, investmentPoolAddress],
          deploymentTx: jeonseVault.deploymentTransaction()?.hash || '',
          blockNumber: jeonseVault.deploymentTransaction()?.blockNumber || 0
        }
      }
    };

    // Crear directorio deployments si no existe
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Guardar archivo de despliegue
    const deploymentPath = path.join(deploymentsDir, 'kairos.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Información de despliegue guardada en: ${deploymentPath}`);

    // Actualizar .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Actualizar direcciones
      envContent = envContent.replace(
        /NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x0000000000000000000000000000000000000000/,
        `NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=${jeonseVaultAddress}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0x0000000000000000000000000000000000000000/,
        `NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=${investmentPoolAddress}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000/,
        `NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=${propertyOracleAddress}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0x0000000000000000000000000000000000000000/,
        `NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=${complianceModuleAddress}`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local actualizado con las direcciones de contratos');
    }

    // Resumen final
    console.log('');
    console.log('🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE!');
    console.log('=====================================');
    console.log(`🌐 Red: Kaia Testnet (Chain ID: 1001)`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🎯 Owner objetivo: ${TARGET_OWNER}`);
    console.log('');
    console.log('📋 Contratos Desplegados:');
    console.log(`   JeonseVault: ${jeonseVaultAddress}`);
    console.log(`   InvestmentPool: ${investmentPoolAddress}`);
    console.log(`   PropertyOracle: ${propertyOracleAddress}`);
    console.log(`   ComplianceModule: ${complianceModuleAddress}`);
    console.log('');
    console.log('🔗 Explorador: https://explorer.kaia.io');
    console.log('📄 Archivos generados:');
    console.log(`   - deployments/kairos.json`);
    console.log(`   - .env.local (actualizado)`);
    console.log('');
    console.log('⚠️ PRÓXIMOS PASOS:');
    console.log('1. Verificar contratos en el explorador de Kaia');
    console.log('2. Transferir ownership si es necesario');
    console.log('3. Probar la funcionalidad de los contratos');

  } catch (error) {
    console.error('❌ Error durante el despliegue:', error);
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
