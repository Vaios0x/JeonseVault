// Exportar todos los servicios de integración
export * from './KoreanPropertyService'
export * from './BankVerificationService'
export * from './ComplianceService'
export * from './NotificationService'
export * from './AnalyticsService'

// Re-exportar instancias singleton para uso directo
export { koreanPropertyService } from './KoreanPropertyService'
export { bankVerificationService } from './BankVerificationService'
export { complianceService } from './ComplianceService'
export { notificationService } from './NotificationService'
export { analyticsService } from './AnalyticsService'

// Re-exportar hooks para uso en componentes React
export { usePropertyService } from './KoreanPropertyService'
export { useBankVerificationService } from './BankVerificationService'
export { useComplianceService } from './ComplianceService'
export { useNotificationService } from './NotificationService'
export { useAnalyticsService, usePageTracking, useErrorTracking } from './AnalyticsService'
