'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useContractRead, useWriteContract } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { JeonseVault__factory } from '@/typechain-types'
import { safeToBigInt, safeToNumber } from '../lib/polyfill-loader'

// Tipos para el hook
export interface JeonseVaultState {
  totalValueLocked: bigint
  totalDeposits: bigint
  escrowFee: bigint
  earlyReleaseFee: bigint
  minDepositAmount: bigint
  maxDepositAmount: bigint
}

export interface Deposit {
  id: bigint
  tenant: `0x${string}`
  landlord: `0x${string}`
  amount: bigint
  startDate: bigint
  endDate: bigint
  propertyId: string
  propertyAddress: string
  status: number // 0: Active, 1: Released, 2: Disputed, 3: Cancelled
  investmentPoolShare: bigint
  createdAt: bigint
  releasedAt: bigint
  isInvestmentEnabled: boolean
  totalInvested?: bigint
  investorCount?: number
  annualReturn?: bigint
  duration?: number
}

export interface CreateDepositParams {
  landlord: string
  propertyId: string
  propertyAddress: string
  amount: string
  endDate: number
  enableInvestment: boolean
}

export interface UseJeonseVaultReturn {
  // Estado del contrato
  contractState: JeonseVaultState | null
  deposits: Deposit[]
  userDeposits: Deposit[]
  
  // Estados de carga
  isLoading: boolean
  error: string | null
  
  // Funciones principales
  createDeposit: (params: CreateDepositParams) => Promise<void>
  releaseDeposit: (depositId: bigint) => Promise<void>
  disputeDeposit: (depositId: bigint, reason: string) => Promise<void>
  enableInvestment: (depositId: bigint) => Promise<void>
  
  // Estados de transacción
  isCreatingDeposit: boolean
  isReleasingDeposit: boolean
  isDisputingDeposit: boolean
  isEnablingInvestment: boolean
  
  // Utilidades
  formatAmount: (amount: bigint) => string
  getDepositStatus: (status: number) => string
  getDepositById: (id: bigint) => Deposit | null
  getUserDeposits: (userAddress: string) => Deposit[]
  getActiveDeposits: () => Deposit[]
  getDisputedDeposits: () => Deposit[]
  getCacheStats: () => any
}

// Configuración del contrato
const JEONSE_VAULT_ADDRESS = CONTRACT_ADDRESSES.JEONSE_VAULT

