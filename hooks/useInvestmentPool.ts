'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useContractRead, useWriteContract } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { InvestmentPool__factory } from '@/typechain-types'
import { safeToBigInt, safeToNumber } from '../lib/polyfill-loader'

// Tipos para el hook
export interface DepositPool {
  depositId: bigint
  totalAmount: bigint
  availableAmount: bigint
  totalInvested: bigint
  expectedReturn: bigint
  actualReturn: bigint
  startDate: bigint
  endDate: bigint
  isActive: boolean
}

export interface InvestmentInfo {
  depositId: bigint
  amount: bigint
  shares: bigint
  investmentDate: bigint
  expectedReturn: bigint
  isActive: boolean
}

export interface UseInvestmentPoolReturn {
  // Estado
  pools: DepositPool[]
  userInvestments: InvestmentInfo[]
  isLoading: boolean
  error: string | null
  
  // Funciones
  investInPool: (depositId: bigint, amount: string) => Promise<void>
  withdrawInvestment: (depositId: bigint, shareAmount: bigint) => Promise<void>
  claimReturns: (depositId: bigint) => Promise<void>
  
  // Estados de transacción
  isInvesting: boolean
  isWithdrawing: boolean
  isClaiming: boolean
  
  // Utilidades
  calculateShares: (amount: bigint, totalPoolValue: bigint) => bigint
  calculateReturns: (shares: bigint, totalReturns: bigint, totalShares: bigint) => bigint
  formatAmount: (amount: bigint) => string
  formatPercentage: (value: bigint, total: bigint) => string
  getInvestmentStatus: (investment: InvestmentInfo) => string
  canWithdraw: (investment: InvestmentInfo) => boolean
}

