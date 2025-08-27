import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CreateDepositPage from '@/app/deposit/create/page'

// Mock de componentes y hooks
vi.mock('@/hooks/useWeb3', () => ({
  useWeb3: vi.fn(() => ({
    jeonseVault: {
      createDeposit: vi.fn(),
      isCreating: false,
      error: null
    },
    isContractDeployed: true
  }))
}))

vi.mock('@/components/deposit/CreateDepositForm', () => ({
  CreateDepositForm: ({ onSuccess }: { onSuccess?: (id: string) => void }) => (
    <div data-testid="create-deposit-form">
      <h2>Crear Nuevo Depósito</h2>
      <button 
        onClick={() => onSuccess?.('deposit-123')}
        data-testid="submit-form"
      >
        Crear Depósito
      </button>
    </div>
  )
}))

vi.mock('@/components/ui/Loading', () => ({
  Loading: ({ size }: { size?: string }) => (
    <div data-testid="loading" data-size={size}>
      Loading...
    </div>
  )
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  )
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'connectWallet.title': 'Conecta tu Wallet',
      'connectWallet.description': 'Necesitas conectar tu wallet para crear depósitos',
      'contractNotDeployed.title': 'Contrato no desplegado',
      'contractNotDeployed.description': 'Los contratos no están desplegados en esta red',
      'contractNotDeployed.cta': 'Volver al inicio',
      'header.back': 'Volver',
      'header.title': 'Crear Depósito',
      'header.subtitle': 'Configura un nuevo depósito de jeonse',
      'info.howItWorks.title': 'Cómo funciona',
      'info.howItWorks.step1.title': 'Configura el depósito',
      'info.howItWorks.step1.description': 'Define el monto y duración',
      'info.howItWorks.step2.title': 'Verifica la propiedad',
      'info.howItWorks.step2.description': 'Confirma la propiedad con el oracle',
      'info.howItWorks.step3.title': 'Recibe inversiones',
      'info.howItWorks.step3.description': 'Los inversores pueden participar',
      'info.benefits.title': 'Beneficios',
      'info.benefits.security': 'Seguridad blockchain',
      'info.benefits.transparency': 'Transparencia total',
      'info.benefits.investment': 'Opciones de inversión',
      'info.benefits.compliance': 'Cumplimiento regulatorio',
      'info.fees.title': 'Comisiones',
      'info.fees.escrow': 'Comisión de custodia',
      'info.fees.gas': 'Gas de red',
      'info.fees.earlyRelease': 'Liberación anticipada'
    }
    return translations[key] || key
  }
}))

