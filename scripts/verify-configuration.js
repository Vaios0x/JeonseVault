#!/usr/bin/env node

/**
 * Script para verificar que todas las configuraciones estén correctas
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Direcciones de contratos desplegados
const DEPLOYED_CONTRACTS = {
  JEONSE_VAULT: '0x6287ac251C19bFDfc7AE8247D64B952727855Dae',
  INVESTMENT_POOL: '0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB',
  PROPERTY_ORACLE: '0xF38701CCCE9190D1445c8cB3561104e811CB1468',
  COMPLIANCE_MODULE: '0xf18Fa2873244423cb2247C2b64B5992418001702'
};

// Mapeo de nombres de contratos para el archivo de deployment
const CONTRACT_NAME_MAPPING = {
  JEONSE_VAULT: 'JeonseVault',
  INVESTMENT_POOL: 'InvestmentPool',
  PROPERTY_ORACLE: 'PropertyOracle',
  COMPLIANCE_MODULE: 'ComplianceModule'
};

// Configuración de red
const NETWORK_CONFIG = {
  CHAIN_ID: 1001,
  RPC_URL: 'https://public-en-kairos.node.kaia.io',
  EXPLORER_URL: 'https://explorer.kaia.io',
  NETWORK_NAME: 'Kaia Testnet (Kairos)'
};

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`🔍 ${title}`);
  console.log('='.repeat(60));
}

function printStatus(message, status = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  console.log(`${icons[status]} ${message}`);
}

async function verifyContractAddresses() {
  printHeader('VERIFICACIÓN DE DIRECCIONES DE CONTRATOS');
  
  const filesToCheck = [
    'utils/constants.ts',
    'config/kaia-2025.ts',
    'lib/config.ts',
    'env.example'
  ];
  
  let allCorrect = true;
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      printStatus(`Archivo no encontrado: ${file}`, 'error');
      allCorrect = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let fileCorrect = true;
    
    for (const [contractName, expectedAddress] of Object.entries(DEPLOYED_CONTRACTS)) {
      if (!content.includes(expectedAddress)) {
        printStatus(`${file}: Dirección incorrecta para ${contractName}`, 'error');
        fileCorrect = false;
        allCorrect = false;
      }
    }
    
    if (fileCorrect) {
      printStatus(`${file}: ✅ Todas las direcciones correctas`, 'success');
    }
  }
  
  return allCorrect;
}

async function verifyNetworkConfiguration() {
  printHeader('VERIFICACIÓN DE CONFIGURACIÓN DE RED');
  
  const filesToCheck = [
    'utils/constants.ts',
    'config/kaia-2025.ts',
    'lib/config.ts'
  ];
  
  let allCorrect = true;
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      printStatus(`Archivo no encontrado: ${file}`, 'error');
      allCorrect = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let fileCorrect = true;
    
    // Verificar Chain ID
    if (!content.includes(NETWORK_CONFIG.CHAIN_ID.toString())) {
      printStatus(`${file}: Chain ID incorrecto`, 'error');
      fileCorrect = false;
      allCorrect = false;
    }
    
    // Verificar RPC URL
    if (!content.includes(NETWORK_CONFIG.RPC_URL)) {
      printStatus(`${file}: RPC URL incorrecto`, 'error');
      fileCorrect = false;
      allCorrect = false;
    }
    
    // Verificar Explorer URL
    if (!content.includes(NETWORK_CONFIG.EXPLORER_URL)) {
      printStatus(`${file}: Explorer URL incorrecto`, 'error');
      fileCorrect = false;
      allCorrect = false;
    }
    
    if (fileCorrect) {
      printStatus(`${file}: ✅ Configuración de red correcta`, 'success');
    }
  }
  
  return allCorrect;
}

async function verifyDeploymentFiles() {
  printHeader('VERIFICACIÓN DE ARCHIVOS DE DESPLIEGUE');
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'kairos.json');
  
  if (!fs.existsSync(deploymentPath)) {
    printStatus('Archivo de despliegue no encontrado: deployments/kairos.json', 'error');
    return false;
  }
  
  try {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    // Verificar que todas las direcciones estén presentes
    const expectedContracts = Object.keys(DEPLOYED_CONTRACTS);
    const deployedContracts = Object.keys(deployment.contracts);
    
    let allPresent = true;
    
    for (const contract of expectedContracts) {
      const mappedName = CONTRACT_NAME_MAPPING[contract];
      if (!deployedContracts.includes(mappedName)) {
        printStatus(`Contrato faltante en deployment: ${mappedName}`, 'error');
        allPresent = false;
      }
    }
    
    // Verificar que las direcciones coincidan
    for (const [contractName, expectedAddress] of Object.entries(DEPLOYED_CONTRACTS)) {
      const mappedName = CONTRACT_NAME_MAPPING[contractName];
      const deployedAddress = deployment.contracts[mappedName]?.address;
      if (deployedAddress !== expectedAddress) {
        printStatus(`Dirección incorrecta para ${mappedName}: ${deployedAddress}`, 'error');
        allPresent = false;
      }
    }
    
    if (allPresent) {
      printStatus('deployments/kairos.json: ✅ Configuración correcta', 'success');
    }
    
    return allPresent;
  } catch (error) {
    printStatus(`Error leyendo archivo de despliegue: ${error.message}`, 'error');
    return false;
  }
}

async function verifyEnvironmentVariables() {
  printHeader('VERIFICACIÓN DE VARIABLES DE ENTORNO');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    printStatus('Archivo .env.local no encontrado', 'warning');
    printStatus('Ejecuta: node scripts/update-env.js', 'info');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  let allCorrect = true;
  
  for (const [contractName, expectedAddress] of Object.entries(DEPLOYED_CONTRACTS)) {
    const envVarName = `NEXT_PUBLIC_${contractName}_ADDRESS`;
    if (!envContent.includes(`${envVarName}=${expectedAddress}`)) {
      printStatus(`Variable de entorno incorrecta: ${envVarName}`, 'error');
      allCorrect = false;
    }
  }
  
  if (allCorrect) {
    printStatus('.env.local: ✅ Variables de entorno correctas', 'success');
  }
  
  return allCorrect;
}

async function main() {
  console.log('🚀 Iniciando verificación completa de configuración...');
  
  const results = {
    contracts: await verifyContractAddresses(),
    network: await verifyNetworkConfiguration(),
    deployment: await verifyDeploymentFiles(),
    environment: await verifyEnvironmentVariables()
  };
  
  printHeader('RESUMEN DE VERIFICACIÓN');
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n📊 Resultados:');
  console.log(`   Contratos: ${results.contracts ? '✅' : '❌'}`);
  console.log(`   Red: ${results.network ? '✅' : '❌'}`);
  console.log(`   Despliegue: ${results.deployment ? '✅' : '❌'}`);
  console.log(`   Variables de entorno: ${results.environment ? '✅' : '❌'}`);
  
  if (allPassed) {
    printStatus('🎉 ¡Todas las verificaciones pasaron! El proyecto está listo para testnet.', 'success');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Configura tu PRIVATE_KEY en .env.local');
    console.log('   2. Ejecuta: npm run dev');
    console.log('   3. Conecta tu wallet a Kaia testnet (Chain ID: 1001)');
    console.log('   4. ¡Prueba la aplicación!');
  } else {
    printStatus('⚠️ Algunas verificaciones fallaron. Revisa los errores arriba.', 'warning');
    console.log('\n🔧 Para corregir:');
    console.log('   1. Ejecuta: node scripts/update-env.js');
    console.log('   2. Verifica que todos los archivos tengan las direcciones correctas');
    console.log('   3. Ejecuta este script nuevamente');
  }
  
  return allPassed;
}

// Ejecutar script
if (require.main === module) {
  main()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error durante la verificación:', error);
      process.exit(1);
    });
}

module.exports = { main, verifyContractAddresses, verifyNetworkConfiguration, verifyDeploymentFiles, verifyEnvironmentVariables };
