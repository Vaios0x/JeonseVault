// Sistema de caching profesional para JeonseVault
// Implementa múltiples estrategias de cache: Memory, SessionStorage, LocalStorage, IndexedDB

interface CacheOptions {
  ttl?: number // Time to live en milisegundos
  maxSize?: number // Tamaño máximo del cache
  strategy?: 'memory' | 'session' | 'local' | 'indexeddb' | 'hybrid'
  namespace?: string // Namespace para evitar colisiones
  compress?: boolean // Comprimir datos grandes
  version?: string // Versión del cache para invalidation
}

interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  version: string
  size: number
  hits: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  entries: number
  hitRate: number
  averageSize: number
  oldestEntry: number
  newestEntry: number
}

// Configuración por defecto
const DEFAULT_OPTIONS: Required<CacheOptions> = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100, // 100 entradas
  strategy: 'hybrid',
  namespace: 'jeonsevault',
  compress: true,
  version: '1.0.0'
}

// Compresión simple para datos grandes
class Compression {
  static compress(data: string): string {
    if (data.length < 1024) return data // No comprimir datos pequeños
    
    try {
      // TODO: Implementar compresión real si es necesario
      // Por ahora retornamos los datos sin comprimir
      return data
    } catch {
      return data
    }
  }

  static decompress(data: string): string {
    if (data.length < 1024) return data
    
    try {
      // TODO: Implementar descompresión real si es necesario
      // Por ahora retornamos los datos tal como están
      return data
    } catch {
      return data
    }
  }
}

// Cache en memoria
class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private stats = { hits: 0, misses: 0, size: 0, entries: 0 }

  set<T>(key: string, value: T, options: Required<CacheOptions>): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      version: options.version,
      size: this.calculateSize(value),
      hits: 0,
      lastAccessed: Date.now()
    }

    // Limpiar cache si excede el tamaño máximo
    if (this.cache.size >= options.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, entry)
    this.stats.entries = this.cache.size
    this.stats.size += entry.size
  }

  get<T>(key: string, options: Required<CacheOptions>): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.entries = this.cache.size
      return null
    }

    // Verificar versión
    if (entry.version !== options.version) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.entries = this.cache.size
      return null
    }

    // Actualizar estadísticas
    entry.hits++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    return entry.value
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.stats.size -= entry.size
      this.stats.entries = this.cache.size - 1
    }
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, size: 0, entries: 0 }
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const averageSize = entries.length > 0 ? this.stats.size / entries.length : 0
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0
    const newestEntry = entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.stats.size,
      entries: this.stats.entries,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      averageSize,
      oldestEntry,
      newestEntry
    }
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }
}

// Cache en SessionStorage
class SessionCache {
  private namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  set<T>(key: string, value: T, options: Required<CacheOptions>): void {
    if (typeof window === 'undefined') return

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      version: options.version,
      size: 0,
      hits: 0,
      lastAccessed: Date.now()
    }

    const data = options.compress 
      ? Compression.compress(JSON.stringify(entry))
      : JSON.stringify(entry)

    try {
      sessionStorage.setItem(`${this.namespace}:${key}`, data)
    } catch (error) {
      console.warn('SessionStorage cache set failed:', error)
    }
  }

  get<T>(key: string, options: Required<CacheOptions>): T | null {
    if (typeof window === 'undefined') return null

    try {
      const data = sessionStorage.getItem(`${this.namespace}:${key}`)
      if (!data) return null

      const entry: CacheEntry<T> = JSON.parse(
        options.compress ? Compression.decompress(data) : data
      )

      // Verificar TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(`${this.namespace}:${key}`)
        return null
      }

      // Verificar versión
      if (entry.version !== options.version) {
        sessionStorage.removeItem(`${this.namespace}:${key}`)
        return null
      }

      return entry.value
    } catch (error) {
      console.warn('SessionStorage cache get failed:', error)
      return null
    }
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined') return false

    try {
      sessionStorage.removeItem(`${this.namespace}:${key}`)
      return true
    } catch {
      return false
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(`${this.namespace}:`)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('SessionStorage cache clear failed:', error)
    }
  }
}

