# Hooks Web3 - JeonseVault

Esta carpeta contiene todos los hooks Web3 personalizados para interactuar con los contratos inteligentes de JeonseVault.

## 📋 Hooks Disponibles

### 1. `useJeonseVault` - Hook Principal
Hook principal para interactuar con el contrato JeonseVault.

```typescript
import { useJeonseVault } from '@/hooks'

const {
  contractState,
  deposits,
  userDeposits,
  createDeposit,
  releaseDeposit,
  disputeDeposit,
  isLoading,
  error
} = useJeonseVault()
```

**Funciones principales:**
- `createDeposit()` - Crear nuevo depósito
- `releaseDeposit()` - Liberar depósito
- `disputeDeposit()` - Disputar depósito
- `enableInvestment()` - Habilitar inversión

### 2. `useKaiaGasless` - Transacciones Sin Gas
Hook para transacciones sin gas en Kaia blockchain.

```typescript
import { useKaiaGasless } from '@/hooks'

const {
  sendGaslessTransaction,
  estimateGas,
  isProcessing,
  gasConfig
} = useKaiaGasless()
```

**Características:**
- Gas delegation
- Meta-transactions
- Estimación automática de gas
- Configuración optimizada para Kaia

### 3. `useInvestmentPool` - Pool de Inversión
Hook para gestionar inversiones en el pool.

```typescript
import { useInvestmentPool } from '@/hooks'

const {
  poolStats,
  userInvestments,
  investInDeposit,
  withdrawInvestment,
  claimReturns
} = useInvestmentPool()
```

**Funciones:**
- `investInDeposit()` - Invertir en depósito
- `withdrawInvestment()` - Retirar inversión
- `claimReturns()` - Reclamar retornos

### 4. `useCompliance` - KYC/AML
Hook para gestión de compliance y verificación de usuarios.

```typescript
import { useCompliance } from '@/hooks'

const {
  userCompliance,
  isVerified,
  complianceLevel,
  checkCompliance,
  validateTransaction
} = useCompliance()
```

**Niveles de Compliance:**
- `None` - Sin verificación
- `Basic` - Hasta 10M KRW
- `Standard` - Hasta 100M KRW
- `Premium` - Hasta 1B KRW
- `Corporate` - Hasta 10B KRW

### 5. `usePropertyOracle` - Oracle de Propiedades
Hook para verificación y gestión de propiedades.

```typescript
import { usePropertyOracle } from '@/hooks'

const {
  properties,
  userProperties,
  registerProperty,
  verifyProperty,
  updatePropertyValue
} = usePropertyOracle()
```

**Tipos de Propiedad:**
- `Apartment` - Apartamento
- `House` - Casa
- `Officetel` - Oficetel
- `Villa` - Villa
- `Commercial` - Comercial

### 6. `useDeposits` - Gestión de Depósitos
Hook para filtrado, búsqueda y análisis de depósitos.

```typescript
import { useDeposits } from '@/hooks'

const {
  allDeposits,
  filteredDeposits,
  depositStats,
  searchDeposits,
  getDepositTrends
} = useDeposits()
```

**Características:**
- Filtrado avanzado
- Búsqueda semántica
- Estadísticas en tiempo real
- Análisis de tendencias

### 7. `useUserProfile` - Perfil de Usuario
Hook para gestión completa del perfil de usuario.

```typescript
import { useUserProfile } from '@/hooks'

const {
  profile,
  transactionHistory,
  updateProfile,
  updatePreferences,
  getUserStatistics
} = useUserProfile()
```

**Funcionalidades:**
- Gestión de perfil
- Preferencias de usuario
- Historial de transacciones
- Estadísticas personales
- Exportación de datos

## 🚀 Uso Básico

### Ejemplo de Creación de Depósito

```typescript
import { useJeonseVault, useCompliance } from '@/hooks'

function CreateDepositForm() {
  const { createDeposit, isCreatingDeposit } = useJeonseVault()
  const { validateTransaction } = useCompliance()

  const handleSubmit = async (formData) => {
    // Validar transacción
    const isValid = await validateTransaction(formData.amount)
    
    if (isValid) {
      await createDeposit({
        landlord: formData.landlord,
        endDate: formData.endDate,
        propertyId: formData.propertyId,
        propertyAddress: formData.propertyAddress,
        enableInvestment: formData.enableInvestment,
        amount: formData.amount
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario */}
    </form>
  )
}
```

### Ejemplo de Dashboard

```typescript
import { useUserProfile, useDeposits, useInvestmentPool } from '@/hooks'

function Dashboard() {
  const { profile, getUserStatistics } = useUserProfile()
  const { depositStats } = useDeposits()
  const { poolStats } = useInvestmentPool()

  const stats = getUserStatistics()

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Total Value Locked: {formatAmount(stats.totalValueLocked)}</div>
      <div>Total Deposits: {stats.totalDeposits}</div>
      <div>Total Returns: {formatAmount(stats.totalReturns)}</div>
    </div>
  )
}
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Contratos
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x...
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0x...
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0x...

# Kaia
NEXT_PUBLIC_KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_CHAIN_ID=1001
```

### Configuración de Wagmi

Los hooks utilizan la configuración de Wagmi definida en `config/wagmi.ts`.

## 📊 Características Avanzadas

### Optimizaciones de Rendimiento
- Memoización de datos con `useMemo`
- Callbacks optimizados con `useCallback`
- Carga lazy de datos
- Cache inteligente

### Manejo de Errores
- Errores de transacción
- Errores de red
- Errores de validación
- Toast notifications

### Estados de Carga
- Estados individuales por operación
- Estados de carga general
- Indicadores de progreso
- Feedback visual

### Seguridad
- Validación de transacciones
- Verificación de compliance
- Límites de transacción
- Protección contra ataques

## 🧪 Testing

```typescript
// Ejemplo de test
import { renderHook, waitFor } from '@testing-library/react'
import { useJeonseVault } from '@/hooks'

test('should create deposit', async () => {
  const { result } = renderHook(() => useJeonseVault())
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  
  expect(result.current.deposits).toBeDefined()
})
```

## 📝 Notas de Desarrollo

### Mejores Prácticas
1. Siempre verificar el estado de conexión antes de usar hooks
2. Manejar estados de carga apropiadamente
3. Implementar manejo de errores robusto
4. Usar tipos TypeScript para mejor DX

### Consideraciones de Gas
- Los hooks incluyen estimación automática de gas
- Configuración optimizada para Kaia
- Soporte para transacciones sin gas

### Compatibilidad
- Wagmi v2
- Viem v2
- React 18+
- TypeScript 5+

## 🤝 Contribución

Para contribuir a los hooks:

1. Mantener consistencia en la API
2. Agregar tipos TypeScript completos
3. Incluir manejo de errores
4. Documentar nuevas funcionalidades
5. Agregar tests unitarios

## 📄 Licencia

MIT License - ver LICENSE para más detalles.
