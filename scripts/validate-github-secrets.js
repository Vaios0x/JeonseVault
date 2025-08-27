#!/usr/bin/env node

/**
 * Script para validar la configuración de GitHub Secrets
 * Este script verifica que todas las variables requeridas estén documentadas
 */

const fs = require('fs');
const path = require('path');

// Variables de entorno requeridas según la documentación
const REQUIRED_SECRETS = {
  // Security
  'SNYK_TOKEN': 'Token de API de Snyk para escaneo de seguridad',
  
  // Smart Contract Deployment
  'DEPLOY_PRIVATE_KEY': 'Clave privada para el despliegue de contratos inteligentes',
  'RPC_URL': 'URL del endpoint RPC de Ethereum',
  'ETHERSCAN_API_KEY': 'Clave de API de Etherscan para verificación de contratos',
  
  // Staging Deployment
  'STAGING_HOST': 'Hostname o IP del servidor de staging',
  'STAGING_USER': 'Usuario SSH para el servidor de staging',
  'STAGING_SSH_KEY': 'Clave privada SSH para el servidor de staging',
  
  // Production Deployment
  'PRODUCTION_HOST': 'Hostname o IP del servidor de producción',
  'PRODUCTION_USER': 'Usuario SSH para el servidor de producción',
  'PRODUCTION_SSH_KEY': 'Clave privada SSH para el servidor de producción',
  'PRODUCTION_DOMAIN': 'Dominio de producción'
};

// Variables opcionales
const OPTIONAL_SECRETS = {
  'SLACK_WEBHOOK_URL': 'URL del webhook de Slack para notificaciones',
  'DISCORD_WEBHOOK_URL': 'URL del webhook de Discord para notificaciones'
};

function validateWorkflowFile() {
  console.log('🔍 Validando archivo de workflow...\n');
  
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'ci-cd.yml');
  
  if (!fs.existsSync(workflowPath)) {
    console.error('❌ No se encontró el archivo de workflow: .github/workflows/ci-cd.yml');
    return false;
  }
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  const missingSecrets = [];
  const foundSecrets = [];
  
  // Buscar todas las referencias a secrets en el workflow
  for (const secretName of Object.keys(REQUIRED_SECRETS)) {
    const secretPattern = new RegExp(`\\$\\{\\{\\s*secrets\\.${secretName}\\s*\\}\\}`, 'g');
    if (secretPattern.test(workflowContent)) {
      foundSecrets.push(secretName);
    } else {
      missingSecrets.push(secretName);
    }
  }
  
  // Verificar secrets opcionales
  for (const secretName of Object.keys(OPTIONAL_SECRETS)) {
    const secretPattern = new RegExp(`\\$\\{\\{\\s*secrets\\.${secretName}\\s*\\}\\}`, 'g');
    if (secretPattern.test(workflowContent)) {
      foundSecrets.push(secretName);
    }
  }
  
  console.log('✅ Secrets encontrados en el workflow:');
  foundSecrets.forEach(secret => {
    const isRequired = REQUIRED_SECRETS[secret];
    const isOptional = OPTIONAL_SECRETS[secret];
    const type = isRequired ? '🔴 REQUERIDO' : '🟡 OPCIONAL';
    const description = isRequired || isOptional;
    console.log(`  ${type} ${secret}: ${description}`);
  });
  
  if (missingSecrets.length > 0) {
    console.log('\n❌ Secrets faltantes en el workflow:');
    missingSecrets.forEach(secret => {
      console.log(`  🔴 ${secret}: ${REQUIRED_SECRETS[secret]}`);
    });
    return false;
  }
  
  console.log('\n✅ Todos los secrets requeridos están referenciados en el workflow');
  return true;
}

