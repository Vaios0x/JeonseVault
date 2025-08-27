import { createSharedPathnamesNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from './config'

// Configuración de navegación compartida
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  defaultLocale
})

// Tipos para configuración de idiomas
export interface LocaleInfo {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  currency: string
  numberFormat: string
}

// Información detallada de idiomas
export const localeInfo: Record<string, LocaleInfo> = {
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    dateFormat: 'ko-KR',
    currency: 'KRW',
    numberFormat: 'ko-KR'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'en-US',
    currency: 'USD',
    numberFormat: 'en-US'
  }
}

// Utilidades para manejo de idiomas
export function getLocaleInfo(locale: string): LocaleInfo | null {
  return localeInfo[locale] || null
}

export function getAllLocales(): LocaleInfo[] {
  return Object.values(localeInfo)
}

export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as any)
}

// Detección automática de idioma
export function detectUserLocale(): string {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  // Obtener idioma del navegador
  const browserLocale = navigator.language || navigator.languages?.[0]
  
  if (browserLocale) {
    // Extraer código de idioma principal
    const primaryLocale = browserLocale.split('-')[0]
    
    // Verificar si está soportado
    if (isValidLocale(primaryLocale)) {
      return primaryLocale
    }
    
    // Verificar si el locale completo está soportado
    if (isValidLocale(browserLocale)) {
      return browserLocale
    }
  }

  return defaultLocale
}

// Formateo de fechas por idioma
export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const localeInfo = getLocaleInfo(locale)
  const dateFormat = localeInfo?.dateFormat || 'en-US'
  
  return new Intl.DateTimeFormat(dateFormat, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date)
}

// Formateo de números por idioma
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  const localeInfo = getLocaleInfo(locale)
  const numberFormat = localeInfo?.numberFormat || 'en-US'
  
  return new Intl.NumberFormat(numberFormat, options).format(value)
}

// Formateo de moneda por idioma
export function formatCurrency(
  value: number,
  locale: string,
  currency?: string
): string {
  const localeInfo = getLocaleInfo(locale)
  const currencyCode = currency || localeInfo?.currency || 'USD'
  const numberFormat = localeInfo?.numberFormat || 'en-US'
  
  return new Intl.NumberFormat(numberFormat, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: locale === 'ko' ? 'symbol' : 'code'
  }).format(value)
}

// Formateo de porcentajes por idioma
export function formatPercent(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  const localeInfo = getLocaleInfo(locale)
  const numberFormat = localeInfo?.numberFormat || 'en-US'
  
  return new Intl.NumberFormat(numberFormat, {
    style: 'percent',
    minimumFractionDigits: 2,
    ...options
  }).format(value / 100)
}

// Utilidades para navegación entre idiomas
export function getAlternateLanguages(currentLocale: string): LocaleInfo[] {
  return getAllLocales().filter(locale => locale.code !== currentLocale)
}

export function createAlternateLinks(
  pathname: string,
  currentLocale: string
): Array<{ locale: string; href: string; label: string }> {
  return getAlternateLanguages(currentLocale).map(locale => ({
    locale: locale.code,
    href: `/${locale.code}${pathname}`,
    label: locale.nativeName
  }))
}

// Configuración de SEO para múltiples idiomas
export function generateAlternateLinks(
  pathname: string,
  currentLocale: string,
  baseUrl: string
): Array<{ lang: string; href: string }> {
  return getAllLocales().map(locale => ({
    lang: locale.code,
    href: `${baseUrl}/${locale.code}${pathname}`
  }))
}

// Utilidades para validación de contenido
export function validateTranslationKey(key: string, namespace?: string): boolean {
  // Validar formato de clave de traducción
  const keyPattern = /^[a-zA-Z0-9._-]+$/
  return keyPattern.test(key)
}

export function sanitizeTranslationValue(value: string): string {
  // Sanitizar valores de traducción para prevenir XSS
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Configuración de fallbacks
export const fallbackConfig = {
  ko: {
    fallback: 'en',
    fallbackNamespaces: ['common', 'errors']
  },
  en: {
    fallback: 'ko',
    fallbackNamespaces: ['common', 'errors']
  }
} as const

// Utilidades para debugging
export function debugLocale(locale: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[i18n] Current locale: ${locale}`)
    console.log(`[i18n] Locale info:`, getLocaleInfo(locale))
    console.log(`[i18n] Available locales:`, getAllLocales().map(l => l.code))
  }
}

// Hook personalizado para manejo de idiomas
export function useLocaleUtils() {
  return {
    detectUserLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    getLocaleInfo,
    getAllLocales,
    isValidLocale,
    getAlternateLanguages,
    createAlternateLinks,
    generateAlternateLinks,
    validateTranslationKey,
    sanitizeTranslationValue,
    debugLocale
  }
}
