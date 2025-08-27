import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useWeb3 } from '@/hooks/useWeb3'
import { useInvestmentPool } from '@/hooks/useInvestmentPool'
import { useTranslations } from 'next-intl'
import InvestmentPage from '@/app/investment/page'

// Mock de los hooks
const mockUseWeb3 = useWeb3 as vi.MockedFunction<typeof useWeb3>
const mockUseInvestmentPool = useInvestmentPool as vi.MockedFunction<typeof useInvestmentPool>
const mockUseTranslations = useTranslations as vi.MockedFunction<typeof useTranslations>

describe('InvestmentPool', () => {
  const defaultWeb3State = {
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1001,
    isCorrectNetwork: true,
    balance: BigInt('1000000000000000000'),
    switchNetwork: vi.fn(),
    checkNetwork: vi.fn(() => true),
    formatBalance: vi.fn((balance: bigint) => `${Number(balance) / 1e18} KAIA`),
    formatAddress: vi.fn((address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`),
    isContractDeployed: true,
  }

  const defaultInvestmentPoolState = {
    pools: [
      {
        id: '1',
        name: 'Pool de Depósitos Premium',
        totalValue: BigInt('1000000000000000000000'), // 1000 KAIA
        availableValue: BigInt('500000000000000000000'), // 500 KAIA
        expectedReturn: BigInt('60000000000000000000'), // 60 KAIA (6%)
        actualReturn: BigInt('55000000000000000000'), // 55 KAIA
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        investorCount: 25,
        riskLevel: 'Low',
        category: 'Premium',
      },
      {
        id: '2',
        name: 'Pool de Depósitos Estándar',
        totalValue: BigInt('500000000000000000000'), // 500 KAIA
        availableValue: BigInt('200000000000000000000'), // 200 KAIA
        expectedReturn: BigInt('30000000000000000000'), // 30 KAIA (6%)
        actualReturn: BigInt('28000000000000000000'), // 28 KAIA
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        isActive: true,
        investorCount: 15,
        riskLevel: 'Medium',
        category: 'Standard',
      },
    ],
    userInvestments: [
      {
        poolId: '1',
        amount: BigInt('100000000000000000000'), // 100 KAIA
        shares: BigInt('1000000000000000000'),
        investedAt: new Date('2024-01-15'),
        expectedReturn: BigInt('6000000000000000000'), // 6 KAIA
        actualReturn: BigInt('5500000000000000000'), // 5.5 KAIA
      },
    ],
    investInPool: vi.fn(),
    withdrawFromPool: vi.fn(),
    isLoading: false,
    error: null,
    poolStats: {
      totalPoolValue: BigInt('1500000000000000000000'), // 1500 KAIA
      totalShares: BigInt('15000000000000000000'),
      totalInvestors: 40,
      expectedAnnualReturn: BigInt('90000000000000000000'), // 90 KAIA
      actualAnnualReturn: BigInt('83000000000000000000'), // 83 KAIA
    },
  }

  const defaultTranslations = {
    'investment.header.title': 'Inversión en Depósitos Jeonse',
    'investment.header.subtitle': 'Invierte en depósitos verificados con retornos atractivos',
    'investment.header.createDeposit': 'Crear Depósito',
    'investment.header.back': 'Volver',
    'investment.pools.title': 'Pools de Inversión',
    'investment.pools.subtitle': 'Selecciona un pool para invertir',
    'investment.pools.filter': 'Filtrar',
    'investment.calculator.title': 'Calculadora de Retornos',
    'investment.stats.title': 'Estadísticas de Inversión',
    'investment.stats.totalInvested': 'Total Invertido',
    'investment.stats.totalReturns': 'Retornos Totales',
    'investment.stats.activeInvestments': 'Inversiones Activas',
    'investment.stats.averageReturn': 'Retorno Promedio',
    'investment.quickActions.title': 'Acciones Rápidas',
    'investment.quickActions.createDeposit': 'Crear Depósito',
    'investment.quickActions.viewDashboard': 'Ver Dashboard',
    'investment.tips.title': 'Consejos de Inversión',
    'investment.tips.diversify': 'Diversifica tu portafolio',
    'investment.tips.longTerm': 'Inversión a largo plazo',
    'investment.tips.riskManagement': 'Gestiona el riesgo',
    'investment.connectWallet.title': 'Conecta tu Wallet',
    'investment.connectWallet.description': 'Necesitas conectar tu wallet para acceder a las inversiones',
    'investment.contractNotDeployed.title': 'Contratos no Desplegados',
    'investment.contractNotDeployed.description': 'Los contratos inteligentes no están disponibles',
    'investment.contractNotDeployed.cta': 'Ir al Inicio',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWeb3.mockReturnValue(defaultWeb3State)
    mockUseInvestmentPool.mockReturnValue(defaultInvestmentPoolState)
    mockUseTranslations.mockReturnValue((key: string) => defaultTranslations[key as keyof typeof defaultTranslations] || key)
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el header con título y navegación', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Inversión en Depósitos Jeonse')).toBeInTheDocument()
      expect(screen.getByText('Invierte en depósitos verificados con retornos atractivos')).toBeInTheDocument()
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
      expect(screen.getByText('Volver')).toBeInTheDocument()
    })

    it('debe renderizar la lista de pools de inversión', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Pools de Inversión')).toBeInTheDocument()
      expect(screen.getByText('Pool de Depósitos Premium')).toBeInTheDocument()
      expect(screen.getByText('Pool de Depósitos Estándar')).toBeInTheDocument()
    })

    it('debe renderizar la calculadora de retornos', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Calculadora de Retornos')).toBeInTheDocument()
    })

    it('debe renderizar las estadísticas de inversión', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Estadísticas de Inversión')).toBeInTheDocument()
      expect(screen.getByText('Total Invertido')).toBeInTheDocument()
      expect(screen.getByText('Retornos Totales')).toBeInTheDocument()
      expect(screen.getByText('Inversiones Activas')).toBeInTheDocument()
      expect(screen.getByText('Retorno Promedio')).toBeInTheDocument()
    })
  })

  describe('Estado de wallet desconectado', () => {
    it('debe mostrar mensaje de conexión cuando no está conectado', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isConnected: false,
      })

      render(<InvestmentPage />)
      
      expect(screen.getByText('Conecta tu Wallet')).toBeInTheDocument()
      expect(screen.getByText('Necesitas conectar tu wallet para acceder a las inversiones')).toBeInTheDocument()
    })

    it('debe mostrar componente appkit-button para conexión', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isConnected: false,
      })

      render(<InvestmentPage />)
      
      expect(screen.getByTestId('appkit-button')).toBeInTheDocument()
    })
  })

  describe('Estado de contratos no desplegados', () => {
    it('debe mostrar mensaje cuando los contratos no están desplegados', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isContractDeployed: false,
      })

      render(<InvestmentPage />)
      
      expect(screen.getByText('Contratos no Desplegados')).toBeInTheDocument()
      expect(screen.getByText('Los contratos inteligentes no están disponibles')).toBeInTheDocument()
    })

    it('debe permitir navegar al inicio cuando los contratos no están desplegados', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isContractDeployed: false,
      })

      render(<InvestmentPage />)
      
      const homeButton = screen.getByText('Ir al Inicio')
      expect(homeButton).toHaveAttribute('href', '/')
    })
  })

  describe('Lista de pools', () => {
    it('debe mostrar información detallada de cada pool', () => {
      render(<InvestmentPage />)
      
      // Pool Premium
      expect(screen.getByText('Pool de Depósitos Premium')).toBeInTheDocument()
      expect(screen.getByText('1000 KAIA')).toBeInTheDocument() // Total value
      expect(screen.getByText('500 KAIA')).toBeInTheDocument() // Available value
      expect(screen.getByText('6%')).toBeInTheDocument() // Expected return
      expect(screen.getByText('25')).toBeInTheDocument() // Investor count
      expect(screen.getByText('Low')).toBeInTheDocument() // Risk level

      // Pool Estándar
      expect(screen.getByText('Pool de Depósitos Estándar')).toBeInTheDocument()
      expect(screen.getByText('500 KAIA')).toBeInTheDocument()
      expect(screen.getByText('200 KAIA')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('debe mostrar botón de filtro', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Filtrar')).toBeInTheDocument()
    })

    it('debe permitir invertir en pools', async () => {
      render(<InvestmentPage />)
      
      const investButton = screen.getByText('Invertir').closest('button')
      fireEvent.click(investButton!)
      
      await waitFor(() => {
        expect(defaultInvestmentPoolState.investInPool).toHaveBeenCalledWith('1')
      })
    })
  })

  describe('Calculadora de retornos', () => {
    it('debe renderizar campos de entrada para el cálculo', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByLabelText('Monto a invertir')).toBeInTheDocument()
      expect(screen.getByLabelText('Período de inversión')).toBeInTheDocument()
      expect(screen.getByLabelText('Tasa de retorno anual')).toBeInTheDocument()
    })

    it('debe calcular retornos correctamente', async () => {
      render(<InvestmentPage />)
      
      const amountInput = screen.getByLabelText('Monto a invertir')
      const periodInput = screen.getByLabelText('Período de inversión')
      
      fireEvent.change(amountInput, { target: { value: '100' } })
      fireEvent.change(periodInput, { target: { value: '12' } })
      
      await waitFor(() => {
        expect(screen.getByText('Retorno estimado: 6.00 KAIA')).toBeInTheDocument()
      })
    })

    it('debe mostrar diferentes escenarios de retorno', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Escenario Conservador')).toBeInTheDocument()
      expect(screen.getByText('Escenario Moderado')).toBeInTheDocument()
      expect(screen.getByText('Escenario Agresivo')).toBeInTheDocument()
    })
  })

  describe('Estadísticas de inversión', () => {
    it('debe mostrar estadísticas correctas del usuario', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('100 KAIA')).toBeInTheDocument() // Total invested
      expect(screen.getByText('5.5 KAIA')).toBeInTheDocument() // Total returns
      expect(screen.getByText('1')).toBeInTheDocument() // Active investments
      expect(screen.getByText('6.2%')).toBeInTheDocument() // Average return
    })

    it('debe mostrar estadísticas globales del pool', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('1500 KAIA')).toBeInTheDocument() // Total pool value
      expect(screen.getByText('90 KAIA')).toBeInTheDocument() // Expected annual return
      expect(screen.getByText('40')).toBeInTheDocument() // Total investors
    })
  })

  describe('Acciones rápidas', () => {
    it('debe mostrar enlaces de acciones rápidas', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
      expect(screen.getByText('Ver Dashboard')).toBeInTheDocument()
    })

    it('debe navegar correctamente al hacer clic en acciones', () => {
      const mockRouter = {
        push: vi.fn(),
      }
      vi.mocked(require('next/navigation').useRouter).mockReturnValue(mockRouter)

      render(<InvestmentPage />)
      
      const createDepositButton = screen.getByText('Crear Depósito').closest('a')
      fireEvent.click(createDepositButton!)
      
      expect(createDepositButton).toHaveAttribute('href', '/deposit/create')
    })
  })

  describe('Consejos de inversión', () => {
    it('debe mostrar consejos útiles', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByText('Consejos de Inversión')).toBeInTheDocument()
      expect(screen.getByText('Diversifica tu portafolio')).toBeInTheDocument()
      expect(screen.getByText('Inversión a largo plazo')).toBeInTheDocument()
      expect(screen.getByText('Gestiona el riesgo')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad de inversión', () => {
    it('debe permitir invertir en un pool', async () => {
      render(<InvestmentPage />)
      
      const investButton = screen.getByText('Invertir').closest('button')
      fireEvent.click(investButton!)
      
      await waitFor(() => {
        expect(defaultInvestmentPoolState.investInPool).toHaveBeenCalledWith('1', {
          amount: BigInt('100000000000000000000'), // 100 KAIA
        })
      })
    })

    it('debe permitir retirar de un pool', async () => {
      render(<InvestmentPage />)
      
      const withdrawButton = screen.getByText('Retirar').closest('button')
      fireEvent.click(withdrawButton!)
      
      await waitFor(() => {
        expect(defaultInvestmentPoolState.withdrawFromPool).toHaveBeenCalledWith('1', {
          amount: BigInt('50000000000000000000'), // 50 KAIA
        })
      })
    })

    it('debe mostrar modal de confirmación antes de invertir', async () => {
      render(<InvestmentPage />)
      
      const investButton = screen.getByText('Invertir').closest('button')
      fireEvent.click(investButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Confirmar Inversión')).toBeInTheDocument()
        expect(screen.getByText('¿Estás seguro de que quieres invertir 100 KAIA?')).toBeInTheDocument()
      })
    })
  })

  describe('Estados de carga', () => {
    it('debe mostrar loading spinner mientras carga', () => {
      mockUseInvestmentPool.mockReturnValue({
        ...defaultInvestmentPoolState,
        isLoading: true,
      })

      render(<InvestmentPage />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('debe mostrar skeleton loaders para pools', () => {
      mockUseInvestmentPool.mockReturnValue({
        ...defaultInvestmentPoolState,
        isLoading: true,
      })

      render(<InvestmentPage />)
      
      expect(screen.getAllByTestId('pool-skeleton')).toHaveLength(2)
    })
  })

  describe('Estados de error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', () => {
      mockUseInvestmentPool.mockReturnValue({
        ...defaultInvestmentPoolState,
        error: 'Error al cargar pools de inversión',
      })

      render(<InvestmentPage />)
      
      expect(screen.getByText('Error al cargar pools de inversión')).toBeInTheDocument()
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    it('debe permitir reintentar cuando hay error', async () => {
      const onRetry = vi.fn()
      mockUseInvestmentPool.mockReturnValue({
        ...defaultInvestmentPoolState,
        error: 'Error',
        onRetry,
      })

      render(<InvestmentPage />)
      
      const retryButton = screen.getByText('Reintentar')
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('Responsive design', () => {
    it('debe mostrar layout de columna en móvil', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<InvestmentPage />)
      
      const mainContainer = screen.getByTestId('investment-main-container')
      expect(mainContainer).toHaveClass('flex-col')
    })

    it('debe mostrar layout de grid en desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(<InvestmentPage />)
      
      const mainContainer = screen.getByTestId('investment-main-container')
      expect(mainContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3')
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener roles ARIA correctos', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Pools de inversión' })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Calculadora' })).toBeInTheDocument()
    })

    it('debe manejar navegación por teclado', () => {
      render(<InvestmentPage />)
      
      const investButton = screen.getByText('Invertir').closest('button')
      investButton!.focus()
      
      fireEvent.keyDown(investButton!, { key: 'Enter' })
      
      expect(defaultInvestmentPoolState.investInPool).toHaveBeenCalled()
    })

    it('debe tener labels descriptivos', () => {
      render(<InvestmentPage />)
      
      expect(screen.getByLabelText('Monto a invertir')).toBeInTheDocument()
      expect(screen.getByLabelText('Período de inversión')).toBeInTheDocument()
    })
  })

  describe('Internacionalización', () => {
    it('debe usar traducciones correctas', () => {
      const customTranslations = {
        'investment.header.title': 'Inversión en español',
        'investment.pools.title': 'Pools de inversión en español',
      }

      mockUseTranslations.mockReturnValue((key: string) => 
        customTranslations[key as keyof typeof customTranslations] || key
      )

      render(<InvestmentPage />)
      
      expect(screen.getByText('Inversión en español')).toBeInTheDocument()
      expect(screen.getByText('Pools de inversión en español')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('debe renderizar sin errores de consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<InvestmentPage />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('debe optimizar re-renders', () => {
      const { rerender } = render(<InvestmentPage />)
      
      // Cambiar estado sin afectar renderizado
      mockUseInvestmentPool.mockReturnValue({
        ...defaultInvestmentPoolState,
        poolStats: {
          ...defaultInvestmentPoolState.poolStats!,
          totalPoolValue: BigInt('2000000000000000000000'), // 2000 KAIA
        },
      })
      
      rerender(<InvestmentPage />)
      
      expect(screen.getByText('2000 KAIA')).toBeInTheDocument()
    })
  })

  describe('Testing de integración', () => {
    it('debe integrarse correctamente con el sistema de navegación', () => {
      const mockRouter = {
        push: vi.fn(),
      }
      vi.mocked(require('next/navigation').useRouter).mockReturnValue(mockRouter)

      render(<InvestmentPage />)
      
      const backButton = screen.getByText('Volver').closest('a')
      fireEvent.click(backButton!)
      
      expect(backButton).toHaveAttribute('href', '/dashboard')
    })

    it('debe integrarse con el sistema de analytics', () => {
      const mockAnalytics = {
        trackEvent: vi.fn(),
      }
      vi.mocked(require('@/services/AnalyticsService').analyticsService).trackEvent = mockAnalytics.trackEvent

      render(<InvestmentPage />)
      
      const investButton = screen.getByText('Invertir').closest('button')
      fireEvent.click(investButton!)
      
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith({
        eventName: 'investment_pool_clicked',
        properties: {
          poolId: '1',
          poolName: 'Pool de Depósitos Premium',
          action: 'invest',
        },
      })
    })
  })
})
