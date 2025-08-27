'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useContractRead, useWriteContract, useTransaction } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { PropertyOracle__factory } from '@/typechain-types'
import { safeToBigInt, safeToNumber } from '../lib/polyfill-loader'

// Tipos para el hook
export interface PropertyData {
  propertyId: string
  fullAddress: string
  owner: string
  marketValue: bigint
  lastValuation: bigint
  isVerified: boolean
  isActive: boolean
  lastInspection: bigint
  propertyType: number // PropertyType enum
  createdAt: bigint
  updatedAt: bigint
}

export enum PropertyType {
  Apartment = 0,
  House = 1,
  Officetel = 2,
  Villa = 3,
  Commercial = 4,
  Land = 5
}

export interface PropertyOracleStats {
  totalProperties: bigint
  verifiedProperties: bigint
  totalValue: bigint
  averageValue: bigint
}

export interface RegisterPropertyParams {
  propertyId: string
  fullAddress: string
  owner: string
  marketValue: string // en ether
  propertyType: PropertyType
}

export interface VerifyPropertyParams {
  propertyId: string
  verificationData: string
  inspectorAddress: string
}

export interface UsePropertyOracleReturn {
  // Estado
  properties: PropertyData[]
  oracleStats: PropertyOracleStats | null
  isLoading: boolean
  error: string | null
  
  // Funciones
  registerProperty: (params: RegisterPropertyParams) => Promise<void>
  verifyProperty: (params: VerifyPropertyParams) => Promise<void>
  updatePropertyValue: (propertyId: string, newValue: string) => Promise<void>
  
  // Estados de transacción
  isRegistering: boolean
  isVerifying: boolean
  isUpdating: boolean
  
  // Utilidades
  getPropertyById: (propertyId: string) => PropertyData | null
  getPropertiesByOwner: (owner: string) => PropertyData[]
  getVerifiedProperties: () => PropertyData[]
  formatPropertyValue: (value: bigint) => string
  getPropertyTypeName: (type: PropertyType) => string
}

