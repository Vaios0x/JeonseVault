import { Address } from 'viem'
import { Property, PropertyType } from '../utils/types'
import { API_CONFIG } from '../utils/constants'

// Tipos específicos del servicio de propiedades
export interface PropertyData {
  id: string
  address: string
  type: PropertyType
  size: number
  value: number
  marketValue: number
  lastTransactionDate?: Date
  transactionHistory: PropertyTransaction[]
  marketData: MarketData
  verificationStatus: 'verified' | 'pending' | 'failed'
  verificationDate?: Date
  landlordAddress?: Address
  documents: PropertyDocument[]
}

export interface PropertyTransaction {
  id: string
  date: Date
  type: 'sale' | 'rent' | 'jeonse'
  amount: number
  pricePerSquareMeter: number
  buyerAddress?: Address
  sellerAddress?: Address
}

export interface MarketData {
  averagePrice: number
  pricePerSquareMeter: number
  marketTrend: 'rising' | 'stable' | 'falling'
  priceChange: number
  priceChangePercentage: number
  daysOnMarket: number
  comparableProperties: ComparableProperty[]
}

export interface ComparableProperty {
  id: string
  address: string
  type: PropertyType
  size: number
  price: number
  pricePerSquareMeter: number
  distance: number
  soldDate: Date
}

export interface PropertyDocument {
  id: string
  type: 'ownership' | 'registration' | 'valuation' | 'inspection' | 'other'
  filename: string
  url: string
  uploadedAt: Date
  verified: boolean
  verificationDate?: Date
}

export interface PropertySearchParams {
  address?: string
  type?: PropertyType
  minSize?: number
  maxSize?: number
  minValue?: number
  maxValue?: number
  radius?: number
  limit?: number
  offset?: number
}

export interface PropertyValuation {
  propertyId: string
  estimatedValue: number
  confidence: number
  factors: ValuationFactor[]
  lastUpdated: Date
  method: 'comparable' | 'income' | 'cost' | 'hybrid'
}

export interface ValuationFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

export interface PropertyVerificationRequest {
  propertyId: string
  landlordAddress: Address
  documents: File[]
  verificationType: 'ownership' | 'registration' | 'both'
}

export interface PropertyVerificationResult {
  success: boolean
  verified: boolean
  confidence: number
  issues: string[]
  recommendations: string[]
  verificationDate: Date
}

// Configuración del servicio
const PROPERTY_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'https://api.koreanproperty.com',
  apiKey: process.env.NEXT_PUBLIC_PROPERTY_API_KEY,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
}

