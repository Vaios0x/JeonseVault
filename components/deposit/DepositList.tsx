'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Search, Filter, SortAsc, SortDesc, Grid, List, ChevronLeft, ChevronRight, Home, Calendar, DollarSign, TrendingUp, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DepositCard } from '@/components/dashboard/DepositCard'
import { DepositDetails } from '@/components/deposit/DepositDetails'
import { formatAmount, formatPercentage } from '@/utils/formatters'
import { Deposit, DepositStatus } from '@/utils/types'

// Enum para tipos de propiedad
enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  CONDOMINIUM = 'condominium',
  OFFICE = 'office',
  COMMERCIAL = 'commercial',
  LAND = 'land'
}

interface DepositListProps {
  deposits: Deposit[]
  className?: string
  onDepositSelect?: (deposit: Deposit) => void
  onInvest?: (depositId: string) => void
  onEdit?: (depositId: string) => void
  onDelete?: (depositId: string) => void
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  itemsPerPage?: number
  layout?: 'grid' | 'list'
  maxItems?: number
  loading?: boolean
  emptyMessage?: string
}

export function DepositList({
  deposits,
  className,
  onDepositSelect,
  onInvest,
  onEdit,
  onDelete,
  showFilters = true,
  showSearch = true,
  showPagination = true,
  itemsPerPage = 12,
  layout = 'grid',
  maxItems,
  loading = false,
  emptyMessage = 'No hay depósitos disponibles'
}: DepositListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('ALL')
  const [returnFilter, setReturnFilter] = useState<string>('ALL')
  const [amountFilter, setAmountFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout)

  // Filtrar depósitos
  const filteredDeposits = useMemo(() => {
    let filtered = deposits

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(deposit => 
        deposit.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||

        deposit.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(deposit => deposit.status === statusFilter)
    }

    // Filtro por tipo de propiedad - Deposit no tiene propertyType, comentando por ahora
    // if (propertyTypeFilter !== 'ALL') {
    //   filtered = filtered.filter(deposit => deposit.propertyType === propertyTypeFilter)
    // }

    // Filtro por rendimiento
    if (returnFilter !== 'ALL') {
      const [min, max] = returnFilter.split('-').map(Number)
      filtered = filtered.filter(deposit => {
        const returnRate = deposit.annualReturn || 0
        if (max) {
          return returnRate >= min && returnRate <= max
        } else {
          return returnRate >= min
        }
      })
    }

    // Filtro por monto
    if (amountFilter !== 'ALL') {
      const [min, max] = amountFilter.split('-').map(Number)
      filtered = filtered.filter(deposit => {
        const amount = deposit.amount
        if (max) {
          return amount >= min && amount <= max
        } else {
          return amount >= min
        }
      })
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'annualReturn':
          aValue = a.annualReturn
          bValue = b.annualReturn
          break
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'investorCount':
          aValue = a.investorCount
          bValue = b.investorCount
          break
        case 'propertyAddress':
          aValue = a.propertyAddress.toLowerCase()
          bValue = b.propertyAddress.toLowerCase()
          break
        default:
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Limitar número de elementos
    if (maxItems) {
      filtered = filtered.slice(0, maxItems)
    }

    return filtered
  }, [deposits, searchTerm, statusFilter, propertyTypeFilter, returnFilter, amountFilter, sortBy, sortOrder, maxItems])

  // Paginación
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDeposits = showPagination 
    ? filteredDeposits.slice(startIndex, endIndex)
    : filteredDeposits

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = filteredDeposits.length
    const totalAmount = filteredDeposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0)
    const avgReturn = total > 0 ? filteredDeposits.reduce((sum, deposit) => sum + (deposit.annualReturn || 0), 0) / total : 0
    const activeCount = filteredDeposits.filter(deposit => deposit.status === 'active').length

    return {
      total,
      totalAmount,
      avgReturn,
      activeCount
    }
  }, [filteredDeposits])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDepositClick = (deposit: Deposit) => {
    if (onDepositSelect) {
      onDepositSelect(deposit)
    } else {
      window.location.href = `/deposit/${deposit.id}`
    }
  }

  if (loading) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Depósitos Jeonse</h2>
            <p className="text-sm text-gray-600">
              {stats.total} depósitos • {formatAmount(stats.totalAmount)} total • {stats.avgReturn.toFixed(1)}% rendimiento promedio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Grid className="w-4 h-4" />}
            >
              Grid
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<List className="w-4 h-4" />}
            >
              Lista
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
            <p className="text-sm text-gray-600">Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{formatAmount(stats.totalAmount)}</p>
            <p className="text-sm text-gray-600">Valor total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.avgReturn.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Rendimiento promedio</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      {(showFilters || showSearch) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            {showSearch && (
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Buscar depósitos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            )}

            {showFilters && (
              <>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: 'Todos los estados', value: 'ALL' },
                    { label: 'Activos', value: 'active' },
                    { label: 'Completados', value: 'completed' },
                    { label: 'En Disputa', value: 'disputed' },
                    { label: 'Pendientes', value: 'pending' },
                    { label: 'Cancelados', value: 'cancelled' }
                  ]}
                  size="sm"
                  className="w-40"
                />

                <Select
                  value={propertyTypeFilter}
                  onChange={setPropertyTypeFilter}
                  options={[
                    { label: 'Todos los tipos', value: 'ALL' },
                    { label: 'Apartamento', value: PropertyType.APARTMENT },
                    { label: 'Casa', value: PropertyType.HOUSE },
                    { label: 'Condominio', value: PropertyType.CONDOMINIUM },
                    { label: 'Oficina', value: PropertyType.OFFICE },
                    { label: 'Comercial', value: PropertyType.COMMERCIAL },
                    { label: 'Terreno', value: PropertyType.LAND }
                  ]}
                  size="sm"
                  className="w-40"
                />

                <Select
                  value={returnFilter}
                  onChange={setReturnFilter}
                  options={[
                    { label: 'Cualquier rendimiento', value: 'ALL' },
                    { label: '5-10%', value: '5-10' },
                    { label: '10-15%', value: '10-15' },
                    { label: '15-20%', value: '15-20' },
                    { label: '20%+', value: '20-100' }
                  ]}
                  size="sm"
                  className="w-40"
                />

                <Select
                  value={amountFilter}
                  onChange={setAmountFilter}
                  options={[
                    { label: 'Cualquier monto', value: 'ALL' },
                    { label: '₩100M - ₩500M', value: '100000000-500000000' },
                    { label: '₩500M - ₩1B', value: '500000000-1000000000' },
                    { label: '₩1B - ₩5B', value: '1000000000-5000000000' },
                    { label: '₩5B+', value: '5000000000-10000000000' }
                  ]}
                  size="sm"
                  className="w-40"
                />

                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(value) => {
                    const [field, order] = value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  options={[
                    { label: 'Más recientes', value: 'createdAt-desc' },
                    { label: 'Más antiguos', value: 'createdAt-asc' },
                    { label: 'Mayor rendimiento', value: 'annualReturn-desc' },
                    { label: 'Menor rendimiento', value: 'annualReturn-asc' },
                    { label: 'Mayor monto', value: 'amount-desc' },
                    { label: 'Menor monto', value: 'amount-asc' },
                    { label: 'Más inversores', value: 'investorCount-desc' },
                    { label: 'A-Z', value: 'propertyAddress-asc' }
                  ]}
                  size="sm"
                  className="w-40"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Lista de depósitos */}
      <div className="p-6">
        {filteredDeposits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay depósitos</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' || propertyTypeFilter !== 'ALL' || returnFilter !== 'ALL' || amountFilter !== 'ALL'
                ? 'No se encontraron depósitos con los filtros aplicados.'
                : emptyMessage}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDeposits.map((deposit) => (
                  <DepositCard
                    key={deposit.id}
                    deposit={deposit}
                    onClick={() => handleDepositClick(deposit)}
                    onInvest={onInvest}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedDeposits.map((deposit) => (
                  <DepositDetails
                    key={deposit.id}
                    deposit={deposit}
                    onInvest={onInvest}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    compact
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDeposits.length)} de {filteredDeposits.length} depósitos
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={currentPage === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