function validateDocumentation() {
  console.log('\n📚 Validando documentación...\n');
  
  const docsPath = path.join(__dirname, '..', 'docs', 'GITHUB_SECRETS.md');
  
  if (!fs.existsSync(docsPath)) {
    console.error('❌ No se encontró la documentación: docs/GITHUB_SECRETS.md');
    return false;
  }
  
  const docsContent = fs.readFileSync(docsPath, 'utf8');
  const missingDocs = [];
  const foundDocs = [];
  
  // Verificar que todos los secrets estén documentados
  for (const [secretName, description] of Object.entries(REQUIRED_SECRETS)) {
    if (docsContent.includes(secretName)) {
      foundDocs.push(secretName);
    } else {
      missingDocs.push(secretName);
    }
  }
  
  console.log('✅ Secrets documentados:');
  foundDocs.forEach(secret => {
    console.log(`  📖 ${secret}: ${REQUIRED_SECRETS[secret]}`);
  });
  
  if (missingDocs.length > 0) {
    console.log('\n❌ Secrets no documentados:');
    missingDocs.forEach(secret => {
      console.log(`  📖 ${secret}: ${REQUIRED_SECRETS[secret]}`);
    });
    return false;
  }
  
  console.log('\n✅ Todos los secrets están documentados');
  return true;
}

function generateSetupInstructions() {
  console.log('\n📋 Instrucciones de configuración:\n');
  
  console.log('1. Ve a tu repositorio en GitHub');
  console.log('2. Settings → Secrets and variables → Actions');
  console.log('3. Haz clic en "New repository secret"');
  console.log('4. Agrega cada secret con su nombre y valor:\n');
  
  for (const [secretName, description] of Object.entries(REQUIRED_SECRETS)) {
    console.log(`🔴 ${secretName}`);
    console.log(`   Descripción: ${description}`);
    
    // Proporcionar ejemplos específicos
    switch (secretName) {
      case 'SNYK_TOKEN':
        console.log(`   Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
        console.log(`   Obtén en: https://app.snyk.io/account`);
        break;
      case 'DEPLOY_PRIVATE_KEY':
        console.log(`   Formato: 0x... (64 caracteres hexadecimales)`);
        break;
      case 'RPC_URL':
        console.log(`   Ejemplo: https://mainnet.infura.io/v3/YOUR_PROJECT_ID`);
        break;
      case 'ETHERSCAN_API_KEY':
        console.log(`   Formato: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`);
        console.log(`   Obtén en: https://etherscan.io/apis`);
        break;
      case 'STAGING_HOST':
      case 'PRODUCTION_HOST':
        console.log(`   Ejemplo: example.com o 192.168.1.100`);
        break;
      case 'STAGING_USER':
      case 'PRODUCTION_USER':
        console.log(`   Ejemplo: deploy o ubuntu`);
        break;
      case 'STAGING_SSH_KEY':
      case 'PRODUCTION_SSH_KEY':
        console.log(`   Formato: -----BEGIN OPENSSH PRIVATE KEY-----...`);
        break;
      case 'PRODUCTION_DOMAIN':
        console.log(`   Ejemplo: jeonsevault.com`);
        break;
    }
    console.log('');
  }
}

function main() {
  console.log('🔧 Validador de GitHub Secrets para JeonseVault\n');
  console.log('=' .repeat(60));
  
  const workflowValid = validateWorkflowFile();
  const docsValid = validateDocumentation();
  
  console.log('\n' + '=' .repeat(60));
  
  if (workflowValid && docsValid) {
    console.log('✅ Validación completada exitosamente');
    console.log('📚 Consulta docs/GITHUB_SECRETS.md para más detalles');
  } else {
    console.log('❌ Se encontraron problemas en la validación');
    console.log('🔧 Ejecuta este script después de corregir los problemas');
  }
  
  generateSetupInstructions();
  
  console.log('\n💡 Consejos adicionales:');
  console.log('   - Nunca commits valores de secrets en el código');
  console.log('   - Usa siempre GitHub Secrets para información sensible');
  console.log('   - Rota regularmente las claves privadas y tokens');
  console.log('   - Considera usar GitHub Environments para mayor seguridad');
  
  process.exit(workflowValid && docsValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateWorkflowFile,
  validateDocumentation,
  REQUIRED_SECRETS,
  OPTIONAL_SECRETS
};
