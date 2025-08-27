'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
// viem imports removed for simplified version
import { Deposit } from '@/utils/types'

// Tipos para el hook
export interface DepositFilters {
  status?: number
  minAmount?: string
  maxAmount?: string
  propertyType?: number
  isInvestmentEnabled?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  owner?: string
  tenant?: string
}

export interface DepositStats {
  totalDeposits: number
  activeDeposits: number
  completedDeposits: number
  disputedDeposits: number
  totalValueLocked: bigint
  averageDepositAmount: bigint
  totalInvestmentEnabled: number
  totalInvestmentValue: bigint
}

export interface DepositSearchResult {
  deposits: Deposit[]
  totalCount: number
  filteredCount: number
}

export interface UseDepositsReturn {
  // Estado de depósitos
  allDeposits: Deposit[]
  filteredDeposits: Deposit[]
  userDeposits: Deposit[]
  depositStats: DepositStats | null
  
  // Estados de carga
  isLoading: boolean
  error: string | null
  
  // Filtros y búsqueda
  filters: DepositFilters
  setFilters: (filters: DepositFilters) => void
  clearFilters: () => void
  searchDeposits: (query: string) => DepositSearchResult
  
  // Operaciones de depósitos
  getDepositById: (id: bigint) => Deposit | null
  getDepositsByStatus: (status: number) => Deposit[]
  getDepositsByOwner: (owner: string) => Deposit[]
  getDepositsByTenant: (tenant: string) => Deposit[]
  
  // Utilidades
  refreshDeposits: () => void
  exportDeposits: (format: 'csv' | 'json') => string
}

