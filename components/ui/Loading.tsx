'use client'

import { clsx } from 'clsx'
import { Loader2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  className?: string
}

export interface LoadingStateProps {
  state: 'loading' | 'success' | 'error' | 'idle'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Componente principal de Loading
export function Loading({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className
}: LoadingProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      case 'xl':
        return 'w-12 h-12'
      default:
        return 'w-6 h-6'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-primary-600'
      case 'secondary':
        return 'text-gray-600'
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'white':
        return 'text-white'
      default:
        return 'text-primary-600'
    }
  }

  const renderSpinner = () => (
    <Loader2 className={clsx('animate-spin', getSizeClasses(), getColorClasses())} />
  )

  const renderDots = () => (
    <div className={clsx('flex space-x-1', getSizeClasses())}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-2 h-2 rounded-full animate-pulse',
            getColorClasses().replace('text-', 'bg-')
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div className={clsx('w-full h-full rounded-full animate-pulse', getColorClasses().replace('text-', 'bg-'))} />
  )

  const renderBars = () => (
    <div className={clsx('flex space-x-1', getSizeClasses())}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-1 rounded-full animate-pulse',
            getColorClasses().replace('text-', 'bg-')
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )

  const renderRipple = () => (
    <div className={clsx('relative', getSizeClasses())}>
      <div className={clsx(
        'absolute inset-0 rounded-full border-2 border-transparent',
        getColorClasses().replace('text-', 'border-'),
        'animate-ping'
      )} />
      <div className={clsx(
        'absolute inset-0 rounded-full border-2',
        getColorClasses().replace('text-', 'border-')
      )} />
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      case 'ripple':
        return renderRipple()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={clsx(
      'flex flex-col items-center justify-center space-y-3',
      className
    )}>
      {renderLoader()}
      {text && (
        <p className={clsx(
          'text-sm font-medium',
          color === 'white' ? 'text-white' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

// Componente de estado de carga
export function LoadingState({
  state,
  text,
  size = 'md',
  className
}: LoadingStateProps) {
  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'idle':
        return <Clock className="w-6 h-6 text-gray-400" />
      default:
        return null
    }
  }

  const getStateText = () => {
    if (text) return text
    
    switch (state) {
      case 'loading':
        return 'Cargando...'
      case 'success':
        return 'Completado'
      case 'error':
        return 'Error'
      case 'idle':
        return 'En espera'
      default:
        return ''
    }
  }

  const getStateColor = () => {
    switch (state) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'idle':
        return 'text-gray-400'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={clsx(
      'flex items-center space-x-3',
      className
    )}>
      {getStateIcon()}
      <span className={clsx('text-sm font-medium', getStateColor())}>
        {getStateText()}
      </span>
    </div>
  )
}

// Componente de skeleton para contenido
export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rounded':
        return 'rounded-lg'
      case 'rectangular':
        return 'rounded-none'
      default:
        return 'rounded'
    }
  }

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' }
      case 'text':
        return { width: '100%', height: '1rem' }
      default:
        return { width: '100%', height: '100px' }
    }
  }

  const defaultDims = getDefaultDimensions()
  const finalWidth = width || defaultDims.width
  const finalHeight = height || defaultDims.height

  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200',
        getVariantClasses(),
        className
      )}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight
      }}
    />
  )
}

// Componente de skeleton para múltiples elementos
export interface SkeletonGroupProps {
  count?: number
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SkeletonGroup({
  count = 3,
  variant = 'text',
  width,
  height,
  spacing = 'md',
  className
}: SkeletonGroupProps) {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'sm':
        return 'space-y-2'
      case 'md':
        return 'space-y-3'
      case 'lg':
        return 'space-y-4'
      default:
        return 'space-y-3'
    }
  }

  return (
    <div className={clsx('flex flex-col', getSpacingClasses(), className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
        />
      ))}
    </div>
  )
}

// Componente de loading para botones
export interface ButtonLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
  className?: string
}

export function ButtonLoading({
  size = 'md',
  color = 'white',
  className
}: ButtonLoadingProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-5 h-5'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  return (
    <Loader2 className={clsx(
      'animate-spin',
      getSizeClasses(),
      color === 'white' ? 'text-white' : 'text-primary-600',
      className
    )} />
  )
}

// Componente de loading para tablas
export interface TableLoadingProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableLoading({
  rows = 5,
  columns = 4,
  className
}: TableLoadingProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width="120px"
            height="1rem"
          />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width="100px"
              height="1rem"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Componente de loading para cards
export interface CardLoadingProps {
  variant?: 'simple' | 'detailed'
  className?: string
}

export function CardLoading({
  variant = 'simple',
  className
}: CardLoadingProps) {
  if (variant === 'simple') {
    return (
      <div className={clsx('space-y-3', className)}>
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="80%" height="1rem" />
      </div>
    )
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" height="1.25rem" />
          <Skeleton variant="text" width="60%" height="1rem" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="90%" height="1rem" />
        <Skeleton variant="text" width="70%" height="1rem" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="80px" height="1rem" />
        <Skeleton variant="rounded" width="100px" height="32px" />
      </div>
    </div>
  )
}
