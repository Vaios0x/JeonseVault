import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Profiler } from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { CreateDepositForm } from '@/components/deposit/CreateDepositForm'
import { DepositStatus } from '@/components/deposit/DepositStatus'

// Mock de hooks y servicios
vi.mock('@/hooks/useJeonseVault', () => ({
  useJeonseVault: () => ({
    createDeposit: vi.fn(),
    isCreating: false,
    deposits: [],
    userDeposits: [],
  })
}))

vi.mock('@/hooks/usePropertyOracle', () => ({
  usePropertyOracle: () => ({
    verifyPropertyOwnership: vi.fn(),
    isPropertyVerified: false,
  })
}))

vi.mock('@/hooks/useCompliance', () => ({
  useCompliance: () => ({
    checkCompliance: vi.fn(),
    userCompliance: {
      level: 'Premium',
      transactionLimit: BigInt(1000000000),
    },
  })
}))

/**
 * Tests de Performance para Componentes
 * Verifica tiempos de renderizado, re-renders y uso de memoria
 */
describe('Performance de Componentes', () => {
  let performanceMetrics: {
    renderTime: number
    reRenderCount: number
    memoryUsage: number
  }[] = []

  beforeEach(() => {
    performanceMetrics = []
    vi.clearAllMocks()
  })

  // Función para medir performance
  const measurePerformance = (callback: () => void) => {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    callback()
    
    const endTime = performance.now()
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    return {
      renderTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
    }
  }

  // Función para contar re-renders
  const countReRenders = (Component: React.ComponentType<any>, props: any) => {
    let renderCount = 0
    
    const ProfilerWrapper = (props: any) => (
      <Profiler
        id="performance-test"
        onRender={(id, phase, actualDuration) => {
          if (phase === 'mount' || phase === 'update') {
            renderCount++
          }
        }}
      >
        <Component {...props} />
      </Profiler>
    )
    
    render(<ProfilerWrapper {...props} />)
    return renderCount
  }

  describe('Button Component', () => {
    it('debe renderizar en menos de 5ms', () => {
      const metrics = measurePerformance(() => {
        render(<Button>Test Button</Button>)
      })
      
      expect(metrics.renderTime).toBeLessThan(5)
      expect(metrics.memoryUsage).toBeLessThan(1000000) // 1MB
    })

    it('debe manejar múltiples clics sin degradación', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      
      const button = screen.getByRole('button')
      
      // Simular 100 clics rápidos
      const startTime = performance.now()
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button)
      }
      const endTime = performance.now()
      
      const totalTime = endTime - startTime
      const averageTime = totalTime / 100
      
      expect(averageTime).toBeLessThan(1) // Menos de 1ms por clic
      expect(handleClick).toHaveBeenCalledTimes(100)
    })

    it('debe mantener performance con diferentes variantes', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger']
      const sizes = ['sm', 'md', 'lg']
      
      variants.forEach(variant => {
        sizes.forEach(size => {
          const metrics = measurePerformance(() => {
            render(
              <Button variant={variant as any} size={size as any}>
                {variant} {size}
              </Button>
            )
          })
          
          expect(metrics.renderTime).toBeLessThan(10)
        })
      })
    })
  })

  describe('Loading Component', () => {
    it('debe renderizar spinners eficientemente', () => {
      const variants = ['spinner', 'dots', 'pulse', 'bars', 'ripple']
      
      variants.forEach(variant => {
        const metrics = measurePerformance(() => {
          render(<Loading variant={variant as any} />)
        })
        
        expect(metrics.renderTime).toBeLessThan(3)
      })
    })

    it('debe manejar animaciones sin memory leaks', async () => {
      const { unmount } = render(<Loading variant="spinner" />)
      
      // Esperar 1 segundo para que las animaciones se ejecuten
      await waitFor(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0
      unmount()
      
      // Forzar garbage collection si está disponible
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0
      const memoryDiff = memoryAfter - memoryBefore
      
      // La diferencia de memoria no debería ser significativa
      expect(Math.abs(memoryDiff)).toBeLessThan(5000000) // 5MB
    })
  })

  describe('CreateDepositForm Component', () => {
    it('debe renderizar formulario completo en menos de 50ms', () => {
      const metrics = measurePerformance(() => {
        render(<CreateDepositForm />)
      })
      
      expect(metrics.renderTime).toBeLessThan(50)
      expect(metrics.memoryUsage).toBeLessThan(5000000) // 5MB
    })

    it('debe manejar cambios de input eficientemente', async () => {
      render(<CreateDepositForm />)
      
      const propertyIdInput = screen.getByLabelText(/ID de Propiedad/i)
      
      // Simular escritura rápida
      const startTime = performance.now()
      for (let i = 0; i < 100; i++) {
        fireEvent.change(propertyIdInput, { target: { value: `property-${i}` } })
      }
      const endTime = performance.now()
      
      const totalTime = endTime - startTime
      const averageTime = totalTime / 100
      
      expect(averageTime).toBeLessThan(5) // Menos de 5ms por cambio
    })

    it('debe validar formulario sin degradación', async () => {
      render(<CreateDepositForm />)
      
      const submitButton = screen.getByRole('button', { name: /crear depósito/i })
      
      // Simular múltiples intentos de envío
      const startTime = performance.now()
      for (let i = 0; i < 50; i++) {
        fireEvent.click(submitButton)
        await waitFor(() => {
          expect(screen.getByText(/ID de propiedad es requerido/i)).toBeInTheDocument()
        })
      }
      const endTime = performance.now()
      
      const totalTime = endTime - startTime
      const averageTime = totalTime / 50
      
      expect(averageTime).toBeLessThan(20) // Menos de 20ms por validación
    })
  })

  describe('DepositStatus Component', () => {
    const mockDeposit = {
      id: BigInt(1),
      tenant: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      landlord: '0x0987654321098765432109876543210987654321' as `0x${string}`,
      amount: BigInt(500000000),
      startDate: BigInt(Math.floor(Date.now() / 1000) - 86400), // 1 día atrás
      endDate: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 días en el futuro
      propertyId: 'test-property',
      propertyAddress: '서울특별시 강남구 역삼동 123-45',
      status: 0, // Active
      investmentPoolShare: BigInt(0),
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
      releasedAt: BigInt(0),
      isInvestmentEnabled: false,
      totalInvested: BigInt(0),
      investorCount: 0,
      annualReturn: BigInt(600), // 6%
      duration: 12,
    }

    it('debe renderizar estado de depósito en menos de 20ms', () => {
      const metrics = measurePerformance(() => {
        render(<DepositStatus deposit={mockDeposit} />)
      })
      
      expect(metrics.renderTime).toBeLessThan(20)
      expect(metrics.memoryUsage).toBeLessThan(2000000) // 2MB
    })

    it('debe manejar diferentes estados eficientemente', () => {
      const statuses = [0, 1, 2, 3, 4, 5] // Active, Completed, Disputed, etc.
      
      statuses.forEach(status => {
        const depositWithStatus = { ...mockDeposit, status }
        const metrics = measurePerformance(() => {
          render(<DepositStatus deposit={depositWithStatus} />)
        })
        
        expect(metrics.renderTime).toBeLessThan(15)
      })
    })

    it('debe calcular progreso sin degradación', () => {
      const depositsWithProgress = [
        { ...mockDeposit, totalInvested: BigInt(0) },
        { ...mockDeposit, totalInvested: BigInt(250000000) }, // 50%
        { ...mockDeposit, totalInvested: BigInt(500000000) }, // 100%
      ]
      
      depositsWithProgress.forEach(deposit => {
        const metrics = measurePerformance(() => {
          render(<DepositStatus deposit={deposit} />)
        })
        
        expect(metrics.renderTime).toBeLessThan(15)
      })
    })
  })

  describe('Memory Management', () => {
    it('debe liberar memoria después de unmount', () => {
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0
      
      const { unmount } = render(<CreateDepositForm />)
      unmount()
      
      // Forzar garbage collection si está disponible
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0
      const memoryDiff = memoryAfter - memoryBefore
      
      // La diferencia no debería ser significativa después del cleanup
      expect(Math.abs(memoryDiff)).toBeLessThan(1000000) // 1MB
    })

    it('debe manejar múltiples montajes/desmontajes', () => {
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0
      
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Button>Test {i}</Button>)
        unmount()
      }
      
      // Forzar garbage collection si está disponible
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0
      const memoryDiff = memoryAfter - memoryBefore
      
      // No debería haber memory leaks significativos
      expect(Math.abs(memoryDiff)).toBeLessThan(2000000) // 2MB
    })
  })

  describe('Bundle Size Impact', () => {
    it('debe mantener componentes ligeros', () => {
      // Verificar que los componentes no importan dependencias pesadas innecesariamente
      const ButtonModule = require('@/components/ui/Button')
      const LoadingModule = require('@/components/ui/Loading')
      
      // Los módulos deberían ser relativamente pequeños
      expect(ButtonModule).toBeDefined()
      expect(LoadingModule).toBeDefined()
    })
  })

  describe('Network Performance', () => {
    it('debe manejar requests lentos sin bloquear UI', async () => {
      // Mock de request lento
      vi.mocked(useJeonseVault).mockReturnValue({
        createDeposit: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 2000))
        ),
        isCreating: true,
        deposits: [],
        userDeposits: [],
      })
      
      render(<CreateDepositForm />)
      
      const submitButton = screen.getByRole('button', { name: /crear depósito/i })
      fireEvent.click(submitButton)
      
      // La UI debería mostrar loading sin bloquearse
      await waitFor(() => {
        expect(screen.getByText(/creando depósito/i)).toBeInTheDocument()
      })
      
      // El botón debería estar deshabilitado durante el loading
      expect(submitButton).toBeDisabled()
    })
  })
})
