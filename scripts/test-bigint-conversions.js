#!/usr/bin/env node

/**
 * Script de Testing para Conversiones BigInt
 * 
 * Este script verifica que las funciones de conversión segura
 * entre BigInt y Number funcionen correctamente.
 * 
 * Uso: node scripts/test-bigint-conversions.js
 */

const { safeToBigInt, safeToNumber } = require('../lib/bigint-polyfill')

// Colores para output en consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function testSafeToBigInt() {
  log('\n🧪 Probando safeToBigInt...', 'cyan')
  
  const tests = [
    // Casos normales
    { input: 123, expected: BigInt(123), description: 'Número entero' },
    { input: BigInt(456), expected: BigInt(456), description: 'BigInt existente' },
    { input: '789', expected: BigInt(789), description: 'String numérico' },
    { input: 0, expected: BigInt(0), description: 'Cero' },
    
    // Casos edge
    { input: null, expected: BigInt(0), description: 'null' },
    { input: undefined, expected: BigInt(0), description: 'undefined' },
    { input: '', expected: BigInt(0), description: 'String vacío' },
    { input: 'invalid', expected: BigInt(0), description: 'String inválido' },
    { input: NaN, expected: BigInt(0), description: 'NaN' },
    { input: Infinity, expected: BigInt(0), description: 'Infinity' },
    { input: -Infinity, expected: BigInt(0), description: '-Infinity' },
    { input: 3.14, expected: BigInt(3), description: 'Número decimal' },
    { input: -42, expected: BigInt(-42), description: 'Número negativo' },
    
    // Casos especiales
    { input: '0x1a', expected: BigInt(26), description: 'String hexadecimal' },
    { input: '1e6', expected: BigInt(1000000), description: 'Notación científica' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = safeToBigInt(test.input)
      if (result === test.expected) {
        log(`✅ ${test.description}: ${test.input} → ${result}`, 'green')
        passed++
      } else {
        log(`❌ ${test.description}: ${test.input} → ${result} (esperado: ${test.expected})`, 'red')
        failed++
      }
    } catch (error) {
      log(`💥 ${test.description}: ${test.input} → Error: ${error.message}`, 'red')
      failed++
    }
  }
  
  return { passed, failed }
}

function testSafeToNumber() {
  log('\n🧪 Probando safeToNumber...', 'cyan')
  
  const tests = [
    // Casos normales
    { input: 123, expected: 123, description: 'Número entero' },
    { input: BigInt(456), expected: 456, description: 'BigInt' },
    { input: '789', expected: 789, description: 'String numérico' },
    { input: 0, expected: 0, description: 'Cero' },
    { input: 3.14, expected: 3.14, description: 'Número decimal' },
    { input: -42, expected: -42, description: 'Número negativo' },
    
    // Casos edge
    { input: null, expected: 0, description: 'null' },
    { input: undefined, expected: 0, description: 'undefined' },
    { input: '', expected: 0, description: 'String vacío' },
    { input: 'invalid', expected: 0, description: 'String inválido' },
    { input: NaN, expected: 0, description: 'NaN' },
    { input: Infinity, expected: 0, description: 'Infinity' },
    { input: -Infinity, expected: 0, description: '-Infinity' },
    
    // Casos especiales
    { input: '0x1a', expected: 26, description: 'String hexadecimal' },
    { input: '1e6', expected: 1000000, description: 'Notación científica' },
    { input: BigInt(Number.MAX_SAFE_INTEGER), expected: Number.MAX_SAFE_INTEGER, description: 'MAX_SAFE_INTEGER' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = safeToNumber(test.input)
      if (result === test.expected) {
        log(`✅ ${test.description}: ${test.input} → ${result}`, 'green')
        passed++
      } else {
        log(`❌ ${test.description}: ${test.input} → ${result} (esperado: ${test.expected})`, 'red')
        failed++
      }
    } catch (error) {
      log(`💥 ${test.description}: ${test.input} → Error: ${error.message}`, 'red')
      failed++
    }
  }
  
  return { passed, failed }
}