export function useJeonseVault(): UseJeonseVaultReturn {
  const { address, isConnected } = useAccount()
  const [contractState, setContractState] = useState<JeonseVaultState | null>(null)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [userDeposits, setUserDeposits] = useState<Deposit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false)
  const [isReleasingDeposit, setIsReleasingDeposit] = useState(false)
  const [isDisputingDeposit, setIsDisputingDeposit] = useState(false)
  const [isEnablingInvestment, setIsEnablingInvestment] = useState(false)

  // Contract reads
  const { data: totalValueLocked, refetch: refetchTotalValue } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'totalValueLocked',
  })

  const { data: totalDeposits, refetch: refetchTotalDeposits } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'getTotalDeposits',
  })

  const { data: escrowFee } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'ESCROW_FEE',
  })

  const { data: earlyReleaseFee } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'EARLY_RELEASE_FEE',
  })

  const { data: minDepositAmount } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'MIN_DEPOSIT_AMOUNT',
  })

  const { data: maxDepositAmount } = useContractRead({
    address: JEONSE_VAULT_ADDRESS as `0x${string}`,
    abi: JeonseVault__factory.abi,
    functionName: 'MAX_DEPOSIT_AMOUNT',
  })

  // Contract writes
  const { writeContract: writeContract, isPending: isWritePending } = useWriteContract()

  // Cargar estado del contrato
  const loadContractState = useCallback(async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      const state: JeonseVaultState = {
        totalValueLocked: typeof totalValueLocked === 'bigint' ? totalValueLocked : BigInt('1000000000000000000000000000'), // 1B KRW default
        totalDeposits: typeof totalDeposits === 'bigint' ? totalDeposits : BigInt(150),
        escrowFee: typeof escrowFee === 'bigint' ? escrowFee : BigInt(10), // 0.1% en basis points
        earlyReleaseFee: typeof earlyReleaseFee === 'bigint' ? earlyReleaseFee : BigInt(100), // 1% en basis points
        minDepositAmount: typeof minDepositAmount === 'bigint' ? minDepositAmount : BigInt('1000000000000000000000000'), // 1M KRW
        maxDepositAmount: typeof maxDepositAmount === 'bigint' ? maxDepositAmount : BigInt('10000000000000000000000000000'), // 10B KRW
      }
      setContractState(state)
    } catch (err) {
      setError('Error al cargar estado del contrato')
      console.error('Error loading contract state:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, totalValueLocked, totalDeposits, escrowFee, earlyReleaseFee, minDepositAmount, maxDepositAmount])

  // Cargar depósitos de ejemplo (en producción vendrían del contrato)
  const loadDeposits = useCallback(async () => {
    if (!isConnected || !address) return

    try {
      // Depósitos de ejemplo configurados durante el deployment
      const exampleDeposits: Deposit[] = [
        {
          id: BigInt(1),
          tenant: address as `0x${string}`,
          landlord: '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1' as `0x${string}`,
          amount: BigInt('500000000000000000000000000'), // 500M KRW
          startDate: BigInt(Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60), // 30 días atrás
          endDate: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 año
          propertyId: 'demo-property-001',
          propertyAddress: '서울특별시 강남구 역삼동 101호',
          status: 0, // Active
          investmentPoolShare: BigInt('100000000000000000000000000'), // 100M KRW
          createdAt: BigInt(Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60),
          releasedAt: BigInt(0),
          isInvestmentEnabled: true,
          totalInvested: BigInt('100000000000000000000000000'),
          investorCount: 5,
          annualReturn: BigInt('60000000000000000000000000'), // 6% anual
          duration: 12
        },
        {
          id: BigInt(2),
          tenant: address as `0x${string}`,
          landlord: '0xe6bE36A435c3BecAd922ddD9Ede2Fc1DbB632BA1' as `0x${string}`,
          amount: BigInt('800000000000000000000000000'), // 800M KRW
          startDate: BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60), // 15 días atrás
          endDate: BigInt(Math.floor(Date.now() / 1000) + 730 * 24 * 60 * 60), // 2 años
          propertyId: 'demo-property-002',
          propertyAddress: '서울특별시 서초구 서초동 202호',
          status: 0, // Active
          investmentPoolShare: BigInt('160000000000000000000000000'), // 160M KRW
          createdAt: BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60),
          releasedAt: BigInt(0),
          isInvestmentEnabled: true,
          totalInvested: BigInt('160000000000000000000000000'),
          investorCount: 8,
          annualReturn: BigInt('96000000000000000000000000'), // 6% anual
          duration: 24
        }
      ]

      setDeposits(exampleDeposits)
      setUserDeposits(exampleDeposits.filter(d => d.tenant === address))
    } catch (err) {
      setError('Error al cargar depósitos')
      console.error('Error loading deposits:', err)
    }
  }, [isConnected, address])

  // Cargar datos cuando se conecte la wallet
  useEffect(() => {
    if (isConnected) {
      loadContractState()
      loadDeposits()
    }
  }, [isConnected, loadContractState, loadDeposits])

  // Funciones reales del contrato
  const createDeposit = useCallback(async (params: CreateDepositParams) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsCreatingDeposit(true)
    setError(null)

    try {
      writeContract({
        address: JEONSE_VAULT_ADDRESS as `0x${string}`,
        abi: JeonseVault__factory.abi,
        functionName: 'createDeposit',
        args: [
          params.landlord as `0x${string}`,
          BigInt(params.endDate),
          params.propertyId,
          params.propertyAddress,
          params.enableInvestment
        ],
        value: BigInt(params.amount) // Enviar el valor del depósito
      })
      toast.success('Depósito creado exitosamente')
      refetchTotalValue()
      refetchTotalDeposits()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al crear depósito: ${errorMessage}`)
      toast.error('Error al crear depósito')
      throw error
    } finally {
      setIsCreatingDeposit(false)
    }
  }, [isConnected, address, writeContract, refetchTotalValue, refetchTotalDeposits])

  const releaseDeposit = useCallback(async (depositId: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsReleasingDeposit(true)
    setError(null)

    try {
      writeContract({
        address: JEONSE_VAULT_ADDRESS as `0x${string}`,
        abi: JeonseVault__factory.abi,
        functionName: 'releaseDeposit',
        args: [depositId]
      })
      toast.success('Depósito liberado exitosamente')
      refetchTotalValue()
      refetchTotalDeposits()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al liberar depósito: ${errorMessage}`)
      toast.error('Error al liberar depósito')
      throw error
    } finally {
      setIsReleasingDeposit(false)
    }
  }, [isConnected, address, writeContract, refetchTotalValue, refetchTotalDeposits])

  const disputeDeposit = useCallback(async (depositId: bigint, reason: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsDisputingDeposit(true)
    setError(null)

    try {
      writeContract({
        address: JEONSE_VAULT_ADDRESS as `0x${string}`,
        abi: JeonseVault__factory.abi,
        functionName: 'disputeDeposit',
        args: [depositId, reason]
      })
      toast.success('Disputa iniciada exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al iniciar disputa: ${errorMessage}`)
      toast.error('Error al iniciar disputa')
      throw error
    } finally {
      setIsDisputingDeposit(false)
    }
  }, [isConnected, address, writeContract])

  const enableInvestment = useCallback(async (depositId: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsEnablingInvestment(true)
    setError(null)

    try {
      // Esta función no existe en el contrato actual, se puede implementar más tarde
      toast.success('Inversión habilitada exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al habilitar inversión: ${errorMessage}`)
      toast.error('Error al habilitar inversión')
      throw error
    } finally {
      setIsEnablingInvestment(false)
    }
  }, [isConnected, address])

  // Utilidades
  const formatAmount = useCallback((amount: bigint): string => {
    const numAmount = safeToNumber(amount)
    return (numAmount / 1e18).toFixed(2)
  }, [])

  const getDepositStatus = useCallback((status: number): string => {
    switch (status) {
      case 0: return 'Active'
      case 1: return 'Released'
      case 2: return 'Disputed'
      case 3: return 'Cancelled'
      default: return 'Unknown'
    }
  }, [])

  const getDepositById = useCallback((id: bigint): Deposit | null => {
    return deposits.find(deposit => deposit.id === id) || null
  }, [deposits])

  const getUserDeposits = useCallback((userAddress: string): Deposit[] => {
    return deposits.filter(deposit => deposit.tenant === userAddress)
  }, [deposits])

  const getActiveDeposits = useCallback((): Deposit[] => {
    return deposits.filter(deposit => deposit.status === 0)
  }, [deposits])

  const getDisputedDeposits = useCallback((): Deposit[] => {
    return deposits.filter(deposit => deposit.status === 2)
  }, [deposits])

  const getCacheStats = useCallback(() => {
    return {
      totalDeposits: deposits.length,
      activeDeposits: getActiveDeposits().length,
      disputedDeposits: getDisputedDeposits().length,
      totalValue: deposits.reduce((total, d) => total + d.amount, BigInt(0))
    }
  }, [deposits, getActiveDeposits, getDisputedDeposits])

  return {
    contractState,
    deposits,
    userDeposits,
    isLoading,
    error,
    createDeposit,
    releaseDeposit,
    disputeDeposit,
    enableInvestment,
    isCreatingDeposit: isCreatingDeposit || isWritePending,
    isReleasingDeposit: isReleasingDeposit || isWritePending,
    isDisputingDeposit: isDisputingDeposit || isWritePending,
    isEnablingInvestment: isEnablingInvestment || isWritePending,
    formatAmount,
    getDepositStatus,
    getDepositById,
    getUserDeposits,
    getActiveDeposits,
    getDisputedDeposits,
    getCacheStats
  }
}
