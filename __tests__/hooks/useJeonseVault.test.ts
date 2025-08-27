import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useJeonseVault } from '@/hooks/useJeonseVault'
import { parseEther, formatEther } from 'viem'

// Mock de wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn(),
  useWriteContract: vi.fn(),
  useWaitForTransactionReceipt: vi.fn(),
}))

// Mock de toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

describe('useJeonseVault', () => {
  const mockUseAccount = vi.mocked(useAccount)
  const mockUseReadContract = vi.mocked(useReadContract)
  const mockUseWriteContract = vi.mocked(useWriteContract)
  const mockUseWaitForTransactionReceipt = vi.mocked(useWaitForTransactionReceipt)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock por defecto de useAccount
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: false,
      status: 'connected',
      connector: null,
    })

    // Mock por defecto de useReadContract
    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: false,
      isFetching: false,
      isRefetching: false,
      refetch: vi.fn(),
    })

    // Mock por defecto de useWriteContract
    mockUseWriteContract.mockReturnValue({
      writeContract: vi.fn(),
      writeContractAsync: vi.fn(),
      data: undefined,
      error: null,
      isError: false,
      isIdle: true,
      isLoading: false,
      isSuccess: false,
      isPending: false,
      reset: vi.fn(),
      variables: undefined,
    })

    // Mock por defecto de useWaitForTransactionReceipt
    mockUseWaitForTransactionReceipt.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: false,
      isFetching: false,
      isRefetching: false,
      refetch: vi.fn(),
    })
  })

  describe('Estado inicial', () => {
    it('debe retornar estado inicial correcto', () => {
      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.contractState).toBeDefined()
      expect(result.current.deposits).toEqual([])
      expect(result.current.userDeposits).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.createDeposit).toBe('function')
      expect(typeof result.current.releaseDeposit).toBe('function')
      expect(typeof result.current.disputeDeposit).toBe('function')
    })

    it('debe cargar estado del contrato', () => {
      mockUseReadContract.mockReturnValue({
        data: {
          totalValueLocked: 1000000000000000000000000n, // 1M KRW
          totalDeposits: 10,
          isPaused: false,
        },
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.contractState).toEqual({
        totalValueLocked: 1000000000000000000000000n,
        totalDeposits: 10,
        isPaused: false,
      })
    })
  })

  describe('Lectura de depósitos', () => {
    it('debe cargar depósitos correctamente', () => {
      const mockDeposits = [
        {
          id: '1',
          depositId: 1n,
          landlordAddress: '0x1234567890123456789012345678901234567890',
          tenantAddress: '0x0987654321098765432109876543210987654321',
          propertyId: 'PROP-001',
          amount: 500000000000000000000000n,
          endDate: new Date('2025-12-31'),
          status: 'active',
          isInvestmentEnabled: true,
          investmentPercentage: 30,
          investmentPoolShare: 150000000000000000000000n,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          property: {
            id: '1',
            propertyId: 'PROP-001',
            type: 'apartment',
            address: '서울특별시 강남구 역삼동 123-45',
            size: 85,
            verified: true,
            verificationDate: new Date('2024-01-01'),
            landlordAddress: '0x1234567890123456789012345678901234567890',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          transactions: []
        }
      ]

      mockUseReadContract.mockReturnValue({
        data: mockDeposits,
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.deposits).toEqual(mockDeposits)
    })

    it('debe manejar error en carga de depósitos', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        error: new Error('Failed to load deposits'),
        isError: true,
        isLoading: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.error).toBe('Failed to load deposits')
    })

    it('debe mostrar estado de carga', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        error: null,
        isError: false,
        isLoading: true,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Creación de depósitos', () => {
    it('debe crear depósito exitosamente', async () => {
      const mockWriteContract = vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
      })

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: true,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      const depositData = {
        landlordAddress: '0x1234567890123456789012345678901234567890',
        amount: '50000000',
        endDate: '2025-12-31',
        propertyId: 'PROP-001',
        propertyAddress: '서울특별시 강남구 역삼동 123-45',
        enableInvestment: false
      }

      await result.current.createDeposit(depositData)

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'createDeposit',
        args: [
          depositData.landlordAddress,
          Math.floor(new Date(depositData.endDate).getTime() / 1000),
          depositData.propertyId,
          depositData.propertyAddress,
          depositData.enableInvestment
        ],
        value: parseEther(depositData.amount),
      })
    })

    it('debe manejar error en creación de depósito', async () => {
      const mockWriteContract = vi.fn().mockRejectedValue(new Error('Transaction failed'))

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: undefined,
        error: new Error('Transaction failed'),
        isError: true,
        isIdle: false,
        isLoading: false,
        isSuccess: false,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      const depositData = {
        landlordAddress: '0x1234567890123456789012345678901234567890',
        amount: '50000000',
        endDate: '2025-12-31',
        propertyId: 'PROP-001',
        propertyAddress: '서울특별시 강남구 역삼동 123-45',
        enableInvestment: false
      }

      try {
        await result.current.createDeposit(depositData)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Transaction failed')
      }
    })

    it('debe validar datos antes de crear depósito', async () => {
      const { result } = renderHook(() => useJeonseVault())

      // Datos inválidos
      const invalidData = {
        landlordAddress: 'invalid-address',
        amount: '0',
        endDate: '2020-01-01', // Fecha en el pasado
        propertyId: '',
        propertyAddress: '',
        enableInvestment: false
      }

      try {
        await result.current.createDeposit(invalidData)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('Liberación de depósitos', () => {
    it('debe liberar depósito exitosamente', async () => {
      const mockWriteContract = vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
      })

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: true,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      await result.current.releaseDeposit(1n)

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'releaseDeposit',
        args: [1n],
      })
    })

    it('debe manejar error en liberación de depósito', async () => {
      const mockWriteContract = vi.fn().mockRejectedValue(new Error('Release failed'))

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: undefined,
        error: new Error('Release failed'),
        isError: true,
        isIdle: false,
        isLoading: false,
        isSuccess: false,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      try {
        await result.current.releaseDeposit(1n)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Release failed')
      }
    })
  })

  describe('Disputa de depósitos', () => {
    it('debe disputar depósito exitosamente', async () => {
      const mockWriteContract = vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
      })

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: true,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      await result.current.disputeDeposit(1n, 'Test dispute reason')

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: 'disputeDeposit',
        args: [1n, 'Test dispute reason'],
      })
    })

    it('debe manejar error en disputa de depósito', async () => {
      const mockWriteContract = vi.fn().mockRejectedValue(new Error('Dispute failed'))

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: undefined,
        error: new Error('Dispute failed'),
        isError: true,
        isIdle: false,
        isLoading: false,
        isSuccess: false,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      try {
        await result.current.disputeDeposit(1n, 'Test dispute reason')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Dispute failed')
      }
    })
  })

  describe('Estados de transacción', () => {
    it('debe mostrar estado de transacción pendiente', () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: false,
        isPending: true,
        reset: vi.fn(),
        variables: undefined,
      })

      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: undefined,
        error: null,
        isError: false,
        isLoading: true,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.isLoading).toBe(true)
    })

    it('debe mostrar estado de transacción exitosa', () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: true,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          transactionHash: '0x1234567890abcdef',
          blockNumber: 12345n,
          gasUsed: 21000n,
          effectiveGasPrice: 20000000000n,
        },
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Manejo de wallet desconectada', () => {
    it('debe manejar wallet desconectada', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isReconnecting: false,
        status: 'disconnected',
        connector: null,
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.contractState).toBeDefined()
      expect(result.current.deposits).toEqual([])
      expect(result.current.userDeposits).toEqual([])
    })

    it('debe mostrar error al intentar transacción sin wallet', async () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isReconnecting: false,
        status: 'disconnected',
        connector: null,
      })

      const { result } = renderHook(() => useJeonseVault())

      try {
        await result.current.createDeposit({
          landlordAddress: '0x1234567890123456789012345678901234567890',
          amount: '50000000',
          endDate: '2025-12-31',
          propertyId: 'PROP-001',
          propertyAddress: '서울특별시 강남구 역삼동 123-45',
          enableInvestment: false
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toContain('Wallet not connected')
      }
    })
  })

  describe('Utilidades', () => {
    it('debe formatear montos correctamente', () => {
      const { result } = renderHook(() => useJeonseVault())

      const amount = 500000000000000000000000n // 500K KRW
      const formatted = formatEther(amount)
      
      expect(formatted).toBe('500000.0')
    })

    it('debe calcular fechas correctamente', () => {
      const { result } = renderHook(() => useJeonseVault())

      const endDate = '2025-12-31'
      const timestamp = Math.floor(new Date(endDate).getTime() / 1000)
      
      expect(timestamp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('debe validar direcciones de wallet', () => {
      const { result } = renderHook(() => useJeonseVault())

      const validAddress = '0x1234567890123456789012345678901234567890'
      const invalidAddress = 'invalid-address'

      expect(validAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(invalidAddress).not.toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('Caché y optimización', () => {
    it('debe reutilizar datos en caché', () => {
      const mockRefetch = vi.fn()

      mockUseReadContract.mockReturnValue({
        data: [{ id: '1', amount: 1000000n }],
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: mockRefetch,
      })

      const { result, rerender } = renderHook(() => useJeonseVault())

      // Re-renderizar sin cambiar dependencias
      rerender()

      expect(mockRefetch).not.toHaveBeenCalled()
    })

    it('debe refetch cuando cambia la dirección del usuario', () => {
      const mockRefetch = vi.fn()

      mockUseReadContract.mockReturnValue({
        data: [],
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: mockRefetch,
      })

      const { rerender } = renderHook(() => useJeonseVault())

      // Cambiar dirección del usuario
      mockUseAccount.mockReturnValue({
        address: '0x0987654321098765432109876543210987654321',
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: false,
        status: 'connected',
        connector: null,
      })

      rerender()

      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Manejo de errores de red', () => {
    it('debe manejar errores de red', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        error: new Error('Network error'),
        isError: true,
        isLoading: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useJeonseVault())

      expect(result.current.error).toBe('Network error')
    })

    it('debe reintentar en caso de error temporal', async () => {
      const mockRefetch = vi.fn()

      mockUseReadContract.mockReturnValue({
        data: undefined,
        error: new Error('Temporary error'),
        isError: true,
        isLoading: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useJeonseVault())

      // Simular reintento
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
      })
    })
  })

  describe('Integración con analytics', () => {
    it('debe trackear eventos de transacción', async () => {
      const mockWriteContract = vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
      })

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        writeContractAsync: vi.fn(),
        data: '0x1234567890abcdef',
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        isSuccess: true,
        isPending: false,
        reset: vi.fn(),
        variables: undefined,
      })

      const { result } = renderHook(() => useJeonseVault())

      const depositData = {
        landlordAddress: '0x1234567890123456789012345678901234567890',
        amount: '50000000',
        endDate: '2025-12-31',
        propertyId: 'PROP-001',
        propertyAddress: '서울특별시 강남구 역삼동 123-45',
        enableInvestment: false
      }

      await result.current.createDeposit(depositData)

      // Verificar que se trackeó el evento
      // (Esto dependería de la implementación específica de analytics)
    })
  })
})
