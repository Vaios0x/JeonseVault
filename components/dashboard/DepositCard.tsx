'use client'

import { useMemo } from 'react'
import { clsx } from 'clsx'
import { Calendar, MapPin, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatAmount, formatDate, formatPercentage } from '@/utils/formatters'
import { Deposit as DepositType } from '@/utils/types'
import { useTranslations } from 'next-intl'

// Tipo más flexible para el componente
interface DepositCardProps {
  deposit: DepositType | {
    id: string | bigint
    propertyId: string
    propertyAddress: string
    amount: bigint
    totalInvested?: bigint
    landlord: string
    tenant: string
    startDate: Date | bigint
    endDate: Date | bigint
    status: 'active' | 'completed' | 'disputed' | 'pending' | 'cancelled' | number
    isInvestmentEnabled: boolean
    investmentPoolShare?: bigint
    expectedReturn?: bigint
    actualReturn?: bigint
    annualReturn?: number
    duration?: number
    investorCount?: number
    createdAt: Date | bigint
    updatedAt?: Date | bigint
  }
  className?: string
  showActions?: boolean
  compact?: boolean
  onClick?: () => void
  onInvest?: (depositId: string) => void
  onEdit?: (depositId: string) => void
  onDelete?: (depositId: string) => void
}
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function DepositCard({
  deposit,
  className,
  showActions = true,
  compact = false,
  onClick,
  onInvest,
  onEdit,
  onDelete
}: DepositCardProps) {
  const t = useTranslations('deposit')
  // Normalizar datos del depósito
  const normalizedDeposit = useMemo(() => {
    const id = typeof deposit.id === 'bigint' ? deposit.id.toString() : deposit.id
    const startDate = typeof deposit.startDate === 'bigint' 
      ? new Date(Number(deposit.startDate) * 1000) 
      : deposit.startDate
    const endDate = typeof deposit.endDate === 'bigint' 
      ? new Date(Number(deposit.endDate) * 1000) 
      : deposit.endDate
    const createdAt = typeof deposit.createdAt === 'bigint' 
      ? new Date(Number(deposit.createdAt) * 1000) 
      : deposit.createdAt
    const status = typeof deposit.status === 'number' 
      ? ['active', 'completed', 'disputed', 'pending', 'cancelled'][deposit.status] || 'active'
      : deposit.status

    return {
      ...deposit,
      id,
      startDate,
      endDate,
      createdAt,
      status
    }
  }, [deposit])

  // Calcular estadísticas del depósito
  const stats = useMemo(() => {
    const totalInvested = normalizedDeposit.totalInvested || BigInt(0)
    const targetAmount = normalizedDeposit.amount
    const progress = targetAmount > BigInt(0) ? Number((totalInvested * BigInt(100)) / targetAmount) : 0
    const remainingAmount = targetAmount > totalInvested ? targetAmount - totalInvested : BigInt(0)
    const daysRemaining = normalizedDeposit.endDate ? Math.max(0, Math.ceil((normalizedDeposit.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

    return {
      progress,
      remainingAmount,
      daysRemaining,
      isFull: progress >= 100,
      isExpired: daysRemaining <= 0,
      isActive: normalizedDeposit.status === 'active'
    }
  }, [normalizedDeposit])

  // Configuración del estado
  const getStatusConfig = () => {
    if (stats.isExpired && !stats.isFull) {
      return {
        label: t('details.status.expired'),
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        icon: AlertCircle
      }
    }
    
    if (stats.isFull) {
      return {
        label: t('details.status.completed'),
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        icon: CheckCircle
      }
    }
    
    return {
      label: t('details.status.active'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: Clock
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  if (compact) {
    return (
      <div className={clsx('p-4 bg-white rounded-lg border', statusConfig.borderColor, className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {normalizedDeposit.propertyAddress}
          </h3>
          <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatAmount(normalizedDeposit.amount)}</span>
          <span>{stats.progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={clsx('h-2 rounded-full transition-all duration-300', statusConfig.bgColor.replace('bg-', 'bg-').replace('-100', '-500'))}
            style={{ width: `${Math.min(100, stats.progress)}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={clsx('bg-white rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow', statusConfig.borderColor, className)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', statusConfig.bgColor)}>
              <StatusIcon className={clsx('w-5 h-5', statusConfig.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {normalizedDeposit.propertyAddress}
              </h3>
              <p className="text-sm text-gray-600">
                {normalizedDeposit.propertyId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatAmount(normalizedDeposit.amount)}
            </p>
            <p className="text-sm text-gray-600">
              {stats.progress.toFixed(1)}% completed
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-gray-400" />
             <div>
               <p className="text-xs text-gray-600">{t('details.fields.deadline')}</p>
               <p className="text-sm font-medium text-gray-900">
                 {formatDate(normalizedDeposit.endDate)}
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-gray-400" />
             <div>
               <p className="text-xs text-gray-600">{t('details.fields.performance')}</p>
               <p className="text-sm font-medium text-gray-900">
                 {normalizedDeposit.annualReturn ? formatPercentage(normalizedDeposit.annualReturn, 100) : 'N/A'}
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <DollarSign className="w-4 h-4 text-gray-400" />
             <div>
               <p className="text-xs text-gray-600">{t('details.fields.remaining')}</p>
               <p className="text-sm font-medium text-gray-900">
                 {formatAmount(stats.remainingAmount)}
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-gray-400" />
             <div>
               <p className="text-xs text-gray-600">{t('details.fields.daysRemaining')}</p>
               <p className="text-sm font-medium text-gray-900">
                 {stats.daysRemaining}
               </p>
             </div>
           </div>
        </div>

                 {/* Barra de progreso */}
         <div className="mb-4">
           <div className="flex items-center justify-between mb-2">
             <span className="text-sm text-gray-600">{t('details.fields.fundingProgress')}</span>
             <span className="text-sm font-medium text-gray-900">
               {formatAmount(normalizedDeposit.totalInvested || 0)} / {formatAmount(normalizedDeposit.amount)}
             </span>
           </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={clsx('h-3 rounded-full transition-all duration-300', statusConfig.bgColor.replace('bg-', 'bg-').replace('-100', '-500'))}
              style={{ width: `${Math.min(100, stats.progress)}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                         <Link href={`/deposit/${normalizedDeposit.id}`}>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={(e) => e.stopPropagation()}
               >
                 {t('details.buttons.viewDetails')}
               </Button>
             </Link>
             
             {stats.isActive && !stats.isFull && (
               <Button 
                 variant="primary" 
                 size="sm"
                 onClick={(e) => {
                   e.stopPropagation()
                   onInvest?.(normalizedDeposit.id)
                 }}
               >
                 {t('details.buttons.invest')}
               </Button>
             )}
             
             {onEdit && (
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={(e) => {
                   e.stopPropagation()
                   onEdit(normalizedDeposit.id)
                 }}
               >
                 {t('details.buttons.edit')}
               </Button>
             )}
             
             {onDelete && (
               <Button 
                 variant="danger" 
                 size="sm"
                 onClick={(e) => {
                   e.stopPropagation()
                   onDelete(normalizedDeposit.id)
                 }}
               >
                 {t('details.buttons.delete')}
               </Button>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
