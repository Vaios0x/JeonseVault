'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { securityManager, useSecurity } from '@/lib/security'

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface SecurityContextType {
  // Validación de inputs
  validateInput: (type: 'address' | 'amount' | 'text' | 'file', value: any, options?: any) => any
  validateForm: (data: Record<string, any>) => any
  
  // CSRF Protection
  generateCSRFToken: (userId?: string) => string
  verifyCSRFToken: (token: string, userId?: string) => boolean
  csrfToken: string | null
  
  // Auditoría de seguridad
  logAudit: (audit: any) => void
  logValidationError: (field: string, value: any, errors: string[]) => void
  logSuspiciousActivity: (action: string, metadata?: Record<string, any>) => void
  
  // Sanitización
  sanitizeData: (data: any) => any
  
  // Estado de seguridad
  isSecure: boolean
  securityStats: any
  recentAudits: any[]
}

interface SecurityProviderProps {
  children: ReactNode
  config?: {
    enableAudit?: boolean
    enableCSRF?: boolean
    enableValidation?: boolean
    logLevel?: 'info' | 'warn' | 'error'
  }
}

// ============================================================================
// CONTEXTO DE SEGURIDAD
// ============================================================================

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SecurityProvider({ 
  children, 
  config = {
    enableAudit: true,
    enableCSRF: true,
    enableValidation: true,
    logLevel: 'warn'
  }
}: SecurityProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isSecure, setIsSecure] = useState(true)
  const [securityStats, setSecurityStats] = useState<any>(null)
  const [recentAudits, setRecentAudits] = useState<any[]>([])

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Generar token CSRF al montar el componente
  useEffect(() => {
    if (config.enableCSRF) {
      const token = securityManager.generateCSRFToken('mock-user-id')
      setCsrfToken(token)
    }
  }, [config.enableCSRF])

  // Actualizar estadísticas de seguridad
  useEffect(() => {
    const updateStats = () => {
      const stats = securityManager.getSecurityStats()
      setSecurityStats(stats)
      
      // Obtener auditorías recientes
      const audits = securityManager.getAudits({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
      })
      setRecentAudits(audits.slice(0, 10))
    }

    updateStats()
    const interval = setInterval(updateStats, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  // ============================================================================
  // FUNCIONES DE AUDITORÍA
  // ============================================================================

  const logAudit = (audit: any) => {
    if (!config.enableAudit) return

    const enhancedAudit = {
      ...audit,
      userId: 'mock-user-id', // Mock user ID for now
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    securityManager.logAudit(enhancedAudit)
  }

  const logValidationError = (field: string, value: any, errors: string[]) => {
    if (!config.enableAudit) return

    logAudit({
      type: 'input',
      severity: 'low',
      message: `Error de validación en campo: ${field}`,
      metadata: { 
        field, 
        value: String(value).substring(0, 100), 
        errors,
        page: window.location.pathname
      }
    })
  }

  const logSuspiciousActivity = (action: string, metadata?: Record<string, any>) => {
    if (!config.enableAudit) return

    logAudit({
      type: 'access',
      severity: 'medium',
      message: `Actividad sospechosa detectada: ${action}`,
      metadata: {
        action,
        page: window.location.pathname,
        referrer: document.referrer,
        ...metadata
      }
    })
  }

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  const validateInput = (type: 'address' | 'amount' | 'text' | 'file', value: any, options?: any) => {
    if (!config.enableValidation) {
      return { isValid: true, errors: [], warnings: [], sanitizedValue: value }
    }

    const result = securityManager.validateInput(type, value, options)
    
    // Log error si la validación falla
    if (!result.isValid) {
      logValidationError(type, value, result.errors)
    }

    return result
  }

  const validateForm = (data: Record<string, any>) => {
    if (!config.enableValidation) {
      return { isValid: true, errors: {}, warnings: {} }
    }

    const result = securityManager.validateForm(data)
    
    // Log errores de validación
    for (const [field, errors] of Object.entries(result.errors)) {
      logValidationError(field, data[field], errors)
    }

    return result
  }

  // ============================================================================
  // FUNCIONES CSRF
  // ============================================================================

  const generateCSRFToken = (userId?: string) => {
    if (!config.enableCSRF) return ''
    
    const token = securityManager.generateCSRFToken(userId || 'mock-user-id')
    setCsrfToken(token)
    return token
  }

  const verifyCSRFToken = (token: string, userId?: string) => {
    if (!config.enableCSRF) return true
    
    return securityManager.verifyCSRFToken(token, userId || 'mock-user-id')
  }

  // ============================================================================
  // FUNCIONES DE SANITIZACIÓN
  // ============================================================================

  const sanitizeData = (data: any) => {
    if (!config.enableValidation) return data
    
    return securityManager.sanitizeData(data)
  }

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const contextValue: SecurityContextType = {
    // Validación
    validateInput,
    validateForm,
    
    // CSRF
    generateCSRFToken,
    verifyCSRFToken,
    csrfToken,
    
    // Auditoría
    logAudit,
    logValidationError,
    logSuspiciousActivity,
    
    // Sanitización
    sanitizeData,
    
    // Estado
    isSecure,
    securityStats,
    recentAudits
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  )
}

// ============================================================================
// HOOK PARA USAR EL CONTEXTO
// ============================================================================

export function useSecurityContext() {
  const context = useContext(SecurityContext)
  
  if (context === undefined) {
    throw new Error('useSecurityContext debe ser usado dentro de un SecurityProvider')
  }
  
  return context
}

// ============================================================================
// COMPONENTE DE MONITOREO DE SEGURIDAD
// ============================================================================

export function SecurityMonitor() {
  const { securityStats, recentAudits, isSecure } = useSecurityContext()

  if (!securityStats) return null

  const hasCriticalIssues = securityStats.audit.criticalCount > 0
  const hasHighIssues = securityStats.audit.highCount > 0
  const hasBlockedRequests = securityStats.rateLimit.blockedKeys > 0

  if (!hasCriticalIssues && !hasHighIssues && !hasBlockedRequests) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-semibold text-red-800">Alertas de Seguridad</h3>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          {hasCriticalIssues && (
            <p>⚠️ {securityStats.audit.criticalCount} errores críticos detectados</p>
          )}
          {hasHighIssues && (
            <p>⚠️ {securityStats.audit.highCount} alertas de alta severidad</p>
          )}
          {hasBlockedRequests && (
            <p>🚫 {securityStats.rateLimit.blockedKeys} IPs bloqueadas</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE DE VALIDACIÓN DE FORMULARIO
// ============================================================================

interface SecureFormProps {
  children: ReactNode
  onSubmit: (data: any) => void
  initialData?: Record<string, any>
  className?: string
}

export function SecureForm({ children, onSubmit, initialData = {}, className }: SecureFormProps) {
  const { validateForm, logAudit, csrfToken } = useSecurityContext()
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [warnings, setWarnings] = useState<Record<string, string[]>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulario
    const validation = validateForm(formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      setWarnings(validation.warnings)
      
      logAudit({
        type: 'input',
        severity: 'medium',
        message: 'Formulario enviado con errores de validación',
        metadata: { errors: validation.errors, warnings: validation.warnings }
      })
      
      return
    }

    // Verificar token CSRF
    if (csrfToken && !securityManager.verifyCSRFToken(csrfToken)) {
      logAudit({
        type: 'access',
        severity: 'high',
        message: 'Token CSRF inválido en envío de formulario',
        metadata: { formData: Object.keys(formData) }
      })
      
      setErrors({ _csrf: ['Token de seguridad inválido'] })
      return
    }

    // Log auditoría exitosa
    logAudit({
      type: 'input',
      severity: 'low',
      message: 'Formulario enviado exitosamente',
      metadata: { formData: Object.keys(formData) }
    })

    // Enviar datos
    onSubmit(formData)
    
    // Limpiar errores
    setErrors({})
    setWarnings({})
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Token CSRF oculto */}
      {csrfToken && (
        <input type="hidden" name="_csrf" value={csrfToken} />
      )}
      
      {/* Renderizar children con contexto de errores */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            errors,
            warnings,
            setFormData,
            formData
          } as any)
        }
        return child
      })}
    </form>
  )
}

