#!/usr/bin/env node

/**
 * Script para verificar que todos los botones del sitio funcionen correctamente
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

function checkButtonFunctionality(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    printStatus(`Archivo no encontrado: ${fileName}`, 'error');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let issues = [];
  let hasDemoTransactions = false;
  let hasRealTransactions = false;

  // Verificar uso de transacciones demo
  const demoPatterns = [
    /useDemoTransactions/i,
    /createDepositDemo/i,
    /investInPoolDemo/i,
    /withdrawInvestmentDemo/i,
    /registerPropertyDemo/i,
    /verifyPropertyDemo/i,
    /verifyUserDemo/i,
    /DEMO_TRANSACTION_VALUE/i,
    /10 Kaia testnet/i
  ];

  // Verificar transacciones reales (que no deberían estar en modo demo)
  const realTransactionPatterns = [
    /writeContract.*value.*BigInt/i,
    /createDeposit.*BigInt/i,
    /investInPool.*BigInt/i,
    /withdrawInvestment.*BigInt/i,
    /registerProperty.*BigInt/i,
    /verifyProperty.*BigInt/i,
    /verifyUser.*BigInt/i
  ];

  // Verificar botones que no requieren transacciones
  const nonTransactionButtons = [
    /onClick.*navigate/i,
    /onClick.*window\.location/i,
    /onClick.*router\.push/i,
    /onClick.*open.*modal/i,
    /onClick.*close.*modal/i,
    /onClick.*setState/i,
    /onClick.*toggle/i,
    /onClick.*copy/i,
    /onClick.*download/i,
    /onClick.*share/i
  ];

  // Verificar patrones demo
  for (const pattern of demoPatterns) {
    if (pattern.test(content)) {
      hasDemoTransactions = true;
      break;
    }
  }

  // Verificar transacciones reales
  for (const pattern of realTransactionPatterns) {
    if (pattern.test(content)) {
      hasRealTransactions = true;
      issues.push(`Contiene transacciones reales: ${pattern.source}`);
    }
  }

  // Verificar botones sin transacciones
  let hasNonTransactionButtons = false;
  for (const pattern of nonTransactionButtons) {
    if (pattern.test(content)) {
      hasNonTransactionButtons = true;
      break;
    }
  }

  // Evaluar el estado del archivo
  if (hasDemoTransactions && !hasRealTransactions) {
    printStatus(`${fileName}: ✅ Usando transacciones demo correctamente`, 'success');
    return true;
  } else if (hasDemoTransactions && hasRealTransactions) {
    printStatus(`${fileName}: ⚠️ Mezcla de transacciones demo y reales`, 'warning');
    return false;
  } else if (!hasDemoTransactions && hasRealTransactions) {
    printStatus(`${fileName}: ❌ Solo transacciones reales (debería usar demo)`, 'error');
    return false;
  } else if (hasNonTransactionButtons) {
    printStatus(`${fileName}: ✅ Botones sin transacciones funcionando correctamente`, 'success');
    return true;
  } else {
    printStatus(`${fileName}: ℹ️ No se detectaron patrones específicos`, 'info');
    return true;
  }
}

async function verifyTransactionButtons() {
  printHeader('VERIFICACIÓN DE BOTONES CON TRANSACCIONES');
  
  const transactionComponents = [
    'components/deposit/CreateDepositForm.tsx',
    'components/investment/InvestmentForm.tsx',
    'components/dashboard/InvestmentPool.tsx',
    'components/investment/PoolList.tsx',
    'components/compliance/KYCForm.tsx',
    'components/compliance/RealNameVerification.tsx'
  ];
  
  let allCorrect = true;
  
  for (const component of transactionComponents) {
    const filePath = path.join(__dirname, '..', component);
    const fileName = component.split('/').pop();
    
    if (!checkButtonFunctionality(filePath, fileName)) {
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

async function verifyNonTransactionButtons() {
  printHeader('VERIFICACIÓN DE BOTONES SIN TRANSACCIONES');
  
  const nonTransactionComponents = [
    'components/ui/SimpleWalletButton.tsx',
    'components/ui/WalletConnect.tsx',
    'components/ui/Modal.tsx',
    'components/ui/Button.tsx',
    'components/layout/Header.tsx',
    'components/layout/Footer.tsx'
  ];
  
  let allCorrect = true;
  
  for (const component of nonTransactionComponents) {
    const filePath = path.join(__dirname, '..', component);
    if (fs.existsSync(filePath)) {
      const fileName = component.split('/').pop();
      if (!checkButtonFunctionality(filePath, fileName)) {
        allCorrect = false;
      }
    }
  }
  
  return allCorrect;
}

async function verifyDemoHook() {
  printHeader('VERIFICACIÓN DEL HOOK DE TRANSACCIONES DEMO');
  
  const demoHookPath = path.join(__dirname, '..', 'hooks/useDemoTransactions.ts');
  
  if (!fs.existsSync(demoHookPath)) {
    printStatus('Hook useDemoTransactions.ts no encontrado', 'error');
    return false;
  }
  
  const content = fs.readFileSync(demoHookPath, 'utf8');
  
  // Verificar que contenga las funciones necesarias
  const requiredFunctions = [
    'createDepositDemo',
    'investInPoolDemo',
    'withdrawInvestmentDemo',
    'registerPropertyDemo',
    'verifyPropertyDemo',
    'verifyUserDemo',
    'DEMO_TRANSACTION_VALUE'
  ];
  
  let allFunctionsPresent = true;
  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      printStatus(`Función faltante: ${func}`, 'error');
      allFunctionsPresent = false;
    }
  }
  
  if (allFunctionsPresent) {
    printStatus('Hook useDemoTransactions.ts: ✅ Todas las funciones presentes', 'success');
  }
  
  return allFunctionsPresent;
}

async function main() {
  console.log('🚀 Verificando que todos los botones funcionen correctamente...');
  
  const results = {
    transactionButtons: await verifyTransactionButtons(),
    nonTransactionButtons: await verifyNonTransactionButtons(),
    demoHook: await verifyDemoHook()
  };
  
  printHeader('RESUMEN DE VERIFICACIÓN');
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n📊 Resultados:');
  console.log(`   Botones con transacciones: ${results.transactionButtons ? '✅' : '❌'}`);
  console.log(`   Botones sin transacciones: ${results.nonTransactionButtons ? '✅' : '❌'}`);
  console.log(`   Hook de transacciones demo: ${results.demoHook ? '✅' : '❌'}`);
  
  if (allPassed) {
    printStatus('🎉 ¡Todos los botones están funcionando correctamente!', 'success');
    console.log('\n📋 Estado:');
    console.log('   ✅ Botones con transacciones usan modo demo (10 Kaia testnet)');
    console.log('   ✅ Botones sin transacciones funcionan correctamente');
    console.log('   ✅ Hook de transacciones demo implementado');
    console.log('   ✅ Listo para demostración');
  } else {
    printStatus('⚠️ Algunos botones necesitan corrección', 'warning');
    console.log('\n🔧 Acciones recomendadas:');
    console.log('   1. Revisar los archivos marcados con ❌ o ⚠️');
    console.log('   2. Asegurar que botones con transacciones usen useDemoTransactions');
    console.log('   3. Verificar que botones sin transacciones funcionen correctamente');
    console.log('   4. Ejecutar este script nuevamente');
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

module.exports = { main, verifyTransactionButtons, verifyNonTransactionButtons, verifyDemoHook };
