// Sistema de Seguridad Integral para JeonseVault
// Implementa rate limiting, validación de inputs, protección CSRF, auditoría de seguridad

import { createHash, randomBytes, createHmac } from 'crypto'
import { Address, parseEther, formatEther } from 'viem'

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface SecurityConfig {
  rateLimit: {
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
    skipFailedRequests: boolean
  }
  csrf: {
    secret: string
    tokenLength: number
    expiresIn: number
  }
  validation: {
    maxInputLength: number
    allowedFileTypes: string[]
    maxFileSize: number
    sanitizeHtml: boolean
  }
  audit: {
    enabled: boolean
    logLevel: 'info' | 'warn' | 'error'
    retentionDays: number
  }
}

export interface RateLimitInfo {
  key: string
  requests: number
  resetTime: number
  blocked: boolean
}

export interface SecurityAudit {
  id: string
  timestamp: Date
  type: 'input' | 'transaction' | 'access' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metadata: Record<string, any>
  userId?: string
  ipAddress?: string
  userAgent?: string
}

export interface InputValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
  warnings: string[]
}

export interface CSRFToken {
  token: string
  expiresAt: number
  userId?: string
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================================

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  csrf: {
    secret: process.env.CSRF_SECRET || 'jeonsevault-csrf-secret-2024',
    tokenLength: 32,
    expiresIn: 24 * 60 * 60 * 1000 // 24 horas
  },
  validation: {
    maxInputLength: 10000,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    sanitizeHtml: true
  },
  audit: {
    enabled: true,
    logLevel: 'warn',
    retentionDays: 90
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private store = new Map<string, RateLimitInfo>()
  private config: SecurityConfig['rateLimit']

  constructor(config: SecurityConfig['rateLimit']) {
    this.config = config
    this.cleanup()
  }

  // Verificar rate limit
  checkLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const info = this.store.get(key)

    if (!info || now > info.resetTime) {
      // Crear nueva entrada
      const newInfo: RateLimitInfo = {
        key,
        requests: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      }
      this.store.set(key, newInfo)
      return { allowed: true, remaining: this.config.maxRequests - 1, resetTime: newInfo.resetTime }
    }

    if (info.blocked) {
      return { allowed: false, remaining: 0, resetTime: info.resetTime }
    }

    if (info.requests >= this.config.maxRequests) {
      info.blocked = true
      return { allowed: false, remaining: 0, resetTime: info.resetTime }
    }

    info.requests++
    return { allowed: true, remaining: this.config.maxRequests - info.requests, resetTime: info.resetTime }
  }

  // Limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now()
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key)
      }
    }
  }

  // Obtener estadísticas
  getStats(): { totalKeys: number; blockedKeys: number } {
    let blockedCount = 0
    for (const info of this.store.values()) {
      if (info.blocked) blockedCount++
    }
    return { totalKeys: this.store.size, blockedKeys: blockedCount }
  }

  // Resetear rate limit para una clave
  reset(key: string): boolean {
    return this.store.delete(key)
  }
}

// ============================================================================
// VALIDACIÓN DE INPUTS
// ============================================================================

class InputValidator {
  private config: SecurityConfig['validation']

  constructor(config: SecurityConfig['validation']) {
    this.config = config
  }

