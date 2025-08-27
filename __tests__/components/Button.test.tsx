import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Button } from '@/components/ui/Button'
import { Loader2, Plus, ArrowRight } from 'lucide-react'

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debe renderizar con texto', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('debe renderizar con variante primary por defecto', () => {
      render(<Button>Primary Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600')
    })

    it('debe renderizar con tamaño md por defecto', () => {
      render(<Button>Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
    })
  })

  describe('Variantes', () => {
    it('debe renderizar variante primary', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600', 'hover:bg-primary-700', 'text-white')
    })

    it('debe renderizar variante secondary', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-600', 'hover:bg-gray-700', 'text-white')
    })

    it('debe renderizar variante outline', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-gray-300', 'bg-white', 'text-gray-700')
    })

    it('debe renderizar variante ghost', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-gray-100', 'text-gray-700')
    })

    it('debe renderizar variante danger', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white')
    })
  })

  describe('Tamaños', () => {
    it('debe renderizar tamaño sm', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('debe renderizar tamaño md', () => {
      render(<Button size="md">Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
    })

    it('debe renderizar tamaño lg', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-base')
    })

    it('debe renderizar tamaño xl', () => {
      render(<Button size="xl">Extra Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-8', 'py-4', 'text-lg')
    })
  })

  describe('Estados de carga', () => {
    it('debe mostrar estado de carga', () => {
      render(<Button isLoading>Loading</Button>)
      
      expect(screen.getByText('처리 중...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('debe mostrar icono de carga', () => {
      render(<Button isLoading>Loading</Button>)
      
      const loaderIcon = screen.getByTestId('loader-icon')
      expect(loaderIcon).toHaveClass('animate-spin')
    })

    it('debe estar deshabilitado durante carga', () => {
      render(<Button isLoading>Loading</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('debe mantener texto original cuando no está cargando', () => {
      render(<Button>Normal Button</Button>)
      
      expect(screen.getByText('Normal Button')).toBeInTheDocument()
      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument()
    })
  })

  describe('Iconos', () => {
    it('debe renderizar icono izquierdo', () => {
      render(<Button leftIcon={<Plus data-testid="left-icon" />}>Add Item</Button>)
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    it('debe renderizar icono derecho', () => {
      render(<Button rightIcon={<ArrowRight data-testid="right-icon" />}>Continue</Button>)
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('debe renderizar ambos iconos', () => {
      render(
        <Button 
          leftIcon={<Plus data-testid="left-icon" />}
          rightIcon={<ArrowRight data-testid="right-icon" />}
        >
          Both Icons
        </Button>
      )
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Both Icons')).toBeInTheDocument()
    })

    it('debe ocultar iconos durante carga', () => {
      render(
        <Button 
          isLoading
          leftIcon={<Plus data-testid="left-icon" />}
          rightIcon={<ArrowRight data-testid="right-icon" />}
        >
          Loading
        </Button>
      )
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })
  })

  describe('Estados deshabilitados', () => {
    it('debe estar deshabilitado cuando disabled es true', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('debe estar deshabilitado cuando isLoading es true', () => {
      render(<Button isLoading>Loading</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('debe mantener estilos cuando está deshabilitado', () => {
      render(<Button disabled variant="primary">Disabled Primary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600', 'disabled:opacity-50')
    })
  })

  describe('Eventos', () => {
    it('debe llamar onClick cuando se hace clic', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debe llamar onClick con evento correcto', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: button
        })
      )
    })

    it('no debe llamar onClick cuando está deshabilitado', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('no debe llamar onClick cuando está cargando', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Loading</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Navegación por teclado', () => {
    it('debe responder a Enter', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Enter Test</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debe responder a Space', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Space Test</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('no debe responder a teclas cuando está deshabilitado', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('no debe responder a teclas cuando está cargando', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Loading</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener role button por defecto', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('debe aceptar aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })

    it('debe aceptar aria-describedby', () => {
      render(
        <div>
          <div id="description">Button description</div>
          <Button aria-describedby="description">Button</Button>
        </div>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('debe tener aria-disabled cuando está deshabilitado', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('debe tener aria-disabled cuando está cargando', () => {
      render(<Button isLoading>Loading</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('debe tener focus-ring para navegación por teclado', () => {
      render(<Button>Focusable</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-ring')
    })
  })

  describe('Clases CSS personalizadas', () => {
    it('debe aceptar className personalizada', () => {
      render(<Button className="custom-class">Custom</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('debe combinar clases personalizadas con clases por defecto', () => {
      render(<Button className="custom-class" variant="primary">Combined</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class', 'bg-primary-600', 'text-white')
    })
  })

  describe('Forwarding de ref', () => {
    it('debe forwardear ref correctamente', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Test</Button>)
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })
  })

  describe('Props adicionales', () => {
    it('debe aceptar type button', () => {
      render(<Button type="button">Type Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('debe aceptar type submit', () => {
      render(<Button type="submit">Submit</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('debe aceptar type reset', () => {
      render(<Button type="reset">Reset</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('debe aceptar data attributes', () => {
      render(<Button data-testid="custom-button" data-custom="value">Data Test</Button>)
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('Casos edge', () => {
    it('debe renderizar sin children', () => {
      render(<Button />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('debe renderizar con children complejos', () => {
      render(
        <Button>
          <span>Complex</span>
          <strong>Content</strong>
        </Button>
      )
      
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('debe manejar múltiples clicks rápidos', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Rapid Clicks</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('debe mantener estado durante re-renders', () => {
      const { rerender } = render(<Button>Initial</Button>)
      
      expect(screen.getByText('Initial')).toBeInTheDocument()
      
      rerender(<Button>Updated</Button>)
      expect(screen.getByText('Updated')).toBeInTheDocument()
    })
  })

  describe('Integración con formularios', () => {
    it('debe funcionar como botón de submit', () => {
      const handleSubmit = vi.fn()
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('debe funcionar como botón de reset', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      const resetButton = screen.getByRole('button')
      
      fireEvent.change(input, { target: { value: 'changed' } })
      expect(input).toHaveValue('changed')
      
      fireEvent.click(resetButton)
      expect(input).toHaveValue('test')
    })
  })

  describe('Estilos responsivos', () => {
    it('debe tener clases de transición', () => {
      render(<Button>Transition</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all', 'duration-200')
    })

    it('debe tener estados hover', () => {
      render(<Button variant="primary">Hover</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-primary-700')
    })

    it('debe tener estados focus', () => {
      render(<Button>Focus</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-ring')
    })
  })
})
