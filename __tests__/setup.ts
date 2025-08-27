import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de React (debe estar antes de cualquier otro mock)
vi.mock('react', () => {
  const React = require('react')
  return {
    ...React,
    createElement: React.createElement,
    Fragment: React.Fragment
  }
})

// Mock de wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
  })),
  useBalance: vi.fn(() => ({
    data: { value: BigInt('1000000000000000000'), formatted: '1.0' },
    isLoading: false,
  })),
  useChainId: vi.fn(() => 1001),
  useReadContract: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useWriteContract: vi.fn(() => ({
    writeContract: vi.fn(),
    data: null,
    isLoading: false,
    error: null,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
    error: null,
  })),
  readContract: vi.fn(),
}))

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => {
    const t = (key: string) => key
    t.raw = (key: string) => key
    return t
  }),
  useLocale: vi.fn(() => 'es'),
  getTranslations: vi.fn(() => (key: string) => key),
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  },
}))

// Mock de framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('div', props, children)
    },
    button: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('button', props, children)
    },
    span: ({ children, ...props }: any) => {
      const React = require('react')
      return React.createElement('span', props, children)
    },
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock de clsx
vi.mock('clsx', () => ({
  default: (...args: any[]) => args.filter(Boolean).join(' '),
}))

// Mock de appkit-button
vi.mock('@/components/ui/AppKitButton', () => ({
  AppKitButton: () => {
    const React = require('react')
    return React.createElement('button', { 'data-testid': 'appkit-button' }, 'Connect Wallet')
  },
}))

// Mock de hooks personalizados
vi.mock('@/hooks/useWeb3', () => ({
  useWeb3: vi.fn(() => ({
    jeonseVault: {
      deposits: [],
      userDeposits: [],
      isLoading: false,
      error: null,
      createDeposit: vi.fn(),
      isCreating: false,
    },
    deposits: {
      userDeposits: [],
      isLoading: false,
      error: null,
    },
    investmentPool: {
      poolStats: {
        totalPoolValue: BigInt(0),
        totalUserValue: BigInt(0),
        expectedAnnualReturn: BigInt(0),
        totalInvestors: 0,
      },
      userInvestments: [],
      isLoading: false,
      error: null,
    },
    compliance: {
      userCompliance: {
        isVerified: true,
        level: 'Premium',
        transactionLimit: BigInt('1000000000000000000000000'),
        monthlyLimit: BigInt('500000000000000000000000'),
        monthlySpent: BigInt('200000000000000000000000'),
        lastMonthReset: BigInt(Math.floor(Date.now() / 1000)),
      },
      isLoading: false,
      error: null,
    },
    isContractDeployed: true,
  })),
}))

// Mock de componentes UI
vi.mock('@/components/ui/Loading', () => ({
  Loading: ({ size }: { size?: string }) => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'loading', 'data-size': size }, 'Loading...')
  },
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => {
    const React = require('react')
    return React.createElement('button', { onClick, 'data-variant': variant, 'data-size': size, className, ...props }, children)
  },
}))

vi.mock('@/components/ui/Input', () => ({
  Input: ({ label, error, ...props }: any) => {
    const React = require('react')
    return React.createElement('input', { ...props, 'data-testid': 'input' })
  },
}))

vi.mock('@/components/ui/Select', () => ({
  Select: ({ options, value, onChange, ...props }: any) => {
    const React = require('react')
    return React.createElement('select', { value, onChange, ...props }, 
      options.map((opt: any) => 
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
      )
    )
  },
}))

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ children, isOpen, onClose }: any) => {
    const React = require('react')
    return isOpen ? React.createElement('div', { 'data-testid': 'modal' }, children) : null
  },
  useModal: () => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
  }),
}))

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
  useToastHelpers: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

// Mock de componentes de dashboard
vi.mock('@/components/dashboard/DepositCard', () => ({
  DepositCard: ({ deposit }: { deposit: any }) => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'deposit-card', 'data-deposit-id': deposit.id.toString() }, [
      React.createElement('h3', { key: 'title' }, `Depósito #${deposit.id}`),
      React.createElement('p', { key: 'amount' }, `Monto: ${deposit.amount.toString()}`),
      React.createElement('p', { key: 'status' }, `Estado: ${deposit.status === 0 ? 'Activo' : 'Completado'}`),
    ])
  },
}))

vi.mock('@/components/dashboard/StatsWidget', () => ({
  StatsWidget: () => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'stats-widget' }, [
      React.createElement('h2', { key: 'title' }, 'Estadísticas'),
      React.createElement('div', { key: 'total', 'data-testid': 'total-deposits' }, 'Total: 1'),
      React.createElement('div', { key: 'value', 'data-testid': 'total-value' }, 'Valor: 500M KRW'),
      React.createElement('div', { key: 'returns', 'data-testid': 'total-returns' }, 'Retornos: 30M KRW'),
    ])
  },
}))

// Mock de componentes de depósito
vi.mock('@/components/deposit/CreateDepositForm', () => ({
  CreateDepositForm: ({ onSuccess }: { onSuccess?: (id: string) => void }) => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'create-deposit-form' }, [
      React.createElement('h2', { key: 'title' }, 'Crear Nuevo Depósito'),
      React.createElement('button', { 
        key: 'submit',
        'data-testid': 'submit-form',
        onClick: () => onSuccess?.('deposit-123')
      }, 'Crear Depósito'),
    ])
  },
}))

// Mock de componentes de inversión
vi.mock('@/components/investment/PoolList', () => ({
  PoolList: () => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'pool-list' }, 'Lista de Pools')
  },
}))

vi.mock('@/components/investment/ReturnsCalculator', () => ({
  ReturnsCalculator: () => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'returns-calculator' }, 'Calculadora de Retornos')
  },
}))

// Mock de servicios
vi.mock('@/services/AnalyticsService', () => ({
  analyticsService: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackClick: vi.fn(),
    trackTransaction: vi.fn(),
    trackError: vi.fn(),
    trackPerformance: vi.fn(),
  },
  useAnalyticsService: () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackClick: vi.fn(),
    trackTransaction: vi.fn(),
    trackError: vi.fn(),
    trackPerformance: vi.fn(),
  }),
}))

// Mock de utils
vi.mock('@/utils/formatters', () => ({
  formatAmount: (amount: bigint | number) => `${amount} KRW`,
  formatPercentage: (value: number, total: number = 100) => `${value}%`,
  formatDate: (date: Date) => date.toLocaleDateString(),
  parseAmount: (amount: string) => BigInt(amount.replace(/[^0-9]/g, '')),
}))

// Mock de config
vi.mock('@/config/wagmi', () => ({
  kairos: {
    id: 1001,
    name: 'Kaia Testnet',
    network: 'kaia-testnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://public-en-kairos.node.kaia.io'] },
      public: { http: ['https://public-en-kairos.node.kaia.io'] },
    },
  },
}))

vi.mock('@/lib/config', () => ({
  CONTRACT_ADDRESSES: {
    JEONSE_VAULT: '0x1234567890123456789012345678901234567890',
    INVESTMENT_POOL: '0x0987654321098765432109876543210987654321',
    PROPERTY_ORACLE: '0x1111111111111111111111111111111111111111',
    COMPLIANCE_MODULE: '0x2222222222222222222222222222222222222222',
  },
}))

// Configuración global de tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de window.scrollTo
window.scrollTo = vi.fn()

// Mock de console para evitar ruido en tests
const originalConsole = { ...console }
beforeAll(() => {
  console.log = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})
