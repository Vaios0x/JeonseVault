'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, Globe } from 'lucide-react'
import { clsx } from 'clsx'
import { locales, localeConfig, type Locale } from '@/i18n/config'
import { getPathnameWithoutLocale } from '@/i18n/config'

interface LanguageSelectorProps {
  className?: string
  variant?: 'dropdown' | 'buttons'
  size?: 'sm' | 'md' | 'lg'
}

export function LanguageSelector({ 
  className, 
  variant = 'dropdown',
  size = 'md'
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>('ko')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  // Detectar idioma actual desde la URL
  useEffect(() => {
    const pathSegments = pathname.split('/')
    const localeFromPath = pathSegments[1] as Locale
    if (locales.includes(localeFromPath)) {
      setCurrentLocale(localeFromPath)
    }
  }, [pathname])

  // Manejar clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
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
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }

    const pathWithoutLocale = getPathnameWithoutLocale(pathname)
    const newPath = `/${newLocale}${pathWithoutLocale}`
    
    router.push(newPath)
    setIsOpen(false)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1'
      case 'md':
        return 'text-sm px-3 py-2'
      case 'lg':
        return 'text-base px-4 py-3'
      default:
        return 'text-sm px-3 py-2'
    }
  }

  if (variant === 'buttons') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        {locales.map((locale) => {
          const config = localeConfig[locale]
          const isActive = locale === currentLocale
          
          return (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={clsx(
                'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 focus-ring',
                getSizeClasses(),
                isActive
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              )}
              aria-label={`${t('language')}: ${config.name}`}
              aria-pressed={isActive}
            >
              <span className="text-lg">{config.flag}</span>
              <span className="hidden sm:inline">{config.nativeName}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus-ring',
          getSizeClasses()
        )}
        aria-label={t('language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{localeConfig[currentLocale].flag}</span>
        <span className="hidden sm:inline">{localeConfig[currentLocale].nativeName}</span>
        <ChevronDown className={clsx(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1" role="listbox">
            {locales.map((locale) => {
              const config = localeConfig[locale]
              const isActive = locale === currentLocale
              
              return (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors focus-ring',
                    isActive && 'bg-primary-50 text-primary-700'
                  )}
                  role="option"
                  aria-selected={isActive}
                >
                  <span className="text-lg">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.nativeName}</span>
                    <span className="text-sm text-gray-500">{config.name}</span>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook personalizado para usar el selector de idioma
export function useLanguageSelector() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('ko')
  const pathname = usePathname()

  useEffect(() => {
    const pathSegments = pathname.split('/')
    const localeFromPath = pathSegments[1] as Locale
    if (locales.includes(localeFromPath)) {
      setCurrentLocale(localeFromPath)
    }
  }, [pathname])

  return {
    currentLocale,
    availableLocales: locales,
    localeConfig,
    setCurrentLocale
  }
}
