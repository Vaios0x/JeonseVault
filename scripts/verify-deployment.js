#!/usr/bin/env node

/**
 * Script para verificar el despliegue y configuración de ownership
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

const TARGET_OWNER = '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1';

async function main() {
  console.log('🔍 Verificando despliegue y configuración...');
  console.log(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  console.log('');

  try {
    // Leer información de despliegue
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'kairos.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('No se encontró información de despliegue.');
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log(`📄 Información de despliegue cargada para red: ${deployment.network}`);
    console.log(`👤 Deployer registrado: ${deployment.deployer}`);
    console.log('');

    // Verificar que los contratos estén desplegados
    console.log('📋 Verificando contratos desplegados:');
    
    for (const [contractName, contractInfo] of Object.entries(deployment.contracts)) {
      console.log(`   ${contractName}: ${contractInfo.address}`);
      
      // Verificar que el contrato existe en la blockchain
      try {
        const code = await ethers.provider.getCode(contractInfo.address);
        if (code === '0x') {
          console.log(`   ❌ ${contractName} no está desplegado en la blockchain`);
        } else {
          console.log(`   ✅ ${contractName} está desplegado correctamente`);
        }
      } catch (error) {
        console.log(`   ⚠️ No se pudo verificar ${contractName}: ${error.message}`);
      }
    }

    console.log('');

    // Verificar ownership y roles
    console.log('🔐 Verificando ownership y roles:');

    // Verificar JeonseVault
    console.log('🏦 Verificando JeonseVault...');
    const jeonseVault = await ethers.getContractAt('JeonseVault', deployment.contracts.JeonseVault.address);
    
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

    const jeonseVaultHasAdminRole = await jeonseVault.hasRole(ADMIN_ROLE, TARGET_OWNER);
    const jeonseVaultHasDefaultAdminRole = await jeonseVault.hasRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    
    console.log(`   ADMIN_ROLE: ${jeonseVaultHasAdminRole ? '✅' : '❌'}`);
    console.log(`   DEFAULT_ADMIN_ROLE: ${jeonseVaultHasDefaultAdminRole ? '✅' : '❌'}`);

    // Verificar PropertyOracle
    console.log('🏠 Verificando PropertyOracle...');
    const propertyOracle = await ethers.getContractAt('PropertyOracle', deployment.contracts.PropertyOracle.address);
    
    const ORACLE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    const propertyOracleHasAdminRole = await propertyOracle.hasRole(ORACLE_ADMIN_ROLE, TARGET_OWNER);
    const propertyOracleHasDefaultAdminRole = await propertyOracle.hasRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    const propertyOracleHasOracleRole = await propertyOracle.hasRole(ORACLE_ROLE, TARGET_OWNER);
    const propertyOracleHasVerifierRole = await propertyOracle.hasRole(VERIFIER_ROLE, TARGET_OWNER);
    
    console.log(`   ADMIN_ROLE: ${propertyOracleHasAdminRole ? '✅' : '❌'}`);
    console.log(`   DEFAULT_ADMIN_ROLE: ${propertyOracleHasDefaultAdminRole ? '✅' : '❌'}`);
    console.log(`   ORACLE_ROLE: ${propertyOracleHasOracleRole ? '✅' : '❌'}`);
    console.log(`   VERIFIER_ROLE: ${propertyOracleHasVerifierRole ? '✅' : '❌'}`);

    // Verificar ComplianceModule
    console.log('🔒 Verificando ComplianceModule...');
    const complianceModule = await ethers.getContractAt('ComplianceModule', deployment.contracts.ComplianceModule.address);
    
    const COMPLIANCE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"));
    const COMPLIANCE_VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    const complianceHasAdminRole = await complianceModule.hasRole(COMPLIANCE_ADMIN_ROLE, TARGET_OWNER);
    const complianceHasDefaultAdminRole = await complianceModule.hasRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    const complianceHasOfficerRole = await complianceModule.hasRole(COMPLIANCE_OFFICER_ROLE, TARGET_OWNER);
    const complianceHasVerifierRole = await complianceModule.hasRole(COMPLIANCE_VERIFIER_ROLE, TARGET_OWNER);
    
    console.log(`   ADMIN_ROLE: ${complianceHasAdminRole ? '✅' : '❌'}`);
    console.log(`   DEFAULT_ADMIN_ROLE: ${complianceHasDefaultAdminRole ? '✅' : '❌'}`);
    console.log(`   COMPLIANCE_OFFICER_ROLE: ${complianceHasOfficerRole ? '✅' : '❌'}`);
    console.log(`   VERIFIER_ROLE: ${complianceHasVerifierRole ? '✅' : '❌'}`);

    // Verificar InvestmentPool
    console.log('💰 Verificando InvestmentPool...');
    const investmentPool = await ethers.getContractAt('InvestmentPool', deployment.contracts.InvestmentPool.address);
    
    const POOL_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"));

    const poolHasAdminRole = await investmentPool.hasRole(POOL_ADMIN_ROLE, TARGET_OWNER);
    const poolHasDefaultAdminRole = await investmentPool.hasRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    const jeonseVaultHasVaultRole = await investmentPool.hasRole(VAULT_ROLE, deployment.contracts.JeonseVault.address);
    
    console.log(`   ADMIN_ROLE: ${poolHasAdminRole ? '✅' : '❌'}`);
    console.log(`   DEFAULT_ADMIN_ROLE: ${poolHasDefaultAdminRole ? '✅' : '❌'}`);
    console.log(`   VAULT_ROLE (JeonseVault): ${jeonseVaultHasVaultRole ? '✅' : '❌'}`);

    console.log('');

    // Verificar configuración de .env.local
    console.log('📄 Verificando configuración de .env.local...');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const jeonseVaultAddress = envContent.match(/NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=(0x[a-fA-F0-9]{40})/)?.[1];
      const investmentPoolAddress = envContent.match(/NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=(0x[a-fA-F0-9]{40})/)?.[1];
      const propertyOracleAddress = envContent.match(/NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=(0x[a-fA-F0-9]{40})/)?.[1];
      const complianceModuleAddress = envContent.match(/NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=(0x[a-fA-F0-9]{40})/)?.[1];
      
      console.log(`   JeonseVault: ${jeonseVaultAddress === deployment.contracts.JeonseVault.address ? '✅' : '❌'}`);
      console.log(`   InvestmentPool: ${investmentPoolAddress === deployment.contracts.InvestmentPool.address ? '✅' : '❌'}`);
      console.log(`   PropertyOracle: ${propertyOracleAddress === deployment.contracts.PropertyOracle.address ? '✅' : '❌'}`);
      console.log(`   ComplianceModule: ${complianceModuleAddress === deployment.contracts.ComplianceModule.address ? '✅' : '❌'}`);
    } else {
      console.log('   ❌ Archivo .env.local no encontrado');
    }

    console.log('');

    // Resumen final
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('==========================');
    
    const allRolesCorrect = jeonseVaultHasAdminRole && jeonseVaultHasDefaultAdminRole &&
                           propertyOracleHasAdminRole && propertyOracleHasDefaultAdminRole &&
                           propertyOracleHasOracleRole && propertyOracleHasVerifierRole &&
                           complianceHasAdminRole && complianceHasDefaultAdminRole &&
                           complianceHasOfficerRole && complianceHasVerifierRole &&
                           poolHasAdminRole && poolHasDefaultAdminRole && jeonseVaultHasVaultRole;

    if (allRolesCorrect) {
      console.log('✅ Todos los roles están configurados correctamente');
    } else {
      console.log('❌ Algunos roles no están configurados correctamente');
      console.log('   Ejecuta: npx hardhat run scripts/transfer-ownership.js --network kairos');
    }

    if (deployment.deployer === TARGET_OWNER) {
      console.log('✅ Owner configurado correctamente');
    } else {
      console.log('❌ Owner no coincide con el objetivo');
      console.log(`   Actual: ${deployment.deployer}`);
      console.log(`   Objetivo: ${TARGET_OWNER}`);
    }

    console.log('');
    console.log('🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
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
