import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SimpleHowItWorks } from '@/components/home/SimpleHowItWorks'
import { useTranslations } from 'next-intl'

// Mock de los hooks
const mockUseTranslations = useTranslations as vi.MockedFunction<typeof useTranslations>

describe('SimpleHowItWorks', () => {
  const defaultTranslations = {
    'howItWorks.title': '¿Cómo funciona JeonseVault?',
    'howItWorks.subtitle': 'Proceso simple y seguro para depósitos Jeonse',
    'howItWorks.step1.title': '1. Crear Depósito',
    'howItWorks.step1.description': 'Configura tu depósito con términos personalizados',
    'howItWorks.step2.title': '2. Verificación',
    'howItWorks.step2.description': 'Verificamos propiedad y compliance automáticamente',
    'howItWorks.step3.title': '3. Inversión',
    'howItWorks.step3.description': 'Invierte en depósitos verificados con retornos atractivos',
    'howItWorks.step4.title': '4. Liquidación',
    'howItWorks.step4.description': 'Recibe tu depósito al vencimiento del contrato',
    'howItWorks.cta': 'Comenzar ahora',
    'howItWorks.learnMore': 'Aprender más',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTranslations.mockReturnValue((key: string) => defaultTranslations[key as keyof typeof defaultTranslations] || key)
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el título y subtítulo', () => {
      render(<SimpleHowItWorks />)
      
      expect(screen.getByText('¿Cómo funciona JeonseVault?')).toBeInTheDocument()
      expect(screen.getByText('Proceso simple y seguro para depósitos Jeonse')).toBeInTheDocument()
    })

    it('debe renderizar los 4 pasos del proceso', () => {
      render(<SimpleHowItWorks />)
      
      expect(screen.getByText('1. Crear Depósito')).toBeInTheDocument()
      expect(screen.getByText('2. Verificación')).toBeInTheDocument()
      expect(screen.getByText('3. Inversión')).toBeInTheDocument()
      expect(screen.getByText('4. Liquidación')).toBeInTheDocument()
    })

    it('debe renderizar las descripciones de cada paso', () => {
      render(<SimpleHowItWorks />)
      
      expect(screen.getByText('Configura tu depósito con términos personalizados')).toBeInTheDocument()
      expect(screen.getByText('Verificamos propiedad y compliance automáticamente')).toBeInTheDocument()
      expect(screen.getByText('Invierte en depósitos verificados con retornos atractivos')).toBeInTheDocument()
      expect(screen.getByText('Recibe tu depósito al vencimiento del contrato')).toBeInTheDocument()
    })
  })

  describe('Estructura de pasos', () => {
    it('debe mostrar los pasos en orden correcto', () => {
      render(<SimpleHowItWorks />)
      
      const steps = screen.getAllByTestId('how-it-works-step')
      expect(steps).toHaveLength(4)
      
      // Verificar que los números están en orden
      expect(steps[0]).toHaveTextContent('1')
      expect(steps[1]).toHaveTextContent('2')
      expect(steps[2]).toHaveTextContent('3')
      expect(steps[3]).toHaveTextContent('4')
    })

    it('debe tener iconos para cada paso', () => {
      render(<SimpleHowItWorks />)
      
      const icons = screen.getAllByTestId('step-icon')
      expect(icons).toHaveLength(4)
    })

    it('debe mostrar líneas conectoras entre pasos', () => {
      render(<SimpleHowItWorks />)
      
      const connectors = screen.getAllByTestId('step-connector')
      expect(connectors).toHaveLength(3) // 4 pasos = 3 conectores
    })
  })

  describe('Interactividad', () => {
    it('debe mostrar tooltips al hacer hover sobre los pasos', async () => {
      render(<SimpleHowItWorks />)
      
      const firstStep = screen.getByText('1. Crear Depósito').closest('div')
      fireEvent.mouseEnter(firstStep!)
      
      await waitFor(() => {
        expect(screen.getByText('Configura tu depósito con términos personalizados')).toBeVisible()
      })
    })

    it('debe resaltar el paso activo al hacer clic', async () => {
      render(<SimpleHowItWorks />)
      
      const secondStep = screen.getByText('2. Verificación').closest('button')
      fireEvent.click(secondStep!)
      
      await waitFor(() => {
        expect(secondStep).toHaveClass('bg-primary-100', 'border-primary-500')
      })
    })

    it('debe mostrar detalles expandidos al hacer clic', async () => {
      render(<SimpleHowItWorks />)
      
      const stepButton = screen.getByText('1. Crear Depósito').closest('button')
      fireEvent.click(stepButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Detalles del paso 1')).toBeInTheDocument()
      })
    })
  })

  describe('Botones de acción', () => {
    it('debe renderizar botón CTA principal', () => {
      render(<SimpleHowItWorks />)
      
      const ctaButton = screen.getByText('Comenzar ahora')
      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveAttribute('href', '/deposit/create')
    })

    it('debe renderizar botón de aprender más', () => {
      render(<SimpleHowItWorks />)
      
      const learnMoreButton = screen.getByText('Aprender más')
      expect(learnMoreButton).toBeInTheDocument()
      expect(learnMoreButton).toHaveAttribute('href', '/docs/how-it-works')
    })

    it('debe manejar clics en botones CTA', async () => {
      const mockRouter = {
        push: vi.fn(),
      }
      vi.mocked(require('next/navigation').useRouter).mockReturnValue(mockRouter)
      
      render(<SimpleHowItWorks />)
      
      const ctaButton = screen.getByText('Comenzar ahora')
      fireEvent.click(ctaButton)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/deposit/create')
    })
  })

  describe('Responsive design', () => {
    it('debe mostrar pasos en columna en móvil', () => {
      // Mock de window.innerWidth para simular móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<SimpleHowItWorks />)
      
      const container = screen.getByTestId('how-it-works-container')
      expect(container).toHaveClass('flex-col', 'space-y-8')
    })

    it('debe mostrar pasos en fila en desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(<SimpleHowItWorks />)
      
      const container = screen.getByTestId('how-it-works-container')
      expect(container).toHaveClass('flex-row', 'space-x-8')
    })

    it('debe ocultar conectores en móvil', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<SimpleHowItWorks />)
      
      const connectors = screen.getAllByTestId('step-connector')
      connectors.forEach(connector => {
        expect(connector).toHaveClass('hidden', 'md:block')
      })
    })
  })

  describe('Animaciones', () => {
    it('debe aplicar animaciones de entrada', () => {
      render(<SimpleHowItWorks />)
      
      const steps = screen.getAllByTestId('how-it-works-step')
      steps.forEach((step, index) => {
        expect(step).toHaveStyle({
          animationDelay: `${index * 0.2}s`,
        })
      })
    })

    it('debe animar iconos al hacer hover', async () => {
      render(<SimpleHowItWorks />)
      
      const firstIcon = screen.getAllByTestId('step-icon')[0]
      fireEvent.mouseEnter(firstIcon)
      
      await waitFor(() => {
        expect(firstIcon).toHaveClass('scale-110', 'rotate-12')
      })
    })

    it('debe animar conectores al hacer scroll', () => {
      // Mock de IntersectionObserver para simular scroll
      const mockIntersectionObserver = vi.fn()
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      })
      window.IntersectionObserver = mockIntersectionObserver

      render(<SimpleHowItWorks />)
      
      const connectors = screen.getAllByTestId('step-connector')
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener roles ARIA correctos', () => {
      render(<SimpleHowItWorks />)
      
      expect(screen.getByRole('region', { name: 'Cómo funciona' })).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(4)
    })

    it('debe manejar navegación por teclado', () => {
      render(<SimpleHowItWorks />)
      
      const stepButtons = screen.getAllByRole('button')
      stepButtons[0].focus()
      
      fireEvent.keyDown(stepButtons[0], { key: 'Enter' })
      
      expect(stepButtons[0]).toHaveClass('bg-primary-100')
    })

    it('debe tener labels descriptivos', () => {
      render(<SimpleHowItWorks />)
      
      expect(screen.getByLabelText('Paso 1: Crear Depósito')).toBeInTheDocument()
      expect(screen.getByLabelText('Paso 2: Verificación')).toBeInTheDocument()
      expect(screen.getByLabelText('Paso 3: Inversión')).toBeInTheDocument()
      expect(screen.getByLabelText('Paso 4: Liquidación')).toBeInTheDocument()
    })

    it('debe anunciar cambios de estado', () => {
      render(<SimpleHowItWorks />)
      
      const stepButton = screen.getByText('1. Crear Depósito').closest('button')
      fireEvent.click(stepButton!)
      
      expect(screen.getByText('Paso 1 seleccionado')).toBeInTheDocument()
    })
  })

  describe('Internacionalización', () => {
    it('debe usar traducciones correctas', () => {
      const customTranslations = {
        'howItWorks.title': 'Cómo funciona JeonseVault en español',
        'howItWorks.step1.title': '1. Crear Depósito en español',
      }

      mockUseTranslations.mockReturnValue((key: string) => 
        customTranslations[key as keyof typeof customTranslations] || key
      )

      render(<SimpleHowItWorks />)
      
      expect(screen.getByText('Cómo funciona JeonseVault en español')).toBeInTheDocument()
      expect(screen.getByText('1. Crear Depósito en español')).toBeInTheDocument()
    })

    it('debe manejar idiomas RTL', () => {
      const rtlTranslations = {
        'howItWorks.title': 'كيف يعمل JeonseVault',
        'howItWorks.subtitle': 'عملية بسيطة وآمنة لودائع Jeonse',
      }

      mockUseTranslations.mockReturnValue((key: string) => 
        rtlTranslations[key as keyof typeof rtlTranslations] || key
      )

      render(<SimpleHowItWorks />)
      
      const container = screen.getByTestId('how-it-works-container')
      expect(container).toHaveAttribute('dir', 'rtl')
    })
  })

  describe('Estados de carga', () => {
    it('debe mostrar skeleton loader mientras carga', () => {
      render(<SimpleHowItWorks isLoading={true} />)
      
      expect(screen.getAllByTestId('step-skeleton')).toHaveLength(4)
      expect(screen.queryByText('¿Cómo funciona JeonseVault?')).not.toBeInTheDocument()
    })

    it('debe mostrar contenido cuando termina de cargar', () => {
      const { rerender } = render(<SimpleHowItWorks isLoading={true} />)
      
      rerender(<SimpleHowItWorks isLoading={false} />)
      
      expect(screen.getByText('¿Cómo funciona JeonseVault?')).toBeInTheDocument()
      expect(screen.queryByTestId('step-skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Estados de error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', () => {
      render(<SimpleHowItWorks error="Error al cargar contenido" />)
      
      expect(screen.getByText('Error al cargar contenido')).toBeInTheDocument()
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    it('debe permitir reintentar cuando hay error', async () => {
      const onRetry = vi.fn()
      render(<SimpleHowItWorks error="Error" onRetry={onRetry} />)
      
      const retryButton = screen.getByText('Reintentar')
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('debe renderizar sin errores de consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<SimpleHowItWorks />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('debe usar lazy loading para animaciones', () => {
      render(<SimpleHowItWorks />)
      
      const animatedElements = screen.getAllByTestId('animated-element')
      animatedElements.forEach(element => {
        expect(element).toHaveAttribute('data-lazy', 'true')
      })
    })

    it('debe optimizar re-renders', () => {
      const { rerender } = render(<SimpleHowItWorks />)
      
      // Cambiar props sin afectar renderizado
      rerender(<SimpleHowItWorks className="custom-class" />)
      
      const container = screen.getByTestId('how-it-works-container')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('Testing de integración', () => {
    it('debe integrarse correctamente con el sistema de navegación', () => {
      const mockRouter = {
        push: vi.fn(),
      }
      vi.mocked(require('next/navigation').useRouter).mockReturnValue(mockRouter)
      
      render(<SimpleHowItWorks />)
      
      const ctaButton = screen.getByText('Comenzar ahora')
      fireEvent.click(ctaButton)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/deposit/create')
    })

    it('debe integrarse con el sistema de analytics', () => {
      const mockAnalytics = {
        trackEvent: vi.fn(),
      }
      vi.mocked(require('@/services/AnalyticsService').analyticsService).trackEvent = mockAnalytics.trackEvent
      
      render(<SimpleHowItWorks />)
      
      const stepButton = screen.getByText('1. Crear Depósito').closest('button')
      fireEvent.click(stepButton!)
      
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith({
        eventName: 'how_it_works_step_clicked',
        properties: {
          stepNumber: 1,
          stepTitle: 'Crear Depósito',
        },
      })
    })
  })
})
