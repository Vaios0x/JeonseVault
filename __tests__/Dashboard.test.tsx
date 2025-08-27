import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DashboardPage from '@/app/dashboard/page'

// Mock de wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890'
  }))
}))

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar correctamente cuando el usuario está conectado', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Gestiona tus depósitos e inversiones')).toBeInTheDocument()
  })

  it('debe mostrar los botones de acción principales', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
    expect(screen.getByText('Invertir')).toBeInTheDocument()
  })

  it('debe mostrar el widget de estadísticas', () => {
    render(<DashboardPage />)
    
    expect(screen.getByTestId('stats-widget')).toBeInTheDocument()
    expect(screen.getByText('Estadísticas')).toBeInTheDocument()
  })

  it('debe mostrar el panel de acciones rápidas', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument()
    expect(screen.getByText('Crear Depósito')).toBeInTheDocument()
    expect(screen.getByText('Ver Inversiones')).toBeInTheDocument()
    expect(screen.getByText('Ver Estadísticas')).toBeInTheDocument()
  })

  it('debe mostrar el estado de compliance del usuario', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Estado de Compliance')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Verificado')).toBeInTheDocument()
    expect(screen.getByText('Nivel')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('debe mostrar la sección de depósitos recientes', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Depósitos Recientes')).toBeInTheDocument()
    expect(screen.getByText('Ver Todos')).toBeInTheDocument()
  })

  it('debe mostrar las tarjetas de depósitos cuando hay depósitos', () => {
    render(<DashboardPage />)
    
    expect(screen.getByTestId('deposit-card')).toBeInTheDocument()
    expect(screen.getByText('Depósito #1')).toBeInTheDocument()
    expect(screen.getByText(/Monto:/)).toBeInTheDocument()
    expect(screen.getByText(/Estado:/)).toBeInTheDocument()
  })

  it('debe tener la estructura de grid correcta', () => {
    render(<DashboardPage />)
    
    const mainContent = screen.getByText('Dashboard').closest('.container')
    expect(mainContent).toHaveClass('container')
  })

  it('debe tener estructura semántica correcta', () => {
    render(<DashboardPage />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('debe tener navegación por teclado funcional', () => {
    render(<DashboardPage />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  it('debe tener enlaces accesibles', () => {
    render(<DashboardPage />)
    
    const links = screen.getAllByTestId('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('debe usar las traducciones correctas', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Gestiona tus depósitos e inversiones')).toBeInTheDocument()
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument()
    expect(screen.getByText('Estado de Compliance')).toBeInTheDocument()
    expect(screen.getByText('Depósitos Recientes')).toBeInTheDocument()
  })

  it('debe renderizar sin errores de consola', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<DashboardPage />)
    
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('debe manejar re-renders eficientemente', () => {
    const { rerender } = render(<DashboardPage />)
    
    // Re-renderizar con las mismas props
    rerender(<DashboardPage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('debe navegar correctamente a crear depósito', () => {
    render(<DashboardPage />)
    
    const createDepositLinks = screen.getAllByTestId('link').filter(link => 
      link.textContent?.includes('Crear Depósito')
    )
    
    createDepositLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/deposit/create')
    })
  })

  it('debe navegar correctamente a inversiones', () => {
    render(<DashboardPage />)
    
    const investmentLinks = screen.getAllByTestId('link').filter(link => 
      link.textContent?.includes('Invertir') || link.textContent?.includes('Ver Inversiones')
    )
    
    investmentLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/investment')
    })
  })

  it('debe navegar correctamente a estadísticas', () => {
    render(<DashboardPage />)
    
    const statsLinks = screen.getAllByTestId('link').filter(link => 
      link.textContent?.includes('Ver Estadísticas')
    )
    
    statsLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/stats')
    })
  })

  it('debe navegar correctamente a ver todos los depósitos', () => {
    render(<DashboardPage />)
    
    const viewAllLinks = screen.getAllByTestId('link').filter(link => 
      link.textContent?.includes('Ver Todos')
    )
    
    viewAllLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/deposit')
    })
  })
})
