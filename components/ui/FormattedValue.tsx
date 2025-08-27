'use client'

import { useLocale } from 'next-intl'
import { formatDate, formatNumber, formatCurrency, formatPercent } from '@/i18n/locales'

interface FormattedValueProps {
  value: string | number | Date
  type: 'date' | 'number' | 'currency' | 'percent'
  options?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions
  currency?: string
  className?: string
}

export function FormattedValue({ 
  value, 
  type, 
  options, 
  currency,
  className 
}: FormattedValueProps) {
  const locale = useLocale()

  const formatValue = () => {
    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return formatDate(value, locale, options as Intl.DateTimeFormatOptions)
        }
        return formatDate(new Date(value as string), locale, options as Intl.DateTimeFormatOptions)
      
      case 'number':
        return formatNumber(value as number, locale, options as Intl.NumberFormatOptions)
      
      case 'currency':
        return formatCurrency(value as number, locale, currency)
      
      case 'percent':
        return formatPercent(value as number, locale, options as Intl.NumberFormatOptions)
      
      default:
        return String(value)
    }
  }

  return (
    <span className={className}>
      {formatValue()}
    </span>
  )
}

// Componente específico para fechas
interface FormattedDateProps {
  date: Date | string
  format?: 'short' | 'long' | 'relative'
  className?: string
}

export function FormattedDate({ date, format = 'short', className }: FormattedDateProps) {
  const locale = useLocale()
  
  const getOptions = (): Intl.DateTimeFormatOptions => {
    switch (format) {
      case 'long':
        return {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      case 'relative':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
      default:
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
    }
  }

  const dateObj = date instanceof Date ? date : new Date(date)
  const formattedDate = formatDate(dateObj, locale, getOptions())

  return (
    <span className={className} title={dateObj.toISOString()}>
      {formattedDate}
    </span>
  )
}

// Componente específico para monedas
interface FormattedCurrencyProps {
  amount: number
  currency?: string
  showSymbol?: boolean
  className?: string
}

export function FormattedCurrency({ 
  amount, 
  currency, 
  showSymbol = true,
  className 
}: FormattedCurrencyProps) {
  const locale = useLocale()
  const formattedAmount = formatCurrency(amount, locale, currency)

  return (
    <span className={className}>
      {formattedAmount}
    </span>
  )
}

// Componente específico para números
interface FormattedNumberProps {
  value: number
  decimals?: number
  className?: string
}

export function FormattedNumber({ value, decimals = 2, className }: FormattedNumberProps) {
  const locale = useLocale()
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }
  
  const formattedNumber = formatNumber(value, locale, options)

  return (
    <span className={className}>
      {formattedNumber}
    </span>
  )
}

// Componente específico para porcentajes
interface FormattedPercentProps {
  value: number
  decimals?: number
  className?: string
}

export function FormattedPercent({ value, decimals = 2, className }: FormattedPercentProps) {
  const locale = useLocale()
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }
  
  const formattedPercent = formatPercent(value, locale, options)

  return (
    <span className={className}>
      {formattedPercent}
    </span>
  )
}

// Componente para valores de blockchain (direcciones, hashes, etc.)
interface FormattedBlockchainValueProps {
  value: string
  type: 'address' | 'hash' | 'transaction'
  maxLength?: number
  className?: string
}

export function FormattedBlockchainValue({ 
  value, 
  type, 
  maxLength = 10,
  className 
}: FormattedBlockchainValueProps) {
  const formatBlockchainValue = () => {
    if (value.length <= maxLength) {
      return value
    }

    const prefix = value.slice(0, maxLength / 2)
    const suffix = value.slice(-maxLength / 2)
    return `${prefix}...${suffix}`
  }

  const getTitle = () => {
    switch (type) {
      case 'address':
        return 'Blockchain Address'
      case 'hash':
        return 'Transaction Hash'
      case 'transaction':
        return 'Transaction ID'
      default:
        return value
    }
  }

  return (
    <span 
      className={className} 
      title={getTitle()}
    >
      {formatBlockchainValue()}
    </span>
  )
}
