'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from './Button'

// Tipos
export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default'
export type ToastPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'

export interface ToastProps {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  persistent?: boolean
}

export interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Contexto
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook para usar el contexto
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}

// Provider del contexto
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      variant: 'default',
      duration: 5000,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Componente individual de Toast
function ToastItem({ toast, onRemove }: { toast: ToastProps; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-remover si no es persistente
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, toast.duration)
    }

    return () => {
      clearTimeout(enterTimer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [toast.duration, toast.persistent])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(toast.id)
      toast.onClose?.()
    }, 300) // Tiempo de animación de salida
  }

  const handleAction = () => {
    toast.action?.onClick()
    handleClose()
  }

  // Iconos por variante
  const getVariantIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  // Clases por variante
  const getVariantClasses = () => {
    switch (toast.variant) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      default:
        return 'border-gray-200 bg-white text-gray-900'
    }
  }

  return (
    <div
      className={clsx(
        'relative w-full max-w-sm transform transition-all duration-300 ease-out',
        isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div
        className={clsx(
          'relative rounded-lg border shadow-lg p-4',
          getVariantClasses()
        )}
      >
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/10 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenido */}
        <div className="flex items-start space-x-3 pr-6">
          {getVariantIcon() && (
            <div className="flex-shrink-0 mt-0.5">
              {getVariantIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-sm font-semibold mb-1">
                {toast.title}
              </h4>
            )}
            <p className="text-sm leading-relaxed">
              {toast.message}
            </p>
            
            {/* Acción */}
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAction}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        {!toast.persistent && toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-current opacity-30 transition-all duration-linear"
              style={{
                width: '100%',
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Contenedor de Toasts
function ToastContainer() {
  const { toasts, removeToast } = useToast()
  const [position, setPosition] = useState<ToastPosition>('top-right')

  if (toasts.length === 0) return null

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const containerContent = (
    <div
      className={clsx(
        'fixed z-50 flex flex-col space-y-4 max-h-screen overflow-hidden',
        getPositionClasses()
      )}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )

  return createPortal(containerContent, document.body)
}

// Componentes de conveniencia
export function useToastHelpers() {
  const { addToast } = useToast()

  const success = useCallback((message: string, title?: string) => {
    return addToast({
      title,
      message,
      variant: 'success'
    })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    return addToast({
      title,
      message,
      variant: 'error'
    })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    return addToast({
      title,
      message,
      variant: 'warning'
    })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    return addToast({
      title,
      message,
      variant: 'info'
    })
  }, [addToast])

  const custom = useCallback((toast: Omit<ToastProps, 'id'>) => {
    return addToast(toast)
  }, [addToast])

  return {
    success,
    error,
    warning,
    info,
    custom
  }
}

// Estilos CSS para la animación de la barra de progreso
const toastStyles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastStyles
  document.head.appendChild(style)
}
