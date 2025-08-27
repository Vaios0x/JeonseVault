'use client'

import { useMemo } from 'react'
import { clsx } from 'clsx'
import { CheckCircle, Clock, AlertCircle, XCircle, TrendingUp, DollarSign, Calendar, Users, BarChart3, ArrowRight } from 'lucide-react'
import { formatAmount, formatPercentage, formatDate } from '@/utils/formatters'
import { Deposit } from '@/utils/types'

interface DepositStatusProps {
  deposit: Deposit
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export function DepositStatus({
  deposit,
  className,
  showDetails = true,
  compact = false
}: DepositStatusProps) {
  // Calcular estadísticas del depósito
  const statusData = useMemo(() => {
    const totalInvested = deposit.totalInvested || BigInt(0)
    const targetAmount = deposit.amount
    const progress = targetAmount > BigInt(0) ? Number((totalInvested * BigInt(100)) / targetAmount) : 0
    const remainingAmount = targetAmount > totalInvested ? targetAmount - totalInvested : BigInt(0)
    const daysRemaining = deposit.endDate ? Math.max(0, Math.ceil((deposit.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
    const daysElapsed = deposit.startDate ? Math.ceil((Date.now() - deposit.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    const totalDays = deposit.startDate && deposit.endDate ? Math.ceil((deposit.endDate.getTime() - deposit.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

    return {
      progress,
      remainingAmount,
      daysRemaining,
      daysElapsed,
      totalDays,
      isFull: progress >= 100,
      isExpired: daysRemaining <= 0,
      isActive: deposit.status === 'active',
      completionPercentage: totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0,
      timeStatus: daysRemaining > 30 ? 'good' : daysRemaining > 7 ? 'warning' : 'critical'
    }
  }, [deposit])

  // Configuración del estado del depósito
  const statusConfig: Record<string, {
    label: string
    color: string
    bgColor: string
    borderColor: string
    icon: any
    description: string
  }> = {
    active: {
      label: 'Activo',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'El depósito está activo y aceptando inversiones'
    },
    completed: {
      label: 'Completado',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: CheckCircle,
      description: 'El depósito ha sido completamente financiado'
    },
    expired: {
      label: 'Expirado',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: Clock,
      description: 'El período de financiación ha expirado'
    },
    cancelled: {
      label: 'Cancelado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      icon: XCircle,
      description: 'El depósito ha sido cancelado'
    },
    disputed: {
      label: 'Disputado',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      icon: CheckCircle,
      description: 'El depósito está en disputa'
    },
    pending: {
      label: 'Pendiente',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      icon: Clock,
      description: 'El depósito está pendiente de aprobación'
    }
  }

  const status = statusConfig[deposit.status] || statusConfig.active
  const StatusIcon = status.icon

  // Configuración del estado del tiempo
  const timeStatusConfig: Record<string, {
    color: string
    bgColor: string
    icon: any
  }> = {
    good: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    warning: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Clock
    },
    critical: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle
    }
  }

  const timeStatus = timeStatusConfig[statusData.timeStatus]
  const TimeStatusIcon = timeStatus.icon

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-3 p-3 bg-white rounded-lg border', status.borderColor, className)}>
        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center', status.bgColor)}>
          <StatusIcon className={clsx('w-4 h-4', status.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={clsx('text-sm font-medium', status.color)}>{status.label}</span>
            <span className="text-xs text-gray-500">{statusData.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className={clsx('h-1 rounded-full transition-all duration-300', status.bgColor.replace('bg-', 'bg-').replace('-100', '-500'))}
              style={{ width: `${Math.min(100, statusData.progress)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg border', status.borderColor, className)}>
      {/* Header del estado */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', status.bgColor)}>
              <StatusIcon className={clsx('w-5 h-5', status.color)} />
            </div>
            <div>
              <h3 className={clsx('text-lg font-semibold', status.color)}>{status.label}</h3>
              <p className="text-sm text-gray-600">{status.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{statusData.progress.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Completado</p>
          </div>
        </div>
      </div>

      {/* Progreso de financiación */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso de financiación</span>
            <span className="text-sm text-gray-600">
              {formatAmount(deposit.totalInvested || 0)} / {formatAmount(deposit.amount)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={clsx('h-3 rounded-full transition-all duration-300', status.bgColor.replace('bg-', 'bg-').replace('-100', '-500'))}
              style={{ width: `${Math.min(100, statusData.progress)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-blue-600">{statusData.progress.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">Financiado</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">{formatAmount(statusData.remainingAmount)}</p>
            <p className="text-xs text-gray-600">Restante</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-purple-600">{deposit.investorCount}</p>
            <p className="text-xs text-gray-600">Inversores</p>
          </div>
        </div>
      </div>

      {/* Información temporal */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Información temporal</h4>
          <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', timeStatus.bgColor, timeStatus.color)}>
            <TimeStatusIcon className="w-3 h-3" />
            {statusData.timeStatus === 'good' ? 'Buen tiempo' : statusData.timeStatus === 'warning' ? 'Poco tiempo' : 'Crítico'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{statusData.daysRemaining}</p>
            <p className="text-xs text-gray-600">Días restantes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{statusData.completionPercentage.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">Tiempo transcurrido</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>Inicio: {deposit.startDate ? formatDate(deposit.startDate) : 'N/A'}</span>
            <ArrowRight className="w-3 h-3" />
            <span>Fin: {formatDate(deposit.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Detalles adicionales */}
      {showDetails && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Detalles del depósito</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rendimiento anual
                </span>
                <span className="text-sm font-medium text-gray-900">{deposit.annualReturn ? formatPercentage(deposit.annualReturn, 100) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Duración
                </span>
                <span className="text-sm font-medium text-gray-900">{deposit.duration} meses</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Inversores actuales
                </span>
                <span className="text-sm font-medium text-gray-900">{deposit.investorCount}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estado de financiación
                </span>
                <span className={clsx('text-sm font-medium', statusData.isFull ? 'text-green-600' : 'text-yellow-600')}>
                  {statusData.isFull ? 'Completo' : 'En progreso'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tasa de éxito
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {statusData.progress >= 100 ? '100%' : `${statusData.progress.toFixed(1)}%`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estado temporal
                </span>
                <span className={clsx('text-sm font-medium', timeStatus.color)}>
                  {statusData.isExpired ? 'Expirado' : statusData.daysRemaining > 30 ? 'Bueno' : statusData.daysRemaining > 7 ? 'Advertencia' : 'Crítico'}
                </span>
              </div>
            </div>
          </div>

          {/* Alertas y recomendaciones */}
          {statusData.daysRemaining <= 7 && statusData.progress < 100 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Poco tiempo restante</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Solo quedan {statusData.daysRemaining} días para completar la financiación. 
                {statusData.progress < 50 && ' Considera ajustar los términos del depósito.'}
              </p>
            </div>
          )}

          {statusData.progress >= 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">¡Financiación completada!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                El depósito ha alcanzado su objetivo de financiación. El proceso continuará según lo programado.
              </p>
            </div>
          )}

          {statusData.isExpired && statusData.progress < 100 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Período expirado</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                El período de financiación ha expirado sin alcanzar el objetivo. Los inversores recibirán reembolsos automáticos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
