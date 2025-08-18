# 🔗 Reown AppKit Integration - JeonseVault

## 📋 Overview

JeonseVault utiliza **Reown AppKit** para proporcionar una experiencia de conexión de wallet moderna y segura. Reown es un toolkit completo para Web3 que simplifica la integración de wallets y transacciones blockchain.

## 🚀 Características Implementadas

### ✅ Wallet Connection
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet
- **Kaia Blockchain**: Soporte nativo para Kaia testnet
- **UI Moderna**: Interfaz intuitiva y responsive
- **Estado Persistente**: Mantiene la conexión entre sesiones

### ✅ Transaction Management
- **Gas Estimation**: Estimación automática de gas fees
- **Transaction History**: Historial de transacciones
- **Error Handling**: Manejo robusto de errores
- **Loading States**: Estados de carga informativos

### ✅ User Experience
- **Korean Localization**: Interfaz en coreano
- **Accessibility**: Soporte completo para accesibilidad
- **Mobile Optimized**: Optimizado para dispositivos móviles
- **Theme Customization**: Tema personalizado para JeonseVault

## 🛠️ Configuración

### 1. Instalación de Dependencias

```bash
npm install @reown/appkit @reown/appkit-ui
```

### 2. Configuración de Reown

```typescript
// lib/reown-config.ts
import { createConfig } from '@reown/appkit'
import { kairos } from './config'

export const reownConfig = createConfig({
  appName: 'JeonseVault',
  appDescription: '혁신적인 전세 보증금 스마트 컨트랙트 플랫폼',
  appUrl: 'https://jeonsevault.com',
  appIcon: '/icon-192x192.png',
  
  chains: [kairos],
  
  wallets: {
    walletConnect: {
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: 'JeonseVault',
        description: '전세 보증금 스마트 컨트랙트 플랫폼',
        url: 'https://jeonsevault.com',
        icons: ['https://jeonsevault.com/icon-192x192.png']
      }
    }
  },
  
  theme: {
    mode: 'light',
    accentColor: '#0052CC',
    borderRadius: 'lg',
    fontFamily: 'Inter, Noto Sans KR, sans-serif'
  },
  
  locale: 'ko',
  
  features: {
    wallet: true,
    transaction: true,
    account: true,
    network: true,
    gas: true,
    history: true
  }
})
```

### 3. Provider Setup

```typescript
// app/providers.tsx
import { AppKitProvider } from '@reown/appkit'
import { reownConfig } from '@/lib/reown-config'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={reownConfig}>
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

## 🎯 Componentes Implementados

### ReownWalletConnect

Componente principal para conexión de wallet con múltiples variantes:

```typescript
import { ReownWalletConnect } from '@/components/wallet/ReownWalletConnect'

// Variantes disponibles
<ReownWalletConnect variant="default" />    // Dropdown completo
<ReownWalletConnect variant="compact" />    // Versión compacta
<ReownWalletConnect variant="minimal" />    // Solo dirección
```

**Características:**
- ✅ Conexión automática con múltiples wallets
- ✅ Gestión de estado de conexión
- ✅ Dropdown con opciones de cuenta
- ✅ Desconexión segura
- ✅ Indicadores visuales de estado

### TransactionExample

Componente de ejemplo para transacciones blockchain:

```typescript
import { TransactionExample } from '@/components/wallet/TransactionExample'

<TransactionExample />
```

**Características:**
- ✅ Formulario de transacción
- ✅ Validación de inputs
- ✅ Estimación de gas
- ✅ Estados de carga
- ✅ Confirmación de transacción
- ✅ Manejo de errores

## 🔧 Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
NEXT_PUBLIC_KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_CHAIN_ID=1001
```

## 📱 Uso en Componentes

### Conexión de Wallet

```typescript
import { useAccount, useConnectModal } from '@reown/appkit'

function MyComponent() {
  const { address, isConnected } = useAccount()
  const { open } = useConnectModal()
  
  if (!isConnected) {
    return (
      <button onClick={open}>
        Connect Wallet
      </button>
    )
  }
  
  return <div>Connected: {address}</div>
}
```

### Transacciones

```typescript
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

function TransactionComponent() {
  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'createDeposit',
    value: amount
  })
  
  const { write, isLoading } = useContractWrite(config)
  
  const handleTransaction = () => {
    write?.()
  }
  
  return (
    <button onClick={handleTransaction} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Send Transaction'}
    </button>
  )
}
```

## 🎨 Personalización de Tema

### CSS Variables

```css
:root {
  --reown-accent: #0052CC;
  --reown-accent-foreground: #FFFFFF;
  --reown-background: #F8FAFC;
  --reown-foreground: #1E293B;
  --reown-card: #FFFFFF;
  --reown-card-foreground: #1E293B;
  --reown-primary: #0052CC;
  --reown-primary-foreground: #FFFFFF;
  --reown-secondary: #F1F5F9;
  --reown-secondary-foreground: #475569;
  --reown-muted: #F1F5F9;
  --reown-muted-foreground: #64748B;
  --reown-border: #E2E8F0;
  --reown-input: #FFFFFF;
  --reown-ring: #0052CC;
  --reown-radius: 0.5rem;
}
```

### Tailwind Classes

```typescript
// Clases personalizadas para Reown
const reownClasses = {
  button: 'bg-reown-primary text-reown-primary-foreground hover:bg-reown-primary/90',
  card: 'bg-reown-card text-reown-card-foreground border border-reown-border',
  input: 'bg-reown-input border border-reown-border focus:ring-reown-ring'
}
```

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Validación de Redes**
   - Solo permite conexión a Kaia testnet
   - Detección automática de red incorrecta

2. **Validación de Transacciones**
   - Verificación de saldo antes de transacciones
   - Límites de transacción configurados

3. **Manejo de Errores**
   - Try-catch en todas las operaciones blockchain
   - Mensajes de error informativos

4. **Estado de Conexión**
   - Verificación de conexión antes de operaciones
   - Reconexión automática cuando sea posible

## 📊 Monitoreo y Analytics

### Eventos de Tracking

```typescript
// Eventos que se pueden trackear
const events = {
  wallet_connected: 'Wallet connected successfully',
  wallet_disconnected: 'Wallet disconnected',
  transaction_started: 'Transaction initiated',
  transaction_completed: 'Transaction completed',
  transaction_failed: 'Transaction failed',
  network_switched: 'Network switched'
}
```

## 🚀 Próximos Pasos

### Funcionalidades Planificadas

1. **Gas Fee Delegation**
   - Implementar gas fee delegation para Kaia
   - Optimizar costos de transacción

2. **Batch Transactions**
   - Soporte para transacciones en lote
   - Optimización de múltiples operaciones

3. **Advanced Analytics**
   - Dashboard de transacciones
   - Métricas de uso de wallet

4. **Mobile Wallet Integration**
   - Soporte para Kaia Wallet mobile
   - Deep linking para transacciones

## 📚 Recursos Adicionales

- [Reown AppKit Documentation](https://docs.reown.com)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Kaia Blockchain Documentation](https://docs.kaia.io)
- [Wagmi Documentation](https://wagmi.sh)

## 🤝 Soporte

Para soporte técnico o preguntas sobre la integración de Reown:

- **Email**: support@jeonsevault.com
- **Documentation**: [docs.jeonsevault.com](https://docs.jeonsevault.com)
- **GitHub Issues**: [github.com/jeonsevault/issues](https://github.com/jeonsevault/issues)

---

**JeonseVault Team** | **Reown Integration v1.0.0** | **2025**
