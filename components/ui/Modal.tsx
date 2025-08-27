'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventScroll?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  overlayClassName,
  contentClassName
}, ref) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Manejar teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevenir scroll del body
      if (preventScroll) {
        document.body.style.overflow = 'hidden'
      }
      // Guardar elemento activo anterior
      previousActiveElement.current = document.activeElement as HTMLElement
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (preventScroll) {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, closeOnEscape, preventScroll, onClose])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Enfocar el modal
      modalRef.current.focus()
    } else if (!isOpen && previousActiveElement.current) {
      // Restaurar focus al elemento anterior
      previousActiveElement.current.focus()
    }
  }, [isOpen])

  // Manejar clic en overlay
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  // Manejar clic en botón de cerrar
  const handleCloseClick = () => {
    onClose()
  }

  // Iconos por variante
  const getVariantIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return null
    }
  }

  // Clases por variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  // Clases por tamaño
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'md':
        return 'max-w-lg'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      case 'full':
        return 'max-w-full mx-4'
      default:
        return 'max-w-lg'
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full transform transition-all duration-300 ease-out',
          getSizeClasses(),
          className
        )}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          className={clsx(
            'relative bg-white rounded-2xl shadow-2xl border overflow-hidden',
            getVariantClasses(),
            contentClassName
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getVariantIcon()}
                {title && (
                  <h2 
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  // Renderizar en portal para evitar problemas de z-index
  return createPortal(modalContent, document.body)
})

Modal.displayName = 'Modal'

// Hook para usar el modal
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

// Componente de confirmación rápida
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  size = 'md'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size={size}
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'error' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Componente de alerta rápida
export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Aceptar',
  variant = 'default',
  size = 'md'
}: AlertModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size={size}
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex items-center justify-end">
          <Button
            variant={variant === 'error' ? 'danger' : 'primary'}
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
