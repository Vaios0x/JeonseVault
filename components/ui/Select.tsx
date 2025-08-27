'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
  icon?: React.ReactNode
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
  searchable?: boolean
  multiSelect?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'filled'
  className?: string
  name?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  error,
  required = false,
  searchable = false,
  multiSelect = false,
  clearable = false,
  size = 'md',
  variant = 'default',
  className,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : [])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Manejar selección múltiple
  useEffect(() => {
    if (multiSelect) {
      setSelectedValues(value ? [value] : [])
    }
  }, [value, multiSelect])

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Manejar teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setIsOpen(true)
        }
        return
      }

      const filteredOptions = getFilteredOptions()
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[focusedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setSearchTerm('')
          setFocusedIndex(-1)
          break
        case 'Backspace':
          if (searchTerm === '' && multiSelect && selectedValues.length > 0) {
            event.preventDefault()
            const newValues = selectedValues.slice(0, -1)
            setSelectedValues(newValues)
            onChange?.(newValues[newValues.length - 1] || '')
          }
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, searchTerm, selectedValues, multiSelect, onChange])

  // Scroll al elemento enfocado
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-1.5'
      case 'md':
        return 'text-sm px-3 py-2'
      case 'lg':
        return 'text-base px-4 py-2.5'
      default:
        return 'text-sm px-3 py-2'
    }
  }

  const getVariantClasses = () => {
    const baseClasses = 'border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
    
    if (error) {
      return `${baseClasses} border-red-300 bg-red-50 text-red-900 placeholder-red-400`
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed`
    }

    switch (variant) {
      case 'outline':
        return `${baseClasses} border-gray-300 bg-white text-gray-900 hover:border-gray-400`
      case 'filled':
        return `${baseClasses} border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200`
      default:
        return `${baseClasses} border-gray-300 bg-white text-gray-900 hover:border-gray-400`
    }
  }

  const getFilteredOptions = () => {
    if (!searchable || !searchTerm) {
      return options
    }
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getSelectedOption = () => {
    return options.find(option => option.value === value)
  }

  const getDisplayValue = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || placeholder
      }
      return `${selectedValues.length} elementos seleccionados`
    }
    
    const selectedOption = getSelectedOption()
    return selectedOption?.label || placeholder
  }

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return

    if (multiSelect) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value]
      
      setSelectedValues(newValues)
      onChange?.(newValues[newValues.length - 1] || '')
    } else {
      onChange?.(option.value)
      setIsOpen(false)
      setSearchTerm('')
      setFocusedIndex(-1)
    }
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (multiSelect) {
      setSelectedValues([])
      onChange?.('')
    } else {
      onChange?.('')
    }
  }

  const handleToggle = () => {
    if (disabled) return
    
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
      setFocusedIndex(-1)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const isOptionSelected = (optionValue: string) => {
    if (multiSelect) {
      return selectedValues.includes(optionValue)
    }
    return value === optionValue
  }

  const renderOption = (option: SelectOption, index: number) => {
    const isSelected = isOptionSelected(option.value)
    const isFocused = index === focusedIndex
    
    return (
      <div
        key={option.value}
        className={clsx(
          'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
          isSelected && 'bg-primary-50 text-primary-900',
          isFocused && !isSelected && 'bg-gray-100',
          option.disabled && 'opacity-50 cursor-not-allowed',
          !option.disabled && 'hover:bg-gray-100'
        )}
        onClick={() => handleOptionSelect(option)}
        onMouseEnter={() => setFocusedIndex(index)}
      >
        <div className="flex items-center space-x-2">
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span className={clsx(
            'truncate',
            option.disabled && 'text-gray-400'
          )}>
            {option.label}
          </span>
        </div>
        
        {isSelected && (
          <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
        )}
      </div>
    )
  }

  const renderOptions = () => {
    const filteredOptions = getFilteredOptions()
    
    if (filteredOptions.length === 0) {
      return (
        <div className="px-3 py-2 text-sm text-gray-500 text-center">
          No se encontraron opciones
        </div>
      )
    }

    // Agrupar opciones si tienen grupo
    const groupedOptions = filteredOptions.reduce((groups, option) => {
      const group = option.group || 'default'
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
      return groups
    }, {} as Record<string, SelectOption[]>)

    return Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
      <div key={groupName}>
        {groupName !== 'default' && (
          <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
            {groupName}
          </div>
        )}
        {groupOptions.map((option, index) => 
          renderOption(option, Object.keys(groupedOptions).indexOf(groupName) * 1000 + index)
        )}
      </div>
    ))
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Select nativo oculto para accesibilidad */}
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Select personalizado */}
      <div
        className={clsx(
          'relative cursor-pointer',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={ariaLabel}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className={clsx(
              'block truncate',
              !value && 'text-gray-500'
            )}>
              {getDisplayValue()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpiar selección"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <ChevronDown className={clsx(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {/* Campo de búsqueda */}
          {searchable && (
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Opciones */}
          <div className="py-1">
            {renderOptions()}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

// Componente de opción individual
export interface SelectOptionProps {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  isSelected?: boolean
  isFocused?: boolean
}

export function SelectOptionItem({
  value,
  label,
  disabled = false,
  icon,
  onClick,
  isSelected = false,
  isFocused = false
}: SelectOptionProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
        isSelected && 'bg-primary-50 text-primary-900',
        isFocused && !isSelected && 'bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:bg-gray-100'
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className={clsx(
          'truncate',
          disabled && 'text-gray-400'
        )}>
          {label}
        </span>
      </div>
      
      {isSelected && (
        <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
      )}
    </div>
  )
}