// Clase principal del servicio
export class KoreanPropertyService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutos

  constructor() {
    this.apiKey = PROPERTY_API_CONFIG.apiKey || ''
    this.baseUrl = PROPERTY_API_CONFIG.baseUrl
  }

  // Métodos principales
  async searchProperties(params: PropertySearchParams): Promise<PropertyData[]> {
    try {
      const cacheKey = `search_${JSON.stringify(params)}`
      const cached = this.getCachedData(cacheKey) as PropertyData[] | null
      if (cached) return cached

      const response = await this.makeRequest('/properties/search', {
        method: 'GET',
        params: this.sanitizeParams(params)
      })

      const properties = response.data.map((prop: any) => this.mapPropertyData(prop))
      this.setCachedData(cacheKey, properties)
      
      return properties
    } catch (error) {
      console.error('Error searching properties:', error)
      throw new Error('Failed to search properties')
    }
  }

  async getPropertyById(propertyId: string): Promise<PropertyData | null> {
    try {
      const cacheKey = `property_${propertyId}`
      const cached = this.getCachedData(cacheKey) as PropertyData | null
      if (cached) return cached

      const response = await this.makeRequest(`/properties/${propertyId}`, {
        method: 'GET'
      })

      const property = this.mapPropertyData(response.data)
      this.setCachedData(cacheKey, property)
      
      return property
    } catch (error) {
      console.error('Error getting property:', error)
      return null
    }
  }

  async getPropertyByAddress(address: string): Promise<PropertyData | null> {
    try {
      const cacheKey = `property_address_${address}`
      const cached = this.getCachedData(cacheKey) as PropertyData | null
      if (cached) return cached

      const response = await this.makeRequest('/properties/address', {
        method: 'GET',
        params: { address }
      })

      if (!response.data) return null

      const property = this.mapPropertyData(response.data)
      this.setCachedData(cacheKey, property)
      
      return property
    } catch (error) {
      console.error('Error getting property by address:', error)
      return null
    }
  }

  async verifyPropertyOwnership(request: PropertyVerificationRequest): Promise<PropertyVerificationResult> {
    try {
      const formData = new FormData()
      formData.append('propertyId', request.propertyId)
      formData.append('landlordAddress', request.landlordAddress)
      formData.append('verificationType', request.verificationType)
      
      request.documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc)
      })

      const response = await this.makeRequest('/properties/verify', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return this.mapVerificationResult(response.data)
    } catch (error) {
      console.error('Error verifying property ownership:', error)
      throw new Error('Failed to verify property ownership')
    }
  }

  async getPropertyValuation(propertyId: string): Promise<PropertyValuation | null> {
    try {
      const cacheKey = `valuation_${propertyId}`
      const cached = this.getCachedData(cacheKey) as PropertyValuation | null
      if (cached) return cached

      const response = await this.makeRequest(`/properties/${propertyId}/valuation`, {
        method: 'GET'
      })

      const valuation = this.mapValuationData(response.data)
      this.setCachedData(cacheKey, valuation)
      
      return valuation
    } catch (error) {
      console.error('Error getting property valuation:', error)
      return null
    }
  }

  async getMarketData(area: string, propertyType?: PropertyType): Promise<MarketData | null> {
    try {
      const cacheKey = `market_${area}_${propertyType || 'all'}`
      const cached = this.getCachedData(cacheKey) as MarketData | null
      if (cached) return cached

      const response = await this.makeRequest('/market/data', {
        method: 'GET',
        params: { area, type: propertyType }
      })

      const marketData = this.mapMarketData(response.data)
      this.setCachedData(cacheKey, marketData)
      
      return marketData
    } catch (error) {
      console.error('Error getting market data:', error)
      return null
    }
  }

  async getComparableProperties(
    propertyId: string,
    radius: number = 1000,
    limit: number = 10
  ): Promise<ComparableProperty[]> {
    try {
      const cacheKey = `comparable_${propertyId}_${radius}_${limit}`
      const cached = this.getCachedData(cacheKey) as ComparableProperty[] | null
      if (cached) return cached

      const response = await this.makeRequest(`/properties/${propertyId}/comparable`, {
        method: 'GET',
        params: { radius, limit }
      })

      const comparables = response.data.map((comp: any) => this.mapComparableProperty(comp))
      this.setCachedData(cacheKey, comparables)
      
      return comparables
    } catch (error) {
      console.error('Error getting comparable properties:', error)
      return []
    }
  }

  async uploadPropertyDocument(
    propertyId: string,
    document: File,
    type: PropertyDocument['type']
  ): Promise<PropertyDocument> {
    try {
      const formData = new FormData()
      formData.append('document', document)
      formData.append('type', type)

      const response = await this.makeRequest(`/properties/${propertyId}/documents`, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return this.mapPropertyDocument(response.data)
    } catch (error) {
      console.error('Error uploading property document:', error)
      throw new Error('Failed to upload property document')
    }
  }

  async verifyPropertyDocument(documentId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/documents/${documentId}/verify`, {
        method: 'POST'
      })

      return response.data.verified
    } catch (error) {
      console.error('Error verifying property document:', error)
      return false
    }
  }

  // Métodos de utilidad
  private async makeRequest(
    endpoint: string,
    options: {
      method: string
      params?: Record<string, any>
      data?: any
      headers?: Record<string, string>
    }
  ): Promise<any> {
    const url = new URL(endpoint, this.baseUrl)
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const config: RequestInit = {
      method: options.method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(PROPERTY_API_CONFIG.timeout)
    }

    if (options.data && !options.headers?.['Content-Type']?.includes('multipart/form-data')) {
      config.body = JSON.stringify(options.data)
    } else if (options.data) {
      config.body = options.data
    }

    let lastError: Error
    for (let attempt = 1; attempt <= PROPERTY_API_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await fetch(url.toString(), config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < PROPERTY_API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, PROPERTY_API_CONFIG.retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }

  private sanitizeParams(params: PropertySearchParams): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Métodos de mapeo de datos
  private mapPropertyData(data: any): PropertyData {
    return {
      id: data.id,
      address: data.address,
      type: data.type,
      size: data.size,
      value: data.value,
      marketValue: data.marketValue,
      lastTransactionDate: data.lastTransactionDate ? new Date(data.lastTransactionDate) : undefined,
      transactionHistory: data.transactionHistory?.map((tx: any) => this.mapPropertyTransaction(tx)) || [],
      marketData: this.mapMarketData(data.marketData),
      verificationStatus: data.verificationStatus,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined,
      landlordAddress: data.landlordAddress,
      documents: data.documents?.map((doc: any) => this.mapPropertyDocument(doc)) || []
    }
  }

  private mapPropertyTransaction(data: any): PropertyTransaction {
    return {
      id: data.id,
      date: new Date(data.date),
      type: data.type,
      amount: data.amount,
      pricePerSquareMeter: data.pricePerSquareMeter,
      buyerAddress: data.buyerAddress,
      sellerAddress: data.sellerAddress
    }
  }

  private mapMarketData(data: any): MarketData {
    return {
      averagePrice: data.averagePrice,
      pricePerSquareMeter: data.pricePerSquareMeter,
      marketTrend: data.marketTrend,
      priceChange: data.priceChange,
      priceChangePercentage: data.priceChangePercentage,
      daysOnMarket: data.daysOnMarket,
      comparableProperties: data.comparableProperties?.map((comp: any) => this.mapComparableProperty(comp)) || []
    }
  }

  private mapComparableProperty(data: any): ComparableProperty {
    return {
      id: data.id,
      address: data.address,
      type: data.type,
      size: data.size,
      price: data.price,
      pricePerSquareMeter: data.pricePerSquareMeter,
      distance: data.distance,
      soldDate: new Date(data.soldDate)
    }
  }

  private mapPropertyDocument(data: any): PropertyDocument {
    return {
      id: data.id,
      type: data.type,
      filename: data.filename,
      url: data.url,
      uploadedAt: new Date(data.uploadedAt),
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined
    }
  }

  private mapValuationData(data: any): PropertyValuation {
    return {
      propertyId: data.propertyId,
      estimatedValue: data.estimatedValue,
      confidence: data.confidence,
      factors: data.factors?.map((factor: any) => ({
        factor: factor.factor,
        impact: factor.impact,
        weight: factor.weight,
        description: factor.description
      })) || [],
      lastUpdated: new Date(data.lastUpdated),
      method: data.method
    }
  }

  private mapVerificationResult(data: any): PropertyVerificationResult {
    return {
      success: data.success,
      verified: data.verified,
      confidence: data.confidence,
      issues: data.issues || [],
      recommendations: data.recommendations || [],
      verificationDate: new Date(data.verificationDate)
    }
  }

  // Métodos de limpieza
  clearCache(): void {
    this.cache.clear()
  }

  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }
}

// Instancia singleton del servicio
export const koreanPropertyService = new KoreanPropertyService()

// Hooks de React para usar el servicio
export function usePropertyService() {
  return {
    searchProperties: koreanPropertyService.searchProperties.bind(koreanPropertyService),
    getPropertyById: koreanPropertyService.getPropertyById.bind(koreanPropertyService),
    getPropertyByAddress: koreanPropertyService.getPropertyByAddress.bind(koreanPropertyService),
    verifyPropertyOwnership: koreanPropertyService.verifyPropertyOwnership.bind(koreanPropertyService),
    getPropertyValuation: koreanPropertyService.getPropertyValuation.bind(koreanPropertyService),
    getMarketData: koreanPropertyService.getMarketData.bind(koreanPropertyService),
    getComparableProperties: koreanPropertyService.getComparableProperties.bind(koreanPropertyService),
    uploadPropertyDocument: koreanPropertyService.uploadPropertyDocument.bind(koreanPropertyService),
    verifyPropertyDocument: koreanPropertyService.verifyPropertyDocument.bind(koreanPropertyService),
    clearCache: koreanPropertyService.clearCache.bind(koreanPropertyService)
  }
}
