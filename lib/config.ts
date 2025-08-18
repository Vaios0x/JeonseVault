import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { 
  injected, 
  walletConnect, 
  coinbaseWallet 
} from 'wagmi/connectors'

// Kaia Testnet (Kairos) configuration
export const kairos = defineChain({
  id: 1001,
  name: 'Kaia Testnet Kairos',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kaia Scope',
      url: 'https://baobab.klaytnscope.com',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [kairos],
  transports: {
    [kairos.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
      metadata: {
        name: 'JeonseVault',
        description: '전세 보증금 스마트 컨트랙트 플랫폼',
        url: 'https://jeonsevault.com',
        icons: ['https://jeonsevault.com/icon-192x192.png']
      }
    }),
    coinbaseWallet({
      appName: 'JeonseVault',
      appLogoUrl: 'https://jeonsevault.com/icon-192x192.png'
    })
  ]
})

// Contract addresses (to be filled after deployment)
export const CONTRACT_ADDRESSES = {
  JEONSE_VAULT: process.env.NEXT_PUBLIC_JEONSE_VAULT_ADDRESS || '',
  INVESTMENT_POOL: process.env.NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS || '',
  PROPERTY_ORACLE: process.env.NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS || '',
  COMPLIANCE_MODULE: process.env.NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS || '',
} as const

// App configuration
export const APP_CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'JeonseVault',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '혁신적인 전세 보증금 스마트 컨트랙트 플랫폼',
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@jeonsevault.com',
  CHAIN_ID: 1001,
  RPC_URL: process.env.NEXT_PUBLIC_KAIA_RPC_URL || 'https://public-en-kairos.node.kaia.io',
} as const

// Market data
export const MARKET_DATA = {
  TOTAL_JEONSE_MARKET: '1000000000000000', // 1,000 trillion KRW in wei
  FRAUD_CASES_ANNUAL: 4000,
  AVERAGE_DEPOSIT: '500000000', // 500M KRW in wei
  EXPECTED_APY: 6, // 6% annual return
} as const

// Transaction limits
export const TRANSACTION_LIMITS = {
  MIN_DEPOSIT: '1000000', // 1M KRW in wei
  MAX_DEPOSIT: '10000000000', // 10B KRW in wei
  MIN_INVESTMENT: '50000', // 50K KRW in wei
  ESCROW_FEE: 10, // 0.1% in basis points
  EARLY_RELEASE_FEE: 100, // 1% in basis points
} as const
