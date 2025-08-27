import { Address } from 'viem'
import React from 'react'

// Declaraciones globales para proveedores externos
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: {
      track: (eventName: string, properties?: Record<string, any>) => void
    }
    amplitude: {
      getInstance: () => {
        logEvent: (eventName: string, properties?: Record<string, any>) => void
      }
    }
  }
}

// Tipos específicos del servicio de analytics
export interface AnalyticsEvent {
  id: string
  userId?: string
  sessionId: string
  eventName: string
  eventType: EventType
  category: EventCategory
  properties: Record<string, any>
  timestamp: Date
  userAgent: string
  ipAddress?: string
  referrer?: string
  pageUrl: string
  pageTitle: string
  metadata?: Record<string, any>
}

export type EventType = 
  | 'page_view' 
  | 'click' 
  | 'form_submit' 
  | 'transaction' 
  | 'error' 
  | 'custom' 
  | 'user_action' 
  | 'system_event'

export type EventCategory = 
  | 'user_engagement' 
  | 'transaction' 
  | 'compliance' 
  | 'investment' 
  | 'deposit' 
  | 'security' 
  | 'performance' 
  | 'error' 
  | 'marketing'

export interface UserMetrics {
  userId: string
  totalSessions: number
  totalEvents: number
  firstSeen: Date
  lastSeen: Date
  averageSessionDuration: number
  totalPageViews: number
  totalTransactions: number
  totalInvestments: number
  totalDeposits: number
  complianceScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
  engagementScore: number
  retentionScore: number
  lifetimeValue: number
  metadata?: Record<string, any>
  updatedAt: Date
}

export interface SessionMetrics {
  sessionId: string
  userId?: string
  startTime: Date
  endTime?: Date
  duration: number
  pageViews: number
  events: number
  transactions: number
  userAgent: string
  ipAddress?: string
  referrer?: string
  entryPage: string
  exitPage: string
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet'
    platform: string
    browser: string
    version: string
  }
  location?: {
    country: string
    region: string
    city: string
    timezone: string
  }
  metadata?: Record<string, any>
}

export interface PageMetrics {
  pageUrl: string
  pageTitle: string
  totalViews: number
  uniqueViews: number
  averageTimeOnPage: number
  bounceRate: number
  exitRate: number
  conversionRate: number
  events: Record<string, number>
  metadata?: Record<string, any>
  updatedAt: Date
}

export interface TransactionMetrics {
  transactionId: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'transfer'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  gasUsed?: number
  gasPrice?: number
  blockNumber?: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface FunnelMetrics {
  funnelId: string
  funnelName: string
  steps: FunnelStep[]
  totalEntries: number
  totalConversions: number
  conversionRate: number
  averageTimeToComplete: number
  dropOffPoints: Record<string, number>
  metadata?: Record<string, any>
  updatedAt: Date
}

export interface FunnelStep {
  stepId: string
  stepName: string
  stepUrl: string
  entries: number
  exits: number
  conversions: number
  conversionRate: number
  averageTimeOnStep: number
}

export interface CohortMetrics {
  cohortId: string
  cohortName: string
  cohortDate: Date
  totalUsers: number
  retentionRates: Record<number, number> // days -> retention rate
  engagementScores: Record<number, number> // days -> engagement score
  revenueMetrics: Record<number, number> // days -> revenue
  metadata?: Record<string, any>
  updatedAt: Date
}

export interface PerformanceMetrics {
  pageUrl: string
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timestamp: Date
  userAgent: string
  connectionType?: string
  metadata?: Record<string, any>
}

export interface ErrorMetrics {
  errorId: string
  errorType: string
  errorMessage: string
  stackTrace?: string
  pageUrl: string
  userId?: string
  sessionId: string
  userAgent: string
  timestamp: Date
  frequency: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

export interface AnalyticsFilter {
  userId?: string
  sessionId?: string
  eventType?: EventType
  eventCategory?: EventCategory
  eventName?: string
  startDate?: Date
  endDate?: Date
  pageUrl?: string
  limit?: number
  offset?: number
}

export interface AnalyticsStats {
  totalEvents: number
  totalUsers: number
  totalSessions: number
  totalTransactions: number
  totalRevenue: number
  averageSessionDuration: number
  bounceRate: number
  conversionRate: number
  byEventType: Record<EventType, number>
  byCategory: Record<EventCategory, number>
  byPage: Record<string, number>
  byUser: Record<string, number>
}

export interface AnalyticsReport {
  reportId: string
  reportName: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom'
  startDate: Date
  endDate: Date
  metrics: AnalyticsStats
  insights: string[]
  recommendations: string[]
  generatedAt: Date
  metadata?: Record<string, any>
}

// Configuración del servicio
const ANALYTICS_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'https://api.analytics.jeonsevault.com',
  apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  batchSize: 50,
  maxRetries: 3,
  flushInterval: 5000, // 5 segundos
  maxQueueSize: 1000
}

// Configuración de proveedores
const PROVIDER_CONFIG = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    apiSecret: process.env.NEXT_PUBLIC_GA_API_SECRET
  },
  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    apiSecret: process.env.NEXT_PUBLIC_MIXPANEL_API_SECRET
  },
  amplitude: {
    apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
    apiSecret: process.env.NEXT_PUBLIC_AMPLITUDE_API_SECRET
  },
  hotjar: {
    siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
  }
}

