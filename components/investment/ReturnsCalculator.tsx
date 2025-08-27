'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Calculator, TrendingUp, DollarSign, Calendar, Percent, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatAmount, formatPercentage } from '@/utils/formatters'

interface ReturnsCalculatorProps {
  className?: string
  initialAmount?: bigint
  initialDuration?: number
  initialReturnRate?: number
}

interface CalculationResult {
  principal: bigint
  annualReturn: bigint
  totalReturn: bigint
  monthlyReturn: bigint
  effectiveRate: number
  totalValue: bigint
  profit: bigint
}

export function ReturnsCalculator({
  className,
  initialAmount = BigInt('100000000000000000000000'), // 100M KRW
  initialDuration = 12,
  initialReturnRate = 6.0
}: ReturnsCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(initialAmount)
  const [duration, setDuration] = useState(initialDuration)
  const [returnRate, setReturnRate] = useState(initialReturnRate)
  const [compoundFrequency, setCompoundFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly')

  // Calcular retornos
  const calculation = useMemo((): CalculationResult => {
    const principal = investmentAmount
    const rate = returnRate / 100
    const time = duration / 12 // Convertir meses a años
    
    // Calcular retorno anual
    const annualReturn = (principal * BigInt(Math.floor(rate * 1000))) / BigInt(1000)
    
    // Calcular retorno total basado en frecuencia de capitalización
    let totalReturn: bigint
    let effectiveRate: number
    
    switch (compoundFrequency) {
      case 'monthly':
        const monthlyRate = rate / 12
        const months = duration
        totalReturn = principal * BigInt(Math.floor(Math.pow(1 + monthlyRate, months) * 1000)) / BigInt(1000)
        effectiveRate = (Math.pow(1 + monthlyRate, months) - 1) * 100
        break
      case 'quarterly':
        const quarterlyRate = rate / 4
        const quarters = duration / 3
        totalReturn = principal * BigInt(Math.floor(Math.pow(1 + quarterlyRate, quarters) * 1000)) / BigInt(1000)
        effectiveRate = (Math.pow(1 + quarterlyRate, quarters) - 1) * 100
        break
      case 'annually':
        totalReturn = principal * BigInt(Math.floor(Math.pow(1 + rate, time) * 1000)) / BigInt(1000)
        effectiveRate = (Math.pow(1 + rate, time) - 1) * 100
        break
      default:
        totalReturn = annualReturn * BigInt(duration) / BigInt(12)
        effectiveRate = rate * time * 100
    }
    
    const monthlyReturn = annualReturn / BigInt(12)
    const totalValue = principal + totalReturn
    const profit = totalReturn
    
    return {
      principal,
      annualReturn,
      totalReturn,
      monthlyReturn,
      effectiveRate,
      totalValue,
      profit
    }
  }, [investmentAmount, duration, returnRate, compoundFrequency])

  const handleAmountChange = (value: string) => {
    const amount = BigInt(value.replace(/[^0-9]/g, '') || '0')
    setInvestmentAmount(amount)
  }

  const handleDurationChange = (value: string) => {
    const months = parseInt(value) || 12
    setDuration(months)
  }

  const handleReturnRateChange = (value: string) => {
    const rate = parseFloat(value) || 6.0
    setReturnRate(rate)
  }

  const presetAmounts = [
    { label: '10M KRW', value: BigInt('10000000000000000000000') },
    { label: '50M KRW', value: BigInt('50000000000000000000000') },
    { label: '100M KRW', value: BigInt('100000000000000000000000') },
    { label: '500M KRW', value: BigInt('500000000000000000000000') }
  ]

  const presetDurations = [
    { label: '6 meses', value: 6 },
    { label: '12 meses', value: 12 },
    { label: '18 meses', value: 18 },
    { label: '24 meses', value: 24 }
  ]

  const presetRates = [
    { label: '4.5%', value: 4.5 },
    { label: '6.0%', value: 6.0 },
    { label: '7.5%', value: 7.5 },
    { label: '9.0%', value: 9.0 }
  ]

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calculadora de Retornos</h3>
          <p className="text-sm text-gray-600">Simula tus inversiones y proyecta ganancias</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Monto de inversión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto de inversión
          </label>
          <Input
            value={formatAmount(investmentAmount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            placeholder="Ingresa el monto"
          />
          <div className="flex items-center gap-2 mt-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset.value.toString()}
                onClick={() => setInvestmentAmount(preset.value)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  investmentAmount === preset.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración de la inversión
          </label>
          <Input
            value={duration.toString()}
            onChange={(e) => handleDurationChange(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            placeholder="Meses"
            type="number"
            min="1"
            max="60"
          />
          <div className="flex items-center gap-2 mt-2">
            {presetDurations.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDuration(preset.value)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  duration === preset.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasa de retorno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de retorno anual
          </label>
          <Input
            value={returnRate.toString()}
            onChange={(e) => handleReturnRateChange(e.target.value)}
            leftIcon={<Percent className="w-4 h-4" />}
            placeholder="Porcentaje"
            type="number"
            step="0.1"
            min="0"
            max="50"
          />
          <div className="flex items-center gap-2 mt-2">
            {presetRates.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setReturnRate(preset.value)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  returnRate === preset.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frecuencia de capitalización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia de capitalización
          </label>
          <Select
            options={[
              { value: 'monthly', label: 'Mensual' },
              { value: 'quarterly', label: 'Trimestral' },
              { value: 'annually', label: 'Anual' }
            ]}
            value={compoundFrequency}
            onChange={(value) => setCompoundFrequency(value as typeof compoundFrequency)}
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Proyección de Retornos</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inversión inicial</span>
              <span className="font-semibold text-gray-900">
                {formatAmount(calculation.principal)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retorno anual</span>
              <span className="font-semibold text-green-600">
                {formatAmount(calculation.annualReturn)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retorno mensual</span>
              <span className="font-semibold text-green-600">
                {formatAmount(calculation.monthlyReturn)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa efectiva</span>
              <span className="font-semibold text-blue-600">
                {calculation.effectiveRate.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retorno total</span>
              <span className="font-semibold text-green-600">
                {formatAmount(calculation.totalReturn)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valor final</span>
              <span className="font-semibold text-purple-600">
                {formatAmount(calculation.totalValue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ganancia neta</span>
              <span className="font-semibold text-green-600">
                {formatAmount(calculation.profit)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ROI total</span>
              <span className="font-semibold text-blue-600">
                {formatPercentage(calculation.profit, calculation.principal)}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen visual */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Desglose de la inversión</span>
            <span className="text-sm font-medium text-gray-900">
              {formatAmount(calculation.totalValue)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(Number(calculation.principal) / Number(calculation.totalValue)) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Principal: {formatAmount(calculation.principal)}</span>
            <span>Ganancia: {formatAmount(calculation.profit)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <Button variant="primary" className="flex-1">
          <TrendingUp className="w-4 h-4 mr-2" />
          Invertir Ahora
        </Button>
        <Button variant="outline">
          Guardar Simulación
        </Button>
      </div>

      {/* Notas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Los cálculos son estimaciones y no garantizan retornos futuros</p>
        <p>• Las tasas pueden variar según las condiciones del mercado</p>
        <p>• No incluye comisiones ni impuestos</p>
      </div>
    </div>
  )
}
