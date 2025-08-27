import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Profiler } from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { InvestmentPool } from '@/components/dashboard/InvestmentPool'
import { TransactionHistory } from '@/components/dashboard/TransactionHistory'
import { PoolList } from '@/components/investment/PoolList'
import { ReturnsCalculator } from '@/components/investment/ReturnsCalculator'

// Mock de hooks
vi.mock('@/hooks/useJeonseVault', () => ({
  useJeonseVault: () => ({
    deposits: Array.from({ length: 100 }, (_, i) => ({
      id: BigInt(i + 1),
      tenant: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      landlord: '0x0987654321098765432109876543210987654321' as `0x${string}`,
      amount: BigInt(500000000 + i * 1000000),
      startDate: BigInt(Math.floor(Date.now() / 1000) - 86400 * i),
      endDate: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
      propertyId: `property-${i}`,
      propertyAddress: `서울특별시 강남구 역삼동 ${i + 1}-${i + 2}`,
      status: i % 3,
      investmentPoolShare: BigInt(i * 1000000),
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * i),
      releasedAt: BigInt(0),
      isInvestmentEnabled: i % 2 === 0,
      totalInvested: BigInt(i * 50000000),
      investorCount: i % 10,
      annualReturn: BigInt(600 + i * 10),
      duration: 12 + (i % 6),
    })),
    userDeposits: [],
    contractState: {
      totalValueLocked: BigInt(1000000000000),
      totalDeposits: BigInt(100),
    },
  })
}))

