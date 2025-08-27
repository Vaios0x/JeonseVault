import { getRequestConfig } from 'next-intl/server'

// Configuración de idiomas soportados
export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]

// Configuración de idiomas por defecto y fallbacks
export const defaultLocale: Locale = 'en'
export const localePrefix = 'always' // 'as-needed' | 'always'

// Configuración principal de next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validar que el idioma esté soportado
  if (!locales.includes(locale as Locale)) {
    // En lugar de notFound(), usar el locale por defecto
    locale = defaultLocale
  }

  return {
    messages: (await import(`./i18n/${locale}.json`)).default,
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
