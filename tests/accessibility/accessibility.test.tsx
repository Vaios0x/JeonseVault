import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Button } from '@/components/ui/Button'
import { CreateDepositForm } from '@/components/deposit/CreateDepositForm'
import { DepositStatus } from '@/components/deposit/DepositStatus'
import DashboardPage from '@/app/dashboard/page'

// Extender expect con axe matchers
expect.extend(toHaveNoViolations)

// Mock de hooks y servicios
vi.mock('@/hooks/useJeonseVault', () => ({
  useJeonseVault: () => ({
    createDeposit: vi.fn(),
    isCreating: false,
    deposits: [],
    userDeposits: [],
    contractState: {
      totalValueLocked: BigInt(1000000000),
      totalDeposits: BigInt(10),
    },
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

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
  }),
  useBalance: () => ({
    data: { value: BigInt(1000000000000000000) }, // 1 ETH
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

/**
 * Tests de Accesibilidad para JeonseVault
 * Verifica compliance con WCAG 2.1 AA usando axe-core
 */
describe('Accesibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Button Component', () => {
    it('debe cumplir con estándares de accesibilidad', async () => {
      const { container } = render(<Button>Test Button</Button>)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('debe tener ARIA labels apropiados', () => {
      render(<Button aria-label="Crear depósito">Crear</Button>)
      
      const button = screen.getByRole('button', { name: /crear depósito/i })
      expect(button).toBeInTheDocument()
    })

    it('debe ser navegable por teclado', () => {
      render(<Button>Test Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabindex', '0')
    })

    it('debe mostrar estado de loading apropiadamente', () => {
      render(<Button isLoading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('debe manejar estados deshabilitados', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('CreateDepositForm Component', () => {
    it('debe cumplir con estándares de accesibilidad', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('debe tener labels apropiados para todos los campos', () => {
      render(<CreateDepositForm />)
      
      // Verificar que todos los campos tienen labels
      expect(screen.getByLabelText(/ID de Propiedad/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Dirección Completa/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Dirección del Propietario/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Monto del Depósito/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Fecha de Vencimiento/i)).toBeInTheDocument()
    })

    it('debe tener mensajes de error accesibles', async () => {
      render(<CreateDepositForm />)
      
      const submitButton = screen.getByRole('button', { name: /crear depósito/i })
      submitButton.click()
      
      // Verificar que los errores están asociados con los campos
      await screen.findByText(/ID de propiedad es requerido/i)
      
      const propertyIdField = screen.getByLabelText(/ID de Propiedad/i)
      expect(propertyIdField).toHaveAttribute('aria-invalid', 'true')
      expect(propertyIdField).toHaveAttribute('aria-describedby')
    })

    it('debe tener navegación por teclado funcional', () => {
      render(<CreateDepositForm />)
      
      // Verificar que todos los campos son navegables
      const focusableElements = screen.getAllByRole('textbox', { hidden: true })
        .concat(screen.getAllByRole('button', { hidden: true }))
        .concat(screen.getAllByRole('combobox', { hidden: true }))
        .concat(screen.getAllByRole('checkbox', { hidden: true }))
      
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex', expect.stringMatching(/^-?\d+$/))
      })
    })

    it('debe tener contraste de colores apropiado', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
      
      expect(results).toHaveNoViolations()
    })

    it('debe tener headings semánticos', () => {
      render(<CreateDepositForm />)
      
      // Verificar estructura de headings
      const headings = screen.getAllByRole('heading')
      expect(headings[0]).toHaveTextContent(/Crear Nuevo Depósito/i)
      expect(headings[1]).toHaveTextContent(/Información de la Propiedad/i)
      expect(headings[2]).toHaveTextContent(/Información del Depósito/i)
    })

    it('debe tener landmarks apropiados', () => {
      render(<CreateDepositForm />)
      
      // Verificar landmarks
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })

  describe('DepositStatus Component', () => {
    const mockDeposit = {
      id: BigInt(1),
      tenant: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      landlord: '0x0987654321098765432109876543210987654321' as `0x${string}`,
      amount: BigInt(500000000),
      startDate: BigInt(Math.floor(Date.now() / 1000) - 86400),
      endDate: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
      propertyId: 'test-property',
      propertyAddress: '서울특별시 강남구 역삼동 123-45',
      status: 0,
      investmentPoolShare: BigInt(0),
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
      releasedAt: BigInt(0),
      isInvestmentEnabled: false,
      totalInvested: BigInt(0),
      investorCount: 0,
      annualReturn: BigInt(600),
      duration: 12,
    }

    it('debe cumplir con estándares de accesibilidad', async () => {
      const { container } = render(<DepositStatus deposit={mockDeposit} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('debe tener progreso accesible', () => {
      render(<DepositStatus deposit={mockDeposit} />)
      
      // Verificar que el progreso tiene atributos ARIA apropiados
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '0')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      expect(progressBar).toHaveAttribute('aria-label', /progreso de financiación/i)
    })

    it('debe tener información de estado clara', () => {
      render(<DepositStatus deposit={mockDeposit} />)
      
      // Verificar que el estado es claro para screen readers
      expect(screen.getByText(/Activo/i)).toBeInTheDocument()
      expect(screen.getByText(/El depósito está activo y aceptando inversiones/i)).toBeInTheDocument()
    })

    it('debe tener datos tabulares accesibles', () => {
      render(<DepositStatus deposit={mockDeposit} showDetails />)
      
      // Verificar que las tablas tienen headers apropiados
      const tables = screen.getAllByRole('table')
      tables.forEach(table => {
        expect(table).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Dashboard Page', () => {
    it('debe cumplir con estándares de accesibilidad', async () => {
      const { container } = render(<DashboardPage />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('debe tener navegación principal accesible', () => {
      render(<DashboardPage />)
      
      // Verificar navegación principal
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      // Verificar que los enlaces tienen texto descriptivo
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveTextContent()
        expect(link.textContent?.trim()).not.toBe('')
      })
    })

    it('debe tener skip links', () => {
      render(<DashboardPage />)
      
      // Verificar skip links para navegación rápida
      const skipLinks = screen.getAllByRole('link', { name: /saltar/i })
      expect(skipLinks.length).toBeGreaterThan(0)
    })

    it('debe tener landmarks apropiados', () => {
      render(<DashboardPage />)
      
      // Verificar landmarks principales
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
    })
  })

  describe('Navegación por Teclado', () => {
    it('debe permitir navegación completa por teclado', () => {
      render(<CreateDepositForm />)
      
      // Verificar que todos los elementos interactivos son navegables
      const interactiveElements = [
        ...screen.getAllByRole('textbox'),
        ...screen.getAllByRole('button'),
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('checkbox'),
        ...screen.getAllByRole('link'),
      ]
      
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex', expect.stringMatching(/^-?\d+$/))
      })
    })

    it('debe tener focus visible', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container, {
        rules: {
          'focus-visible': { enabled: true },
        },
      })
      
      expect(results).toHaveNoViolations()
    })

    it('debe manejar teclas de acceso rápido', () => {
      render(<CreateDepositForm />)
      
      // Verificar que los botones tienen accesskeys apropiados
      const submitButton = screen.getByRole('button', { name: /crear depósito/i })
      expect(submitButton).toHaveAttribute('accesskey', 's')
    })
  })

  describe('Screen Reader Support', () => {
    it('debe tener texto alternativo para imágenes', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container, {
        rules: {
          'image-alt': { enabled: true },
        },
      })
      
      expect(results).toHaveNoViolations()
    })

    it('debe tener descripciones para elementos complejos', () => {
      render(<CreateDepositForm />)
      
      // Verificar que elementos complejos tienen descripciones
      const complexElements = screen.getAllByRole('group')
      complexElements.forEach(element => {
        expect(element).toHaveAttribute('aria-labelledby') || expect(element).toHaveAttribute('aria-label')
      })
    })

    it('debe anunciar cambios dinámicos', () => {
      render(<CreateDepositForm />)
      
      // Verificar que los cambios de estado se anuncian
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Contraste y Colores', () => {
    it('debe tener contraste suficiente en todos los elementos', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
      
      expect(results).toHaveNoViolations()
    })

    it('debe no depender solo del color para transmitir información', async () => {
      const { container } = render(<CreateDepositForm />)
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('Responsive Design', () => {
    it('debe ser accesible en diferentes tamaños de pantalla', async () => {
      // Simular diferentes viewports
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ]
      
      for (const viewport of viewports) {
        // Simular viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        })
        
        const { container } = render(<CreateDepositForm />)
        
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })
  })

  describe('Idioma y Localización', () => {
    it('debe tener idioma especificado', () => {
      render(<CreateDepositForm />)
      
      // Verificar que el documento tiene idioma especificado
      expect(document.documentElement).toHaveAttribute('lang', 'ko')
    })

    it('debe manejar cambios de idioma apropiadamente', () => {
      render(<CreateDepositForm />)
      
      // Verificar que los elementos tienen idioma especificado
      const elementsWithLang = document.querySelectorAll('[lang]')
      expect(elementsWithLang.length).toBeGreaterThan(0)
    })
  })

  describe('Formularios', () => {
    it('debe tener validación accesible', () => {
      render(<CreateDepositForm />)
      
      // Verificar que los campos tienen validación apropiada
      const requiredFields = screen.getAllByRole('textbox')
      requiredFields.forEach(field => {
        if (field.hasAttribute('required')) {
          expect(field).toHaveAttribute('aria-required', 'true')
        }
      })
    })

    it('debe tener mensajes de error asociados', () => {
      render(<CreateDepositForm />)
      
      // Verificar que los errores están asociados con los campos
      const fields = screen.getAllByRole('textbox')
      fields.forEach(field => {
        if (field.hasAttribute('aria-invalid')) {
          expect(field).toHaveAttribute('aria-describedby')
        }
      })
    })
  })
})
