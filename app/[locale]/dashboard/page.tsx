'use client'

import { useTranslations } from 'next-intl'
import { useWeb3 } from '@/hooks/useWeb3'
import { DepositCard } from '@/components/dashboard/DepositCard'
import { StatsWidget } from '@/components/dashboard/StatsWidget'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { TrendingUp, BarChart3, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
    const { jeonseVault, deposits, investmentPool, compliance, isContractDeployed } = useWeb3()

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

  if (jeonseVault.isLoading || deposits.isLoading || investmentPool.isLoading || compliance.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('header.back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('header.title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/deposit/create">
                <Button variant="primary" className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('header.createDeposit')}</span>
                </Button>
              </Link>
              <Link href="/investment">
                <Button variant="outline" className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>{t('header.viewInvestments')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Widget */}
            <StatsWidget 
              deposits={deposits.allDeposits}
              investmentPool={investmentPool}
              compliance={compliance}
            />

            {/* Deposits */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('deposits.title')}
                </h2>
                <Link href="/deposit">
                  <Button variant="outline" size="sm">
                    {t('deposits.viewAll')}
                  </Button>
                </Link>
              </div>
              
              {deposits.allDeposits && deposits.allDeposits.length > 0 ? (
                <div className="space-y-4">
                  {deposits.allDeposits.slice(0, 3).map((deposit) => (
                    <DepositCard
                      key={deposit.id}
                      deposit={deposit}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('deposits.empty.title')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('deposits.empty.description')}
                  </p>
                  <Link href="/deposit/create">
                    <Button>
                      {t('deposits.empty.cta')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('quickActions.title')}
              </h3>
              <div className="space-y-3">
                <Link href="/deposit/create">
                  <Button variant="primary" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t('quickActions.createDeposit')}
                  </Button>
                </Link>
                <Link href="/investment">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('quickActions.viewInvestments')}
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('quickActions.viewStats')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Compliance Status */}
            {compliance.userCompliance && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('compliance.title')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('compliance.status')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      compliance.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {compliance.isVerified 
                        ? t('compliance.verified') 
                        : t('compliance.pending')
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('compliance.level')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {compliance.getComplianceLevelName(compliance.complianceLevel)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('compliance.limit')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {compliance.transactionLimit ? 
                        compliance.formatLimit(compliance.transactionLimit) : 
                        t('compliance.noLimit')
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
