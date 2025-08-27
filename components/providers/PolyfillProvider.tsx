'use client'

import { useEffect } from 'react'
import { initializeBigIntPolyfill } from '@/lib/polyfill-loader'

export function PolyfillProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar el polyfill de BigInt cuando el componente se monte
    try {
      initializeBigIntPolyfill()
    } catch (error) {
      console.warn('Error al inicializar BigInt polyfill:', error)
    }
  }, [])

  return <>{children}</>
}
