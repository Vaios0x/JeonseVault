'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { TrendingUp, Clock, DollarSign, Users, BarChart3, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatAmount, formatPercentage, formatDate } from '@/utils/formatters'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'

interface InvestmentPool {
  id: string
  name: string
  totalValue: bigint
  availableValue: bigint
  expectedReturn: bigint
  duration: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'full' | 'closed'
  investors: number
  minInvestment: bigint
  maxInvestment: bigint
  endDate: Date
  description: string
  propertyType: string
  location: string
}

interface PoolListProps {
  className?: string
  pools?: InvestmentPool[]
}

export function PoolList({ className, pools = [] }: PoolListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('return')

  // Usar transacciones demo
  const { investInPoolDemo, isProcessing } = useDemoTransactions()

  // Datos de ejemplo como fallback si no hay datos reales
  const defaultPools: InvestmentPool[] = useMemo(() => [
    {
      id: '1',
      name: 'Gangnam Premium Apartments',
      totalValue: BigInt('1000000000000000000000000'), // 1B KRW
      availableValue: BigInt('200000000000000000000000'), // 200M KRW
      expectedReturn: BigInt('60000000000000000000000'), // 60M KRW
      duration: 12,
      riskLevel: 'low',
      status: 'active',
      investors: 45,
      minInvestment: BigInt('10000000000000000000000'), // 10M KRW
      maxInvestment: BigInt('100000000000000000000000'), // 100M KRW
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      description: 'Inversión en apartamentos premium en Gangnam, Seoul',
      propertyType: 'Apartamento',
      location: 'Gangnam-gu, Seoul'
    },
    {
      id: '2',
      name: 'Mapo Commercial District',
      totalValue: BigInt('800000000000000000000000'), // 800M KRW
      availableValue: BigInt('150000000000000000000000'), // 150M KRW
      expectedReturn: BigInt('48000000000000000000000'), // 48M KRW
      duration: 18,
      riskLevel: 'medium',
      status: 'active',
      investors: 32,
      minInvestment: BigInt('5000000000000000000000'), // 5M KRW
      maxInvestment: BigInt('50000000000000000000000'), // 50M KRW
      endDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
      description: 'Desarrollo comercial en el distrito de Mapo',
      propertyType: 'Comercial',
      location: 'Mapo-gu, Seoul'
    },
    {
      id: '3',
      name: 'Yongsan Tech Hub',
      totalValue: BigInt('1200000000000000000000000'), // 1.2B KRW
      availableValue: BigInt('0'),
      expectedReturn: BigInt('72000000000000000000000'), // 72M KRW
      duration: 24,
      riskLevel: 'high',
      status: 'full',
      investors: 78,
      minInvestment: BigInt('20000000000000000000000'), // 20M KRW
      maxInvestment: BigInt('200000000000000000000000'), // 200M KRW
      endDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
      description: 'Centro tecnológico en Yongsan con alto potencial de crecimiento',
      propertyType: 'Oficina',
      location: 'Yongsan-gu, Seoul'
    }
  ], [])

  // Usar datos de ejemplo para demo
  const allPools = defaultPools

  // Filtrar y ordenar pools
  const filteredPools = useMemo(() => {
    let filtered = allPools.filter(pool => {
      const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pool.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = filterRisk === 'all' || pool.riskLevel === filterRisk
      const matchesStatus = filterStatus === 'all' || pool.status === filterStatus
      
      return matchesSearch && matchesRisk && matchesStatus
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'return':
          return Number(b.expectedReturn) - Number(a.expectedReturn)
        case 'duration':
          return a.duration - b.duration
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3 }
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        case 'available':
          return Number(b.availableValue) - Number(a.availableValue)
        default:
          return 0
      }
    })

    return filtered
  }, [allPools, searchTerm, filterRisk, filterStatus, sortBy])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'full': return 'text-blue-600 bg-blue-100'
      case 'closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateProgress = (pool: InvestmentPool) => {
    const total = Number(pool.totalValue)
    const available = Number(pool.availableValue)
    return ((total - available) / total) * 100
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Buscar pools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div>
            <Select
              options={[
                { value: 'all', label: 'Todos los riesgos' },
                { value: 'low', label: 'Riesgo Bajo' },
                { value: 'medium', label: 'Riesgo Medio' },
                { value: 'high', label: 'Riesgo Alto' }
              ]}
              value={filterRisk}
              onChange={setFilterRisk}
            />
          </div>
          
          <div>
            <Select
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'full', label: 'Completo' },
                { value: 'closed', label: 'Cerrado' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
          
          <div>
            <Select
              options={[
                { value: 'return', label: 'Mayor retorno' },
                { value: 'duration', label: 'Menor duración' },
                { value: 'risk', label: 'Menor riesgo' },
                { value: 'available', label: 'Más disponible' }
              ]}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>
      </div>

      {/* Lista de pools */}
      <div className="space-y-4">
        {filteredPools.map((pool) => {
          const progress = calculateProgress(pool)
          const returnRate = Number(pool.expectedReturn) / Number(pool.totalValue) * 100
          
          return (
            <div key={pool.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{pool.name}</h3>
                    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getRiskColor(pool.riskLevel))}>
                      {pool.riskLevel === 'low' ? 'Bajo' : pool.riskLevel === 'medium' ? 'Medio' : 'Alto'} Riesgo
                    </span>
                    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(pool.status))}>
                      {pool.status === 'active' ? 'Activo' : pool.status === 'full' ? 'Completo' : 'Cerrado'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{pool.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {pool.propertyType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {pool.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pool.duration} meses
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {returnRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Retorno anual</p>
                </div>
              </div>

              {/* Progreso y métricas */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progreso de financiación</span>
                    <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(pool.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disponible</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(pool.availableValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inversores</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pool.investors}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha límite</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(pool.endDate)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span>Inversión mínima: {formatAmount(pool.minInvestment)}</span>
                    {pool.maxInvestment > pool.minInvestment && (
                      <span className="ml-2">• Máxima: {formatAmount(pool.maxInvestment)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                    {pool.status === 'active' && pool.availableValue > 0 && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await investInPoolDemo(BigInt(pool.id))
                          } catch (error) {
                            console.error('Error al invertir:', error)
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Procesando...' : 'Invertir'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estado vacío */}
      {filteredPools.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron pools de inversión
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros o vuelve más tarde
          </p>
        </div>
      )}
    </div>
  )
}
