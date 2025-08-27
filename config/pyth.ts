/**
 * Configuración de Pyth Network para JeonseVault
 * Direcciones de contratos y Price IDs para diferentes redes
 */

export interface PythConfig {
  pythContract: string
  krwUsdPriceId: string
  usdcUsdPriceId: string
  ethUsdPriceId: string
  networkName: string
  chainId: number
  description: string
}

export const PYTH_CONFIGS: Record<number, PythConfig> = {
  // Ethereum Mainnet
  1: {
    pythContract: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
    ethUsdPriceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    networkName: 'Ethereum Mainnet',
    chainId: 1,
    description: 'Pyth Network en Ethereum Mainnet'
  },
  
  // Sepolia Testnet
  11155111: {
    pythContract: '0x2880aB155794e7179c9eE2e3820029c9bE88A4c2',
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f6e7d17b74a8b5c39f57b',
    ethUsdPriceId: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    networkName: 'Sepolia Testnet',
    chainId: 11155111,
    description: 'Pyth Network en Sepolia Testnet'
  },
  
  // Polygon Mainnet
  137: {
    pythContract: '0x4D7C363DED4B3b4e1F954494d2Bc3955e49699cC',
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2808bb4f82baa94b',
    ethUsdPriceId: '0x23dec3db7e8b6c80b79e75a0a712c6fdb5650a29',
    networkName: 'Polygon Mainnet',
    chainId: 137,
    description: 'Pyth Network en Polygon Mainnet'
  },
  
  // BSC Mainnet
  56: {
    pythContract: '0x4D7C363DED4B3b4e1F954494d2Bc3955e49699cC',
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2808bb4f82baa94b',
    ethUsdPriceId: '0x23dec3db7e8b6c80b79e75a0a712c6fdb5650a29',
    networkName: 'BSC Mainnet',
    chainId: 56,
    description: 'Pyth Network en BSC Mainnet'
  },
  
  // Kaia Testnet (usando configuración de testnet)
  1001: {
    pythContract: '0x2880aB155794e7179c9eE2e3820029c9bE88A4c2', // Usando Sepolia como base
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f6e7d17b74a8b5c39f57b',
    ethUsdPriceId: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    networkName: 'Kaia Testnet',
    chainId: 1001,
    description: 'Pyth Network en Kaia testnet (configuración de testnet)'
  },
  
  // Hardhat Local
  31337: {
    pythContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
    usdcUsdPriceId: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f6e7d17b74a8b5c39f57b',
    ethUsdPriceId: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    networkName: 'Hardhat Local',
    chainId: 31337,
    description: 'Pyth Network para desarrollo local'
  }
}

/**
 * Obtener configuración de Pyth para una red específica
 * @param chainId ID de la cadena
 * @returns Configuración de Pyth
 */
export function getPythConfig(chainId: number): PythConfig | null {
  return PYTH_CONFIGS[chainId] || null
}

/**
 * Verificar si una red tiene soporte para Pyth
 * @param chainId ID de la cadena
 * @returns True si tiene soporte
 */
export function hasPythSupport(chainId: number): boolean {
  const config = getPythConfig(chainId)
  return config !== null && config.pythContract !== '0x0000000000000000000000000000000000000000'
}

/**
 * Obtener todas las redes soportadas
 * @returns Array de configuraciones de red
 */
export function getSupportedPythNetworks(): PythConfig[] {
  return Object.values(PYTH_CONFIGS).filter(config => 
    config.pythContract !== '0x0000000000000000000000000000000000000000'
  )
}

/**
 * Configuración por defecto para desarrollo
 */
export const DEFAULT_PYTH_CONFIG: PythConfig = {
  pythContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  krwUsdPriceId: '0xef2c98c804ba503c6a406d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d3b4d',
  usdcUsdPriceId: '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f6e7d17b74a8b5c39f57b',
  ethUsdPriceId: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
  networkName: 'Development',
  chainId: 31337,
  description: 'Configuración por defecto para desarrollo'
}

export default PYTH_CONFIGS
