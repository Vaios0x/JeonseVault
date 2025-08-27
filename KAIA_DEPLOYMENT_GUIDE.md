# 🚀 Guía de Despliegue - Kaia Testnet

Esta guía te ayudará a desplegar los smart contracts de JeonseVault en la red de prueba de Kaia.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- npm o yarn instalado
- Private key de la cuenta que va a desplegar
- Saldo suficiente en Kaia testnet (al menos 0.1 ETH)

## 🔧 Configuración Inicial

### 1. Configurar la Private Key

Primero, necesitas configurar tu private key como variable de entorno:

```bash
# En Windows PowerShell
$env:PRIVATE_KEY="tu_private_key_aqui"

# En Linux/Mac
export PRIVATE_KEY="tu_private_key_aqui"
```

**⚠️ IMPORTANTE**: Nunca compartas tu private key ni la incluyas en archivos que se suban a Git.

### 2. Verificar Balance

Verifica que tu cuenta tenga saldo suficiente:

```bash
npx hardhat run scripts/check-balance.js --network kairos
```

## 🚀 Proceso de Despliegue

### Opción 1: Despliegue Automático (Recomendado)

Ejecuta el script de configuración automática:

```bash
node scripts/setup-kaia-deployment.js
```

Este script:
- ✅ Verifica la configuración
- ✅ Compila los contratos
- ✅ Ejecuta tests básicos
- ✅ Despliega todos los contratos
- ✅ Configura el archivo `.env.local`
- ✅ Actualiza la información de despliegue

### Opción 2: Despliegue Manual

Si prefieres hacer el despliegue paso a paso:

#### 1. Compilar Contratos

```bash
npx hardhat compile
```

#### 2. Ejecutar Tests

```bash
npx hardhat test
```

#### 3. Desplegar Contratos

```bash
npx hardhat run scripts/deploy.ts --network kairos
```

## 🔐 Configuración de Ownership

### Verificar Ownership Actual

```bash
npx hardhat run scripts/verify-deployment.ts --network kairos
```

### Transferir Ownership (si es necesario)

Si el owner actual no es `0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1`:

```bash
npx hardhat run scripts/transfer-ownership.ts --network kairos
```

## 📊 Contratos Desplegados

Los siguientes contratos serán desplegados en orden:

1. **PropertyOracle** - Verificación de propiedades
2. **ComplianceModule** - Cumplimiento KYC/AML
3. **InvestmentPool** - Pool de inversiones
4. **JeonseVault** - Contrato principal

## 🔍 Verificación

### Verificar en el Explorador

Una vez desplegados, puedes verificar los contratos en el explorador de Kaia:
- **Explorador**: https://explorer.kaia.io
- **Chain ID**: 1001
- **RPC URL**: https://public-en-kairos.node.kaia.io

### Verificar Configuración

```bash
npx hardhat run scripts/verify-deployment.ts --network kairos
```

## 📄 Archivos Generados

Después del despliegue, se generarán los siguientes archivos:

- `deployments/kairos.json` - Información completa del despliegue
- `.env.local` - Variables de entorno con las direcciones de contratos
- `lib/deployed-contracts.ts` - Configuración TypeScript

## 🔧 Configuración de Roles

Los contratos utilizan un sistema de roles basado en OpenZeppelin AccessControl:

### JeonseVault
- `ADMIN_ROLE` - Administración general
- `DEFAULT_ADMIN_ROLE` - Super administrador

### PropertyOracle
- `ADMIN_ROLE` - Administración
- `ORACLE_ROLE` - Actualización de datos
- `VERIFIER_ROLE` - Verificación de propiedades

### ComplianceModule
- `ADMIN_ROLE` - Administración
- `COMPLIANCE_OFFICER_ROLE` - Oficial de cumplimiento
- `VERIFIER_ROLE` - Verificación de usuarios

### InvestmentPool
- `ADMIN_ROLE` - Administración
- `VAULT_ROLE` - Control del vault (JeonseVault)

## 🧪 Testing

### Ejecutar Tests Locales

```bash
npx hardhat test
```

### Ejecutar Tests en Kaia Testnet

```bash
npx hardhat test --network kairos
```

## 🔄 Actualización de Contratos

Si necesitas actualizar contratos ya desplegados:

1. **Compilar** los cambios
2. **Desplegar** los nuevos contratos
3. **Actualizar** las referencias en JeonseVault
4. **Verificar** la funcionalidad

## 🚨 Solución de Problemas

### Error: "Insufficient funds"

```bash
# Verificar balance
npx hardhat run scripts/check-balance.js --network kairos

# Obtener tokens de prueba si es necesario
# Visita: https://faucet.kaia.io
```

### Error: "Contract verification failed"

```bash
# Verificar que los contratos estén desplegados
npx hardhat run scripts/verify-deployment.ts --network kairos
```

### Error: "Role not granted"

```bash
# Transferir ownership correctamente
npx hardhat run scripts/transfer-ownership.ts --network kairos
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Verifica que tu private key esté configurada correctamente
2. Asegúrate de tener saldo suficiente en Kaia testnet
3. Revisa los logs de error para identificar el problema específico
4. Consulta la documentación de Kaia: https://docs.kaia.io

## 🔗 Enlaces Útiles

- **Kaia Testnet**: https://testnet.kaia.io
- **Explorador**: https://explorer.kaia.io
- **Faucet**: https://faucet.kaia.io
- **Documentación**: https://docs.kaia.io
- **Discord**: https://discord.gg/kaia

---

**🎉 ¡Felicitaciones!** Si has llegado hasta aquí, has desplegado exitosamente JeonseVault en Kaia testnet.