export function usePropertyOracle(): UsePropertyOracleReturn {
  const { address, isConnected } = useAccount()
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [oracleStats, setOracleStats] = useState<PropertyOracleStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Contract reads
  const { data: totalProperties, refetch: refetchTotalProperties } = useContractRead({
    address: CONTRACT_ADDRESSES.PROPERTY_ORACLE as `0x${string}`,
    abi: PropertyOracle__factory.abi,
    functionName: 'getAllProperties',
  })

  const { data: verifiedProperties, refetch: refetchVerifiedProperties } = useContractRead({
    address: CONTRACT_ADDRESSES.PROPERTY_ORACLE as `0x${string}`,
    abi: PropertyOracle__factory.abi,
    functionName: 'getVerifiedPropertyCount',
  })

  // Contract writes
  const { writeContract: writeContract, isPending: isWritePending } = useWriteContract()

  // Cargar propiedades desde el contrato
  const loadProperties = useCallback(async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // En una implementación real, necesitarías eventos o un mapping para obtener todas las propiedades
      // Por ahora, usamos las propiedades de prueba que se configuraron durante el deployment
      const testProperties: PropertyData[] = [
        {
          propertyId: 'demo-property-001',
          fullAddress: '서울특별시 강남구 역삼동 101호',
          owner: address || '0x0000000000000000000000000000000000000000',
          marketValue: BigInt('500000000000000000000000000'), // 500M KRW
          lastValuation: BigInt('500000000000000000000000000'),
          isVerified: true,
          isActive: true,
          lastInspection: BigInt(Math.floor(Date.now() / 1000)),
          propertyType: PropertyType.Apartment,
          createdAt: BigInt(Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60),
          updatedAt: BigInt(Math.floor(Date.now() / 1000))
        },
        {
          propertyId: 'demo-property-002',
          fullAddress: '서울특별시 서초구 서초동 202호',
          owner: address || '0x0000000000000000000000000000000000000000',
          marketValue: BigInt('800000000000000000000000000'), // 800M KRW
          lastValuation: BigInt('800000000000000000000000000'),
          isVerified: true,
          isActive: true,
          lastInspection: BigInt(Math.floor(Date.now() / 1000)),
          propertyType: PropertyType.Apartment,
          createdAt: BigInt(Math.floor(Date.now() / 1000) - 180 * 24 * 60 * 60),
          updatedAt: BigInt(Math.floor(Date.now() / 1000))
        },
        {
          propertyId: 'demo-property-003',
          fullAddress: '서울특별시 마포구 합정동 303호',
          owner: address || '0x0000000000000000000000000000000000000000',
          marketValue: BigInt('300000000000000000000000000'), // 300M KRW
          lastValuation: BigInt('300000000000000000000000000'),
          isVerified: true,
          isActive: true,
          lastInspection: BigInt(Math.floor(Date.now() / 1000)),
          propertyType: PropertyType.House,
          createdAt: BigInt(Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60),
          updatedAt: BigInt(Math.floor(Date.now() / 1000))
        }
      ]

      setProperties(testProperties)
      
      // Calcular estadísticas usando datos del contrato
      const stats: PropertyOracleStats = {
        totalProperties: typeof totalProperties === 'bigint' ? totalProperties : BigInt(testProperties.length),
        verifiedProperties: typeof verifiedProperties === 'bigint' ? verifiedProperties : BigInt(testProperties.filter(p => p.isVerified).length),
        totalValue: testProperties.reduce((total, p) => total + p.marketValue, BigInt(0)),
        averageValue: testProperties.length > 0 
          ? testProperties.reduce((total, p) => total + p.marketValue, BigInt(0)) / BigInt(testProperties.length)
          : BigInt(0)
      }
      setOracleStats(stats)
    } catch (err) {
      setError('Error al cargar propiedades')
      console.error('Error loading properties:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, totalProperties, verifiedProperties])

  // Cargar propiedades cuando se conecte la wallet
  useEffect(() => {
    if (isConnected) {
      loadProperties()
    }
  }, [isConnected, loadProperties])

  // Funciones reales del contrato
  const registerProperty = useCallback(async (params: RegisterPropertyParams) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsRegistering(true)
    setError(null)

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_ORACLE as `0x${string}`,
        abi: PropertyOracle__factory.abi,
        functionName: 'registerProperty',
        args: [
          params.propertyId,
          params.fullAddress,
          params.owner as `0x${string}`,
          BigInt(params.marketValue),
          params.propertyType
        ]
      })
      toast.success('Propiedad registrada exitosamente')
      refetchTotalProperties()
      refetchVerifiedProperties()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al registrar propiedad: ${errorMessage}`)
      toast.error('Error al registrar propiedad')
      throw error
    } finally {
      setIsRegistering(false)
    }
  }, [isConnected, address, writeContract, refetchTotalProperties, refetchVerifiedProperties])

  const verifyProperty = useCallback(async (params: VerifyPropertyParams) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsVerifying(true)
    setError(null)

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_ORACLE as `0x${string}`,
        abi: PropertyOracle__factory.abi,
        functionName: 'verifyProperty',
        args: [params.propertyId]
      })
      toast.success('Propiedad verificada exitosamente')
      refetchVerifiedProperties()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al verificar propiedad: ${errorMessage}`)
      toast.error('Error al verificar propiedad')
      throw error
    } finally {
      setIsVerifying(false)
    }
  }, [isConnected, address, writeContract, refetchVerifiedProperties])

  const updatePropertyValue = useCallback(async (propertyId: string, newValue: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet no conectada')
    }

    setIsUpdating(true)
    setError(null)

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_ORACLE as `0x${string}`,
        abi: PropertyOracle__factory.abi,
        functionName: 'updatePropertyValue',
        args: [propertyId, BigInt(newValue)]
      })
      toast.success('Valor de propiedad actualizado exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al actualizar valor de propiedad: ${errorMessage}`)
      toast.error('Error al actualizar valor de propiedad')
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [isConnected, address, writeContract])

  // Utilidades
  const getPropertyById = useCallback((propertyId: string): PropertyData | null => {
    return properties.find(property => property.propertyId === propertyId) || null
  }, [properties])

  const getPropertiesByOwner = useCallback((owner: string): PropertyData[] => {
    return properties.filter(property => property.owner === owner)
  }, [properties])

  const getVerifiedProperties = useCallback((): PropertyData[] => {
    return properties.filter(property => property.isVerified)
  }, [properties])

  const formatPropertyValue = useCallback((value: bigint): string => {
    const numValue = safeToNumber(value)
    return (numValue / 1e18).toFixed(0)
  }, [])

  const getPropertyTypeName = useCallback((type: PropertyType): string => {
    const typeNames = {
      [PropertyType.Apartment]: 'Apartamento',
      [PropertyType.House]: 'Casa',
      [PropertyType.Officetel]: 'Oficetel',
      [PropertyType.Villa]: 'Villa',
      [PropertyType.Commercial]: 'Comercial',
      [PropertyType.Land]: 'Terreno'
    }
    return typeNames[type] || 'Desconocido'
  }, [])

  return {
    properties,
    oracleStats,
    isLoading,
    error,
    registerProperty,
    verifyProperty,
    updatePropertyValue,
    isRegistering: isRegistering || isWritePending,
    isVerifying: isVerifying || isWritePending,
    isUpdating: isUpdating || isWritePending,
    getPropertyById,
    getPropertiesByOwner,
    getVerifiedProperties,
    formatPropertyValue,
    getPropertyTypeName
  }
}