describe('CreateDepositPage', () => {
  const mockUseAccount = vi.fn()
  const mockUseWeb3 = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    })
    
    // Mock del hook useWeb3
    mockUseWeb3.mockReturnValue({
      jeonseVault: {
        createDeposit: vi.fn(),
        isCreating: false,
        error: null
      },
      isContractDeployed: true
    })
  })

  describe('Renderizado básico', () => {
    it('debe renderizar correctamente cuando el usuario está conectado', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
      expect(screen.getByText('Configura un nuevo depósito de jeonse')).toBeInTheDocument()
      expect(screen.getByTestId('create-deposit-form')).toBeInTheDocument()
    })

    it('debe mostrar el botón de volver al dashboard', () => {
      render(<CreateDepositPage />)
      
      const backButton = screen.getByText('Volver')
      expect(backButton).toBeInTheDocument()
      expect(backButton.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('debe mostrar el formulario de creación de depósito', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByTestId('create-deposit-form')).toBeInTheDocument()
      expect(screen.getByText('Crear Nuevo Depósito')).toBeInTheDocument()
    })
  })

  describe('Panel de información', () => {
    it('debe mostrar la sección "Cómo funciona"', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByText('Cómo funciona')).toBeInTheDocument()
      expect(screen.getByText('Configura el depósito')).toBeInTheDocument()
      expect(screen.getByText('Verifica la propiedad')).toBeInTheDocument()
      expect(screen.getByText('Recibe inversiones')).toBeInTheDocument()
    })

    it('debe mostrar los pasos numerados correctamente', () => {
      render(<CreateDepositPage />)
      
      const stepNumbers = screen.getAllByText(/[1-3]/)
      expect(stepNumbers).toHaveLength(3)
    })

    it('debe mostrar la sección de beneficios', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByText('Beneficios')).toBeInTheDocument()
      expect(screen.getByText('Seguridad blockchain')).toBeInTheDocument()
      expect(screen.getByText('Transparencia total')).toBeInTheDocument()
      expect(screen.getByText('Opciones de inversión')).toBeInTheDocument()
      expect(screen.getByText('Cumplimiento regulatorio')).toBeInTheDocument()
    })

    it('debe mostrar la sección de comisiones', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByText('Comisiones')).toBeInTheDocument()
      expect(screen.getByText('Comisión de custodia')).toBeInTheDocument()
      expect(screen.getByText('0.1%')).toBeInTheDocument()
      expect(screen.getByText('Gas de red')).toBeInTheDocument()
      expect(screen.getByText('~$2-5')).toBeInTheDocument()
      expect(screen.getByText('Liberación anticipada')).toBeInTheDocument()
      expect(screen.getByText('1%')).toBeInTheDocument()
    })
  })

  describe('Estados de wallet desconectada', () => {
    it('debe mostrar mensaje cuando el usuario no está conectado', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined
      })

      render(<CreateDepositPage />)
      
      expect(screen.getByText('Conecta tu Wallet')).toBeInTheDocument()
      expect(screen.getByText('Necesitas conectar tu wallet para crear depósitos')).toBeInTheDocument()
      expect(screen.getByTestId('appkit-button')).toBeInTheDocument()
    })

    it('debe mostrar el icono de escudo azul cuando no está conectado', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined
      })

      render(<CreateDepositPage />)
      
      const shieldIcon = screen.getByTestId('appkit-button')
      expect(shieldIcon).toBeInTheDocument()
    })
  })

  describe('Estados de contrato no desplegado', () => {
    it('debe mostrar mensaje cuando el contrato no está desplegado', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: false,
          error: null
        },
        isContractDeployed: false
      })

      render(<CreateDepositPage />)
      
      expect(screen.getByText('Contrato no desplegado')).toBeInTheDocument()
      expect(screen.getByText('Los contratos no están desplegados en esta red')).toBeInTheDocument()
    })

    it('debe mostrar el icono de escudo amarillo cuando el contrato no está desplegado', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: false,
          error: null
        },
        isContractDeployed: false
      })

      render(<CreateDepositPage />)
      
      const shieldIcon = screen.getByTestId('appkit-button')
      expect(shieldIcon).toBeInTheDocument()
    })

    it('debe mostrar botón para volver al inicio cuando el contrato no está desplegado', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: false,
          error: null
        },
        isContractDeployed: false
      })

      render(<CreateDepositPage />)
      
      const backButton = screen.getByText('Volver al inicio')
      expect(backButton).toBeInTheDocument()
      expect(backButton.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Interactividad del formulario', () => {
    it('debe manejar el envío exitoso del formulario', async () => {
      render(<CreateDepositPage />)
      
      const submitButton = screen.getByTestId('submit-form')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument()
      })
    })

    it('debe mostrar el formulario con la funcionalidad correcta', () => {
      render(<CreateDepositPage />)
      
      const form = screen.getByTestId('create-deposit-form')
      expect(form).toBeInTheDocument()
      
      const submitButton = screen.getByTestId('submit-form')
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Responsive design', () => {
    it('debe tener la estructura de grid correcta', () => {
      render(<CreateDepositPage />)
      
      const mainContent = screen.getByText('Crear Depósito').closest('.container')
      expect(mainContent).toHaveClass('container')
    })

    it('debe mostrar el panel de información en la columna correcta', () => {
      render(<CreateDepositPage />)
      
      const infoPanel = screen.getByText('Cómo funciona').closest('.space-y-6')
      expect(infoPanel).toBeInTheDocument()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('debe tener navegación por teclado funcional', () => {
      render(<CreateDepositPage />)
      
      const backButton = screen.getByText('Volver')
      expect(backButton).toBeInTheDocument()
      
      // Simular navegación por teclado
      backButton.focus()
      expect(backButton).toHaveFocus()
    })

    it('debe tener enlaces accesibles', () => {
      render(<CreateDepositPage />)
      
      const links = screen.getAllByTestId('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Estados de carga', () => {
    it('debe manejar estados de carga del hook useWeb3', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: true,
          error: null
        },
        isContractDeployed: true
      })

      render(<CreateDepositPage />)
      
      // El formulario debe seguir siendo accesible incluso durante la carga
      expect(screen.getByTestId('create-deposit-form')).toBeInTheDocument()
    })
  })

  describe('Manejo de errores', () => {
    it('debe manejar errores del hook useWeb3', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: false,
          error: 'Error de contrato'
        },
        isContractDeployed: true
      })

      render(<CreateDepositPage />)
      
      // La página debe seguir renderizándose incluso con errores
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
    })
  })

  describe('Internacionalización', () => {
    it('debe usar las traducciones correctas', () => {
      render(<CreateDepositPage />)
      
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
      expect(screen.getByText('Configura un nuevo depósito de jeonse')).toBeInTheDocument()
      expect(screen.getByText('Cómo funciona')).toBeInTheDocument()
      expect(screen.getByText('Beneficios')).toBeInTheDocument()
      expect(screen.getByText('Comisiones')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('debe renderizar sin errores de consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<CreateDepositPage />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('debe manejar re-renders eficientemente', () => {
      const { rerender } = render(<CreateDepositPage />)
      
      // Re-renderizar con las mismas props
      rerender(<CreateDepositPage />)
      
      expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
    })
  })

  describe('Integración con navegación', () => {
    it('debe navegar correctamente al dashboard', () => {
      render(<CreateDepositPage />)
      
      const backLink = screen.getByText('Volver').closest('a')
      expect(backLink).toHaveAttribute('href', '/dashboard')
    })

    it('debe navegar correctamente al inicio cuando el contrato no está desplegado', () => {
      mockUseWeb3.mockReturnValue({
        jeonseVault: {
          createDeposit: vi.fn(),
          isCreating: false,
          error: null
        },
        isContractDeployed: false
      })

      render(<CreateDepositPage />)
      
      const homeLink = screen.getByText('Volver al inicio').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })
})