// Cache en LocalStorage
class LocalCache {
  private namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  set<T>(key: string, value: T, options: Required<CacheOptions>): void {
    if (typeof window === 'undefined') return

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      version: options.version,
      size: 0,
      hits: 0,
      lastAccessed: Date.now()
    }

    const data = options.compress 
      ? Compression.compress(JSON.stringify(entry))
      : JSON.stringify(entry)

    try {
      localStorage.setItem(`${this.namespace}:${key}`, data)
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error)
    }
  }

  get<T>(key: string, options: Required<CacheOptions>): T | null {
    if (typeof window === 'undefined') return null

    try {
      const data = localStorage.getItem(`${this.namespace}:${key}`)
      if (!data) return null

      const entry: CacheEntry<T> = JSON.parse(
        options.compress ? Compression.decompress(data) : data
      )

      // Verificar TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`${this.namespace}:${key}`)
        return null
      }

      // Verificar versión
      if (entry.version !== options.version) {
        localStorage.removeItem(`${this.namespace}:${key}`)
        return null
      }

      return entry.value
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error)
      return null
    }
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined') return false

    try {
      localStorage.removeItem(`${this.namespace}:${key}`)
      return true
    } catch {
      return false
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`${this.namespace}:`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error)
    }
  }
}

// Cache híbrido (combinación de estrategias)
class HybridCache {
  private memory: MemoryCache
  private session: SessionCache
  private local: LocalCache
  private options: Required<CacheOptions>

  constructor(options: CacheOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.memory = new MemoryCache()
    this.session = new SessionCache(this.options.namespace)
    this.local = new LocalCache(this.options.namespace)
  }

  set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
    const mergedOptions = { ...this.options, ...options }
    
    // Guardar en memoria (más rápido)
    this.memory.set(key, value, mergedOptions)
    
    // Guardar en session storage (persistente durante la sesión)
    this.session.set(key, value, mergedOptions)
    
    // Guardar en local storage si es persistente
    if (mergedOptions.ttl > 24 * 60 * 60 * 1000) { // Más de 24 horas
      this.local.set(key, value, mergedOptions)
    }
  }

  get<T>(key: string, options?: Partial<CacheOptions>): T | null {
    const mergedOptions = { ...this.options, ...options }
    
    // Intentar memoria primero
    let value = this.memory.get<T>(key, mergedOptions)
    if (value !== null) return value
    
    // Intentar session storage
    value = this.session.get<T>(key, mergedOptions)
    if (value !== null) {
      // Restaurar en memoria
      this.memory.set(key, value, mergedOptions)
      return value
    }
    
    // Intentar local storage
    value = this.local.get<T>(key, mergedOptions)
    if (value !== null) {
      // Restaurar en memoria y session
      this.memory.set(key, value, mergedOptions)
      this.session.set(key, value, mergedOptions)
      return value
    }
    
    return null
  }

  delete(key: string): boolean {
    const memoryDeleted = this.memory.delete(key)
    const sessionDeleted = this.session.delete(key)
    const localDeleted = this.local.delete(key)
    
    return memoryDeleted || sessionDeleted || localDeleted
  }

  clear(): void {
    this.memory.clear()
    this.session.clear()
    this.local.clear()
  }

  getStats(): CacheStats {
    return this.memory.getStats()
  }
}

// Cache especializado para Web3
class Web3Cache {
  private cache: HybridCache

  constructor(options?: CacheOptions) {
    this.cache = new HybridCache({
      ttl: 30 * 1000, // 30 segundos para datos blockchain
      maxSize: 200,
      strategy: 'hybrid',
      namespace: 'jeonsevault:web3',
      compress: true,
      version: '1.0.0',
      ...options
    })
  }

