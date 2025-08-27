'use client'

import { useMemo } from 'react'
import { useJeonseVault } from './useJeonseVault'
import { useInvestmentPool } from './useInvestmentPool'
import { useDeposits } from './useDeposits'
import { usePropertyOracle } from './usePropertyOracle'
import { useCompliance } from './useCompliance'
import { useKaiaGasless } from './useKaiaGasless'
import { useUserProfile } from './useUserProfile'
import { safeToBigInt, safeToNumber } from '../lib/polyfill-loader'

export interface UseWeb3Return {
  // Contract Hooks
  jeonseVault: ReturnType<typeof useJeonseVault>
  investmentPool: ReturnType<typeof useInvestmentPool>
  deposits: ReturnType<typeof useDeposits>
  propertyOracle: ReturnType<typeof usePropertyOracle>
  compliance: ReturnType<typeof useCompliance>
  gasless: ReturnType<typeof useKaiaGasless>
  userProfile: ReturnType<typeof useUserProfile>
  
  // Utility Functions
  formatBalance: (balance: bigint) => string
  formatAddress: (address: string) => string
  isContractDeployed: boolean
  isLoading: boolean
  error: string | null
}

export function useWeb3(): UseWeb3Return {
  // Contract hooks
  const jeonseVault = useJeonseVault()
  const investmentPool = useInvestmentPool()
  const deposits = useDeposits()
  const propertyOracle = usePropertyOracle()
  const compliance = useCompliance()
  const gasless = useKaiaGasless()
  const userProfile = useUserProfile()

  const formatBalance = (balance: bigint): string => {
    const numBalance = safeToNumber(balance)
    return (numBalance / 1e18).toFixed(4)
  }

  const formatAddress = (address: string): string => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Check if contracts are deployed
  const isContractDeployed = useMemo(() => {
    return !!(
      process.env.NEXT_PUBLIC_JEONSE_VAULT_ADDRESS &&
      process.env.NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS &&
      process.env.NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS
    )
  }, [])

  // Loading state
  const isLoading = useMemo(() => {
    return (
      jeonseVault.isLoading ||
      investmentPool.isLoading ||
      deposits.isLoading ||
      propertyOracle.isLoading ||
      compliance.isLoading ||
      userProfile.isLoading
    )
  }, [
    jeonseVault.isLoading,
    investmentPool.isLoading,
    deposits.isLoading,
    propertyOracle.isLoading,
    compliance.isLoading,
    userProfile.isLoading
  ])

  // Error state
  const error = useMemo(() => {
    return (
      jeonseVault.error ||
      investmentPool.error ||
      deposits.error ||
      propertyOracle.error ||
      compliance.error ||
      userProfile.error
    )
  }, [
    jeonseVault.error,
    investmentPool.error,
    deposits.error,
    propertyOracle.error,
    compliance.error,
    userProfile.error
  ])

  return {
    // Contract Hooks
    jeonseVault,
    investmentPool,
    deposits,
    propertyOracle,
    compliance,
    gasless,
    userProfile,
    
    // Utility Functions
    formatBalance,
    formatAddress,
    isContractDeployed,
    isLoading,
    error,
  }
}
