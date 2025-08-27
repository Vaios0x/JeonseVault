#!/usr/bin/env ts-node

/**
 * Script para transferir ownership de contratos al owner especificado
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_OWNER = '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1';

interface DeployedContracts {
  [key: string]: {
    address: string;
    constructorArgs: any[];
    verified: boolean;
    deploymentTx: string;
    blockNumber: number;
  };
}

interface DeploymentInfo {
  network: string;
  deployer: string;
  timestamp: string;
  contracts: DeployedContracts;
}

async function main() {
  console.log('🔄 Iniciando transferencia de ownership...');
  console.log(`🎯 Owner objetivo: ${TARGET_OWNER}`);
  console.log('');

  try {
    // Obtener signer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Desplegador actual: ${deployer.address}`);

    // Leer información de despliegue
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'kairos.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('No se encontró información de despliegue. Ejecuta el despliegue primero.');
    }

    const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log(`📄 Información de despliegue cargada para red: ${deployment.network}`);

    // Verificar si el deployer actual es diferente al owner objetivo
    if (deployment.deployer === TARGET_OWNER) {
      console.log('✅ El owner ya está configurado correctamente');
      return;
    }

    console.log('🔄 Iniciando transferencias de ownership...');

    // Transferir ownership de JeonseVault
    console.log('🏦 Transferiendo ownership de JeonseVault...');
    const jeonseVault = await ethers.getContractAt('JeonseVault', deployment.contracts.JeonseVault.address);
    
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash; // 0x0000000000000000000000000000000000000000000000000000000000000000

    // Revocar roles del deployer actual
    await jeonseVault.revokeRole(ADMIN_ROLE, deployer.address);
    await jeonseVault.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log('   ✅ Roles revocados del deployer actual');

    // Otorgar roles al nuevo owner
    await jeonseVault.grantRole(ADMIN_ROLE, TARGET_OWNER);
    await jeonseVault.grantRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    console.log('   ✅ Roles otorgados al nuevo owner');

    // Transferir ownership de PropertyOracle
    console.log('🏠 Transferiendo ownership de PropertyOracle...');
    const propertyOracle = await ethers.getContractAt('PropertyOracle', deployment.contracts.PropertyOracle.address);
    
    const ORACLE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    // Revocar roles del deployer actual
    await propertyOracle.revokeRole(ORACLE_ADMIN_ROLE, deployer.address);
    await propertyOracle.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
    await propertyOracle.revokeRole(ORACLE_ROLE, deployer.address);
    await propertyOracle.revokeRole(VERIFIER_ROLE, deployer.address);
    console.log('   ✅ Roles revocados del deployer actual');

    // Otorgar roles al nuevo owner
    await propertyOracle.grantRole(ORACLE_ADMIN_ROLE, TARGET_OWNER);
    await propertyOracle.grantRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    await propertyOracle.grantRole(ORACLE_ROLE, TARGET_OWNER);
    await propertyOracle.grantRole(VERIFIER_ROLE, TARGET_OWNER);
    console.log('   ✅ Roles otorgados al nuevo owner');

    // Transferir ownership de ComplianceModule
    console.log('🔒 Transferiendo ownership de ComplianceModule...');
    const complianceModule = await ethers.getContractAt('ComplianceModule', deployment.contracts.ComplianceModule.address);
    
    const COMPLIANCE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const COMPLIANCE_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COMPLIANCE_OFFICER_ROLE"));
    const COMPLIANCE_VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    // Revocar roles del deployer actual
    await complianceModule.revokeRole(COMPLIANCE_ADMIN_ROLE, deployer.address);
    await complianceModule.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
    await complianceModule.revokeRole(COMPLIANCE_OFFICER_ROLE, deployer.address);
    await complianceModule.revokeRole(COMPLIANCE_VERIFIER_ROLE, deployer.address);
    console.log('   ✅ Roles revocados del deployer actual');

    // Otorgar roles al nuevo owner
    await complianceModule.grantRole(COMPLIANCE_ADMIN_ROLE, TARGET_OWNER);
    await complianceModule.grantRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    await complianceModule.grantRole(COMPLIANCE_OFFICER_ROLE, TARGET_OWNER);
    await complianceModule.grantRole(COMPLIANCE_VERIFIER_ROLE, TARGET_OWNER);
    console.log('   ✅ Roles otorgados al nuevo owner');

    // Transferir ownership de InvestmentPool
    console.log('💰 Transferiendo ownership de InvestmentPool...');
    const investmentPool = await ethers.getContractAt('InvestmentPool', deployment.contracts.InvestmentPool.address);
    
    const POOL_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const VAULT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE"));

    // Revocar roles del deployer actual
    await investmentPool.revokeRole(POOL_ADMIN_ROLE, deployer.address);
    await investmentPool.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log('   ✅ Roles revocados del deployer actual');

    // Otorgar roles al nuevo owner
    await investmentPool.grantRole(POOL_ADMIN_ROLE, TARGET_OWNER);
    await investmentPool.grantRole(DEFAULT_ADMIN_ROLE, TARGET_OWNER);
    console.log('   ✅ Roles otorgados al nuevo owner');

    // El VAULT_ROLE debe mantenerse en JeonseVault
    console.log('   ℹ️ VAULT_ROLE mantenido en JeonseVault');

    // Actualizar información de despliegue
    deployment.deployer = TARGET_OWNER;
    deployment.timestamp = new Date().toISOString();
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log('📄 Información de despliegue actualizada');

    console.log('');
    console.log('✅ Transferencia de ownership completada exitosamente!');
    console.log(`🎯 Nuevo owner: ${TARGET_OWNER}`);
    console.log('');
    console.log('📋 Resumen de cambios:');
    console.log('   - JeonseVault: ADMIN_ROLE y DEFAULT_ADMIN_ROLE transferidos');
    console.log('   - PropertyOracle: Todos los roles transferidos');
    console.log('   - ComplianceModule: Todos los roles transferidos');
    console.log('   - InvestmentPool: ADMIN_ROLE y DEFAULT_ADMIN_ROLE transferidos');
    console.log('   - VAULT_ROLE mantenido en JeonseVault para funcionalidad');

  } catch (error) {
    console.error('❌ Error durante la transferencia de ownership:', error);
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

export { main };