  // Validar dirección Ethereum
  validateAddress(address: string): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!address) {
      errors.push('La dirección es requerida')
      return { isValid: false, errors, warnings }
    }

    if (typeof address !== 'string') {
      errors.push('La dirección debe ser una cadena de texto')
      return { isValid: false, errors, warnings }
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      errors.push('Formato de dirección Ethereum inválido')
      return { isValid: false, errors, warnings }
    }

    // Verificar checksum
    try {
      const checksumAddress = address as Address
      if (checksumAddress.toLowerCase() !== address.toLowerCase()) {
        warnings.push('La dirección no está en formato checksum')
      }
    } catch {
      errors.push('Dirección Ethereum inválida')
      return { isValid: false, errors, warnings }
    }

    return { isValid: true, errors, warnings, sanitizedValue: address }
  }

  // Validar cantidad de ETH
  validateAmount(amount: string): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!amount) {
      errors.push('La cantidad es requerida')
      return { isValid: false, errors, warnings }
    }

    if (typeof amount !== 'string') {
      errors.push('La cantidad debe ser una cadena de texto')
      return { isValid: false, errors, warnings }
    }

    // Verificar formato numérico
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      errors.push('Formato de cantidad inválido')
      return { isValid: false, errors, warnings }
    }

    try {
      const parsedAmount = parseEther(amount)
      
      // Verificar límites
      const minAmount = parseEther('0.001')
      const maxAmount = parseEther('10000')

      if (parsedAmount < minAmount) {
        errors.push('La cantidad mínima es 0.001 ETH')
        return { isValid: false, errors, warnings }
      }

      if (parsedAmount > maxAmount) {
        errors.push('La cantidad máxima es 10,000 ETH')
        return { isValid: false, errors, warnings }
      }

      return { isValid: true, errors, warnings, sanitizedValue: amount }
    } catch {
      errors.push('Cantidad inválida')
      return { isValid: false, errors, warnings }
    }
  }

  // Validar texto general
  validateText(text: string, maxLength?: number): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!text) {
      errors.push('El texto es requerido')
      return { isValid: false, errors, warnings }
    }

    if (typeof text !== 'string') {
      errors.push('El texto debe ser una cadena de texto')
      return { isValid: false, errors, warnings }
    }

    const limit = maxLength || this.config.maxInputLength

    if (text.length > limit) {
      errors.push(`El texto no puede exceder ${limit} caracteres`)
      return { isValid: false, errors, warnings }
    }

    // Detectar posibles ataques XSS
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(text)) {
        errors.push('Contenido potencialmente peligroso detectado')
        return { isValid: false, errors, warnings }
      }
    }

    // Sanitizar HTML si está habilitado
    let sanitizedValue = text
    if (this.config.sanitizeHtml) {
      sanitizedValue = this.sanitizeHtml(text)
    }

    return { isValid: true, errors, warnings, sanitizedValue }
  }

  // Validar archivo
  validateFile(file: File): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!file) {
      errors.push('El archivo es requerido')
      return { isValid: false, errors, warnings }
    }

    // Verificar tamaño
    if (file.size > this.config.maxFileSize) {
      errors.push(`El archivo no puede exceder ${this.config.maxFileSize / 1024 / 1024}MB`)
      return { isValid: false, errors, warnings }
    }

    // Verificar tipo
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !this.config.allowedFileTypes.includes(extension)) {
      errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${this.config.allowedFileTypes.join(', ')}`)
      return { isValid: false, errors, warnings }
    }

    return { isValid: true, errors, warnings, sanitizedValue: file }
  }

  // Sanitizar HTML
  private sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '')
  }

  // Validar formulario completo
  validateForm(data: Record<string, any>): { isValid: boolean; errors: Record<string, string[]>; warnings: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}

    for (const [key, value] of Object.entries(data)) {
      const result = this.validateField(key, value)
      if (!result.isValid) {
        errors[key] = result.errors
      }
      if (result.warnings.length > 0) {
        warnings[key] = result.warnings
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  }

  // Validar campo específico
  private validateField(key: string, value: any): InputValidationResult {
    switch (key) {
      case 'address':
      case 'landlord':
      case 'tenant':
        return this.validateAddress(value)
      case 'amount':
        return this.validateAmount(value)
      case 'propertyId':
      case 'propertyAddress':
      case 'reason':
        return this.validateText(value, 500)
      case 'file':
        return this.validateFile(value)
      default:
        return this.validateText(value)
    }
  }
}

// ============================================================================
// PROTECCIÓN CSRF
// ============================================================================

class CSRFProtection {
  private tokens = new Map<string, CSRFToken>()
  private config: SecurityConfig['csrf']

  constructor(config: SecurityConfig['csrf']) {
    this.config = config
    this.cleanup()
  }

  // Generar token CSRF
  generateToken(userId?: string): string {
    const token = randomBytes(this.config.tokenLength).toString('hex')
    const expiresAt = Date.now() + this.config.expiresIn

    this.tokens.set(token, {
      token,
      expiresAt,
      userId
    })

    return token
  }

  // Verificar token CSRF
  verifyToken(token: string, userId?: string): boolean {
    const tokenInfo = this.tokens.get(token)

    if (!tokenInfo) {
      return false
    }

    if (Date.now() > tokenInfo.expiresAt) {
      this.tokens.delete(token)
      return false
    }

    if (userId && tokenInfo.userId && tokenInfo.userId !== userId) {
      return false
    }

    return true
  }

  // Limpiar tokens expirados
  private cleanup(): void {
    const now = Date.now()
    for (const [token, info] of this.tokens.entries()) {
      if (now > info.expiresAt) {
        this.tokens.delete(token)
      }
    }
  }

  // Obtener estadísticas
  getStats(): { totalTokens: number; activeTokens: number } {
    const now = Date.now()
    let activeCount = 0

    for (const info of this.tokens.values()) {
      if (now <= info.expiresAt) {
        activeCount++
      }
    }

    return { totalTokens: this.tokens.size, activeTokens: activeCount }
  }
}

// ============================================================================
// AUDITORÍA DE SEGURIDAD
// ============================================================================

class SecurityAuditor {
  private audits: SecurityAudit[] = []
  private config: SecurityConfig['audit']

  constructor(config: SecurityConfig['audit']) {
    this.config = config
  }

  // Registrar auditoría
  log(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return

    const securityAudit: SecurityAudit = {
      ...audit,
      id: this.generateId(),
      timestamp: new Date()
    }

    this.audits.push(securityAudit)

    // Limpiar auditorías antiguas
    this.cleanup()

    // Log según nivel de severidad
    this.logToConsole(securityAudit)
  }

  // Registrar intento de acceso sospechoso
  logSuspiciousAccess(ipAddress: string, userAgent: string, action: string, metadata?: Record<string, any>): void {
    this.log({
      type: 'access',
      severity: 'medium',
      message: `Acceso sospechoso detectado: ${action}`,
      metadata: { ipAddress, userAgent, action, ...metadata },
      ipAddress,
      userAgent
    })
  }

  // Registrar error de validación
  logValidationError(field: string, value: any, errors: string[], userId?: string): void {
    this.log({
      type: 'input',
      severity: 'low',
      message: `Error de validación en campo: ${field}`,
      metadata: { field, value: String(value).substring(0, 100), errors },
      userId
    })
  }

  // Registrar transacción sospechosa
  logSuspiciousTransaction(txHash: string, from: string, to: string, amount: string, metadata?: Record<string, any>): void {
    this.log({
      type: 'transaction',
      severity: 'high',
      message: `Transacción sospechosa detectada: ${txHash}`,
      metadata: { txHash, from, to, amount, ...metadata }
    })
  }

  // Registrar error crítico
  logCriticalError(error: Error, context: string, userId?: string): void {
    this.log({
      type: 'error',
      severity: 'critical',
      message: `Error crítico: ${error.message}`,
      metadata: { 
        error: error.message, 
        stack: error.stack, 
        context 
      },
      userId
    })
  }

  // Obtener auditorías por filtro
  getAudits(filter?: {
    type?: SecurityAudit['type']
    severity?: SecurityAudit['severity']
    userId?: string
    startDate?: Date
    endDate?: Date
  }): SecurityAudit[] {
    let filtered = this.audits

    if (filter?.type) {
      filtered = filtered.filter(audit => audit.type === filter.type)
    }

    if (filter?.severity) {
      filtered = filtered.filter(audit => audit.severity === filter.severity)
    }

    if (filter?.userId) {
      filtered = filtered.filter(audit => audit.userId === filter.userId)
    }

    if (filter?.startDate) {
      filtered = filtered.filter(audit => audit.timestamp >= filter.startDate!)
    }

    if (filter?.endDate) {
      filtered = filtered.filter(audit => audit.timestamp <= filter.endDate!)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Generar reporte de seguridad
  generateSecurityReport(): {
    totalAudits: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    recentSuspiciousActivity: SecurityAudit[]
    recommendations: string[]
  } {
    const now = Date.now()
    const last24Hours = now - 24 * 60 * 60 * 1000

    const recentAudits = this.audits.filter(audit => audit.timestamp.getTime() > last24Hours)
    const suspiciousActivity = recentAudits.filter(audit => 
      audit.severity === 'high' || audit.severity === 'critical'
    )

    const criticalCount = this.audits.filter(a => a.severity === 'critical').length
    const highCount = this.audits.filter(a => a.severity === 'high').length
    const mediumCount = this.audits.filter(a => a.severity === 'medium').length
    const lowCount = this.audits.filter(a => a.severity === 'low').length

    const recommendations: string[] = []

    if (criticalCount > 0) {
      recommendations.push('Revisar inmediatamente los errores críticos detectados')
    }

    if (suspiciousActivity.length > 10) {
      recommendations.push('Implementar medidas adicionales de seguridad debido al alto número de actividades sospechosas')
    }

    if (highCount > 50) {
      recommendations.push('Considerar implementar rate limiting más estricto')
    }

    return {
      totalAudits: this.audits.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      recentSuspiciousActivity: suspiciousActivity.slice(0, 10),
      recommendations
    }
  }

  // Limpiar auditorías antiguas
  private cleanup(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    this.audits = this.audits.filter(audit => audit.timestamp > cutoffDate)
  }

  // Generar ID único
  private generateId(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .substring(0, 16)
  }

  // Log a consola
  private logToConsole(audit: SecurityAudit): void {
    const timestamp = audit.timestamp.toISOString()
    const level = audit.severity.toUpperCase()
    const message = audit.message

    switch (audit.severity) {
      case 'critical':
        console.error(`[${timestamp}] [CRITICAL] ${message}`, audit.metadata)
        break
      case 'high':
        console.warn(`[${timestamp}] [HIGH] ${message}`, audit.metadata)
        break
      case 'medium':
        if (this.config.logLevel === 'info' || this.config.logLevel === 'warn') {
          console.warn(`[${timestamp}] [MEDIUM] ${message}`, audit.metadata)
        }
        break
      case 'low':
        if (this.config.logLevel === 'info') {
          console.log(`[${timestamp}] [LOW] ${message}`, audit.metadata)
        }
        break
    }
  }
}

// ============================================================================
// VALIDACIÓN DE CONTRATOS INTELIGENTES
// ============================================================================

class SmartContractValidator {
  // Validar dirección de contrato
  validateContractAddress(address: string): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!address) {
      errors.push('La dirección del contrato es requerida')
      return { isValid: false, errors, warnings }
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      errors.push('Formato de dirección de contrato inválido')
      return { isValid: false, errors, warnings }
    }

    // Verificar que no sea una dirección EOA (cuenta externa)
    // Esto es una validación básica, en producción se debería verificar el código del contrato
    if (address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      errors.push('La dirección no puede ser la dirección cero')
      return { isValid: false, errors, warnings }
    }

    return { isValid: true, errors, warnings, sanitizedValue: address }
  }

  // Validar ABI del contrato
  validateContractABI(abi: any): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!abi) {
      errors.push('El ABI del contrato es requerido')
      return { isValid: false, errors, warnings }
    }

    if (!Array.isArray(abi)) {
      errors.push('El ABI debe ser un array')
      return { isValid: false, errors, warnings }
    }

    // Verificar estructura básica del ABI
    for (const item of abi) {
      if (!item.type || !item.name) {
        errors.push('Cada elemento del ABI debe tener type y name')
        return { isValid: false, errors, warnings }
      }
    }

    return { isValid: true, errors, warnings, sanitizedValue: abi }
  }

  // Validar parámetros de función
  validateFunctionParams(functionName: string, params: any[], expectedTypes: string[]): InputValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!functionName) {
      errors.push('El nombre de la función es requerido')
      return { isValid: false, errors, warnings }
    }

    if (!Array.isArray(params)) {
      errors.push('Los parámetros deben ser un array')
      return { isValid: false, errors, warnings }
    }

    if (params.length !== expectedTypes.length) {
      errors.push(`Número incorrecto de parámetros. Esperado: ${expectedTypes.length}, Recibido: ${params.length}`)
      return { isValid: false, errors, warnings }
    }

    // Validar tipos de parámetros
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      const expectedType = expectedTypes[i]

      if (!this.validateParameterType(param, expectedType)) {
        errors.push(`Parámetro ${i + 1} debe ser de tipo ${expectedType}`)
        return { isValid: false, errors, warnings }
      }
    }

    return { isValid: true, errors, warnings, sanitizedValue: params }
  }

  // Validar tipo de parámetro
  private validateParameterType(param: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'address':
        return typeof param === 'string' && /^0x[a-fA-F0-9]{40}$/.test(param)
      case 'uint256':
      case 'uint':
        return typeof param === 'string' && /^\d+$/.test(param)
      case 'int256':
      case 'int':
        return typeof param === 'string' && /^-?\d+$/.test(param)
      case 'bool':
        return typeof param === 'boolean'
      case 'string':
        return typeof param === 'string'
      case 'bytes':
        return typeof param === 'string' && param.startsWith('0x')
      default:
        return true // Para tipos complejos, asumir válido
    }
  }
}

// ============================================================================
// CLASE PRINCIPAL DE SEGURIDAD
// ============================================================================

export class SecurityManager {
  private rateLimiter: RateLimiter
  private inputValidator: InputValidator
  private csrfProtection: CSRFProtection
  private securityAuditor: SecurityAuditor
  private contractValidator: SmartContractValidator
  private config: SecurityConfig

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
    
    this.rateLimiter = new RateLimiter(this.config.rateLimit)
    this.inputValidator = new InputValidator(this.config.validation)
    this.csrfProtection = new CSRFProtection(this.config.csrf)
    this.securityAuditor = new SecurityAuditor(this.config.audit)
    this.contractValidator = new SmartContractValidator()
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  // Rate Limiting
  checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    return this.rateLimiter.checkLimit(key)
  }

  // Validación de Inputs
  validateInput(type: 'address' | 'amount' | 'text' | 'file', value: any, options?: any): InputValidationResult {
    switch (type) {
      case 'address':
        return this.inputValidator.validateAddress(value)
      case 'amount':
        return this.inputValidator.validateAmount(value)
      case 'text':
        return this.inputValidator.validateText(value, options?.maxLength)
      case 'file':
        return this.inputValidator.validateFile(value)
      default:
        return { isValid: false, errors: ['Tipo de validación no soportado'], warnings: [] }
    }
  }

  validateForm(data: Record<string, any>): { isValid: boolean; errors: Record<string, string[]>; warnings: Record<string, string[]> } {
    return this.inputValidator.validateForm(data)
  }

  // CSRF Protection
  generateCSRFToken(userId?: string): string {
    return this.csrfProtection.generateToken(userId)
  }

  verifyCSRFToken(token: string, userId?: string): boolean {
    return this.csrfProtection.verifyToken(token, userId)
  }

  // Smart Contract Validation
  validateContractAddress(address: string): InputValidationResult {
    return this.contractValidator.validateContractAddress(address)
  }

  validateContractABI(abi: any): InputValidationResult {
    return this.contractValidator.validateContractABI(abi)
  }

  validateFunctionParams(functionName: string, params: any[], expectedTypes: string[]): InputValidationResult {
    return this.contractValidator.validateFunctionParams(functionName, params, expectedTypes)
  }

  // Security Auditing
  logAudit(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): void {
    this.securityAuditor.log(audit)
  }

  logSuspiciousAccess(ipAddress: string, userAgent: string, action: string, metadata?: Record<string, any>): void {
    this.securityAuditor.logSuspiciousAccess(ipAddress, userAgent, action, metadata)
  }

  logValidationError(field: string, value: any, errors: string[], userId?: string): void {
    this.securityAuditor.logValidationError(field, value, errors, userId)
  }

  logSuspiciousTransaction(txHash: string, from: string, to: string, amount: string, metadata?: Record<string, any>): void {
    this.securityAuditor.logSuspiciousTransaction(txHash, from, to, amount, metadata)
  }

  logCriticalError(error: Error, context: string, userId?: string): void {
    this.securityAuditor.logCriticalError(error, context, userId)
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  // Generar hash seguro
  generateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex')
  }

  // Generar HMAC
  generateHMAC(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('hex')
  }

  // Sanitizar datos
  sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.inputValidator.validateText(data).sanitizedValue
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value)
      }
      return sanitized
    }
    return data
  }

  // Verificar si una IP está en lista negra
  isIPBlacklisted(ipAddress: string): boolean {
    // Implementar lógica de lista negra
    const blacklistedIPs = [
      '127.0.0.1', // Localhost (para testing)
      // Agregar más IPs según sea necesario
    ]
    return blacklistedIPs.includes(ipAddress)
  }

  // ============================================================================
  // MÉTODOS DE ESTADÍSTICAS
  // ============================================================================

  getSecurityStats(): {
    rateLimit: { totalKeys: number; blockedKeys: number }
    csrf: { totalTokens: number; activeTokens: number }
    audit: ReturnType<SecurityAuditor['generateSecurityReport']>
  } {
    return {
      rateLimit: this.rateLimiter.getStats(),
      csrf: this.csrfProtection.getStats(),
      audit: this.securityAuditor.generateSecurityReport()
    }
  }

  getAudits(filter?: Parameters<SecurityAuditor['getAudits']>[0]): SecurityAudit[] {
    return this.securityAuditor.getAudits(filter)
  }
}

// ============================================================================
// INSTANCIA GLOBAL
// ============================================================================

export const securityManager = new SecurityManager()

// ============================================================================
// HOOKS PARA REACT
// ============================================================================

export function useSecurity() {
  return {
    validateInput: securityManager.validateInput.bind(securityManager),
    validateForm: securityManager.validateForm.bind(securityManager),
    generateCSRFToken: securityManager.generateCSRFToken.bind(securityManager),
    verifyCSRFToken: securityManager.verifyCSRFToken.bind(securityManager),
    logAudit: securityManager.logAudit.bind(securityManager),
    sanitizeData: securityManager.sanitizeData.bind(securityManager)
  }
}

// ============================================================================
// MIDDLEWARE PARA NEXT.JS
// ============================================================================

export function withSecurity(handler: Function) {
  return async (req: any, res: any) => {
    try {
      // Verificar rate limit
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const rateLimitResult = securityManager.checkRateLimit(clientIP)

      if (!rateLimitResult.allowed) {
        securityManager.logSuspiciousAccess(clientIP, req.headers['user-agent'], 'Rate limit exceeded')
        return res.status(429).json({ error: 'Too many requests' })
      }

      // Verificar CSRF token para métodos POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken
        if (!csrfToken || !securityManager.verifyCSRFToken(csrfToken)) {
          securityManager.logSuspiciousAccess(clientIP, req.headers['user-agent'], 'CSRF token invalid')
          return res.status(403).json({ error: 'Invalid CSRF token' })
        }
      }

      // Sanitizar datos de entrada
      if (req.body) {
        req.body = securityManager.sanitizeData(req.body)
      }

      // Continuar con el handler original
      return await handler(req, res)
    } catch (error) {
      securityManager.logCriticalError(error as Error, 'API Handler Error')
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// ============================================================================
// EXPORTAR TIPOS
// ============================================================================

// Note: Los tipos se exportan como interfaces arriba en el archivo
