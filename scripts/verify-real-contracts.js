#!/usr/bin/env node

/**
 * Script para verificar que todos los hooks y componentes están usando contratos reales
 * en lugar de datos mockup o simulados
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

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

function checkFileForMockData(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    printStatus(`Archivo no encontrado: ${fileName}`, 'error');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let hasMockData = false;
  let issues = [];

  // Patrones que indican datos mockup
  const mockPatterns = [
    /mock.*data/i,
    /mock.*properties/i,
    /mock.*deposits/i,
    /mock.*pools/i,
    /mock.*users/i,
    /mock.*compliance/i,
    /mock.*prices/i,
    /mock.*address/i,
    /mock.*balance/i,
    /simular.*datos/i,
    /simular.*propiedades/i,
    /simular.*depósitos/i,
    /simular.*pools/i,
    /simular.*usuarios/i,
    /simular.*precios/i,
    /setTimeout.*resolve.*2000/i,
    /new Promise.*resolve.*setTimeout/i,
    /await new Promise.*resolve.*setTimeout/i
  ];

  // Patrones que indican uso de contratos reales
  const realContractPatterns = [
    /useContractRead/i,
    /useWriteContract/i,
    /useAccount/i,
    /CONTRACT_ADDRESSES/i,
    /writeContract/i,
    /PropertyOracle__factory/i,
    /ComplianceModule__factory/i,
    /JeonseVault__factory/i,
    /InvestmentPool__factory/i,
    /wagmi/i,
    /toast\.success/i,
    /toast\.error/i
  ];

  // Verificar patrones mockup
  for (const pattern of mockPatterns) {
    if (pattern.test(content)) {
      hasMockData = true;
      issues.push(`Contiene datos mockup: ${pattern.source}`);
    }
  }

  // Verificar patrones de contratos reales
  let hasRealContracts = false;
  for (const pattern of realContractPatterns) {
    if (pattern.test(content)) {
      hasRealContracts = true;
      break;
    }
  }

  if (hasMockData && !hasRealContracts) {
    printStatus(`${fileName}: ❌ Solo contiene datos mockup`, 'error');
    return false;
  } else if (hasMockData && hasRealContracts) {
    printStatus(`${fileName}: ⚠️ Mezcla de datos mockup y contratos reales`, 'warning');
    return false;
  } else if (!hasMockData && hasRealContracts) {
    printStatus(`${fileName}: ✅ Usando contratos reales`, 'success');
    return true;
  } else {
    printStatus(`${fileName}: ℹ️ No se detectaron patrones específicos`, 'info');
    return true;
  }
}

async function verifyHooks() {
  printHeader('VERIFICACIÓN DE HOOKS');
  
  const hooksToCheck = [
    'hooks/usePropertyOracle.ts',
    'hooks/useCompliance.ts',
    'hooks/useJeonseVault.ts',
    'hooks/useInvestmentPool.ts',
    'hooks/usePythOracle.ts'
  ];
  
  let allCorrect = true;
  
  for (const hook of hooksToCheck) {
    const filePath = path.join(__dirname, '..', hook);
    const fileName = hook.split('/').pop();
    
    if (!checkFileForMockData(filePath, fileName)) {
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

async function verifyComponents() {
  printHeader('VERIFICACIÓN DE COMPONENTES');
  
  const componentsToCheck = [
    'components/ui/SimpleWalletButton.tsx',
    'components/investment/PoolList.tsx'
  ];
  
  let allCorrect = true;
  
  for (const component of componentsToCheck) {
    const filePath = path.join(__dirname, '..', component);
    const fileName = component.split('/').pop();
    
    if (!checkFileForMockData(filePath, fileName)) {
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

async function verifyConfiguration() {
  printHeader('VERIFICACIÓN DE CONFIGURACIÓN');
  
  const configFiles = [
    'lib/config.ts',
    'config/kaia-2025.ts',
    'utils/constants.ts'
  ];
  
  let allCorrect = true;
  
  for (const config of configFiles) {
    const filePath = path.join(__dirname, '..', config);
    if (!fs.existsSync(filePath)) {
      printStatus(`Archivo de configuración no encontrado: ${config}`, 'error');
      allCorrect = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar que contenga las direcciones de contratos reales
    const expectedAddresses = [
      '0x6287ac251C19bFDfc7AE8247D64B952727855Dae', // JeonseVault
      '0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB', // InvestmentPool
      '0xF38701CCCE9190D1445c8cB3561104e811CB1468', // PropertyOracle
      '0xf18Fa2873244423cb2247C2b64B5992418001702'  // ComplianceModule
    ];
    
    let hasAllAddresses = true;
    for (const address of expectedAddresses) {
      if (!content.includes(address)) {
        printStatus(`${config}: Dirección faltante ${address}`, 'error');
        hasAllAddresses = false;
        allCorrect = false;
      }
    }
    
    if (hasAllAddresses) {
      printStatus(`${config}: ✅ Configuración correcta`, 'success');
    }
  }
  
  return allCorrect;
}

async function main() {
  console.log('🚀 Verificando que todos los componentes usen contratos reales...');
  
  const results = {
    hooks: await verifyHooks(),
    components: await verifyComponents(),
    configuration: await verifyConfiguration()
  };
  
  printHeader('RESUMEN DE VERIFICACIÓN');
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n📊 Resultados:');
  console.log(`   Hooks: ${results.hooks ? '✅' : '❌'}`);
  console.log(`   Componentes: ${results.components ? '✅' : '❌'}`);
  console.log(`   Configuración: ${results.configuration ? '✅' : '❌'}`);
  
  if (allPassed) {
    printStatus('🎉 ¡Todos los componentes están usando contratos reales!', 'success');
    console.log('\n📋 Estado:');
    console.log('   ✅ Hooks conectados a contratos reales');
    console.log('   ✅ Componentes usando datos reales');
    console.log('   ✅ Configuración actualizada');
    console.log('   ✅ Listo para testnet');
  } else {
    printStatus('⚠️ Algunos componentes aún usan datos mockup', 'warning');
    console.log('\n🔧 Acciones recomendadas:');
    console.log('   1. Revisar los archivos marcados con ❌ o ⚠️');
    console.log('   2. Reemplazar datos mockup con llamadas a contratos reales');
    console.log('   3. Ejecutar este script nuevamente');
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

module.exports = { main, verifyHooks, verifyComponents, verifyConfiguration };
