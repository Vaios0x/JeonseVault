'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail, Github, Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  className?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: props.showDetails || false
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Llamar callback personalizado si existe
    this.props.onError?.(error, errorInfo)

    // Enviar error a servicio de analytics/monitoring
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Aquí se puede integrar con servicios como Sentry, LogRocket, etc.
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: true
        })
      }

      // También se puede enviar a un endpoint personalizado
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silenciar errores de reporte
      })
    } catch (reportError) {
      console.error('Error reporting error:', reportError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleContactSupport = () => {
    const subject = encodeURIComponent('Error Report - JeonseVault')
    const body = encodeURIComponent(`
Error Details:
${this.state.error?.message}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `)
    
    window.open(`mailto:support@jeonsevault.com?subject=${subject}&body=${body}`)
  }

  private handleReportIssue = () => {
    const title = encodeURIComponent(`Error: ${this.state.error?.message}`)
    const body = encodeURIComponent(`
## Error Report

**Error Message:** ${this.state.error?.message}

**URL:** ${window.location.href}

**User Agent:** ${navigator.userAgent}

**Timestamp:** ${new Date().toISOString()}

### Stack Trace
\`\`\`
${this.state.error?.stack}
\`\`\`

### Component Stack
\`\`\`
${this.state.errorInfo?.componentStack}
\`\`\`

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior


### Actual Behavior

    `)
    
    window.open(`https://github.com/jeonsevault/jeonsevault/issues/new?title=${title}&body=${body}`)
  }

  private toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }))
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${this.props.className || ''}`}>
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Algo salió mal
              </h1>
              <p className="text-gray-600">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
              </p>
            </div>

            {/* Error Details */}
            {this.state.showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Detalles del Error</h3>
                <div className="text-xs text-red-800 space-y-1">
                  <div>
                    <strong>Mensaje:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {this.state.error.name}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Componente:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Intentar de Nuevo
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Ir al Inicio
              </Button>

              {this.state.error && (
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  leftIcon={<Bug className="w-4 h-4" />}
                >
                  {this.state.showDetails ? 'Ocultar' : 'Mostrar'} Detalles
                </Button>
              )}
            </div>

            {/* Support Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                ¿Necesitas ayuda? Contacta con nuestro equipo:
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={this.handleContactSupport}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Soporte
                </Button>
                
                <Button
                  onClick={this.handleReportIssue}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Github className="w-4 h-4" />}
                >
                  Reportar
                </Button>
              </div>
            </div>

            {/* Error ID for tracking */}
            {this.state.error && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Error ID: {this.state.error.message.slice(0, 8)}...
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar ErrorBoundary en componentes funcionales
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    resetError,
    hasError: !!error
  }
}

// Componente de error simple para casos específicos
interface SimpleErrorProps {
  error: Error
  onRetry?: () => void
  onClose?: () => void
  className?: string
}

export function SimpleError({ error, onRetry, onClose, className }: SimpleErrorProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className || ''}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Error
          </h3>
          <p className="text-sm text-red-700 mb-3">
            {error.message}
          </p>
          
          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                leftIcon={<RefreshCw className="w-3 h-3" />}
              >
                Reintentar
              </Button>
            )}
            
            {onClose && (
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// HOC para envolver componentes con ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Componente para mostrar errores de red
interface NetworkErrorProps {
  onRetry: () => void
  message?: string
  className?: string
}

export function NetworkError({ onRetry, message, className }: NetworkErrorProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className || ''}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Error de Conexión
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            {message || 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'}
          </p>
          
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3 h-3" />}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar errores de permisos
interface PermissionErrorProps {
  onRequestPermission?: () => void
  className?: string
}

export function PermissionError({ onRequestPermission, className }: PermissionErrorProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className || ''}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Permisos Requeridos
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Esta función requiere permisos adicionales para funcionar correctamente.
          </p>
          
          {onRequestPermission && (
            <Button
              onClick={onRequestPermission}
              size="sm"
              variant="outline"
            >
              Solicitar Permisos
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
