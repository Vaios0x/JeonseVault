import { defineChain } from 'viem'

// Kaia Testnet (Kairos) configuration - Updated for 2025
export const kairos = defineChain({
  id: 1001,
  name: 'Kaia Testnet (Kairos)',
  network: 'kaia-testnet',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
    public: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kaia Explorer',
      url: 'https://explorer.kaia.io',
    },
  },
  testnet: true,
})

// Contract addresses desplegados en Kaia testnet
export const CONTRACT_ADDRESSES = {
  JEONSE_VAULT: process.env.NEXT_PUBLIC_JEONSE_VAULT_ADDRESS || '0x6287ac251C19bFDfc7AE8247D64B952727855Dae',
  INVESTMENT_POOL: process.env.NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS || '0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB',
  PROPERTY_ORACLE: process.env.NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS || '0xF38701CCCE9190D1445c8cB3561104e811CB1468',
  COMPLIANCE_MODULE: process.env.NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS || '0xf18Fa2873244423cb2247C2b64B5992418001702',
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
  TOTAL_JEONSE_MARKET: BigInt('1000000000000000'), // 1,000 trillion KRW in wei
  FRAUD_CASES_ANNUAL: 4000,
  AVERAGE_DEPOSIT: BigInt('500000000'), // 500M KRW in wei
  EXPECTED_APY: 6, // 6% annual return
} as const

// Transaction limits
export const TRANSACTION_LIMITS = {
  MIN_DEPOSIT: BigInt('1000000'), // 1M KRW in wei
  MAX_DEPOSIT: BigInt('10000000000'), // 10B KRW in wei
  MIN_INVESTMENT: BigInt('50000'), // 50K KRW in wei
  ESCROW_FEE: 10, // 0.1% in basis points
  EARLY_RELEASE_FEE: 100, // 1% in basis points
} as const
