/**
 * Polyfill Loader para JeonseVault
 * 
 * Este archivo se encarga de cargar todos los polyfills necesarios
 * antes de que se ejecute cualquier otro código de la aplicación.
 * 
 * Específicamente maneja:
 * - BigInt polyfill para compatibilidad con wagmi/viem
 * - Conversiones seguras entre BigInt y Number
 */

// Cargador controlado para el polyfill de BigInt
import { setupBigIntPolyfill } from './bigint-polyfill'

let isInitialized = false

export function initializeBigIntPolyfill(): boolean {
  if (isInitialized) {
    return true
  }

  try {
    if (typeof window !== 'undefined') {
      const result = setupBigIntPolyfill()
      isInitialized = true
      return result
    }
    return false
  } catch (error) {
    console.warn('Error al inicializar BigInt polyfill:', error)
    return false
  }
}

// Exportar las funciones del polyfill
export { 
  safeToBigInt, 
  safeToNumber, 
  safeBigIntToNumber, 
  safeNumberToBigInt,
  isBigIntSupported 
} from './bigint-polyfill'
