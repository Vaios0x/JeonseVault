'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, Lock, Unlock, ArrowRight, Clock, CheckCircle, AlertCircle, Eye, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, useModal } from '@/components/ui/Modal'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'
import { formatAmount, formatPercentage, formatDate } from '@/utils/formatters'
import { InvestmentPool as PoolType } from '@/utils/types'
import { useTranslations } from 'next-intl'

interface InvestmentPoolProps {
  pool: PoolType
  className?: string
  onInvest?: (poolId: string) => void
  onWithdraw?: (poolId: string) => void
  onViewDetails?: (poolId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function InvestmentPool({
  pool,
  className,
  onInvest,
  onWithdraw,
  onViewDetails,
  showActions = true,
  compact = false
}: InvestmentPoolProps) {
  const t = useTranslations('investment')
  const { investInPoolDemo, withdrawInvestmentDemo, isProcessing } = useDemoTransactions()
  const { open, close } = useModal()

  // Encontrar inversión del usuario en este pool (simulado)
  const userInvestment = useMemo(() => {
    // Simular inversión del usuario
    return null
  }, [pool.id])

  // Calcular estadísticas del pool
  const poolStats = useMemo(() => {
    const totalInvested = Number(pool.totalValue - pool.availableValue)
    const totalValue = Number(pool.totalValue)
    const progress = totalValue > 0 ? (totalInvested / totalValue) * 100 : 0
    const remainingAmount = pool.availableValue
    const daysRemaining = pool.endDate ? Math.max(0, Math.ceil((pool.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

    return {
      progress,
      remainingAmount,
      daysRemaining,
      isFull: progress >= 100,
      isExpired: daysRemaining <= 0
    }
  }, [pool])

  // Configuración del estado del pool
  const statusConfig = {
    'active': {
      label: t('status.active'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    'full': {
      label: t('status.full'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Lock
    },
    'closed': {
      label: t('status.closed'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Lock
    }
  }

  const status = statusConfig[pool.status] || statusConfig['active']
  const StatusIcon = status.icon

  // Configuración de riesgo
  const riskConfig = {
    'low': { label: t('risk.low'), color: 'text-green-600', bgColor: 'bg-green-100' },
    'medium': { label: t('risk.medium'), color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    'high': { label: t('risk.high'), color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const risk = riskConfig[pool.riskLevel] || riskConfig['medium']

  const handleInvest = async () => {
    try {
      if (onInvest) {
        onInvest(pool.id)
      } else {
        // Ejecutar inversión demo
        await investInPoolDemo(BigInt(pool.id))
      }
    } catch (error) {
      console.error('Error al invertir:', error)
    }
  }

  const handleWithdraw = async () => {
    try {
      if (onWithdraw) {
        onWithdraw(pool.id)
      } else {
        // Ejecutar retiro demo
        await withdrawInvestmentDemo(BigInt(pool.id))
      }
    } catch (error) {
      console.error('Error al retirar:', error)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(pool.id)
    } else {
      window.location.href = `/investment/pool/${pool.id}`
    }
  }

  const handleExportData = () => {
    // Exportar datos del pool
    const data = {
      poolId: pool.id,
      name: pool.name,
      description: pool.description,
      totalValue: pool.totalValue,
      availableValue: pool.availableValue,
      expectedReturn: pool.expectedReturn,
      duration: pool.duration,
      investors: pool.investors,
      status: pool.status,
      riskLevel: pool.riskLevel,
      endDate: pool.endDate,
      userInvestment: null
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pool-${pool.id}-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${t('share.title')}: ${pool.name}`,
        text: `${t('share.text')} ${formatPercentage(Number(pool.expectedReturn), BigInt(1000000000000000000000))} ${t('share.annualReturn')}`,
        url: `${window.location.origin}/investment/pool/${pool.id}`
      })
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${window.location.origin}/investment/pool/${pool.id}`)
    }
  }

  if (compact) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{pool.name}</h3>
              <p className="text-sm text-gray-600">{pool.propertyType}</p>
            </div>
          </div>
                      <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{formatPercentage(Number(pool.expectedReturn), BigInt(1000000000000000000000))}</p>
              <p className="text-xs text-gray-500">{t('stats.annualReturn')}</p>
            </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{pool.investors}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{formatAmount(pool.totalValue - pool.availableValue)}</span>
            </div>
          </div>
          <Button
            onClick={handleViewDetails}
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            {t('actions.view')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow', className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{pool.name}</h3>
                <p className="text-sm text-gray-600">{pool.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={clsx('px-3 py-1 rounded-full text-sm font-medium', risk.bgColor, risk.color)}>
              {risk.label}
            </div>
            <div className={clsx('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1', status.bgColor, status.color)}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(Number(pool.expectedReturn), BigInt(1000000000000000000000))}</p>
            <p className="text-sm text-gray-600">{t('stats.annualReturn')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{pool.investors}</p>
            <p className="text-sm text-gray-600">{t('stats.investors')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatAmount(pool.totalValue - pool.availableValue)}</p>
            <p className="text-sm text-gray-600">{t('stats.totalInvested')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{poolStats.daysRemaining}</p>
            <p className="text-sm text-gray-600">{t('stats.daysRemaining')}</p>
          </div>
        </div>

        {/* Progreso del pool */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('stats.poolProgress')}</span>
            <span className="text-sm text-gray-600">
              {formatAmount(pool.totalValue - pool.availableValue)} / {formatAmount(pool.totalValue)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, poolStats.progress)}%` }}
            />
          </div>
        </div>

        {/* Información de la propiedad */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">{t('propertyInfo.title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('propertyInfo.type')}</p>
              <p className="font-medium text-gray-900">{pool.propertyType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('propertyInfo.location')}</p>
              <p className="font-medium text-gray-900">{pool.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('propertyInfo.duration')}</p>
              <p className="font-medium text-gray-900">{pool.duration} {t('propertyInfo.months')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('propertyInfo.startDate')}</p>
              <p className="font-medium text-gray-900">{formatDate(pool.endDate)}</p>
            </div>
          </div>
        </div>

        {/* Inversión del usuario */}
        {/* User investment section removed for simplified version */}

        {/* Acciones */}
        {showActions && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                leftIcon={<Eye className="w-4 h-4" />}
              >
                {t('actions.viewDetails')}
              </Button>
              <Button
                onClick={handleExportData}
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
              >
                {t('actions.export')}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                {t('actions.share')}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {userInvestment ? (
                <Button
                  onClick={handleWithdraw}
                  variant="outline"
                  disabled={poolStats.isExpired}
                >
                  {t('actions.withdraw')}
                </Button>
              ) : (
                <Button
                  onClick={handleInvest}
                  disabled={!poolStats.isFull || poolStats.isExpired}
                  leftIcon={<TrendingUp className="w-4 h-4" />}
                >
                  {t('actions.invest')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de retiro */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title={t('modal.confirmWithdraw.title')}
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('modal.confirmWithdraw.question')}
            </h3>
            <p className="text-gray-600">
              {t('modal.confirmWithdraw.description')}
            </p>
          </div>

          {/* User investment details removed for simplified version */}

          <div className="flex gap-3">
            <Button
              onClick={close}
              variant="outline"
              className="flex-1"
            >
              {t('modal.confirmWithdraw.cancel')}
            </Button>
            <Button
              onClick={() => {
                // Aquí se implementaría la lógica de retiro
                close()
              }}
              className="flex-1"
            >
              {t('modal.confirmWithdraw.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