export function useDeposits(): UseDepositsReturn {
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([])
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([])
  const [userDeposits, setUserDeposits] = useState<Deposit[]>([])
  const [depositStats, setDepositStats] = useState<DepositStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DepositFilters>({})

  // Datos simulados
  const mockDeposits: Deposit[] = [
    {
      id: '1',
      propertyId: 'prop-001',
      propertyAddress: '123 Main St, Seoul',
      amount: BigInt(1000000000000000000), // 1 ETH
      totalInvested: BigInt(500000000000000000), // 0.5 ETH
      landlord: '0x1234567890123456789012345678901234567890',
      tenant: '0x0987654321098765432109876543210987654321',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      status: 'active',
      isInvestmentEnabled: true,
      investmentPoolShare: BigInt(500000000000000000),
      expectedReturn: BigInt(60000000000000000), // 6% anual
      actualReturn: BigInt(30000000000000000), // 3% hasta ahora
      annualReturn: 6,
      duration: 1,
      investorCount: 5,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-10-27')
    },
    {
      id: '2',
      propertyId: 'prop-002',
      propertyAddress: '456 Oak Ave, Busan',
      amount: BigInt(2000000000000000000), // 2 ETH
      totalInvested: BigInt(1000000000000000000), // 1 ETH
      landlord: '0x1234567890123456789012345678901234567890',
      tenant: '0x0987654321098765432109876543210987654321',
      startDate: new Date('2023-02-01'),
      endDate: new Date('2024-02-01'),
      status: 'active',
      isInvestmentEnabled: true,
      investmentPoolShare: BigInt(1000000000000000000),
      expectedReturn: BigInt(120000000000000000), // 6% anual
      actualReturn: BigInt(60000000000000000), // 3% hasta ahora
      annualReturn: 6,
      duration: 1,
      investorCount: 8,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-10-27')
    }
  ]

  // Cargar datos simulados
  useEffect(() => {
    setIsLoading(true)
    try {
      setAllDeposits(mockDeposits)
      setUserDeposits(mockDeposits)
      setFilteredDeposits(mockDeposits)
      
      // Calcular estadísticas
      const stats: DepositStats = {
        totalDeposits: mockDeposits.length,
        activeDeposits: mockDeposits.filter(d => d.status === 'active').length,
        completedDeposits: mockDeposits.filter(d => d.status === 'completed').length,
        disputedDeposits: mockDeposits.filter(d => d.status === 'disputed').length,
        totalValueLocked: mockDeposits.reduce((total, d) => total + d.amount, BigInt(0)),
        averageDepositAmount: mockDeposits.length > 0 
          ? mockDeposits.reduce((total, d) => total + d.amount, BigInt(0)) / BigInt(mockDeposits.length)
          : BigInt(0),
        totalInvestmentEnabled: mockDeposits.filter(d => d.isInvestmentEnabled).length,
        totalInvestmentValue: mockDeposits.reduce((total, d) => total + (d.totalInvested || BigInt(0)), BigInt(0))
      }
      setDepositStats(stats)
    } catch (err) {
      setError('Error al cargar depósitos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allDeposits]

          if (filters.status !== undefined) {
        filtered = filtered.filter(deposit => {
          const statusMap: Record<number, string> = { 0: 'pending', 1: 'active', 2: 'completed', 3: 'disputed', 4: 'cancelled' }
          return statusMap[filters.status!] === deposit.status
        })
      }

    if (filters.minAmount) {
      const minAmount = BigInt(filters.minAmount)
      filtered = filtered.filter(deposit => deposit.amount >= minAmount)
    }

    if (filters.maxAmount) {
      const maxAmount = BigInt(filters.maxAmount)
      filtered = filtered.filter(deposit => deposit.amount <= maxAmount)
    }

    if (filters.isInvestmentEnabled !== undefined) {
      filtered = filtered.filter(deposit => deposit.isInvestmentEnabled === filters.isInvestmentEnabled)
    }

    setFilteredDeposits(filtered)
  }, [allDeposits, filters])

  // Funciones de búsqueda
  const searchDeposits = useCallback((query: string): DepositSearchResult => {
    const searchResults = allDeposits.filter(deposit =>
      deposit.propertyAddress.toLowerCase().includes(query.toLowerCase()) ||
      deposit.propertyId.toLowerCase().includes(query.toLowerCase())
    )

    return {
      deposits: searchResults,
      totalCount: allDeposits.length,
      filteredCount: searchResults.length
    }
  }, [allDeposits])

  // Funciones de depósitos
  const getDepositById = useCallback((id: bigint): Deposit | null => {
    return allDeposits.find(deposit => deposit.id === id.toString()) || null
  }, [allDeposits])

  const getDepositsByStatus = useCallback((status: number): Deposit[] => {
    const statusMap: Record<number, string> = { 0: 'pending', 1: 'active', 2: 'completed', 3: 'disputed', 4: 'cancelled' }
    return allDeposits.filter(deposit => deposit.status === statusMap[status])
  }, [allDeposits])

  const getDepositsByOwner = useCallback((owner: string): Deposit[] => {
    return allDeposits.filter(deposit => deposit.landlord === owner)
  }, [allDeposits])

  const getDepositsByTenant = useCallback((tenant: string): Deposit[] => {
    return allDeposits.filter(deposit => deposit.tenant === tenant)
  }, [allDeposits])

  // Utilidades
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const refreshDeposits = useCallback(() => {
    // Simular refresco
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const exportDeposits = useCallback((format: 'csv' | 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(filteredDeposits, null, 2)
    } else {
      // CSV format
      const headers = ['ID', 'Property Address', 'Amount', 'Status', 'Created At']
      const rows = filteredDeposits.map(deposit => [
        deposit.id,
        deposit.propertyAddress,
        deposit.amount.toString(),
        deposit.status,
        deposit.createdAt.toISOString()
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }, [filteredDeposits])

  return {
    allDeposits,
    filteredDeposits,
    userDeposits,
    depositStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    searchDeposits,
    getDepositById,
    getDepositsByStatus,
    getDepositsByOwner,
    getDepositsByTenant,
    refreshDeposits,
    exportDeposits
  }
}
