'use client'

import { useState } from 'react'
import { TrendingUp, Users, Calendar, DollarSign, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatAmount, formatPercentage } from '@/utils/formatters'

export interface PoolCardProps {
  poolId: string
  name: string
  description: string
  totalValue: bigint
  availableValue: bigint
  totalInvestors: number
  expectedReturn: bigint
  actualReturn: bigint
  startDate: Date
  endDate: Date
  isActive: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  propertyType: 'Apartment' | 'House' | 'Officetel' | 'Villa' | 'Commercial'
  location: string
  onInvest?: (poolId: string) => void
  onViewDetails?: (poolId: string) => void
}

export function PoolCard({
  poolId,
  name,
  description,
  totalValue,
  availableValue,
  totalInvestors,
  expectedReturn,
  actualReturn,
  startDate,
  endDate,
  isActive,
  riskLevel,
  propertyType,
  location,
  onInvest,
  onViewDetails
}: PoolCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'Apartment': return '🏢'
      case 'House': return '🏠'
      case 'Officetel': return '🏬'
      case 'Villa': return '🏡'
      case 'Commercial': return '🏪'
      default: return '🏢'
    }
  }

  const calculateProgress = () => {
    const invested = totalValue - availableValue
    return (Number(invested) / Number(totalValue)) * 100
  }

  const calculateDaysLeft = () => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const progress = calculateProgress()
  const daysLeft = calculateDaysLeft()
  const isFullyFunded = progress >= 100
  const isExpired = daysLeft === 0

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getPropertyIcon(propertyType)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(riskLevel)}`}>
              {riskLevel} Risk
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso de financiación</span>
          <span className="text-sm font-semibold text-primary-600">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Recaudado: {formatAmount(totalValue - availableValue)}</span>
          <span>Meta: {formatAmount(totalValue)}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-lg font-semibold text-green-600">
                {formatPercentage(expectedReturn, totalValue)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Retorno esperado</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-lg font-semibold text-blue-600">{totalInvestors}</span>
            </div>
            <p className="text-xs text-gray-600">Inversores</p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center mb-1">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">Días restantes</span>
              </div>
              <p className="text-gray-600">{daysLeft} días</p>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">Retorno actual</span>
              </div>
              <p className="text-gray-600">{formatPercentage(actualReturn, totalValue)}</p>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <Lock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">Disponible</span>
              </div>
              <p className="text-gray-600">{formatAmount(availableValue)}</p>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <span className="font-medium text-gray-700">Estado</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isActive && !isExpired 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isExpired ? 'Expirado' : isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex space-x-3">
          <Button
            onClick={() => onInvest?.(poolId)}
            disabled={!isActive || isFullyFunded || isExpired}
            className="flex-1"
            variant="primary"
            size="md"
          >
            {isFullyFunded ? 'Completado' : isExpired ? 'Expirado' : 'Invertir'}
          </Button>
          <Button
            onClick={() => onViewDetails?.(poolId)}
            variant="outline"
            size="md"
            className="flex items-center"
          >
            Detalles
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
