'use client'

import { useMemo } from 'react'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, DollarSign, Users, Home, BarChart3 } from 'lucide-react'
import { formatAmount, formatPercentage } from '@/utils/formatters'
import { useTranslations } from 'next-intl'

interface StatsWidgetProps {
  className?: string
  compact?: boolean
  showCharts?: boolean
  deposits?: any
  investmentPool?: any
  compliance?: any
}

interface StatItem {
  label: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
}

export function StatsWidget({
  className,
  compact = false,
  showCharts = false,
  deposits,
  investmentPool,
  compliance
}: StatsWidgetProps) {
  const t = useTranslations('stats')
  
  // Datos de ejemplo - en producción vendrían del hook useWeb3
  const stats = useMemo((): StatItem[] => [
    {
      label: t('totalDeposits'),
      value: '₩2.5B',
      change: 12.5,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: t('totalInvestors'),
      value: '1,247',
      change: 8.3,
      changeType: 'positive',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: t('averageReturn'),
      value: '6.8%',
      change: 0.5,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: t('activeUsers'),
      value: '892',
      change: 15.2,
      changeType: 'positive',
      icon: Home,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ], [t])

  if (compact) {
    return (
      <div className={clsx('grid grid-cols-2 gap-4', className)}>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center', stat.bgColor)}>
                  <Icon className={clsx('w-4 h-4', stat.color)} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <div className={clsx(
                      'flex items-center text-xs',
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{t('last24h')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', stat.bgColor)}>
                  <Icon className={clsx('w-6 h-6', stat.color)} />
                </div>
                {stat.change && (
                  <div className={clsx(
                    'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  )}>
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}%
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                
                {showCharts && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={clsx('h-2 rounded-full transition-all duration-300', stat.bgColor.replace('bg-', 'bg-').replace('-100', '-500'))}
                      style={{ width: `${Math.min(100, (stat.change || 0) + 50)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('summary.title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('summary.description')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">+9.2%</p>
            <p className="text-sm text-gray-600">{t('summary.growth')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