// ============================================================================
// COMPONENTE DE INPUT SEGURO
// ============================================================================

interface SecureInputProps {
  name: string
  type: 'address' | 'amount' | 'text' | 'file'
  label?: string
  placeholder?: string
  required?: boolean
  maxLength?: number
  errors?: Record<string, string[]>
  warnings?: Record<string, string[]>
  setFormData?: (data: any) => void
  formData?: Record<string, any>
  className?: string
}

export function SecureInput({
  name,
  type,
  label,
  placeholder,
  required = false,
  maxLength,
  errors = {},
  warnings = {},
  setFormData,
  formData = {},
  className
}: SecureInputProps) {
  const { validateInput, logValidationError } = useSecurityContext()
  const [value, setValue] = useState(formData[name] || '')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [fieldWarnings, setFieldWarnings] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Validar en tiempo real
    const validation = validateInput(type, newValue, { maxLength })
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      logValidationError(name, newValue, validation.errors)
    } else {
      setFieldErrors([])
    }

    if (validation.warnings.length > 0) {
      setFieldWarnings(validation.warnings)
    } else {
      setFieldWarnings([])
    }

    // Actualizar formData
    if (setFormData) {
      setFormData({
        ...formData,
        [name]: validation.sanitizedValue || newValue
      })
    }
  }

  const handleBlur = () => {
    // Validación final al perder el foco
    const validation = validateInput(type, value, { maxLength })
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      logValidationError(name, value, validation.errors)
    }
  }

  const hasErrors = fieldErrors.length > 0 || errors[name]?.length > 0
  const hasWarnings = fieldWarnings.length > 0 || warnings[name]?.length > 0
  const allErrors = [...fieldErrors, ...(errors[name] || [])]
  const allWarnings = [...fieldWarnings, ...(warnings[name] || [])]

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type === 'file' ? 'file' : 'text'}
        value={type === 'file' ? undefined : value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          ${hasErrors 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : hasWarnings
            ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          focus:outline-none focus:ring-1 focus:ring-opacity-50
        `}
      />
      
      {/* Mostrar errores */}
      {allErrors.length > 0 && (
        <div className="text-red-600 text-sm space-y-1">
          {allErrors.map((error, index) => (
            <p key={index} className="flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          ))}
        </div>
      )}
      
      {/* Mostrar advertencias */}
      {allWarnings.length > 0 && (
        <div className="text-yellow-600 text-sm space-y-1">
          {allWarnings.map((warning, index) => (
            <p key={index} className="flex items-center">
              <span className="mr-1">⚠️</span>
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE DE BOTÓN SEGURO
// ============================================================================

interface SecureButtonProps {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function SecureButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className
}: SecureButtonProps) {
  const { logAudit } = useSecurityContext()

  const handleClick = () => {
    if (onClick) {
      logAudit({
        type: 'user_action',
        severity: 'low',
        message: 'Botón clickeado',
        metadata: { 
          buttonText: typeof children === 'string' ? children : 'Button',
          variant,
          type
        }
      })
      
      onClick()
    }
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className || ''}
      `}
    >
      {children}
    </button>
  )
}
