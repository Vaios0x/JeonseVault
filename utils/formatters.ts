// Utilidades de formateo para la aplicación
import { safeToNumber, safeToBigInt } from '../lib/polyfill-loader'

/**
 * Formatea un monto en KRW
 */
export function formatAmount(amount: bigint | number): string {
  const numAmount = safeToNumber(amount)
  
  // Convertir de wei a KRW (asumiendo 1 KRW = 1e18 wei)
  const krwAmount = numAmount / 1e18
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(krwAmount)
}

/**
 * Parsea un monto de KRW a wei
 */
export function parseAmount(amount: string): bigint {
  const cleanAmount = amount.replace(/[^0-9]/g, '')
  const numAmount = parseInt(cleanAmount) || 0
  
  // Convertir de KRW a wei
  return safeToBigInt(numAmount * 1e18)
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: bigint | number, total: bigint | number): string {
  const numValue = safeToNumber(value)
  const numTotal = safeToNumber(total)
  
  if (numTotal === 0) return '0%'
  
  const percentage = (numValue / numTotal) * 100
  return `${percentage.toFixed(1)}%`
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Formatea una dirección de wallet
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

/**
 * Formatea una duración en días
 */
export function formatDuration(days: number): string {
  if (days < 30) {
    return `${days} días`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} mes${months > 1 ? 'es' : ''}`
  } else {
    const years = Math.floor(days / 365)
    return `${years} año${years > 1 ? 's' : ''}`
  }
}

/**
 * Formatea un timestamp
 */
export function formatTimestamp(timestamp: number | bigint): string {
  const date = new Date(safeToNumber(timestamp) * 1000)
  return formatDate(date)
}

/**
 * Formatea un tiempo relativo (ej: "hace 2 horas", "en 3 días")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const targetDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) {
    return 'hace un momento'
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  } else if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  } else if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`
  } else if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`
  } else {
    return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`
  }
}
