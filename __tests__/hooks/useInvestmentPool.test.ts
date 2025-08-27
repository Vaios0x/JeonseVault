import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useInvestmentPool } from '@/hooks/useInvestmentPool'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'react-hot-toast'

// Mock de wagmi
const mockUseAccount = useAccount as vi.MockedFunction<typeof useAccount>
const mockUseReadContract = useReadContract as vi.MockedFunction<typeof useReadContract>
const mockUseWriteContract = useWriteContract as vi.MockedFunction<typeof useWriteContract>
const mockUseWaitForTransactionReceipt = useWaitForTransactionReceipt as vi.MockedFunction<typeof useWaitForTransactionReceipt>

// Mock de react-hot-toast
const mockToast = toast as vi.MockedFunction<typeof toast>

describe('useInvestmentPool', () => {
  const defaultAccountState = {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
  }

  const defaultPoolData = {
    totalAmount: BigInt('1000000000000000000000'), // 1000 KAIA
    availableAmount: BigInt('500000000000000000000'), // 500 KAIA
    totalInvested: BigInt('500000000000000000000'), // 500 KAIA
    expectedReturn: BigInt('60000000000000000000'), // 60 KAIA (6%)
    actualReturn: BigInt('55000000000000000000'), // 55 KAIA
    startDate: BigInt('1704067200'), // 2024-01-01
    endDate: BigInt('1735689600'), // 2024-12-31
    isActive: true,
  }

  const defaultUserInvestments = [
    BigInt('1'), // Pool ID 1
    BigInt('2'), // Pool ID 2
  ]

  const defaultPoolStats = {
    totalPoolValue: BigInt('1500000000000000000000'), // 1500 KAIA
    totalShares: BigInt('15000000000000000000'),
    totalInvestors: BigInt('40'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock de useAccount
    mockUseAccount.mockReturnValue(defaultAccountState)
    
    // Mock de useReadContract para diferentes funciones
    mockUseReadContract.mockImplementation((config) => {
      if (config.functionName === 'getTotalPoolStats') {
        return {
          data: defaultPoolStats,
          isLoading: false,
          error: null,
        }
      }
      
      if (config.functionName === 'getUserInvestments') {
        return {
          data: defaultUserInvestments,
          isLoading: false,
          error: null,
        }
      }
      
      if (config.functionName === 'getDepositPool') {
        return {
          data: defaultPoolData,
          isLoading: false,
          error: null,
        }
      }
      
      return {
        data: null,
        isLoading: false,
        error: null,
      }
    })
    
    // Mock de useWriteContract
    mockUseWriteContract.mockReturnValue({
      writeContract: vi.fn(),
      data: null,
      isLoading: false,
      error: null,
    })
    
    // Mock de useWaitForTransactionReceipt
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      error: null,
    })
    
    // Mock de toast
    mockToast.success = vi.fn()
    mockToast.error = vi.fn()
    mockToast.warning = vi.fn()
  })

  describe('Estado inicial', () => {
    it('debe retornar estado inicial correcto', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.pools).toEqual([])
      expect(result.current.userInvestments).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.investInPool).toBe('function')
      expect(typeof result.current.withdrawFromPool).toBe('function')
    })

    it('debe cargar pools cuando está conectado', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2)
      })
    })

    it('debe cargar inversiones del usuario cuando está conectado', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.userInvestments).toHaveLength(2)
      })
    })
  })

  describe('Carga de datos', () => {
    it('debe cargar estadísticas del pool', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.poolStats).toEqual({
          totalPoolValue: BigInt('1500000000000000000000'),
          totalShares: BigInt('15000000000000000000'),
          totalInvestors: BigInt('40'),
        })
      })
    })

    it('debe manejar errores de carga', async () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Error de red'),
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.error).toBe('Error de red')
      })
    })

    it('debe mostrar estado de carga', () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Inversión en pools', () => {
    it('debe permitir invertir en un pool', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('100000000000000000000'), // 100 KAIA
        })
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'investInDeposit',
        args: ['1'],
        value: BigInt('100000000000000000000'),
      })
    })

    it('debe validar monto mínimo de inversión', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('10000000000000000000'), // 10 KAIA (menos del mínimo)
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('Monto mínimo de inversión es 50 KAIA')
    })

    it('debe validar monto máximo de inversión', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('10000000000000000000000'), // 10000 KAIA (más del máximo)
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('Monto máximo de inversión es 1000 KAIA')
    })

    it('debe validar que el pool esté activo', async () => {
      mockUseReadContract.mockImplementation((config) => {
        if (config.functionName === 'getDepositPool') {
          return {
            data: { ...defaultPoolData, isActive: false },
            isLoading: false,
            error: null,
          }
        }
        return { data: null, isLoading: false, error: null }
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('100000000000000000000'),
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('El pool no está activo')
    })

    it('debe validar fondos suficientes', async () => {
      mockUseAccount.mockReturnValue({
        ...defaultAccountState,
        address: '0x1234567890123456789012345678901234567890',
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('1000000000000000000000'), // 1000 KAIA (más del balance)
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('Fondos insuficientes')
    })
  })

  describe('Retiro de pools', () => {
    it('debe permitir retirar de un pool', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.withdrawFromPool('1', {
          amount: BigInt('50000000000000000000'), // 50 KAIA
        })
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'withdrawFromDeposit',
        args: ['1', BigInt('50000000000000000000')],
      })
    })

    it('debe validar que el usuario tenga inversión en el pool', async () => {
      mockUseReadContract.mockImplementation((config) => {
        if (config.functionName === 'getUserInvestments') {
          return {
            data: [], // Sin inversiones
            isLoading: false,
            error: null,
          }
        }
        return { data: null, isLoading: false, error: null }
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.withdrawFromPool('1', {
          amount: BigInt('50000000000000000000'),
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('No tienes inversión en este pool')
    })

    it('debe validar monto de retiro', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.withdrawFromPool('1', {
          amount: BigInt('0'),
        })
      })
      
      expect(mockToast.error).toHaveBeenCalledWith('Monto de retiro debe ser mayor a 0')
    })
  })

  describe('Gestión de transacciones', () => {
    it('debe mostrar loading durante transacción', async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: '0x1234567890abcdef',
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.isLoading).toBe(true)
    })

    it('debe manejar éxito de transacción', async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: '0x1234567890abcdef',
        isLoading: false,
        error: null,
      })

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Transacción completada exitosamente')
      })
    })

    it('debe manejar error de transacción', async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: null,
        isLoading: false,
        error: new Error('Error de transacción'),
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Error de transacción')
      })
    })
  })

  describe('Cálculos de retornos', () => {
    it('debe calcular retorno esperado correctamente', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const expectedReturn = result.current.calculateExpectedReturn(
        BigInt('100000000000000000000'), // 100 KAIA
        6, // 6% anual
        12 // 12 meses
      )
      
      expect(expectedReturn).toBe(BigInt('6000000000000000000')) // 6 KAIA
    })

    it('debe calcular retorno real correctamente', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const actualReturn = result.current.calculateActualReturn(
        BigInt('100000000000000000000'), // 100 KAIA
        BigInt('5500000000000000000'), // 5.5 KAIA
        12 // 12 meses
      )
      
      expect(actualReturn).toBe(BigInt('5500000000000000000')) // 5.5 KAIA
    })

    it('debe calcular porcentaje de retorno', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const returnPercentage = result.current.calculateReturnPercentage(
        BigInt('100000000000000000000'), // 100 KAIA
        BigInt('6000000000000000000') // 6 KAIA
      )
      
      expect(returnPercentage).toBe(6.0) // 6%
    })
  })

  describe('Filtros y búsqueda', () => {
    it('debe filtrar pools por categoría', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const filteredPools = result.current.filterPoolsByCategory('Premium')
      
      expect(filteredPools).toHaveLength(1)
      expect(filteredPools[0].category).toBe('Premium')
    })

    it('debe filtrar pools por nivel de riesgo', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const filteredPools = result.current.filterPoolsByRisk('Low')
      
      expect(filteredPools).toHaveLength(1)
      expect(filteredPools[0].riskLevel).toBe('Low')
    })

    it('debe buscar pools por nombre', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const searchResults = result.current.searchPools('Premium')
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].name).toContain('Premium')
    })
  })

  describe('Validaciones', () => {
    it('debe validar dirección de wallet', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const isValid = result.current.validateWalletAddress('0x1234567890123456789012345678901234567890')
      expect(isValid).toBe(true)
      
      const isInvalid = result.current.validateWalletAddress('invalid-address')
      expect(isInvalid).toBe(false)
    })

    it('debe validar monto de inversión', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const isValid = result.current.validateInvestmentAmount(BigInt('100000000000000000000')) // 100 KAIA
      expect(isValid).toBe(true)
      
      const isInvalid = result.current.validateInvestmentAmount(BigInt('10000000000000000000')) // 10 KAIA
      expect(isInvalid).toBe(false)
    })

    it('debe validar pool ID', () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      const isValid = result.current.validatePoolId('1')
      expect(isValid).toBe(true)
      
      const isInvalid = result.current.validatePoolId('')
      expect(isInvalid).toBe(false)
    })
  })

  describe('Estados de error', () => {
    it('debe manejar error de red', async () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })
    })

    it('debe manejar error de contrato', async () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Contract error'),
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.error).toBe('Contract error')
      })
    })

    it('debe limpiar error al reconectar', async () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Simular reconexión
      mockUseReadContract.mockReturnValue({
        data: defaultPoolData,
        isLoading: false,
        error: null,
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Performance', () => {
    it('debe cachear datos de pools', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      // Primera carga
      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2)
      })

      // Segunda carga (debe usar cache)
      const startTime = Date.now()
      await waitFor(() => {
        expect(result.current.pools).toHaveLength(2)
      })
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100) // Debe ser rápido
    })

    it('debe evitar re-renders innecesarios', () => {
      const { result, rerender } = renderHook(() => useInvestmentPool())
      
      const initialPools = result.current.pools
      
      rerender()
      
      expect(result.current.pools).toBe(initialPools) // Misma referencia
    })
  })

  describe('Testing de integración', () => {
    it('debe integrarse con el sistema de analytics', async () => {
      const mockAnalytics = {
        trackEvent: vi.fn(),
      }
      vi.mocked(require('@/services/AnalyticsService').analyticsService).trackEvent = mockAnalytics.trackEvent

      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('100000000000000000000'),
        })
      })
      
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith({
        eventName: 'investment_made',
        properties: {
          poolId: '1',
          amount: '100',
          currency: 'KAIA',
        },
      })
    })

    it('debe integrarse con el sistema de notificaciones', async () => {
      const { result } = renderHook(() => useInvestmentPool())
      
      await act(async () => {
        await result.current.investInPool('1', {
          amount: BigInt('100000000000000000000'),
        })
      })
      
      expect(mockToast.success).toHaveBeenCalledWith('Inversión realizada exitosamente')
    })
  })

  describe('Casos edge', () => {
    it('debe manejar wallet desconectado', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.pools).toEqual([])
      expect(result.current.userInvestments).toEqual([])
    })

    it('debe manejar datos nulos del contrato', () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.pools).toEqual([])
      expect(result.current.poolStats).toBeNull()
    })

    it('debe manejar errores de formato de datos', () => {
      mockUseReadContract.mockReturnValue({
        data: 'invalid-data',
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useInvestmentPool())
      
      expect(result.current.error).toContain('Error de formato de datos')
    })
  })
})
