'use client'

import React, { Suspense, lazy, useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Skeleton, SkeletonGroup } from './Loading'

// Tipos para el lazy loader
interface LazyLoaderProps {
  component: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  skeleton?: {
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
    width?: string | number
    height?: string | number
    count?: number
  }
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  timeout?: number
  className?: string
  props?: Record<string, any>
}

// Componente de error boundary para lazy loading
class LazyErrorBoundaryClass extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.fallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// Componente de fallback por defecto
function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar componente</h3>
      <p className="text-gray-600 mb-4 max-w-md">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}

// Componente de skeleton por defecto
function DefaultSkeleton({ variant = 'text', width = '100%', height = '200px', count = 1 }: any) {
  if (count > 1) {
    return <SkeletonGroup count={count} variant={variant} width={width} height={height} />
  }
  return <Skeleton variant={variant} width={width} height={height} />
}

// Hook para lazy loading con timeout
function useLazyComponent(
  component: () => Promise<{ default: React.ComponentType<any> }>,
  timeout: number = 10000
) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setError(new Error('Tiempo de carga excedido'))
        setIsLoading(false)
      }
    }, timeout)

    component()
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default)
          setIsLoading(false)
          clearTimeout(timeoutId)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err)
          setIsLoading(false)
          clearTimeout(timeoutId)
        }
      })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [component, timeout])

  return { Component, isLoading, error }
}

// Componente principal de lazy loading
export function LazyLoader({
  component,
  fallback,
  skeleton,
  errorFallback = DefaultErrorFallback,
  timeout = 10000,
  className,
  props = {}
}: LazyLoaderProps) {
  const { Component, isLoading, error } = useLazyComponent(component, timeout)

  if (error) {
    const ErrorComponent = errorFallback || DefaultErrorFallback
    return <ErrorComponent error={error} retry={() => window.location.reload()} />
  }

  if (isLoading || !Component) {
    return (
      <div className={clsx('w-full', className)}>
        {fallback || <DefaultSkeleton {...skeleton} />}
      </div>
    )
  }

  return (
    <LazyErrorBoundaryClass fallback={errorFallback}>
      <Component {...props} />
    </LazyErrorBoundaryClass>
  )
}

// Hook para preload de componentes
export function usePreloadComponent(
  component: () => Promise<{ default: React.ComponentType<any> }>
) {
  const preload = () => {
    component()
  }

  return { preload }
}

// Componente para preload en hover
export function PreloadOnHover({
  component,
  children,
  className
}: {
  component: () => Promise<{ default: React.ComponentType<any> }>
  children: React.ReactNode
  className?: string
}) {
  const { preload } = usePreloadComponent(component)

  return (
    <div className={className} onMouseEnter={preload}>
      {children}
    </div>
  )
}

// Lazy loaders específicos para componentes comunes
// export const LazyChart = lazy(() => import('./Chart').then(module => ({ default: module.Chart })))
// export const LazyModal = lazy(() => import('./Modal'))
// export const LazyToast = lazy(() => import('./Toast'))
// export const LazyLoading = lazy(() => import('./Loading'))
// export const LazyFormattedValue = lazy(() => import('./FormattedValue'))
// export const LazyNetworkSelector = lazy(() => import('./NetworkSelector'))
// export const LazyLanguageSelector = lazy(() => import('./LanguageSelector'))
// export const LazyContractStatus = lazy(() => import('./ContractStatus'))
// export const LazyErrorBoundary = lazy(() => import('./ErrorBoundary'))
// export const LazyAnimatedCard = lazy(() => import('./AnimatedCard'))
// export const LazyUIExamples = lazy(() => import('./UIExamples'))
// export const LazyPWAInstaller = lazy(() => import('../PWAInstaller'))

// Lazy loaders para componentes de depósitos
// export const LazyCreateDepositForm = lazy(() => import('../deposit/CreateDepositForm'))
// export const LazyDepositList = lazy(() => import('../deposit/DepositList'))
// export const LazyDepositDetails = lazy(() => import('../deposit/DepositDetails'))
// export const LazyDepositStatus = lazy(() => import('../deposit/DepositStatus'))

// Lazy loaders para componentes de inversión
// export const LazyInvestmentForm = lazy(() => import('../investment/InvestmentForm'))
// export const LazyPoolList = lazy(() => import('../investment/PoolList'))
// export const LazyPoolCard = lazy(() => import('../investment/PoolCard'))
// export const LazyReturnsCalculator = lazy(() => import('../investment/ReturnsCalculator'))

// Lazy loaders para componentes de dashboard
// export const LazyDepositCard = lazy(() => import('../dashboard/DepositCard'))
// export const LazyInvestmentPool = lazy(() => import('../dashboard/InvestmentPool'))
// export const LazyStatsWidget = lazy(() => import('../dashboard/StatsWidget'))
// export const LazyTransactionHistory = lazy(() => import('../dashboard/TransactionHistory'))
// export const LazyUserProfile = lazy(() => import('../dashboard/UserProfile'))

// Lazy loaders para componentes de compliance
// export const LazyBankVerification = lazy(() => import('../compliance/BankVerification'))
// export const LazyComplianceCheck = lazy(() => import('../compliance/ComplianceCheck'))
// export const LazyKYCForm = lazy(() => import('../compliance/KYCForm'))
// export const LazyRealNameVerification = lazy(() => import('../compliance/RealNameVerification'))

// Lazy loaders para componentes de wallet
// export const LazyReownWalletConnect = lazy(() => import('../wallet/ReownWalletConnect'))
// export const LazyTransactionExample = lazy(() => import('../wallet/TransactionExample'))

// Lazy loaders para componentes de layout
// export const LazyHeader = lazy(() => import('../layout/Header'))
// export const LazyFooter = lazy(() => import('../layout/Footer'))

// Lazy loaders para componentes de home
// export const LazySimpleHowItWorks = lazy(() => import('../home/SimpleHowItWorks'))
