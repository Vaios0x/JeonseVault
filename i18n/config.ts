import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Configuración de idiomas soportados
export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]

// Configuración de idiomas por defecto y fallbacks
export const defaultLocale: Locale = 'en'
export const localePrefix = 'always' // 'as-needed' | 'always'

// Configuración de idiomas
export const localeConfig = {
  ko: {
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr' as const,
    dateFormat: 'ko-KR',
    currency: 'KRW',
    numberFormat: 'ko-KR'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
    dateFormat: 'en-US',
    currency: 'USD',
    numberFormat: 'en-US'
  }
} as const

// Configuración de rutas internacionalizadas
export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/deposit': {
    '/': '/deposit',
    '/create': '/deposit/create'
  },
  '/investment': '/investment',
  '/stats': '/stats',
  '/help': '/help',
  '/docs': '/docs',
  '/contact': '/contact',
  '/privacy': '/privacy',
  '/terms': '/terms',
  '/security': '/security'
} as const

// Configuración principal de next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validar que el idioma esté soportado
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    messages: (await import(`./${locale}.json`)).default,
    timeZone: locale === 'ko' ? 'Asia/Seoul' : 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: locale === 'ko' ? 'KRW' : 'USD',
          currencyDisplay: locale === 'ko' ? 'symbol' : 'code'
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 2
        }
      }
    }
  }
})

// Utilidades para manejo de idiomas
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  
  return locales.includes(locale) ? locale : null
}

export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  
  if (locales.includes(locale)) {
    return '/' + segments.slice(2).join('/')
  }
  
  return pathname
}

export function createLocalizedPathname(
  pathname: string,
  locale: Locale,
  pathnames: Record<string, any> = {}
): string {
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname)
  
  // Buscar en pathnames configurados
  const pathnameConfig = pathnames[pathnameWithoutLocale]
  if (pathnameConfig) {
    return `/${locale}${typeof pathnameConfig === 'string' ? pathnameConfig : pathnameConfig[locale] || pathnameConfig}`
  }
  
  // Fallback a pathname original
  return `/${locale}${pathnameWithoutLocale}`
}

// Configuración de metadatos por idioma
export const metadataConfig = {
  ko: {
    title: 'JeonseVault - 혁신적인 전세 보증금 스마트 컨트랙트 플랫폼',
    description: '한국의 전세 시스템을 위한 블록체인 기반 에스크로 플랫폼. 안전하고 투명한 보증금 관리와 투자 기회를 제공합니다.',
    keywords: ['전세', '보증금', '블록체인', '스마트컨트랙트', '에스크로', '투자', 'Kaia', '스테이블코인'],
    openGraph: {
      title: 'JeonseVault - 전세 보증금 스마트 컨트랙트 플랫폼',
      description: '900조원 규모의 전세 시장을 혁신하는 블록체인 솔루션',
      locale: 'ko_KR'
    }
  },
  en: {
    title: 'JeonseVault - Revolutionary Smart Contract Escrow Platform for Korean Housing Deposits',
    description: 'Blockchain-based escrow platform for Korea\'s Jeonse housing deposit system. Providing safe and transparent deposit management and investment opportunities.',
    keywords: ['jeonse', 'deposit', 'blockchain', 'smart contract', 'escrow', 'investment', 'kaia', 'stablecoin', 'korea'],
    openGraph: {
      title: 'JeonseVault - Smart Contract Escrow Platform',
      description: 'Revolutionizing the 900 trillion KRW Jeonse market with blockchain solutions',
      locale: 'en_US'
    }
  }
} as const
