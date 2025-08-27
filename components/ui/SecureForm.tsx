'use client'

import React, { useState, useEffect, useRef, ReactNode, FormEvent } from 'react'
import { useForm, Controller, FieldValues, SubmitHandler, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { securityManager, useSecurity } from '@/lib/security'

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface SecureFormProps<T extends FieldValues> {
  // Configuración del formulario
  schema: z.ZodSchema<T>
  onSubmit: SubmitHandler<T>
  onError?: (errors: any) => void
  
  // Configuración de seguridad
  requireCSRF?: boolean
  validateInputs?: boolean
  sanitizeData?: boolean
  rateLimit?: {
    maxSubmissions: number
    windowMs: number
  }
  
  // Configuración de UI
  children: ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
  
  // Configuración de validación
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  
  // Configuración de errores
  showValidationErrors?: boolean
  errorMessage?: string
  successMessage?: string
}

interface FormSecurityState {
  csrfToken: string
  submissionCount: number
  lastSubmission: number
  isRateLimited: boolean
  validationErrors: string[]
  securityWarnings: string[]
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SecureForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  requireCSRF = true,
  validateInputs = true,
  sanitizeData = true,
  rateLimit = { maxSubmissions: 5, windowMs: 60000 },
  children,
  className,
  disabled = false,
  loading = false,
  validationMode = 'onSubmit',
  reValidateMode = 'onChange',
  showValidationErrors = true,
  errorMessage,
  successMessage
}: SecureFormProps<T>) {
  
  // ============================================================================
  // ESTADO Y REFS
  // ============================================================================
  
  const [securityState, setSecurityState] = useState<FormSecurityState>({
    csrfToken: '',
    submissionCount: 0,
    lastSubmission: 0,
    isRateLimited: false,
    validationErrors: [],
    securityWarnings: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)
  const { validateInput, validateForm, generateCSRFToken, verifyCSRFToken } = useSecurity()
  
  // ============================================================================
  // CONFIGURACIÓN DE REACT HOOK FORM
  // ============================================================================
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<T>({
    resolver: zodResolver(schema),
    mode: validationMode,
    reValidateMode,
    defaultValues: {} as DefaultValues<T>
  })
  
  // ============================================================================
  // EFECTOS
  // ============================================================================
  
  // Generar token CSRF al montar el componente
  useEffect(() => {
    if (requireCSRF) {
      const token = generateCSRFToken()
      setSecurityState(prev => ({ ...prev, csrfToken: token }))
    }
  }, [requireCSRF, generateCSRFToken])
  
  // Verificar rate limiting
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastSubmission = now - securityState.lastSubmission
    
    if (timeSinceLastSubmission < rateLimit.windowMs && 
        securityState.submissionCount >= rateLimit.maxSubmissions) {
      setSecurityState(prev => ({ ...prev, isRateLimited: true }))
    } else if (timeSinceLastSubmission >= rateLimit.windowMs) {
      setSecurityState(prev => ({ 
        ...prev, 
        isRateLimited: false,
        submissionCount: 0 
      }))
    }
  }, [securityState.lastSubmission, securityState.submissionCount, rateLimit])
  
  // ============================================================================
  // FUNCIONES DE SEGURIDAD
  // ============================================================================
  
  // Validar y sanitizar datos antes del envío
  const validateAndSanitizeData = async (data: T): Promise<T> => {
    const validationErrors: string[] = []
    const securityWarnings: string[] = []
    
    try {
      // 1. Validación de esquema Zod
      const validatedData = schema.parse(data)
      
      // 2. Validación de seguridad adicional
      if (validateInputs) {
        for (const [key, value] of Object.entries(validatedData)) {
          const validationResult = validateInput('text', value, { field: key })
          
          if (validationResult.errors && validationResult.errors.length > 0) {
            validationErrors.push(`${key}: ${validationResult.errors.join(', ')}`)
          }
          
          if (validationResult.warnings && validationResult.warnings.length > 0) {
            securityWarnings.push(`${key}: ${validationResult.warnings.join(', ')}`)
          }
        }
      }
      
      // 3. Sanitización de datos
      let sanitizedData = validatedData
      if (sanitizeData) {
        sanitizedData = await sanitizeFormData(validatedData)
      }
      
      // 4. Verificación CSRF
      if (requireCSRF && !verifyCSRFToken(securityState.csrfToken)) {
        throw new Error('Token CSRF inválido')
      }
      
      // 5. Verificación de rate limiting
      if (securityState.isRateLimited) {
        throw new Error('Demasiadas solicitudes. Intenta de nuevo más tarde.')
      }
      
      // Actualizar estado de seguridad
      setSecurityState(prev => ({
        ...prev,
        validationErrors,
        securityWarnings,
        submissionCount: prev.submissionCount + 1,
        lastSubmission: Date.now()
      }))
      
      return sanitizedData
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        validationErrors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
      } else if (error instanceof Error) {
        validationErrors.push(error.message)
      }
      
      setSecurityState(prev => ({ ...prev, validationErrors }))
      throw error
    }
  }
  
  // Sanitizar datos del formulario
  const sanitizeFormData = async (data: T): Promise<T> => {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Sanitizar strings básico (remover caracteres peligrosos)
        sanitized[key] = value.replace(/[<>]/g, '')
      } else if (typeof value === 'number') {
        // Validar números básico
        sanitized[key] = isNaN(value) ? 0 : value
      } else if (typeof value === 'boolean') {
        // Mantener booleanos
        sanitized[key] = value
      } else if (Array.isArray(value)) {
        // Sanitizar arrays
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? item.replace(/[<>]/g, '') : item
        )
      } else if (value && typeof value === 'object') {
        // Sanitizar objetos recursivamente
        sanitized[key] = await sanitizeFormData(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized as T
  }
  
  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================
  
  // Manejador de envío seguro
  const handleSecureSubmit = async (data: T) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      // Validar y sanitizar datos
      const validatedData = await validateAndSanitizeData(data)
      
      // Ejecutar onSubmit
      await onSubmit(validatedData)
      
      // Éxito
      setSubmitSuccess(successMessage || 'Formulario enviado exitosamente')
      
      // Resetear formulario después de éxito
      setTimeout(() => {
        reset()
        setSecurityState(prev => ({ 
          ...prev, 
          validationErrors: [], 
          securityWarnings: [] 
        }))
      }, 2000)
      
    } catch (error) {
      console.error('Error en envío de formulario:', error)
      
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Error inesperado al enviar el formulario')
      }
      
      // Llamar onError si está definido
      if (onError) {
        onError(error)
      }
      
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Manejador de envío con validación adicional
  const handleFormSubmit = handleSubmit(handleSecureSubmit, (errors) => {
    console.error('Errores de validación:', errors)
    setSubmitError('Por favor, corrige los errores en el formulario')
    
    if (onError) {
      onError(errors)
    }
  })
  
  // ============================================================================
  // RENDERIZADO
  // ============================================================================
  
  const isFormDisabled = disabled || loading || isSubmitting || securityState.isRateLimited
  
  return (
    <div className={clsx('secure-form', className)}>
      {/* Token CSRF oculto */}
      {requireCSRF && (
        <input
          type="hidden"
          name="_csrf"
          value={securityState.csrfToken}
        />
      )}
      
      {/* Formulario */}
      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        className="space-y-6"
        noValidate
      >
        {/* Renderizar campos del formulario */}
        {children}
        
        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className={clsx(
            'w-full px-4 py-2 text-white font-medium rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            isFormDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          )}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      
      {/* Mensajes de error */}
      {showValidationErrors && (
        <>
          {/* Errores de validación del formulario */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Errores de validación:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error?.message as string}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Errores de seguridad */}
          {securityState.validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Errores de seguridad:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {securityState.validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Advertencias de seguridad */}
          {securityState.securityWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Advertencias de seguridad:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {securityState.securityWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      
      {/* Mensaje de error de envío */}
      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {submitSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{submitSuccess}</p>
        </div>
      )}
      
      {/* Rate limiting */}
      {securityState.isRateLimited && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Demasiadas solicitudes. Intenta de nuevo en unos minutos.
          </p>
        </div>
      )}
      
      {/* Información de seguridad */}
      <div className="mt-4 text-xs text-gray-500">
        <p>✅ Validación de seguridad activa</p>
        {requireCSRF && <p>🔒 Protección CSRF habilitada</p>}
        <p>🛡️ Rate limiting: {securityState.submissionCount}/{rateLimit.maxSubmissions}</p>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

// Campo seguro con validación
export function SecureField<T extends FieldValues>({
  name,
  control,
  rules,
  render,
  validateOnChange = true,
  ...props
}: {
  name: keyof T
  control: any
  rules?: any
  render: (props: any) => ReactNode
  validateOnChange?: boolean
} & any) {
  
  const { validateInput } = useSecurity()
  
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        ...rules,
        validate: async (value) => {
          // Validación personalizada de seguridad
          const validationResult = validateInput('text', value, { field: name as string })
          
          if (validationResult.errors && validationResult.errors.length > 0) {
            return validationResult.errors.join(', ')
          }
          
          return true
        }
      }}
      render={({ field, fieldState }) => {
        const { error } = fieldState
        
        return render({
          ...field,
          ...props,
          error: error?.message,
          hasError: !!error
        })
      }}
    />
  )
}

// Input seguro
export function SecureInput({
  error,
  hasError,
  validateOnChange,
  onBlur,
  onChange,
  ...props
}: {
  error?: string
  hasError?: boolean
  validateOnChange?: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
} & React.InputHTMLAttributes<HTMLInputElement>) {
  
  const { validateInput } = useSecurity()
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateOnChange) {
      const validationResult = validateInput('text', e.target.value)
      if (validationResult.errors && validationResult.errors.length > 0) {
        // Marcar como error
        e.target.setCustomValidity(validationResult.errors.join(', '))
      } else {
        e.target.setCustomValidity('')
      }
    }
    
    onChange?.(e)
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Validación en blur
    const validationResult = validateInput('text', e.target.value)
    if (validationResult.errors && validationResult.errors.length > 0) {
      e.target.setCustomValidity(validationResult.errors.join(', '))
    } else {
      e.target.setCustomValidity('')
    }
    
    onBlur?.(e)
  }
  
  return (
    <input
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      className={clsx(
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
        hasError
          ? 'border-red-300 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500'
      )}
    />
  )
}

