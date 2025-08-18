import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

// Define Kaia Testnet (Kairos)
export const kairos = defineChain({
  id: 1001,
  name: 'Kaia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
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

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

export const networks = [kairos]

export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage
	}),
	ssr: true,
	projectId,
	networks
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
