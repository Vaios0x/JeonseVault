'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { wagmiAdapter, projectId, wagmiConfig, kairos } from '@/config/wagmi'

// Set up queryClient
const queryClient = new QueryClient()

// Set up metadata
const metadata = {
	name: 'JeonseVault',
	description: 'Powered by Reown',
	url: 'https://jeonsevault.com',
	icons: ['https://jeonsevault.com/icon-192x192.png']
}

if (!projectId) {
	console.warn('NEXT_PUBLIC_PROJECT_ID no está definido. Usa un Project ID de Reown Dashboard.')
}

// Create the AppKit modal
createAppKit({
	adapters: [wagmiAdapter],
	projectId,
	networks: [kairos],
	defaultNetwork: kairos,
	metadata,
	features: {
		analytics: true
	}
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
	const initialState = cookieToInitialState(wagmiConfig as Config, cookies)

	return (
		<WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	)
}

export default ContextProvider