// Textarea seguro
export function SecureTextarea({
  error,
  hasError,
  validateOnChange,
  onBlur,
  onChange,
  ...props
}: {
  error?: string
  hasError?: boolean
  validateOnChange?: boolean
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  
  const { validateInput } = useSecurity()
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (validateOnChange) {
      const validationResult = validateInput('text', e.target.value)
      if (validationResult.errors && validationResult.errors.length > 0) {
        e.target.setCustomValidity(validationResult.errors.join(', '))
      } else {
        e.target.setCustomValidity('')
      }
    }
    
    onChange?.(e)
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const validationResult = validateInput('text', e.target.value)
    if (validationResult.errors && validationResult.errors.length > 0) {
      e.target.setCustomValidity(validationResult.errors.join(', '))
    } else {
      e.target.setCustomValidity('')
    }
    
    onBlur?.(e)
  }
  
  return (
    <textarea
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      className={clsx(
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
        hasError
          ? 'border-red-300 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500'
      )}
    />
  )
}

// Select seguro
export function SecureSelect({
  error,
  hasError,
  options,
  ...props
}: {
  error?: string
  hasError?: boolean
  options: Array<{ value: string; label: string }>
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  
  return (
    <select
      {...props}
      className={clsx(
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
        hasError
          ? 'border-red-300 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500'
      )}
    >
      <option value="">Seleccionar...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SecureForm