function testEdgeCases() {
  log('\n🧪 Probando casos edge y stress...', 'cyan')
  
  const edgeCases = [
    // Valores extremos
    BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1),
    BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1),
    Number.MAX_VALUE,
    Number.MIN_VALUE,
    
    // Objetos y arrays
    {},
    [],
    [1, 2, 3],
    { value: 123 },
    
    // Funciones
    () => 123,
    function() { return 456 },
    
    // Booleanos
    true,
    false,
    
    // Valores especiales
    Symbol('test'),
    new Date(),
    new Error('test'),
  ]
  
  let passed = 0
  let failed = 0
  
  for (const edgeCase of edgeCases) {
    try {
      const bigIntResult = safeToBigInt(edgeCase)
      const numberResult = safeToNumber(edgeCase)
      
      // Verificar que no se lanzan errores
      if (typeof bigIntResult === 'bigint' && typeof numberResult === 'number') {
        log(`✅ Caso edge: ${typeof edgeCase} → BigInt: ${bigIntResult}, Number: ${numberResult}`, 'green')
        passed++
      } else {
        log(`❌ Caso edge: ${typeof edgeCase} → tipos incorrectos`, 'red')
        failed++
      }
    } catch (error) {
      log(`💥 Caso edge: ${typeof edgeCase} → Error: ${error.message}`, 'red')
      failed++
    }
  }
  
  return { passed, failed }
}

function testPerformance() {
  log('\n⚡ Probando performance...', 'cyan')
  
  const iterations = 100000
  const testValues = [
    123,
    BigInt(456),
    '789',
    null,
    undefined,
    'invalid'
  ]
  
  // Test safeToBigInt
  const startBigInt = Date.now()
  for (let i = 0; i < iterations; i++) {
    for (const value of testValues) {
      safeToBigInt(value)
    }
  }
  const bigIntTime = Date.now() - startBigInt
  
  // Test safeToNumber
  const startNumber = Date.now()
  for (let i = 0; i < iterations; i++) {
    for (const value of testValues) {
      safeToNumber(value)
    }
  }
  const numberTime = Date.now() - startNumber
  
  log(`📊 safeToBigInt: ${bigIntTime}ms para ${iterations * testValues.length} conversiones`, 'blue')
  log(`📊 safeToNumber: ${numberTime}ms para ${iterations * testValues.length} conversiones`, 'blue')
  log(`📊 Promedio: ${((bigIntTime + numberTime) / 2).toFixed(2)}ms por batch`, 'blue')
  
  return { bigIntTime, numberTime }
}

function runAllTests() {
  log('🚀 Iniciando tests de conversiones BigInt...', 'bright')
  
  const results = {
    safeToBigInt: testSafeToBigInt(),
    safeToNumber: testSafeToNumber(),
    edgeCases: testEdgeCases(),
    performance: testPerformance()
  }
  
  // Resumen
  const totalPassed = results.safeToBigInt.passed + results.safeToNumber.passed + results.edgeCases.passed
  const totalFailed = results.safeToBigInt.failed + results.safeToNumber.failed + results.edgeCases.failed
  const totalTests = totalPassed + totalFailed
  
  log('\n📋 Resumen de Tests:', 'bright')
  log(`✅ Tests pasados: ${totalPassed}`, 'green')
  log(`❌ Tests fallidos: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green')
  log(`📊 Total de tests: ${totalTests}`, 'blue')
  log(`📈 Tasa de éxito: ${((totalPassed / totalTests) * 100).toFixed(2)}%`, 'blue')
  
  if (totalFailed === 0) {
    log('\n🎉 ¡Todos los tests pasaron! Las conversiones BigInt funcionan correctamente.', 'green')
    process.exit(0)
  } else {
    log('\n⚠️  Algunos tests fallaron. Revisar las conversiones BigInt.', 'yellow')
    process.exit(1)
  }
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  try {
    runAllTests()
  } catch (error) {
    log(`💥 Error ejecutando tests: ${error.message}`, 'red')
    process.exit(1)
  }
}

module.exports = {
  testSafeToBigInt,
  testSafeToNumber,
  testEdgeCases,
  testPerformance,
  runAllTests
}
