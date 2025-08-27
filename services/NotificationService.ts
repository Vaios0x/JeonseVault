import { Address } from 'viem'

// Tipos específicos del servicio de notificaciones
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  channels: NotificationChannel[]
  scheduledAt?: Date
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  expiresAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type NotificationType = 
  | 'transaction' 
  | 'compliance' 
  | 'security' 
  | 'investment' 
  | 'deposit' 
  | 'system' 
  | 'marketing' 
  | 'reminder'

export type NotificationChannel = 'push' | 'email' | 'sms' | 'inApp'

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  title: string
  message: string
  channels: NotificationChannel[]
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationPreferences {
  userId: string
  push: boolean
  email: boolean
  sms: boolean
  inApp: boolean
  types: {
    transaction: boolean
    compliance: boolean
    security: boolean
    investment: boolean
    deposit: boolean
    system: boolean
    marketing: boolean
    reminder: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string // HH:mm format
    timezone: string
  }
  updatedAt: Date
}

export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  deviceInfo: {
    userAgent: string
    platform: string
    language: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailNotification {
  id: string
  userId: string
  to: string
  subject: string
  htmlContent: string
  textContent: string
  templateId?: string
  variables?: Record<string, any>
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt?: Date
  deliveredAt?: Date
  error?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface SMSNotification {
  id: string
  userId: string
  to: string
  message: string
  templateId?: string
  variables?: Record<string, any>
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: Date
  deliveredAt?: Date
  error?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface NotificationRequest {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  channels?: NotificationChannel[]
  scheduledAt?: Date
  expiresAt?: Date
  templateId?: string
  variables?: Record<string, any>
}

export interface NotificationBatchRequest {
  userIds: string[]
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  channels?: NotificationChannel[]
  scheduledAt?: Date
  expiresAt?: Date
  templateId?: string
  variables?: Record<string, any>
}

export interface NotificationFilter {
  userId?: string
  type?: NotificationType
  status?: Notification['status']
  priority?: Notification['priority']
  channel?: NotificationChannel
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface NotificationStats {
  total: number
  sent: number
  delivered: number
  failed: number
  read: number
  byType: Record<NotificationType, number>
  byChannel: Record<NotificationChannel, number>
  byStatus: Record<Notification['status'], number>
}

// Configuración del servicio
const NOTIFICATION_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || 'https://api.notifications.jeonsevault.com',
  apiKey: process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  batchSize: 100,
  maxRetries: 3
}

// Configuración de proveedores
const PROVIDER_CONFIG = {
  email: {
    provider: 'sendgrid', // o 'mailgun', 'ses', etc.
    apiKey: process.env.NEXT_PUBLIC_EMAIL_API_KEY,
    fromEmail: 'noreply@jeonsevault.com',
    fromName: 'JeonseVault'
  },
  sms: {
    provider: 'twilio', // o 'nexmo', 'aws_sns', etc.
    accountSid: process.env.NEXT_PUBLIC_SMS_ACCOUNT_SID,
    authToken: process.env.NEXT_PUBLIC_SMS_AUTH_TOKEN,
    fromNumber: process.env.NEXT_PUBLIC_SMS_FROM_NUMBER
  },
  push: {
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
  }
}

// Clase principal del servicio
export class NotificationService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutos
  private queue: Map<string, Promise<any>> = new Map()

  constructor() {
    this.apiKey = NOTIFICATION_API_CONFIG.apiKey || ''
    this.baseUrl = NOTIFICATION_API_CONFIG.baseUrl
  }

  // Métodos principales
  async sendNotification(request: NotificationRequest): Promise<Notification> {
    try {
      const response = await this.makeRequest('/notifications/send', {
        method: 'POST',
        data: request
      })

      return this.mapNotification(response.data)
    } catch (error) {
      console.error('Error sending notification:', error)
      throw new Error('Failed to send notification')
    }
  }

  async sendBatchNotifications(request: NotificationBatchRequest): Promise<Notification[]> {
    try {
      const response = await this.makeRequest('/notifications/batch', {
        method: 'POST',
        data: request
      })

      return response.data.map((notification: any) => this.mapNotification(notification))
    } catch (error) {
      console.error('Error sending batch notifications:', error)
      throw new Error('Failed to send batch notifications')
    }
  }

  async getNotifications(filter: NotificationFilter): Promise<Notification[]> {
    try {
      const response = await this.makeRequest('/notifications', {
        method: 'GET',
        params: this.sanitizeFilter(filter)
      })

      return response.data.map((notification: any) => this.mapNotification(notification))
    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    try {
      const response = await this.makeRequest(`/notifications/${notificationId}`, {
        method: 'GET'
      })

      return this.mapNotification(response.data)
    } catch (error) {
      console.error('Error getting notification:', error)
      return null
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      return response.data.success
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/notifications/${userId}/read-all`, {
        method: 'POST'
      })

      return response.data.success
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      return response.data.success
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  async getNotificationStats(userId?: string): Promise<NotificationStats> {
    try {
      const params = userId ? { userId } : {}
      const response = await this.makeRequest('/notifications/stats', {
        method: 'GET',
        params
      })

      return this.mapNotificationStats(response.data)
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return this.getDefaultStats()
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await this.makeRequest(`/notifications/${userId}/unread-count`, {
        method: 'GET'
      })

      return response.data.count
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Métodos de preferencias
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const cacheKey = `preferences_${userId}`
      const cached = this.getCachedData(cacheKey) as NotificationPreferences | null
      if (cached) return cached

      const response = await this.makeRequest(`/notifications/preferences/${userId}`, {
        method: 'GET'
      })

      const preferences = this.mapNotificationPreferences(response.data)
      this.setCachedData(cacheKey, preferences)
      
      return preferences
    } catch (error) {
      console.error('Error getting notification preferences:', error)
      return null
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const response = await this.makeRequest(`/notifications/preferences/${userId}`, {
        method: 'PUT',
        data: preferences
      })

      const updatedPreferences = this.mapNotificationPreferences(response.data)
      this.clearPreferencesCache(userId)
      
      return updatedPreferences
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return null
    }
  }

  // Métodos de suscripción push
  async subscribeToPush(
    userId: string,
    subscription: PushSubscription
  ): Promise<PushSubscription> {
    try {
      const response = await this.makeRequest('/notifications/push/subscribe', {
        method: 'POST',
        data: {
          userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          deviceInfo: subscription.deviceInfo
        }
      })

      return this.mapPushSubscription(response.data)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      throw new Error('Failed to subscribe to push notifications')
    }
  }

  async unsubscribeFromPush(subscriptionId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/notifications/push/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      })

      return response.data.success
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const response = await this.makeRequest(`/notifications/push/subscriptions/${userId}`, {
        method: 'GET'
      })

      return response.data.map((subscription: any) => this.mapPushSubscription(subscription))
    } catch (error) {
      console.error('Error getting push subscriptions:', error)
      return []
    }
  }

  // Métodos de plantillas
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const cacheKey = 'notification_templates'
      const cached = this.getCachedData(cacheKey) as NotificationTemplate[] | null
      if (cached) return cached

      const response = await this.makeRequest('/notifications/templates', {
        method: 'GET'
      })

      const templates = response.data.map((template: any) => this.mapNotificationTemplate(template))
      this.setCachedData(cacheKey, templates)
      
      return templates
    } catch (error) {
      console.error('Error getting notification templates:', error)
      return []
    }
  }

  async getNotificationTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const response = await this.makeRequest(`/notifications/templates/${templateId}`, {
        method: 'GET'
      })

      return this.mapNotificationTemplate(response.data)
    } catch (error) {
      console.error('Error getting notification template:', error)
      return null
    }
  }

  // Métodos de email
  async sendEmailNotification(emailNotification: Omit<EmailNotification, 'id' | 'createdAt'>): Promise<EmailNotification> {
    try {
      const response = await this.makeRequest('/notifications/email', {
        method: 'POST',
        data: emailNotification
      })

      return this.mapEmailNotification(response.data)
    } catch (error) {
      console.error('Error sending email notification:', error)
      throw new Error('Failed to send email notification')
    }
  }

  async getEmailNotifications(userId: string, limit: number = 50): Promise<EmailNotification[]> {
    try {
      const response = await this.makeRequest(`/notifications/email/${userId}`, {
        method: 'GET',
        params: { limit }
      })

      return response.data.map((email: any) => this.mapEmailNotification(email))
    } catch (error) {
      console.error('Error getting email notifications:', error)
      return []
    }
  }

  // Métodos de SMS
  async sendSMSNotification(smsNotification: Omit<SMSNotification, 'id' | 'createdAt'>): Promise<SMSNotification> {
    try {
      const response = await this.makeRequest('/notifications/sms', {
        method: 'POST',
        data: smsNotification
      })

      return this.mapSMSNotification(response.data)
    } catch (error) {
      console.error('Error sending SMS notification:', error)
      throw new Error('Failed to send SMS notification')
    }
  }

  async getSMSNotifications(userId: string, limit: number = 50): Promise<SMSNotification[]> {
    try {
      const response = await this.makeRequest(`/notifications/sms/${userId}`, {
        method: 'GET',
        params: { limit }
      })

      return response.data.map((sms: any) => this.mapSMSNotification(sms))
    } catch (error) {
      console.error('Error getting SMS notifications:', error)
      return []
    }
  }

  // Métodos de utilidad
  async isInQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId)
      if (!preferences || !preferences.quietHours.enabled) {
        return false
      }

      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: preferences.quietHours.timezone 
      })

      const { startTime, endTime } = preferences.quietHours
      return currentTime >= startTime && currentTime <= endTime
    } catch (error) {
      console.error('Error checking quiet hours:', error)
      return false
    }
  }

  async shouldSendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId)
      if (!preferences) return false

      // Verificar si el canal está habilitado
      if (!preferences[channel]) return false

      // Verificar si el tipo está habilitado
      if (!preferences.types[type]) return false

      // Verificar si está en horas silenciosas
      if (await this.isInQuietHours(userId)) {
        return type === 'security' || type === 'system' // Permitir notificaciones críticas
      }

      return true
    } catch (error) {
      console.error('Error checking notification preferences:', error)
      return false
    }
  }

  // Métodos privados
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
      signal: AbortSignal.timeout(NOTIFICATION_API_CONFIG.timeout)
    }

    if (options.data) {
      config.body = JSON.stringify(options.data)
    }

    let lastError: Error
    for (let attempt = 1; attempt <= NOTIFICATION_API_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await fetch(url.toString(), config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < NOTIFICATION_API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, NOTIFICATION_API_CONFIG.retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }

  private sanitizeFilter(filter: NotificationFilter): Record<string, any> {
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

    return cached.data
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private clearPreferencesCache(userId: string): void {
    this.cache.delete(`preferences_${userId}`)
  }

  private getDefaultStats(): NotificationStats {
    return {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      read: 0,
      byType: {
        transaction: 0,
        compliance: 0,
        security: 0,
        investment: 0,
        deposit: 0,
        system: 0,
        marketing: 0,
        reminder: 0
      },
      byChannel: {
        push: 0,
        email: 0,
        sms: 0,
        inApp: 0
      },
      byStatus: {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        read: 0
      }
    }
  }

  // Métodos de mapeo de datos
  private mapNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      priority: data.priority,
      status: data.status,
      channels: data.channels,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
      readAt: data.readAt ? new Date(data.readAt) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      metadata: data.metadata,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapNotificationPreferences(data: any): NotificationPreferences {
    return {
      userId: data.userId,
      push: data.push,
      email: data.email,
      sms: data.sms,
      inApp: data.inApp,
      types: data.types,
      quietHours: data.quietHours,
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapPushSubscription(data: any): PushSubscription {
    return {
      id: data.id,
      userId: data.userId,
      endpoint: data.endpoint,
      keys: data.keys,
      deviceInfo: data.deviceInfo,
      isActive: data.isActive,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapNotificationTemplate(data: any): NotificationTemplate {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      title: data.title,
      message: data.message,
      channels: data.channels,
      variables: data.variables,
      isActive: data.isActive,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    }
  }

  private mapEmailNotification(data: any): EmailNotification {
    return {
      id: data.id,
      userId: data.userId,
      to: data.to,
      subject: data.subject,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      templateId: data.templateId,
      variables: data.variables,
      status: data.status,
      sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
      error: data.error,
      metadata: data.metadata,
      createdAt: new Date(data.createdAt)
    }
  }

  private mapSMSNotification(data: any): SMSNotification {
    return {
      id: data.id,
      userId: data.userId,
      to: data.to,
      message: data.message,
      templateId: data.templateId,
      variables: data.variables,
      status: data.status,
      sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
      error: data.error,
      metadata: data.metadata,
      createdAt: new Date(data.createdAt)
    }
  }

  private mapNotificationStats(data: any): NotificationStats {
    return {
      total: data.total,
      sent: data.sent,
      delivered: data.delivered,
      failed: data.failed,
      read: data.read,
      byType: data.byType,
      byChannel: data.byChannel,
      byStatus: data.byStatus
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

  getActiveQueueCount(): number {
    return this.queue.size
  }
}

// Instancia singleton del servicio
export const notificationService = new NotificationService()

// Hooks de React para usar el servicio
export function useNotificationService() {
  return {
    sendNotification: notificationService.sendNotification.bind(notificationService),
    sendBatchNotifications: notificationService.sendBatchNotifications.bind(notificationService),
    getNotifications: notificationService.getNotifications.bind(notificationService),
    getNotificationById: notificationService.getNotificationById.bind(notificationService),
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    deleteNotification: notificationService.deleteNotification.bind(notificationService),
    getNotificationStats: notificationService.getNotificationStats.bind(notificationService),
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService),
    getNotificationPreferences: notificationService.getNotificationPreferences.bind(notificationService),
    updateNotificationPreferences: notificationService.updateNotificationPreferences.bind(notificationService),
    subscribeToPush: notificationService.subscribeToPush.bind(notificationService),
    unsubscribeFromPush: notificationService.unsubscribeFromPush.bind(notificationService),
    getPushSubscriptions: notificationService.getPushSubscriptions.bind(notificationService),
    getNotificationTemplates: notificationService.getNotificationTemplates.bind(notificationService),
    getNotificationTemplate: notificationService.getNotificationTemplate.bind(notificationService),
    sendEmailNotification: notificationService.sendEmailNotification.bind(notificationService),
    getEmailNotifications: notificationService.getEmailNotifications.bind(notificationService),
    sendSMSNotification: notificationService.sendSMSNotification.bind(notificationService),
    getSMSNotifications: notificationService.getSMSNotifications.bind(notificationService),
    isInQuietHours: notificationService.isInQuietHours.bind(notificationService),
    shouldSendNotification: notificationService.shouldSendNotification.bind(notificationService),
    clearCache: notificationService.clearCache.bind(notificationService)
  }
}
