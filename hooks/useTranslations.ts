'use client'

import { useTranslations as useNextIntlTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { formatDate, formatNumber, formatCurrency, formatPercent } from '@/i18n/locales'

// Hook personalizado para traducciones con tipado fuerte
export function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace)
  const locale = useLocale()

  return {
    t,
    locale,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, locale, options),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => 
      formatNumber(value, locale, options),
    formatCurrency: (value: number, currency?: string) => 
      formatCurrency(value, locale, currency),
    formatPercent: (value: number, options?: Intl.NumberFormatOptions) => 
      formatPercent(value, locale, options)
  }
}

// Hook para traducciones específicas de componentes
export function useComponentTranslations(componentName: string) {
  return useTranslations(componentName)
}

// Hook para traducciones de formularios
export function useFormTranslations(formName: string) {
  const t = useTranslations(formName)
  
  return {
    ...t,
    getFieldLabel: (fieldName: string) => t.t(`form.${fieldName}`),
    getFieldPlaceholder: (fieldName: string) => t.t(`form.${fieldName}Placeholder`),
    getFieldError: (fieldName: string, errorType: string) => t.t(`validation.${fieldName}.${errorType}`),
    getSubmitText: () => t.t('form.submit'),
    getCancelText: () => t.t('form.cancel')
  }
}

// Hook para traducciones de errores
export function useErrorTranslations() {
  const t = useTranslations('errors')
  
  return {
    ...t,
    getErrorMessage: (errorCode: string, fallback?: string) => {
      try {
        return t.t(errorCode)
      } catch {
        return fallback || t.t('unknown')
      }
    },
    getNetworkError: () => t.t('network'),
    getTransactionError: () => t.t('transaction'),
    getValidationError: () => t.t('validation'),
    getUnauthorizedError: () => t.t('unauthorized')
  }
}

// Hook para traducciones de notificaciones
export function useNotificationTranslations() {
  const t = useTranslations('notifications')
  
  return {
    ...t,
    getSuccessMessage: (action: string) => {
      try {
        return t.t(`${action}Success`)
      } catch {
        return t.t('success')
      }
    },
    getErrorMessage: (action: string) => {
      try {
        return t.t(`${action}Error`)
      } catch {
        return t.t('error')
      }
    },
    getPendingMessage: (action: string) => {
      try {
        return t.t(`${action}Pending`)
      } catch {
        return t.t('info')
      }
    }
  }
}

// Hook para traducciones de navegación
export function useNavigationTranslations() {
  const t = useTranslations('navigation')
  
  return {
    ...t,
    getPageTitle: (page: string) => t.t(page),
    getBreadcrumb: (page: string) => t.t(page),
    getMenuLabel: (item: string) => t.t(item)
  }
}

// Hook para traducciones de wallet
export function useWalletTranslations() {
  const t = useTranslations('wallet')
  
  return {
    ...t,
    getConnectionStatus: (isConnected: boolean) => 
      isConnected ? t.t('connected') : t.t('notConnected'),
    getNetworkStatus: (isCorrectNetwork: boolean) => 
      isCorrectNetwork ? t.t('network') : t.t('wrongNetwork'),
    getBalanceText: (balance: string) => `${t.t('balance')}: ${balance}`,
    getAddressText: (address: string) => `${t.t('address')}: ${address}`
  }
}

// Hook para traducciones de depósitos
export function useDepositTranslations() {
  const t = useTranslations('deposit')
  
  return {
    ...t,
    getStatusText: (status: string) => t.t(`status.${status}`),
    getActionText: (action: string) => t.t(`actions.${action}`),
    getFormField: (field: string) => t.t(`form.${field}`),
    getValidationError: (field: string, error: string) => t.t(`validation.${field}${error}`)
  }
}

// Hook para traducciones de inversión
export function useInvestmentTranslations() {
  const t = useTranslations('investment')
  
  return {
    ...t,
    getStatText: (stat: string) => t.t(`stats.${stat}`),
    getPoolAction: (action: string) => t.t(`pools.${action}`),
    getCalculatorField: (field: string) => t.t(`calculator.${field}`)
  }
}

// Hook para traducciones del dashboard
export function useDashboardTranslations() {
  const t = useTranslations('dashboard')
  
  return {
    ...t,
    getWelcomeMessage: (name: string) => t.t('welcome', { name }),
    getStatText: (stat: string) => t.t(`stats.${stat}`),
    getActionText: (action: string) => t.t(`actions.${action}`)
  }
}

// Hook para traducciones del footer
export function useFooterTranslations() {
  const t = useTranslations('footer')
  
  return {
    ...t,
    getCopyrightText: (year: number) => t.t('copyright', { year }),
    getLinkText: (link: string) => t.t(link)
  }
}
