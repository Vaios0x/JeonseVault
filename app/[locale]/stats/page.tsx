'use client'

import { useTranslations } from 'next-intl'
import { useWeb3 } from '@/hooks/useWeb3'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Shield, ArrowLeft, BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

export default function StatsPage() {
  const t = useTranslations('stats')
    const { jeonseVault, deposits, investmentPool, isContractDeployed } = useWeb3()

    // Wallet connection check removed for simplified version
  if (!isContractDeployed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('contractNotDeployed.title')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('contractNotDeployed.description')}
          </p>
          <Link href="/">
            <Button>
              {t('contractNotDeployed.cta')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (jeonseVault.isLoading || deposits.isLoading || investmentPool.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    )
  }

  // Calcular estadísticas
  const totalDeposits = deposits.allDeposits?.length || 0
  const totalReturns = deposits.allDeposits?.reduce((sum, deposit) => {
    return sum + (deposit.actualReturn ? Number(deposit.actualReturn) : 0)
  }, 0) || 0
  const avgReturn = totalDeposits > 0 ? totalReturns / totalDeposits : 0
  const totalInvestors = investmentPool.userInvestments?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('header.back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deposits */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('overview.totalDeposits')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalDeposits}</p>
              </div>
            </div>
          </div>

          {/* Total Returns */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('overview.totalReturns')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalReturns.toFixed(2)} KRW</p>
              </div>
            </div>
          </div>

          {/* Average Return */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('overview.averageReturn')}</p>
                <p className="text-2xl font-bold text-gray-900">{avgReturn.toFixed(2)} KRW</p>
              </div>
            </div>
          </div>

          {/* Total Investors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('overview.totalInvestors')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvestors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('detailed.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposits by Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('detailed.depositsByStatus')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.status.active')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {deposits.allDeposits?.filter(d => d.status === 'active').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.status.completed')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {deposits.allDeposits?.filter(d => d.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.status.pending')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {deposits.allDeposits?.filter(d => d.status === 'pending').length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Investment Pool Stats */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('detailed.investmentPool')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.totalPools')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {investmentPool.pools?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.userInvestments')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {investmentPool.userInvestments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('detailed.totalValueInvested')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {investmentPool.userInvestments?.reduce((total, inv) => total + Number(inv.amount), 0) || 0} KRW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
