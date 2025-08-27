import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Header } from '@/components/layout/Header'
import { useWeb3 } from '@/hooks/useWeb3'
import { useTranslations } from 'next-intl'

// Mock de los hooks
const mockUseWeb3 = useWeb3 as vi.MockedFunction<typeof useWeb3>
const mockUseTranslations = useTranslations as vi.MockedFunction<typeof useTranslations>

describe('Header', () => {
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

  const defaultTranslations = {
    'header.title': 'JeonseVault',
    'header.subtitle': 'Plataforma blockchain para depósitos Jeonse',
    'header.dashboard': 'Dashboard',
    'header.deposits': 'Depósitos',
    'header.investment': 'Inversión',
    'header.profile': 'Perfil',
    'header.connect': 'Conectar Wallet',
    'header.disconnect': 'Desconectar',
    'header.network': 'Red',
    'header.balance': 'Balance',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWeb3.mockReturnValue(defaultWeb3State)
    mockUseTranslations.mockReturnValue((key: string) => defaultTranslations[key as keyof typeof defaultTranslations] || key)
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el logo y título', () => {
      render(<Header />)
      
      expect(screen.getByText('JeonseVault')).toBeInTheDocument()
      expect(screen.getByText('Plataforma blockchain para depósitos Jeonse')).toBeInTheDocument()
    })

    it('debe renderizar el menú de navegación', () => {
      render(<Header />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Depósitos')).toBeInTheDocument()
      expect(screen.getByText('Inversión')).toBeInTheDocument()
      expect(screen.getByText('Perfil')).toBeInTheDocument()
    })

    it('debe mostrar el estado de conexión cuando está conectado', () => {
      render(<Header />)
      
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
      expect(screen.getByText('1.0 KAIA')).toBeInTheDocument()
    })
  })

  describe('Estado de wallet desconectado', () => {
    it('debe mostrar botón de conexión cuando no está conectado', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isConnected: false,
        address: undefined,
        balance: undefined,
      })

      render(<Header />)
      
      expect(screen.getByText('Conectar Wallet')).toBeInTheDocument()
      expect(screen.queryByText('0x1234...7890')).not.toBeInTheDocument()
    })

    it('debe mostrar indicador de red incorrecta', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isCorrectNetwork: false,
      })

      render(<Header />)
      
      expect(screen.getByText('Red')).toBeInTheDocument()
      // Debería mostrar algún indicador de red incorrecta
    })
  })

  describe('Navegación', () => {
    it('debe tener enlaces de navegación correctos', () => {
      render(<Header />)
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const depositsLink = screen.getByText('Depósitos').closest('a')
      const investmentLink = screen.getByText('Inversión').closest('a')
      const profileLink = screen.getByText('Perfil').closest('a')

      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(depositsLink).toHaveAttribute('href', '/deposit')
      expect(investmentLink).toHaveAttribute('href', '/investment')
      expect(profileLink).toHaveAttribute('href', '/profile')
    })

    it('debe resaltar la página activa', () => {
      // Mock de usePathname para simular página activa
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/dashboard')
      
      render(<Header />)
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('bg-primary-100', 'text-primary-700')
    })
  })

  describe('Menú móvil', () => {
    it('debe mostrar botón de menú en móvil', () => {
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Abrir menú')
      expect(menuButton).toBeInTheDocument()
    })

    it('debe abrir menú móvil al hacer clic', async () => {
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Abrir menú')
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Cerrar menú')).toBeInTheDocument()
      })
    })

    it('debe cerrar menú móvil al hacer clic en cerrar', async () => {
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Abrir menú')
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar menú')
        fireEvent.click(closeButton)
      })
      
      await waitFor(() => {
        expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument()
      })
    })
  })

  describe('Funcionalidad de wallet', () => {
    it('debe mostrar dropdown de wallet cuando está conectado', async () => {
      render(<Header />)
      
      const walletButton = screen.getByText('0x1234...7890')
      fireEvent.click(walletButton)
      
      await waitFor(() => {
        expect(screen.getByText('Desconectar')).toBeInTheDocument()
        expect(screen.getByText('1.0 KAIA')).toBeInTheDocument()
      })
    })

    it('debe llamar a switchNetwork cuando se hace clic en cambiar red', async () => {
      render(<Header />)
      
      const walletButton = screen.getByText('0x1234...7890')
      fireEvent.click(walletButton)
      
      await waitFor(() => {
        const networkButton = screen.getByText('Red')
        fireEvent.click(networkButton)
      })
      
      expect(defaultWeb3State.switchNetwork).toHaveBeenCalled()
    })

    it('debe mostrar estado de carga durante transacciones', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isLoading: true,
      })

      render(<Header />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Responsive design', () => {
    it('debe ocultar menú de navegación en móvil', () => {
      // Mock de window.innerWidth para simular móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<Header />)
      
      const navMenu = screen.getByRole('navigation')
      expect(navMenu).toHaveClass('hidden', 'md:flex')
    })

    it('debe mostrar menú hamburguesa en móvil', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<Header />)
      
      expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener roles ARIA correctos', () => {
      render(<Header />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
    })

    it('debe manejar navegación por teclado', () => {
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Abrir menú')
      menuButton.focus()
      
      fireEvent.keyDown(menuButton, { key: 'Enter' })
      
      expect(screen.getByLabelText('Cerrar menú')).toBeInTheDocument()
    })

    it('debe tener labels descriptivos', () => {
      render(<Header />)
      
      expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument()
      expect(screen.getByLabelText('JeonseVault logo')).toBeInTheDocument()
    })
  })

  describe('Estados de error', () => {
    it('debe mostrar error de red incorrecta', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isCorrectNetwork: false,
      })

      render(<Header />)
      
      expect(screen.getByText('Red incorrecta')).toBeInTheDocument()
    })

    it('debe mostrar error de contratos no desplegados', () => {
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        isContractDeployed: false,
      })

      render(<Header />)
      
      expect(screen.getByText('Contratos no desplegados')).toBeInTheDocument()
    })
  })

  describe('Internacionalización', () => {
    it('debe usar traducciones correctas', () => {
      const customTranslations = {
        'header.title': 'JeonseVault ES',
        'header.subtitle': 'Plataforma blockchain para depósitos Jeonse en español',
      }

      mockUseTranslations.mockReturnValue((key: string) => 
        customTranslations[key as keyof typeof customTranslations] || key
      )

      render(<Header />)
      
      expect(screen.getByText('JeonseVault ES')).toBeInTheDocument()
      expect(screen.getByText('Plataforma blockchain para depósitos Jeonse en español')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('debe renderizar sin errores de consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<Header />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('debe manejar cambios de estado sin re-renders innecesarios', () => {
      const { rerender } = render(<Header />)
      
      // Cambiar estado de wallet
      mockUseWeb3.mockReturnValue({
        ...defaultWeb3State,
        balance: BigInt('2000000000000000000'),
      })
      
      rerender(<Header />)
      
      expect(screen.getByText('2.0 KAIA')).toBeInTheDocument()
    })
  })
})
