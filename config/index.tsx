import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { kaiaTestnet } from './kaia-2025'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'd7242b85d653283db8721b60ce80a938'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Usar la configuración actualizada de Kaia para 2025
export const kaia = kaiaTestnet
export const networks = [kaia]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
