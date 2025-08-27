import { Address, Hash, formatEther, parseEther } from 'viem'
import { formatAmount, formatDate, formatRelativeTime } from './formatters'
import { validateKoreanPhone, validateKoreanID, validateAmount } from './validators'
import { FINANCIAL_LIMITS, VALIDATION_CONFIG } from './constants'

// Utilidades de fecha y tiempo
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

export function getCurrentDate(): Date {
  return new Date()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

export function getMonthsBetween(startDate: Date, endDate: Date): number {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear()
  const monthDiff = endDate.getMonth() - startDate.getMonth()
  return yearDiff * 12 + monthDiff
}

export function isDateInFuture(date: Date): boolean {
  return date > new Date()
}

export function isDateInPast(date: Date): boolean {
  return date < new Date()
}

export function isDateToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isDateThisWeek(date: Date): boolean {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return date >= weekStart && date <= weekEnd
}

export function isDateThisMonth(date: Date): boolean {
  const today = new Date()
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

export function isDateThisYear(date: Date): boolean {
  const today = new Date()
  return date.getFullYear() === today.getFullYear()
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getEndOfWeek(date: Date): Date {
  const result = getStartOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export function getStartOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getEndOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

// Utilidades de validación
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  return validateKoreanPhone(phone) === null
}

export function isValidKoreanID(id: string): boolean {
  return validateKoreanID(id) === null
}

export function isValidAmount(amount: string, min?: number, max?: number): boolean {
  return validateAmount(amount, min, max) === null
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Utilidades de manipulación de datos
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

export function mergeObjects<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return sources.reduce<T>((merged, source) => {
    for (const key in source) {
      if (source.hasOwnProperty(key) && source[key] !== undefined) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          merged[key] = mergeObjects(merged[key] || ({} as any), source[key])
        } else {
          merged[key] = source[key] as T[Extract<keyof T, string>]
        }
      }
    }
    return merged
  }, deepClone(target))
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => any),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function uniqueBy<T>(array: T[], key: keyof T | ((item: T) => any)): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// Utilidades de blockchain
export function formatEtherAmount(amount: bigint): string {
  return formatEther(amount)
}

export function parseEtherAmount(amount: string): bigint {
  return parseEther(amount)
}

export function calculateGasCost(gasUsed: bigint, gasPrice: bigint): bigint {
  return gasUsed * gasPrice
}

export function estimateGasCost(gasLimit: bigint, gasPrice: bigint): bigint {
  return gasLimit * gasPrice
}

export function formatGasCost(gasCost: bigint): string {
  return formatAmount(gasCost)
}

export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function shortenHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (!hash || hash.length < startChars + endChars) {
    return hash
  }
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

// Utilidades de seguridad
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function hashString(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function validatePassword(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 1
  else feedback.push('Al menos 8 caracteres')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Al menos una letra minúscula')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Al menos una letra mayúscula')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Al menos un número')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Al menos un carácter especial')
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

// Utilidades de formato
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - suffix.length) + suffix
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Utilidades de arrays
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((flat, item) => flat.concat(item), [] as T[])
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function sample<T>(array: T[], size: number = 1): T[] {
  const shuffled = shuffle(array)
  return shuffled.slice(0, size)
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

// Utilidades de objetos
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false
    }
    return true
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!isEqual(a[key], b[key])) return false
  }
  
  return true
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

// Utilidades de funciones
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

export function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    
    const attempt = async () => {
      try {
        attempts++
        const result = await fn()
        resolve(result)
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(error)
        } else {
          setTimeout(attempt, delay)
        }
      }
    }
    
    attempt()
  })
}

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ])
}

// Utilidades de DOM
export function getElementById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null
}

export function querySelector<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null
}

export function querySelectorAll<T extends HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll(selector)) as T[]
}

export function addEventListener(
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler, options)
  return () => element.removeEventListener(event, handler, options)
}

export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({ behavior, block: 'start' })
}

export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({ top: 0, behavior })
}

// Utilidades de almacenamiento
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue || null
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing localStorage:', error)
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

