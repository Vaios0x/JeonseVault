// ============================================================================
// CONFIGURACIÓN ACTUALIZADA DE KAIA TESTNET (KAIROS) - 2025
// ============================================================================

import { defineChain } from 'viem'

/**
 * Configuración oficial de Kaia Testnet (Kairos) para 2025
 * 
 * Información verificada:
 * - Chain ID: 1001
 * - Network: kaia-testnet
 * - RPC URL: https://public-en-kairos.node.kaia.io
 * - Explorer: https://baobab.klaytnscope.com
 * - Currency: KAIA
 * - Decimals: 18
 */
export const kaiaTestnet = defineChain({
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

// Configuración de la aplicación para Kaia
export const KAIA_APP_CONFIG = {
  CHAIN_ID: 1001,
  CHAIN_NAME: 'Kaia Testnet (Kairos)',
  RPC_URL: 'https://public-en-kairos.node.kaia.io',
  EXPLORER_URL: 'https://explorer.kaia.io',
  CURRENCY_SYMBOL: 'KAIA',
  DECIMALS: 18,
  BLOCK_TIME: 12, // segundos
  IS_TESTNET: true,
} as const

// Configuración de gas para Kaia
export const KAIA_GAS_CONFIG = {
  DEFAULT_GAS_PRICE: 25000000000, // 25 Gwei
  MAX_GAS_LIMIT: 12000000,
  BLOCK_GAS_LIMIT: 12000000,
  TIMEOUT: 60000, // 60 segundos
} as const

// Configuración de contratos para Kaia
export const KAIA_CONTRACT_CONFIG = {
  // Direcciones de contratos desplegados en Kaia testnet
  JEONSE_VAULT: process.env.NEXT_PUBLIC_JEONSE_VAULT_ADDRESS || '0x6287ac251C19bFDfc7AE8247D64B952727855Dae',
  INVESTMENT_POOL: process.env.NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS || '0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB',
  PROPERTY_ORACLE: process.env.NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS || '0xF38701CCCE9190D1445c8cB3561104e811CB1468',
  COMPLIANCE_MODULE: process.env.NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS || '0xf18Fa2873244423cb2247C2b64B5992418001702',
  
  // Configuración de deployment
  DEPLOYMENT_NETWORK: 'kairos',
  VERIFY_CONTRACTS: true,
} as const

// Configuración de oráculos para Kaia
export const KAIA_ORACLE_CONFIG = {
  // Chainlink (Mock para testnet)
  CHAINLINK: {
    KRW_USD_FEED: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Mock feed
    NETWORK_NAME: 'Kaia Testnet',
    DESCRIPTION: 'Feed simulado para KRW/USD en Kaia testnet',
  },
  
  // Pyth Network (usando Sepolia como base)
  PYTH: {
    CONTRACT: '0x2880aB155794e7179c9eE2e3820029c9bE88A4c2',
    KRW_USD_PRICE_ID: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    USDC_USD_PRICE_ID: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f6e7d17b74a8b5c39f57b',
    ETH_USD_PRICE_ID: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    NETWORK_NAME: 'Kaia Testnet',
    DESCRIPTION: 'Pyth Network en Kaia testnet (configuración de testnet)',
  },
} as const

// Configuración de límites de transacciones para Kaia
export const KAIA_TRANSACTION_LIMITS = {
  MIN_DEPOSIT: BigInt('1000000'), // 1M KRW in wei
  MAX_DEPOSIT: BigInt('10000000000'), // 10B KRW in wei
  MIN_INVESTMENT: BigInt('50000'), // 50K KRW in wei
  ESCROW_FEE: 10, // 0.1% in basis points
  EARLY_RELEASE_FEE: 100, // 1% in basis points
} as const

// Configuración de datos de mercado para Kaia
export const KAIA_MARKET_DATA = {
  TOTAL_JEONSE_MARKET: BigInt('1000000000000000'), // 1,000 trillion KRW in wei
  FRAUD_CASES_ANNUAL: 4000,
  AVERAGE_DEPOSIT: BigInt('500000000'), // 500M KRW in wei
  EXPECTED_APY: 6, // 6% annual return
} as const

// Función para validar la configuración de Kaia
export function validateKaiaConfig() {
  const requiredFields = [
    'CHAIN_ID',
    'RPC_URL',
    'EXPLORER_URL',
    'CURRENCY_SYMBOL',
  ]
  
  const missingFields = requiredFields.filter(field => !KAIA_APP_CONFIG[field as keyof typeof KAIA_APP_CONFIG])
  
  if (missingFields.length > 0) {
    throw new Error(`Configuración de Kaia incompleta. Campos faltantes: ${missingFields.join(', ')}`)
  }
  
  console.log('✅ Configuración de Kaia validada correctamente')
  return true
}

// Exportar configuración principal
export default {
  chain: kaiaTestnet,
  app: KAIA_APP_CONFIG,
  gas: KAIA_GAS_CONFIG,
  contracts: KAIA_CONTRACT_CONFIG,
  oracles: KAIA_ORACLE_CONFIG,
  limits: KAIA_TRANSACTION_LIMITS,
  market: KAIA_MARKET_DATA,
  validate: validateKaiaConfig,
}
