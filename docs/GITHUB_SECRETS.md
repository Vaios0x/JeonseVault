# GitHub Secrets Configuration

Este documento describe las variables de entorno (secrets) requeridas para el workflow de CI/CD de JeonseVault.

## Configuración de Secrets

Para configurar estos secrets, ve a tu repositorio en GitHub:
1. Settings → Secrets and variables → Actions
2. Haz clic en "New repository secret"
3. Agrega cada secret con su nombre y valor correspondiente

## Secrets Requeridos

### 🔒 Security
- **SNYK_TOKEN**: Token de API de Snyk para escaneo de seguridad
  - Obtén tu token en: https://app.snyk.io/account
  - Formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 📜 Smart Contract Deployment
- **DEPLOY_PRIVATE_KEY**: Clave privada para el despliegue de contratos inteligentes
  - Debe ser una clave privada de Ethereum válida
  - Formato: `0x...` (64 caracteres hexadecimales)
  
- **RPC_URL**: URL del endpoint RPC de Ethereum
  - Ejemplo: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
  - O para testnet: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
  
- **ETHERSCAN_API_KEY**: Clave de API de Etherscan para verificación de contratos
  - Obtén tu clave en: https://etherscan.io/apis
  - Formato: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 🚀 Staging Deployment
- **STAGING_HOST**: Hostname o IP del servidor de staging
  - Ejemplo: `staging.jeonsevault.com` o `192.168.1.100`
  
- **STAGING_USER**: Usuario SSH para el servidor de staging
  - Ejemplo: `deploy` o `ubuntu`
  
- **STAGING_SSH_KEY**: Clave privada SSH para el servidor de staging
  - Debe ser la clave privada completa (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----`)

### 🚀 Production Deployment
- **PRODUCTION_HOST**: Hostname o IP del servidor de producción
  - Ejemplo: `jeonsevault.com` o `203.0.113.10`
  
- **PRODUCTION_USER**: Usuario SSH para el servidor de producción
  - Ejemplo: `deploy` o `ubuntu`
  
- **PRODUCTION_SSH_KEY**: Clave privada SSH para el servidor de producción
  - Debe ser la clave privada completa (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----`)
  
- **PRODUCTION_DOMAIN**: Dominio de producción
  - Ejemplo: `jeonsevault.com`

## Configuración Opcional

### 📊 Monitoring (Futuro)
- **SLACK_WEBHOOK_URL**: URL del webhook de Slack para notificaciones
- **DISCORD_WEBHOOK_URL**: URL del webhook de Discord para notificaciones

## Verificación de Configuración

Para verificar que todos los secrets están configurados correctamente:

1. Ejecuta el workflow manualmente desde la pestaña Actions
2. Revisa los logs para asegurarte de que no hay errores de variables no definidas
3. Verifica que los despliegues funcionan correctamente

## Seguridad

⚠️ **Importante**: 
- Nunca commits estos valores directamente en el código
- Usa siempre los secrets de GitHub para información sensible
- Rota regularmente las claves privadas y tokens
- Usa claves SSH específicas para cada entorno
- Considera usar GitHub Environments para mayor seguridad

## Troubleshooting

### Error: "Context access might be invalid"
Este error aparece cuando el linter detecta que una variable podría no estar definida. Para solucionarlo:

1. Verifica que el secret esté configurado en GitHub
2. Asegúrate de que el nombre del secret coincida exactamente
3. Revisa que el workflow tenga permisos para acceder a los secrets

### Error: "Secret not found"
1. Verifica que el secret esté configurado en el repositorio correcto
2. Asegúrate de que el nombre del secret no tenga espacios o caracteres especiales
3. Verifica que tengas permisos para acceder a los secrets del repositorio