export function setSessionStorage(key: string, value: any): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting sessionStorage:', error)
  }
}

export function getSessionStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error getting sessionStorage:', error)
    return defaultValue || null
  }
}

export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing sessionStorage:', error)
  }
}

export function clearSessionStorage(): void {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('Error clearing sessionStorage:', error)
  }
}

// Utilidades de URL
export function getQueryParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

export function setQueryParams(params: Record<string, string>): void {
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  window.history.replaceState({}, '', url.toString())
}

export function removeQueryParams(keys: string[]): void {
  const url = new URL(window.location.href)
  keys.forEach(key => {
    url.searchParams.delete(key)
  })
  window.history.replaceState({}, '', url.toString())
}

export function buildUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}

// Utilidades de errores
export function createError(message: string, code?: string, details?: any): Error {
  const error = new Error(message) as any
  error.code = code
  error.details = details
  error.timestamp = new Date()
  return error
}

export function isError(error: any): error is Error {
  return error instanceof Error
}

export function getErrorMessage(error: any): string {
  if (isError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error?.message) {
    return error.message
  }
  return 'An unknown error occurred'
}

// Utilidades de validación de límites
export function validateDepositAmount(amount: bigint): boolean {
  return amount >= FINANCIAL_LIMITS.MIN_DEPOSIT_AMOUNT && 
         amount <= FINANCIAL_LIMITS.MAX_DEPOSIT_AMOUNT
}

export function validateInvestmentAmount(amount: bigint): boolean {
  return amount >= FINANCIAL_LIMITS.MIN_INVESTMENT_AMOUNT && 
         amount <= FINANCIAL_LIMITS.MAX_INVESTMENT_AMOUNT
}

export function validatePropertySize(size: number): boolean {
  return size >= FINANCIAL_LIMITS.MIN_PROPERTY_SIZE && 
         size <= FINANCIAL_LIMITS.MAX_PROPERTY_SIZE
}

export function validateDepositPeriod(days: number): boolean {
  return days >= FINANCIAL_LIMITS.MIN_DEPOSIT_PERIOD && 
         days <= FINANCIAL_LIMITS.MAX_DEPOSIT_PERIOD
}

// Utilidades de cálculo
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

export function roundToDecimals(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Utilidades de texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function unescapeHtml(text: string): string {
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || ''
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Utilidades de números
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isInteger(value: any): value is number {
  return isNumber(value) && Number.isInteger(value)
}

export function isPositive(value: number): boolean {
  return isNumber(value) && value > 0
}

export function isNegative(value: number): boolean {
  return isNumber(value) && value < 0
}

export function isZero(value: number): boolean {
  return isNumber(value) && value === 0
}

export function isBetween(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max
}

// Utilidades de promesas
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function createPromise<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
} {
  let resolve: (value: T) => void
  let reject: (error: Error) => void
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  
  return { promise, resolve: resolve!, reject: reject! }
}

// Utilidades de eventos
export function createEventEmitter<T = any>() {
  const listeners = new Map<string, Set<(data: T) => void>>()
  
  return {
    on(event: string, listener: (data: T) => void) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set())
      }
      listeners.get(event)!.add(listener)
    },
    
    off(event: string, listener: (data: T) => void) {
      listeners.get(event)?.delete(listener)
    },
    
    emit(event: string, data: T) {
      listeners.get(event)?.forEach(listener => listener(data))
    },
    
    clear() {
      listeners.clear()
    }
  }
}

// Utilidades de caché
export function createCache<T>(ttl: number = 5 * 60 * 1000) {
  const cache = new Map<string, { value: T; timestamp: number }>()
  
  return {
    set(key: string, value: T) {
      cache.set(key, { value, timestamp: Date.now() })
    },
    
    get(key: string): T | null {
      const item = cache.get(key)
      if (!item) return null
      
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key)
        return null
      }
      
      return item.value
    },
    
    has(key: string): boolean {
      return this.get(key) !== null
    },
    
    delete(key: string) {
      cache.delete(key)
    },
    
    clear() {
      cache.clear()
    },
    
    size() {
      return cache.size
    }
  }
}