// Clase principal del servicio
export class AnalyticsService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 10 * 60 * 1000 // 10 minutos
  private eventQueue: AnalyticsEvent[] = []
  private flushTimer?: NodeJS.Timeout
  private sessionId: string
  private userId?: string

  constructor() {
    this.apiKey = ANALYTICS_API_CONFIG.apiKey || ''
    this.baseUrl = ANALYTICS_API_CONFIG.baseUrl
    this.sessionId = this.generateSessionId()
    this.startFlushTimer()
  }

  // Métodos principales
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'sessionId' | 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        id: this.generateEventId(),
        sessionId: this.sessionId,
        timestamp: new Date()
      }

      // Agregar a la cola para envío por lotes
      this.eventQueue.push(fullEvent)

      // Enviar inmediatamente si la cola está llena
      if (this.eventQueue.length >= ANALYTICS_API_CONFIG.maxQueueSize) {
        await this.flushEvents()
      }

      // También enviar a proveedores externos si están configurados
      await this.sendToExternalProviders(fullEvent)
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  async trackPageView(pageUrl: string, pageTitle: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      userId: this.userId,
      eventName: 'page_view',
      eventType: 'page_view',
      category: 'user_engagement',
      properties: {
        pageUrl,
        pageTitle,
        ...properties
      },
      userAgent: navigator.userAgent,
      pageUrl,
      pageTitle,
      referrer: document.referrer
    })
  }

  async trackClick(elementId: string, elementText: string, pageUrl: string, pageTitle: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      userId: this.userId,
      eventName: 'click',
      eventType: 'click',
      category: 'user_engagement',
      properties: {
        elementId,
        elementText,
        ...properties
      },
      userAgent: navigator.userAgent,
      pageUrl,
      pageTitle
    })
  }

  async trackTransaction(transaction: Omit<TransactionMetrics, 'transactionId' | 'timestamp'>): Promise<void> {
    try {
      const fullTransaction: TransactionMetrics = {
        ...transaction,
        transactionId: this.generateTransactionId(),
        timestamp: new Date()
      }

      // Enviar transacción inmediatamente
      await this.makeRequest('/analytics/transactions', {
        method: 'POST',
        data: fullTransaction
      })

      // También trackear como evento
      await this.trackEvent({
        userId: this.userId,
        eventName: 'transaction',
        eventType: 'transaction',
        category: 'transaction',
        properties: {
          transactionId: fullTransaction.transactionId,
          type: fullTransaction.type,
          amount: fullTransaction.amount,
          currency: fullTransaction.currency,
          status: fullTransaction.status
        },
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        pageTitle: document.title
      })
    } catch (error) {
      console.error('Error tracking transaction:', error)
    }
  }

  async trackError(error: Error, pageUrl: string, pageTitle: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      userId: this.userId,
      eventName: 'error',
      eventType: 'error',
      category: 'error',
      properties: {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        ...properties
      },
      userAgent: navigator.userAgent,
      pageUrl,
      pageTitle
    })
  }

  async trackPerformance(metrics: Omit<PerformanceMetrics, 'timestamp'>): Promise<void> {
    try {
      const fullMetrics: PerformanceMetrics = {
        ...metrics,
        timestamp: new Date()
      }

      await this.makeRequest('/analytics/performance', {
        method: 'POST',
        data: fullMetrics
      })
    } catch (error) {
      console.error('Error tracking performance:', error)
    }
  }

  // Métodos de consulta
  async getEvents(filter: AnalyticsFilter): Promise<AnalyticsEvent[]> {
    try {
      const response = await this.makeRequest('/analytics/events', {
        method: 'GET',
        params: this.sanitizeFilter(filter)
      })

      return response.data.map((event: any) => this.mapAnalyticsEvent(event))
    } catch (error) {
      console.error('Error getting events:', error)
      return []
    }
  }

  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    try {
      const cacheKey = `user_metrics_${userId}`
      const cached = this.getCachedData<UserMetrics>(cacheKey)
      if (cached) return cached

      const response = await this.makeRequest(`/analytics/users/${userId}/metrics`, {
        method: 'GET'
      })

      const metrics = this.mapUserMetrics(response.data)
      this.setCachedData(cacheKey, metrics)
      
      return metrics
    } catch (error) {
      console.error('Error getting user metrics:', error)
      return null
    }
  }

  async getSessionMetrics(sessionId: string): Promise<SessionMetrics | null> {
    try {
      const response = await this.makeRequest(`/analytics/sessions/${sessionId}`, {
        method: 'GET'
      })

      return this.mapSessionMetrics(response.data)
    } catch (error) {
      console.error('Error getting session metrics:', error)
      return null
    }
  }

  async getPageMetrics(pageUrl: string): Promise<PageMetrics | null> {
    try {
      const response = await this.makeRequest(`/analytics/pages/${encodeURIComponent(pageUrl)}`, {
        method: 'GET'
      })

      return this.mapPageMetrics(response.data)
    } catch (error) {
      console.error('Error getting page metrics:', error)
      return null
    }
  }

  async getFunnelMetrics(funnelId: string): Promise<FunnelMetrics | null> {
    try {
      const response = await this.makeRequest(`/analytics/funnels/${funnelId}`, {
        method: 'GET'
      })

      return this.mapFunnelMetrics(response.data)
    } catch (error) {
      console.error('Error getting funnel metrics:', error)
      return null
    }
  }

  async getCohortMetrics(cohortId: string): Promise<CohortMetrics | null> {
    try {
      const response = await this.makeRequest(`/analytics/cohorts/${cohortId}`, {
        method: 'GET'
      })

      return this.mapCohortMetrics(response.data)
    } catch (error) {
      console.error('Error getting cohort metrics:', error)
      return null
    }
  }

  async getAnalyticsStats(filter?: AnalyticsFilter): Promise<AnalyticsStats> {
    try {
      const response = await this.makeRequest('/analytics/stats', {
        method: 'GET',
        params: filter ? this.sanitizeFilter(filter) : {}
      })

      return this.mapAnalyticsStats(response.data)
    } catch (error) {
      console.error('Error getting analytics stats:', error)
      return this.getDefaultStats()
    }
  }

  async generateReport(
    reportName: string,
    reportType: AnalyticsReport['reportType'],
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsReport | null> {
    try {
      const response = await this.makeRequest('/analytics/reports', {
        method: 'POST',
        data: {
          reportName,
          reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      })

      return this.mapAnalyticsReport(response.data)
    } catch (error) {
      console.error('Error generating report:', error)
      return null
    }
  }

  async getReport(reportId: string): Promise<AnalyticsReport | null> {
    try {
      const response = await this.makeRequest(`/analytics/reports/${reportId}`, {
        method: 'GET'
      })

      return this.mapAnalyticsReport(response.data)
    } catch (error) {
      console.error('Error getting report:', error)
      return null
    }
  }

  // Métodos de configuración
  setUserId(userId: string): void {
    this.userId = userId
    this.clearUserCache(userId)
  }

  clearUserId(): void {
    this.userId = undefined
  }

  getSessionId(): string {
    return this.sessionId
  }

  // Métodos privados
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const eventsToSend = this.eventQueue.splice(0, ANALYTICS_API_CONFIG.batchSize)

    try {
      await this.makeRequest('/analytics/events/batch', {
        method: 'POST',
        data: { events: eventsToSend }
      })
    } catch (error) {
      console.error('Error flushing events:', error)
      // Reinsertar eventos en la cola para reintento
      this.eventQueue.unshift(...eventsToSend)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents()
    }, ANALYTICS_API_CONFIG.flushInterval)
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
  }

  private async sendToExternalProviders(event: AnalyticsEvent): Promise<void> {
    // Google Analytics 4
    if (PROVIDER_CONFIG.googleAnalytics.measurementId && typeof window.gtag !== 'undefined') {
      try {
        window.gtag('event', event.eventName, {
          event_category: event.category,
          event_label: event.eventName,
          value: event.properties.value || 1,
          custom_parameters: event.properties
        })
      } catch (error) {
        console.error('Error sending to Google Analytics:', error)
      }
    }

    // Mixpanel
    if (PROVIDER_CONFIG.mixpanel.token && typeof window.mixpanel !== 'undefined') {
      try {
        window.mixpanel.track(event.eventName, {
          ...event.properties,
          category: event.category,
          event_type: event.eventType
        })
      } catch (error) {
        console.error('Error sending to Mixpanel:', error)
      }
    }

    // Amplitude
    if (PROVIDER_CONFIG.amplitude.apiKey && typeof window.amplitude !== 'undefined') {
      try {
        window.amplitude.getInstance().logEvent(event.eventName, {
          ...event.properties,
          category: event.category,
          event_type: event.eventType
        })
      } catch (error) {
        console.error('Error sending to Amplitude:', error)
      }
    }
  }

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
      signal: AbortSignal.timeout(ANALYTICS_API_CONFIG.timeout)
    }

    if (options.data) {
      config.body = JSON.stringify(options.data)
    }

    let lastError: Error
    for (let attempt = 1; attempt <= ANALYTICS_API_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await fetch(url.toString(), config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < ANALYTICS_API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, ANALYTICS_API_CONFIG.retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }

  private sanitizeFilter(filter: AnalyticsFilter): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          sanitized[key] = value.toISOString()
        } else {
          sanitized[key] = value
        }
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

    return cached.data as T
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private clearUserCache(userId: string): void {
    this.cache.delete(`user_metrics_${userId}`)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultStats(): AnalyticsStats {
    return {
      totalEvents: 0,
      totalUsers: 0,
      totalSessions: 0,
      totalTransactions: 0,
      totalRevenue: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0,
      byEventType: {
        page_view: 0,
        click: 0,
        form_submit: 0,
        transaction: 0,
        error: 0,
        custom: 0,
        user_action: 0,
        system_event: 0
      },
      byCategory: {
        user_engagement: 0,
        transaction: 0,
        compliance: 0,
        investment: 0,
        deposit: 0,
        security: 0,
        performance: 0,
        error: 0,
        marketing: 0
      },
      byPage: {},
      byUser: {}
    }
  }

  // Métodos de mapeo de datos
  private mapAnalyticsEvent(data: any): AnalyticsEvent {
    return {
      id: data.id,
      userId: data.userId,
      sessionId: data.sessionId,
      eventName: data.eventName,
      eventType: data.eventType,
      category: data.category,
      properties: data.properties,
      timestamp: new Date(data.timestamp),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      referrer: data.referrer,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      metadata: data.metadata
    }
  }

  private mapUserMetrics(data: any): UserMetrics {
    return {
      userId: data.userId,
      totalSessions: data.totalSessions,
      totalEvents: data.totalEvents,
      firstSeen: new Date(data.firstSeen),
      lastSeen: new Date(data.lastSeen),
      averageSessionDuration: data.averageSessionDuration,
      totalPageViews: data.totalPageViews,
      totalTransactions: data.totalTransactions,
      totalInvestments: data.totalInvestments,
      totalDeposits: data.totalDeposits,
      complianceScore: data.complianceScore,
      riskLevel: data.riskLevel,
      engagementScore: data.engagementScore,
      retentionScore: data.retentionScore,
      lifetimeValue: data.lifetimeValue,
      metadata: data.metadata,
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapSessionMetrics(data: any): SessionMetrics {
    return {
      sessionId: data.sessionId,
      userId: data.userId,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      duration: data.duration,
      pageViews: data.pageViews,
      events: data.events,
      transactions: data.transactions,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      referrer: data.referrer,
      entryPage: data.entryPage,
      exitPage: data.exitPage,
      deviceInfo: data.deviceInfo,
      location: data.location,
      metadata: data.metadata
    }
  }

  private mapPageMetrics(data: any): PageMetrics {
    return {
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      totalViews: data.totalViews,
      uniqueViews: data.uniqueViews,
      averageTimeOnPage: data.averageTimeOnPage,
      bounceRate: data.bounceRate,
      exitRate: data.exitRate,
      conversionRate: data.conversionRate,
      events: data.events,
      metadata: data.metadata,
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapFunnelMetrics(data: any): FunnelMetrics {
    return {
      funnelId: data.funnelId,
      funnelName: data.funnelName,
      steps: data.steps,
      totalEntries: data.totalEntries,
      totalConversions: data.totalConversions,
      conversionRate: data.conversionRate,
      averageTimeToComplete: data.averageTimeToComplete,
      dropOffPoints: data.dropOffPoints,
      metadata: data.metadata,
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapCohortMetrics(data: any): CohortMetrics {
    return {
      cohortId: data.cohortId,
      cohortName: data.cohortName,
      cohortDate: new Date(data.cohortDate),
      totalUsers: data.totalUsers,
      retentionRates: data.retentionRates,
      engagementScores: data.engagementScores,
      revenueMetrics: data.revenueMetrics,
      metadata: data.metadata,
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapAnalyticsStats(data: any): AnalyticsStats {
    return {
      totalEvents: data.totalEvents,
      totalUsers: data.totalUsers,
      totalSessions: data.totalSessions,
      totalTransactions: data.totalTransactions,
      totalRevenue: data.totalRevenue,
      averageSessionDuration: data.averageSessionDuration,
      bounceRate: data.bounceRate,
      conversionRate: data.conversionRate,
      byEventType: data.byEventType,
      byCategory: data.byCategory,
      byPage: data.byPage,
      byUser: data.byUser
    }
  }

  private mapAnalyticsReport(data: any): AnalyticsReport {
    return {
      reportId: data.reportId,
      reportName: data.reportName,
      reportType: data.reportType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      metrics: this.mapAnalyticsStats(data.metrics),
      insights: data.insights,
      recommendations: data.recommendations,
      generatedAt: new Date(data.generatedAt),
      metadata: data.metadata
    }
  }

  // Métodos de limpieza
  clearCache(): void {
    this.cache.clear()
  }

  clearExpiredCache(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, value] of entries) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }

  getQueueSize(): number {
    return this.eventQueue.length
  }

  // Método de limpieza al destruir
  destroy(): void {
    this.stopFlushTimer()
    this.flushEvents() // Enviar eventos restantes
    this.clearCache()
  }
}

// Instancia singleton del servicio
export const analyticsService = new AnalyticsService()

// Hooks de React para usar el servicio
export function useAnalyticsService() {
  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackClick: analyticsService.trackClick.bind(analyticsService),
    trackTransaction: analyticsService.trackTransaction.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    trackPerformance: analyticsService.trackPerformance.bind(analyticsService),
    getEvents: analyticsService.getEvents.bind(analyticsService),
    getUserMetrics: analyticsService.getUserMetrics.bind(analyticsService),
    getSessionMetrics: analyticsService.getSessionMetrics.bind(analyticsService),
    getPageMetrics: analyticsService.getPageMetrics.bind(analyticsService),
    getFunnelMetrics: analyticsService.getFunnelMetrics.bind(analyticsService),
    getCohortMetrics: analyticsService.getCohortMetrics.bind(analyticsService),
    getAnalyticsStats: analyticsService.getAnalyticsStats.bind(analyticsService),
    generateReport: analyticsService.generateReport.bind(analyticsService),
    getReport: analyticsService.getReport.bind(analyticsService),
    setUserId: analyticsService.setUserId.bind(analyticsService),
    clearUserId: analyticsService.clearUserId.bind(analyticsService),
    getSessionId: analyticsService.getSessionId.bind(analyticsService),
    clearCache: analyticsService.clearCache.bind(analyticsService),
    getQueueSize: analyticsService.getQueueSize.bind(analyticsService)
  }
}

// Hook para tracking automático de páginas
export function usePageTracking() {
  const { trackPageView } = useAnalyticsService()

  React.useEffect(() => {
    trackPageView(window.location.href, document.title)
  }, [trackPageView])
}

// Hook para tracking automático de errores
export function useErrorTracking() {
  const { trackError } = useAnalyticsService()

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(
        new Error(event.message),
        window.location.href,
        document.title,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        window.location.href,
        document.title,
        {
          reason: event.reason
        }
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackError])
}