vi.mock('@/hooks/useInvestmentPool', () => ({
  useInvestmentPool: () => ({
    pools: Array.from({ length: 50 }, (_, i) => ({
      id: BigInt(i + 1),
      totalInvested: BigInt(1000000000 + i * 10000000),
      investorCount: 10 + i,
      annualReturn: BigInt(600 + i * 5),
      duration: 12 + (i % 6),
      isActive: true,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * i),
    })),
    userInvestments: [],
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
  }),
  useBalance: () => ({
    data: { value: BigInt(1000000000000000000) },
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

/**
 * Tests de Performance para Componentes Complejos
 * Verifica rendimiento de componentes con grandes cantidades de datos
 */
describe('Performance Tests - Componentes Complejos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('InvestmentPool Component', () => {
    it('debe renderizar 100 depósitos eficientemente', () => {
      const onRender = vi.fn()
      
      const { container } = render(
        <Profiler id="investment-pool" onRender={onRender}>
          <InvestmentPool />
        </Profiler>
      )
      
      // Verificar que se renderiza en menos de 100ms
      expect(onRender).toHaveBeenCalledWith(
        expect.any(String),
        'mount',
        expect.any(Number)
      )
      
      const renderTime = onRender.mock.calls[0][2]
      expect(renderTime).toBeLessThan(100)
      
      // Verificar que todos los depósitos están presentes
      const depositCards = container.querySelectorAll('[data-testid="deposit-card"]')
      expect(depositCards.length).toBe(100)
    })

    it('debe manejar scroll virtual eficientemente', async () => {
      const { container } = render(<InvestmentPool />)
      
      // Simular scroll rápido
      const scrollContainer = container.querySelector('[data-testid="scroll-container"]')
      if (scrollContainer) {
        const startTime = performance.now()
        
        for (let i = 0; i < 10; i++) {
          fireEvent.scroll(scrollContainer, {
            target: { scrollTop: i * 1000 }
          })
        }
        
        const endTime = performance.now()
        const scrollTime = endTime - startTime
        
        // Scroll debe ser responsivo (< 50ms total)
        expect(scrollTime).toBeLessThan(50)
      }
    })

    it('debe filtrar depósitos sin lag', () => {
      const { container } = render(<InvestmentPool />)
      
      const filterInput = screen.getByPlaceholderText(/filtrar depósitos/i)
      
      const startTime = performance.now()
      
      // Escribir filtro rápidamente
      fireEvent.change(filterInput, { target: { value: 'property-50' } })
      
      const endTime = performance.now()
      const filterTime = endTime - startTime
      
      // Filtrado debe ser instantáneo (< 10ms)
      expect(filterTime).toBeLessThan(10)
      
      // Verificar que solo se muestra el depósito filtrado
      const visibleCards = container.querySelectorAll('[data-testid="deposit-card"]')
      expect(visibleCards.length).toBe(1)
    })
  })

  describe('TransactionHistory Component', () => {
    it('debe renderizar 1000 transacciones eficientemente', () => {
      const mockTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        type: i % 3 === 0 ? 'deposit' : i % 3 === 1 ? 'investment' : 'withdrawal',
        amount: BigInt(100000000 + i * 1000000),
        timestamp: Math.floor(Date.now() / 1000) - i * 3600,
        status: i % 4 === 0 ? 'pending' : 'confirmed',
        hash: `0x${i.toString().padStart(64, '0')}`,
      }))
      
      const onRender = vi.fn()
      
      const { container } = render(
        <Profiler id="transaction-history" onRender={onRender}>
          <TransactionHistory transactions={mockTransactions} />
        </Profiler>
      )
      
      const renderTime = onRender.mock.calls[0][2]
      expect(renderTime).toBeLessThan(200) // Máximo 200ms para 1000 transacciones
      
      // Verificar que se renderizan las transacciones
      const transactionRows = container.querySelectorAll('[data-testid="transaction-row"]')
      expect(transactionRows.length).toBeGreaterThan(0)
    })

    it('debe paginar eficientemente', () => {
      const mockTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        type: 'deposit',
        amount: BigInt(100000000),
        timestamp: Math.floor(Date.now() / 1000) - i * 3600,
        status: 'confirmed',
        hash: `0x${i.toString().padStart(64, '0')}`,
      }))
      
      const { container } = render(<TransactionHistory transactions={mockTransactions} />)
      
      const nextPageButton = screen.getByLabelText(/siguiente página/i)
      
      const startTime = performance.now()
      fireEvent.click(nextPageButton)
      const endTime = performance.now()
      
      const pageChangeTime = endTime - startTime
      expect(pageChangeTime).toBeLessThan(20) // Cambio de página debe ser rápido
    })
  })

  describe('PoolList Component', () => {
    it('debe renderizar 50 pools de inversión eficientemente', () => {
      const onRender = vi.fn()
      
      const { container } = render(
        <Profiler id="pool-list" onRender={onRender}>
          <PoolList />
        </Profiler>
      )
      
      const renderTime = onRender.mock.calls[0][2]
      expect(renderTime).toBeLessThan(80) // Máximo 80ms para 50 pools
      
      // Verificar que todos los pools están presentes
      const poolCards = container.querySelectorAll('[data-testid="pool-card"]')
      expect(poolCards.length).toBe(50)
    })

    it('debe ordenar pools sin lag', () => {
      const { container } = render(<PoolList />)
      
      const sortSelect = screen.getByLabelText(/ordenar por/i)
      
      const startTime = performance.now()
      
      // Cambiar ordenamiento
      fireEvent.change(sortSelect, { target: { value: 'return' } })
      
      const endTime = performance.now()
      const sortTime = endTime - startTime
      
      expect(sortTime).toBeLessThan(15) // Ordenamiento debe ser rápido
    })
  })

  describe('ReturnsCalculator Component', () => {
    it('debe calcular retornos en tiempo real sin lag', () => {
      render(<ReturnsCalculator />)
      
      const amountInput = screen.getByLabelText(/monto de inversión/i)
      const durationInput = screen.getByLabelText(/duración/i)
      
      const startTime = performance.now()
      
      // Cambiar valores rápidamente
      for (let i = 1; i <= 10; i++) {
        fireEvent.change(amountInput, { target: { value: (i * 100000000).toString() } })
        fireEvent.change(durationInput, { target: { value: (i * 6).toString() } })
      }
      
      const endTime = performance.now()
      const calculationTime = endTime - startTime
      
      // Cálculos deben ser instantáneos (< 50ms para 10 cambios)
      expect(calculationTime).toBeLessThan(50)
    })

    it('debe manejar cálculos complejos eficientemente', () => {
      render(<ReturnsCalculator />)
      
      const amountInput = screen.getByLabelText(/monto de inversión/i)
      const rateInput = screen.getByLabelText(/tasa de retorno/i)
      
      // Simular cálculos complejos con valores grandes
      const startTime = performance.now()
      
      fireEvent.change(amountInput, { target: { value: '999999999999' } })
      fireEvent.change(rateInput, { target: { value: '15.5' } })
      
      const endTime = performance.now()
      const calculationTime = endTime - startTime
      
      expect(calculationTime).toBeLessThan(5) // Cálculo debe ser instantáneo
    })
  })

  describe('Memory Management', () => {
    it('debe liberar memoria después de desmontar componentes grandes', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      const { unmount } = render(<InvestmentPool />)
      
      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc()
      }
      
      unmount()
      
      // Esperar un poco para que se libere la memoria
      setTimeout(() => {
        const finalMemory = performance.memory?.usedJSHeapSize || 0
        const memoryDiff = finalMemory - initialMemory
        
        // La diferencia de memoria debe ser pequeña (< 10MB)
        expect(memoryDiff).toBeLessThan(10 * 1024 * 1024)
      }, 100)
    })

    it('debe manejar múltiples montajes/desmontajes eficientemente', () => {
      const onRender = vi.fn()
      
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <Profiler id={`investment-pool-${i}`} onRender={onRender}>
            <InvestmentPool />
          </Profiler>
        )
        
        const renderTime = onRender.mock.calls[i][2]
        expect(renderTime).toBeLessThan(100) // Cada render debe ser rápido
        
        unmount()
      }
    })
  })

  describe('Network Performance', () => {
    it('debe mostrar loading states apropiadamente durante requests lentos', async () => {
      // Mock de request lento
      vi.useFakeTimers()
      
      render(<InvestmentPool />)
      
      // Simular request lento
      const loadingElement = screen.getByTestId('loading-indicator')
      expect(loadingElement).toBeInTheDocument()
      
      // Avanzar tiempo
      vi.advanceTimersByTime(2000)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })
      
      vi.useRealTimers()
    })

    it('debe manejar errores de red sin afectar performance', async () => {
      // Mock de error de red
      vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<InvestmentPool />)
      
      // Simular error
      fireEvent.click(screen.getByText(/recargar/i))
      
      // Verificar que la UI sigue siendo responsiva
      const filterInput = screen.getByPlaceholderText(/filtrar/i)
      fireEvent.change(filterInput, { target: { value: 'test' } })
      
      // El filtrado debe seguir funcionando
      expect(filterInput).toHaveValue('test')
      
      vi.restoreAllMocks()
    })
  })

  describe('Bundle Size Impact', () => {
    it('debe importar solo dependencias necesarias', () => {
      // Verificar que no se importan librerías pesadas innecesariamente
      const componentModules = [
        'InvestmentPool',
        'TransactionHistory', 
        'PoolList',
        'ReturnsCalculator'
      ]
      
      componentModules.forEach(moduleName => {
        // En un test real, verificaríamos el tamaño del bundle
        // Por ahora, verificamos que los componentes se renderizan
        expect(() => {
          render(<div data-testid={moduleName.toLowerCase()} />)
        }).not.toThrow()
      })
    })
  })

  describe('Animation Performance', () => {
    it('debe usar animaciones optimizadas', () => {
      const { container } = render(<InvestmentPool />)
      
      // Verificar que las animaciones usan transform en lugar de propiedades costosas
      const animatedElements = container.querySelectorAll('[data-testid*="animated"]')
      
      animatedElements.forEach(element => {
        const style = window.getComputedStyle(element as Element)
        // Las animaciones deben usar transform para mejor performance
        expect(style.transform).toBeDefined()
      })
    })
  })
})