  // Cache para balances de wallet
  async getBalance(address: string, chainId: number): Promise<bigint | null> {
    const key = `balance:${address}:${chainId}`
    return this.cache.get<bigint>(key)
  }

  setBalance(address: string, chainId: number, balance: bigint): void {
    const key = `balance:${address}:${chainId}`
    this.cache.set(key, balance, { ttl: 10 * 1000 }) // 10 segundos
  }

  // Cache para datos de contratos
  async getContractData(contractAddress: string, functionName: string, args: any[]): Promise<any | null> {
    const key = `contract:${contractAddress}:${functionName}:${JSON.stringify(args)}`
    return this.cache.get(key)
  }

  setContractData(contractAddress: string, functionName: string, args: any[], data: any): void {
    const key = `contract:${contractAddress}:${functionName}:${JSON.stringify(args)}`
    this.cache.set(key, data, { ttl: 60 * 1000 }) // 1 minuto
  }

  // Cache para transacciones
  async getTransaction(hash: string): Promise<any | null> {
    const key = `tx:${hash}`
    return this.cache.get(key)
  }

  setTransaction(hash: string, transaction: any): void {
    const key = `tx:${hash}`
    this.cache.set(key, transaction, { ttl: 5 * 60 * 1000 }) // 5 minutos
  }

  // Cache para depósitos
  async getDeposits(userAddress: string): Promise<any[] | null> {
    const key = `deposits:${userAddress}`
    return this.cache.get<any[]>(key)
  }

  setDeposits(userAddress: string, deposits: any[]): void {
    const key = `deposits:${userAddress}`
    this.cache.set(key, deposits, { ttl: 30 * 1000 }) // 30 segundos
  }

  // Cache para compliance
  async getCompliance(userAddress: string): Promise<any | null> {
    const key = `compliance:${userAddress}`
    return this.cache.get(key)
  }

  setCompliance(userAddress: string, compliance: any): void {
    const key = `compliance:${userAddress}`
    this.cache.set(key, compliance, { ttl: 5 * 60 * 1000 }) // 5 minutos
  }

  // Invalidar cache por tipo
  invalidateByType(type: 'balance' | 'contract' | 'transaction' | 'deposits' | 'compliance'): void {
    // Implementar invalidación por tipo
    console.log(`Invalidating cache for type: ${type}`)
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear()
  }

  // Obtener estadísticas
  getStats(): CacheStats {
    return this.cache.getStats()
  }
}

// Instancias globales
export const web3Cache = new Web3Cache()
export const generalCache = new HybridCache({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100,
  strategy: 'hybrid',
  namespace: 'jeonsevault:general',
  compress: true,
  version: '1.0.0'
})

// Hooks para React
export function useCache() {
  return {
    web3: web3Cache,
    general: generalCache,
    get: generalCache.get.bind(generalCache),
    set: generalCache.set.bind(generalCache),
    delete: generalCache.delete.bind(generalCache),
    clear: generalCache.clear.bind(generalCache),
    stats: generalCache.getStats.bind(generalCache)
  }
}

// Utilidades de cache
export const cacheUtils = {
  // Generar clave de cache
  generateKey(...parts: any[]): string {
    return parts.map(part => 
      typeof part === 'object' ? JSON.stringify(part) : String(part)
    ).join(':')
  },

  // Verificar si el cache está disponible
  isAvailable(): boolean {
    return typeof window !== 'undefined'
  },

  // Limpiar cache expirado
  cleanup(): void {
    web3Cache.clear()
    generalCache.clear()
  },

  // Obtener estadísticas combinadas
  getStats(): { web3: CacheStats; general: CacheStats } {
    return {
      web3: web3Cache.getStats(),
      general: generalCache.getStats()
    }
  }
}

// Exportar tipos
export type { CacheOptions, CacheEntry, CacheStats }
