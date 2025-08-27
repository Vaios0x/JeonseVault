'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { 
  JeonseVault__factory, 
  InvestmentPool__factory, 
  PropertyOracle__factory, 
  ComplianceModule__factory 
} from '@/typechain-types'

// Constante para transacciones demo
const DEMO_TRANSACTION_VALUE = BigInt('10000000000000000000') // 10 Kaia testnet

export interface UseDemoTransactionsReturn {
  // Estados
  isProcessing: boolean
  error: string | null
  
  // Funciones de transacciones demo
  createDepositDemo: (params: CreateDepositDemoParams) => Promise<void>
  investInPoolDemo: (depositId: bigint) => Promise<void>
  withdrawInvestmentDemo: (depositId: bigint) => Promise<void>
  registerPropertyDemo: (params: RegisterPropertyDemoParams) => Promise<void>
  verifyPropertyDemo: (propertyId: string) => Promise<void>
  verifyUserDemo: (params: VerifyUserDemoParams) => Promise<void>
  
  // Utilidades
  formatDemoValue: () => string
  getDemoTransactionHash: () => string
}

export interface CreateDepositDemoParams {
  landlord: string
  endDate: number
  propertyId: string
  propertyAddress: string
  enableInvestment: boolean
}

export interface RegisterPropertyDemoParams {
  propertyId: string
  fullAddress: string
  owner: string
  marketValue: string
  propertyType: number
}

export interface VerifyUserDemoParams {
  realName: string
  idNumber: string
  bankAccount: string
  level: number
}

export function useDemoTransactions(): UseDemoTransactionsReturn {
  const { address, isConnected } = useAccount()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { writeContract, isPending } = useWriteContract()

  // Función para simular transacción demo
  const simulateDemoTransaction = useCallback(async (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value?: bigint
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Simular delay de transacción
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Ejecutar transacción demo
      writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName,
        args,
        value: value || DEMO_TRANSACTION_VALUE
      })

      toast.success('Transacción demo ejecutada exitosamente')
      
      // Simular hash de transacción
      const demoHash = `0x${Math.random().toString(16).substring(2, 66)}`
      console.log('Demo transaction hash:', demoHash)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error en transacción demo: ${errorMessage}`)
      toast.error('Error en transacción demo')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, address, writeContract])

  // Crear depósito demo
  const createDepositDemo = useCallback(async (params: CreateDepositDemoParams) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.JEONSE_VAULT,
      JeonseVault__factory.abi,
      'createDeposit',
      [
        params.landlord as `0x${string}`,
        BigInt(params.endDate),
        params.propertyId,
        params.propertyAddress,
        params.enableInvestment
      ],
      DEMO_TRANSACTION_VALUE
    )
  }, [simulateDemoTransaction])

  // Invertir en pool demo
  const investInPoolDemo = useCallback(async (depositId: bigint) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.INVESTMENT_POOL,
      InvestmentPool__factory.abi,
      'investInDeposit',
      [depositId],
      DEMO_TRANSACTION_VALUE
    )
  }, [simulateDemoTransaction])

  // Retirar inversión demo
  const withdrawInvestmentDemo = useCallback(async (depositId: bigint) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.INVESTMENT_POOL,
      InvestmentPool__factory.abi,
      'withdrawFromDeposit',
      [depositId, BigInt(1000000)], // 1M shares demo
      BigInt(0) // Sin valor para retiro
    )
  }, [simulateDemoTransaction])

  // Registrar propiedad demo
  const registerPropertyDemo = useCallback(async (params: RegisterPropertyDemoParams) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.PROPERTY_ORACLE,
      PropertyOracle__factory.abi,
      'registerProperty',
      [
        params.propertyId,
        params.fullAddress,
        params.owner as `0x${string}`,
        BigInt(params.marketValue),
        params.propertyType
      ],
      BigInt(0) // Sin valor para registro
    )
  }, [simulateDemoTransaction])

  // Verificar propiedad demo
  const verifyPropertyDemo = useCallback(async (propertyId: string) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.PROPERTY_ORACLE,
      PropertyOracle__factory.abi,
      'verifyProperty',
      [propertyId],
      BigInt(0) // Sin valor para verificación
    )
  }, [simulateDemoTransaction])

  // Verificar usuario demo
  const verifyUserDemo = useCallback(async (params: VerifyUserDemoParams) => {
    await simulateDemoTransaction(
      CONTRACT_ADDRESSES.COMPLIANCE_MODULE,
      ComplianceModule__factory.abi,
      'verifyUser',
      [
        address as `0x${string}`,
        params.realName,
        params.idNumber,
        params.bankAccount,
        params.level
      ],
      BigInt(0) // Sin valor para verificación
    )
  }, [simulateDemoTransaction, address])

  // Utilidades
  const formatDemoValue = useCallback(() => {
    return '10 Kaia testnet'
  }, [])

  const getDemoTransactionHash = useCallback(() => {
    return `0x${Math.random().toString(16).substring(2, 66)}`
  }, [])

  return {
    // Estados
    isProcessing: isProcessing || isPending,
    error,
    
    // Funciones de transacciones demo
    createDepositDemo,
    investInPoolDemo,
    withdrawInvestmentDemo,
    registerPropertyDemo,
    verifyPropertyDemo,
    verifyUserDemo,
    
    // Utilidades
    formatDemoValue,
    getDemoTransactionHash
  }
}