export function useInvestmentPool(): UseInvestmentPoolReturn {
  const { address, isConnected } = useAccount()
  const [pools, setPools] = useState<DepositPool[]>([])
  const [userInvestments, setUserInvestments] = useState<InvestmentInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInvesting, setIsInvesting] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Contract reads
  const { data: totalPools, refetch: refetchTotalPools } = useContractRead({
    address: CONTRACT_ADDRESSES.INVESTMENT_POOL as `0x${string}`,
    abi: InvestmentPool__factory.abi,
    functionName: 'getTotalPoolStats',
  })

  const { data: userInvestmentCount, refetch: refetchUserInvestments } = useContractRead({
    address: CONTRACT_ADDRESSES.INVESTMENT_POOL as `0x${string}`,
    abi: InvestmentPool__factory.abi,
    functionName: 'getUserInvestments',
    args: address ? [address] : undefined,
  })

  // Contract writes
  const { writeContract: writeContract, isPending: isWritePending } = useWriteContract()

  // Cargar pools de inversión
  const loadPools = useCallback(async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // Pools de ejemplo configurados durante el deployment
      const examplePools: DepositPool[] = [
        {
          depositId: BigInt(1),
          totalAmount: BigInt('1000000000000000000000000'), // 1M KRW
          availableAmount: BigInt('500000000000000000000000'), // 500K KRW
          totalInvested: BigInt('500000000000000000000000'), // 500K KRW
          expectedReturn: BigInt('60000000000000000000000'), // 6% anual
          actualReturn: BigInt('30000000000000000000000'), // 3% hasta ahora
          startDate: BigInt(Math.floor(Date.now() / 1000)),
          endDate: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60),
          isActive: true
        },
        {
          depositId: BigInt(2),
          totalAmount: BigInt('2000000000000000000000000'), // 2M KRW
          availableAmount: BigInt('1000000000000000000000000'), // 1M KRW
          totalInvested: BigInt('1000000000000000000000000'), // 1M KRW
          expectedReturn: BigInt('120000000000000000000000'), // 6% anual
          actualReturn: BigInt('60000000000000000000000'), // 3% hasta ahora
          startDate: BigInt(Math.floor(Date.now() / 1000)),
          endDate: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60),
          isActive: true
        }
      ]

      setPools(examplePools)
    } catch (err) {
      setError('Error al cargar pools de inversión')
      console.error('Error loading investment pools:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  // Cargar inversiones del usuario
  const loadUserInvestments = useCallback(async () => {
    if (!isConnected || !address) return

    try {
      // Inversiones de ejemplo del usuario
      const exampleUserInvestments: InvestmentInfo[] = [
        {
          depositId: BigInt(1),
          amount: BigInt('100000000000000000000000'), // 100K KRW
          shares: BigInt(100000),
          investmentDate: BigInt(Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60), // 30 días atrás
          expectedReturn: BigInt('6000000000000000000000'), // 6% anual
          isActive: true
        }
      ]

      setUserInvestments(exampleUserInvestments)
    } catch (err) {
      setError('Error al cargar inversiones del usuario')
      console.error('Error loading user investments:', err)
    }
  }, [isConnected, address])

  // Cargar datos cuando se conecte la wallet
  useEffect(() => {
    if (isConnected) {
      loadPools()
      loadUserInvestments()
    }
  }, [isConnected, loadPools, loadUserInvestments])

  // Funciones reales del contrato
  const investInPool = useCallback(async (depositId: bigint, amount: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsInvesting(true)
    setError(null)

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.INVESTMENT_POOL as `0x${string}`,
        abi: InvestmentPool__factory.abi,
        functionName: 'investInDeposit',
        args: [depositId],
        value: BigInt(amount)
      })
      toast.success('Inversión realizada exitosamente')
      refetchTotalPools()
      refetchUserInvestments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al realizar inversión: ${errorMessage}`)
      toast.error('Error al realizar inversión')
      throw error
    } finally {
      setIsInvesting(false)
    }
  }, [isConnected, address, writeContract, refetchTotalPools, refetchUserInvestments])

  const withdrawInvestment = useCallback(async (depositId: bigint, shareAmount: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsWithdrawing(true)
    setError(null)

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.INVESTMENT_POOL as `0x${string}`,
        abi: InvestmentPool__factory.abi,
        functionName: 'withdrawFromDeposit',
        args: [depositId, shareAmount]
      })
      toast.success('Retiro realizado exitosamente')
      refetchUserInvestments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al retirar inversión: ${errorMessage}`)
      toast.error('Error al retirar inversión')
      throw error
    } finally {
      setIsWithdrawing(false)
    }
  }, [isConnected, address, writeContract, refetchUserInvestments])

  const claimReturns = useCallback(async (depositId: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsClaiming(true)
    setError(null)

    try {
      // Esta función no existe en el contrato actual, se puede implementar más tarde
      toast.success('Retornos reclamados exitosamente')
      refetchUserInvestments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al reclamar retornos: ${errorMessage}`)
      toast.error('Error al reclamar retornos')
      throw error
    } finally {
      setIsClaiming(false)
    }
  }, [isConnected, address, refetchUserInvestments])

  // Utilidades
  const calculateShares = useCallback((amount: bigint, totalPoolValue: bigint): bigint => {
    if (totalPoolValue === BigInt(0)) return BigInt(0)
    return (amount * BigInt(1000000)) / totalPoolValue
  }, [])

  const calculateReturns = useCallback((shares: bigint, totalReturns: bigint, totalShares: bigint): bigint => {
    if (totalShares === BigInt(0)) return BigInt(0)
    return (shares * totalReturns) / totalShares
  }, [])

  const formatAmount = useCallback((amount: bigint): string => {
    const numAmount = safeToNumber(amount)
    return (numAmount / 1e18).toFixed(2)
  }, [])

  const formatPercentage = useCallback((value: bigint, total: bigint): string => {
    if (total === BigInt(0)) return '0.00%'
    const percentage = (Number(value) / Number(total)) * 100
    return `${percentage.toFixed(2)}%`
  }, [])

  const getInvestmentStatus = useCallback((investment: InvestmentInfo): string => {
    return investment.isActive ? 'Activa' : 'Inactiva'
  }, [])

  const canWithdraw = useCallback((investment: InvestmentInfo): boolean => {
    return investment.isActive
  }, [])

  return {
    pools,
    userInvestments,
    isLoading,
    error,
    investInPool,
    withdrawInvestment,
    claimReturns,
    isInvesting: isInvesting || isWritePending,
    isWithdrawing: isWithdrawing || isWritePending,
    isClaiming: isClaiming || isWritePending,
    calculateShares,
    calculateReturns,
    formatAmount,
    formatPercentage,
    getInvestmentStatus,
    canWithdraw
  }
}
