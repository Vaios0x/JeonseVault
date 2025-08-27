'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, XCircle, Download, Filter, Search, Calendar, DollarSign, TrendingUp, TrendingDown, Eye, ExternalLink, AlertTriangle, Gift, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, useModal } from '@/components/ui/Modal'
import { formatAmount, formatDate, formatAddress } from '@/utils/formatters'
import { Transaction, TransactionType, TransactionStatus } from '@/utils/types'

interface TransactionHistoryProps {
  transactions: Transaction[]
  className?: string
  onViewTransaction?: (transactionId: string) => void
  onExport?: (format: 'csv' | 'pdf') => void
  showFilters?: boolean
  showSearch?: boolean
  maxItems?: number
  loading?: boolean
}

export function TransactionHistory({
  transactions,
  className,
  onViewTransaction,
  onExport,
  showFilters = true,
  showSearch = true,
  maxItems,
  loading = false
}: TransactionHistoryProps) {
  const { open, close } = useModal()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.metadata.poolId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatAddress(tx.from).toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatAddress(tx.to).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(tx => tx.status === statusFilter)
    }

    // Filtro por tipo
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(tx => tx.type === typeFilter)
    }

    // Filtro por fecha
    if (dateFilter !== 'ALL') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate)
          break
        case 'WEEK':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate)
          break
        case 'MONTH':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate)
          break
        case 'QUARTER':
          filterDate.setMonth(now.getMonth() - 3)
          filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate)
          break
        case 'YEAR':
          filterDate.setFullYear(now.getFullYear() - 1)
          filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate)
          break
      }
    }

    // Limitar número de elementos
    if (maxItems) {
      filtered = filtered.slice(0, maxItems)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [transactions, searchTerm, statusFilter, typeFilter, dateFilter, maxItems])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = filteredTransactions.length
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + Number(tx.value), 0)
    const successful = filteredTransactions.filter(tx => tx.status === 'confirmed').length
    const pending = filteredTransactions.filter(tx => tx.status === 'pending').length
    const failed = filteredTransactions.filter(tx => tx.status === 'failed').length

    return {
      total,
      totalAmount,
      successful,
      pending,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0
    }
  }, [filteredTransactions])

  // Configuración de tipos de transacción
  const typeConfig = {
    'create_deposit': {
      label: 'Depósito',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: ArrowDownLeft
    },
    'release_deposit': {
      label: 'Retiro',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: ArrowUpRight
    },
    'dispute_deposit': {
      label: 'Disputa',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: AlertTriangle
    },
    'invest_in_pool': {
      label: 'Inversión',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: TrendingUp
    },
    'withdraw_investment': {
      label: 'Retiro Inversión',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: TrendingDown
    },
    'claim_returns': {
      label: 'Retorno',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Gift
    },
    'verify_property': {
      label: 'Verificar Propiedad',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      icon: CheckCircle
    },
    'verify_user': {
      label: 'Verificar Usuario',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      icon: UserCheck
    }
  }

  // Configuración de estados
  const statusConfig = {
    'pending': {
      label: 'Pendiente',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Clock
    },
    'confirmed': {
      label: 'Completada',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    'failed': {
      label: 'Fallida',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: XCircle
    },
    'cancelled': {
      label: 'Cancelada',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: XCircle
    }
  }

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    open()
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format)
    } else {
      // Lógica de exportación por defecto
      const data = filteredTransactions.map(tx => ({
        ID: tx.id,
        Tipo: typeConfig[tx.type]?.label || tx.type,
        Estado: statusConfig[tx.status]?.label || tx.status,
        Monto: formatAmount(tx.value),
        Descripción: tx.metadata.description || 'N/A',
        Fecha: formatDate(tx.timestamp),
        Hash: tx.hash,
        Pool: tx.metadata.poolId?.toString() || 'N/A'
      }))

      if (format === 'csv') {
        const csvContent = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }
  }

  const handleViewOnExplorer = (hash: string) => {
    window.open(`https://explorer.kaia.network/tx/${hash}`, '_blank')
  }

  if (loading) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h3>
              <p className="text-sm text-gray-600">
                {stats.total} transacciones • {formatAmount(stats.totalAmount)} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
              >
                CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
              >
                PDF
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600">Fallidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tasa de éxito</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {(showFilters || showSearch) && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              {showSearch && (
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Buscar transacciones..."
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
                      { label: 'Completadas', value: 'confirmed' },
                      { label: 'Pendientes', value: 'pending' },
                      { label: 'Fallidas', value: 'failed' },
                      { label: 'Canceladas', value: 'cancelled' }
                    ]}
                    className="w-40"
                  />

                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { label: 'Todos los tipos', value: 'ALL' },
                      { label: 'Depósitos', value: 'create_deposit' },
                      { label: 'Retiros', value: 'release_deposit' },
                      { label: 'Inversiones', value: 'invest_in_pool' },
                      { label: 'Retornos', value: 'claim_returns' }
                    ]}
                    className="w-40"
                  />

                  <Select
                    value={dateFilter}
                    onChange={setDateFilter}
                    options={[
                      { label: 'Todas las fechas', value: 'ALL' },
                      { label: 'Hoy', value: 'TODAY' },
                      { label: 'Última semana', value: 'WEEK' },
                      { label: 'Último mes', value: 'MONTH' },
                      { label: 'Último trimestre', value: 'QUARTER' },
                      { label: 'Último año', value: 'YEAR' }
                    ]}
                    className="w-40"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Lista de transacciones */}
        <div className="divide-y divide-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' || dateFilter !== 'ALL'
                  ? 'No se encontraron transacciones con los filtros aplicados.'
                  : 'Aún no has realizado ninguna transacción.'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const type = typeConfig[transaction.type]
              const status = statusConfig[transaction.status]
              const TypeIcon = type.icon
              const StatusIcon = status.icon

              return (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', type.bgColor)}>
                        <TypeIcon className={clsx('w-5 h-5', type.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{transaction.metadata.description || 'Sin descripción'}</h4>
                          <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', status.bgColor, status.color)}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {status.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.timestamp)}
                          </span>
                          {transaction.metadata.poolId && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Pool #{transaction.metadata.poolId.toString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatAmount(transaction.value)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewTransaction(transaction)
                        }}
                        variant="ghost"
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Ver
                      </Button>
                      {transaction.hash && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewOnExplorer(transaction.hash!)
                          }}
                          variant="ghost"
                          leftIcon={<ExternalLink className="w-4 h-4" />}
                        >
                          Explorer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Paginación o "Ver más" */}
        {maxItems && transactions.length > maxItems && (
          <div className="p-4 border-t border-gray-200 text-center">
            <Button
              onClick={() => window.location.href = '/transactions'}
              variant="outline"
            >
              Ver todas las transacciones
            </Button>
          </div>
        )}
      </div>

      {/* Modal de detalles de transacción */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Detalles de la Transacción"
        size="lg"
      >
        {selectedTransaction && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Información Básica</h4>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID de Transacción</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedTransaction.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.metadata.description || 'Sin descripción'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Monto</label>
                  <p className="text-lg font-bold text-gray-900">{formatAmount(selectedTransaction.value)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTransaction.timestamp)}</p>
                </div>

                {selectedTransaction.metadata.poolId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pool</label>
                    <p className="text-sm text-gray-900">Pool #{selectedTransaction.metadata.poolId.toString()}</p>
                  </div>
                )}
              </div>

              {/* Información técnica */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Información Técnica</h4>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', typeConfig[selectedTransaction.type].bgColor, typeConfig[selectedTransaction.type].color)}>
                      {typeConfig[selectedTransaction.type].label}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', statusConfig[selectedTransaction.status].bgColor, statusConfig[selectedTransaction.status].color)}>
                      {statusConfig[selectedTransaction.status].label}
                    </div>
                  </div>
                </div>

                {selectedTransaction.hash && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hash de Transacción</label>
                    <p className="text-sm text-gray-900 font-mono break-all">{selectedTransaction.hash}</p>
                    <Button
                      onClick={() => handleViewOnExplorer(selectedTransaction.hash!)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      leftIcon={<ExternalLink className="w-4 h-4" />}
                    >
                      Ver en Explorer
                    </Button>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Desde</label>
                  <p className="text-sm text-gray-900 font-mono">{formatAddress(selectedTransaction.from)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Hacia</label>
                  <p className="text-sm text-gray-900 font-mono">{formatAddress(selectedTransaction.to)}</p>
                </div>

                {selectedTransaction.gasUsed && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gas Utilizado</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.gasUsed.toString()}</p>
                  </div>
                )}

                {selectedTransaction.gasPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio del Gas</label>
                    <p className="text-sm text-gray-900">{formatAmount(selectedTransaction.gasPrice)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadatos adicionales */}
            {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Metadatos</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
