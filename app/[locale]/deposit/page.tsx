'use client'

import { useTranslations } from 'next-intl'
import { useWeb3 } from '@/hooks/useWeb3'
import { DepositList } from '@/components/deposit/DepositList'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Shield, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DepositsPage() {
  const t = useTranslations('deposits')
    const { deposits, isContractDeployed } = useWeb3()

    // Wallet connection check removed for simplified version
  if (!isContractDeployed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Contratos no desplegados
          </h1>
          <p className="text-gray-600 mb-8">
            Los contratos necesarios no están desplegados en la red actual
          </p>
          <Link href="/">
            <Button>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (deposits.isLoading) {
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
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mis Depósitos
                </h1>
                <p className="text-gray-600 mt-2">
                  Gestiona y visualiza todos tus depósitos Jeonse
                </p>
              </div>
            </div>
            <Link href="/deposit/create">
              <Button variant="primary" className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Crear Depósito</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <DepositList 
          deposits={deposits.allDeposits || []}
          showFilters={true}
          showSearch={true}
        />
      </div>
    </div>
  )
}
