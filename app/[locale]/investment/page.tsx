'use client'

import { useTranslations } from 'next-intl'
import { useWeb3 } from '@/hooks/useWeb3'
import { InvestmentPool } from '@/components/dashboard/InvestmentPool'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { TrendingUp, BarChart3, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function InvestmentPage() {
  const t = useTranslations('investment')
    const { investmentPool, isContractDeployed } = useWeb3()

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

  if (investmentPool.isLoading) {
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
        {/* Crear un pool de muestra hasta que tengamos datos reales */}
        <InvestmentPool 
          pool={{
            id: '1',
            name: t('pool.name'),
            totalValue: BigInt('1000000000000000000000'), // 1000 ETH
            availableValue: BigInt('500000000000000000000'), // 500 ETH
            expectedReturn: BigInt('120000000000000000000'), // 120 ETH (12% anual)
            duration: 24, // meses
            riskLevel: 'medium' as const,
            status: 'active' as const,
            investors: 45,
            minInvestment: BigInt('1000000000000000000'), // 1 ETH
            maxInvestment: BigInt('100000000000000000000'), // 100 ETH
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            description: t('pool.description'),
            propertyType: 'Mixed',
            location: 'Seoul Metropolitan Area'
          }}
        />
      </div>
    </div>
  )
}
