'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Loader2, Info, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToastHelpers } from '@/components/ui/Toast'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'
import { useCompliance } from '@/hooks/useCompliance'
import { formatAmount, parseAmount, formatPercentage } from '@/utils/formatters'
import { validateAmount } from '@/utils/validators'

// Esquema de validación
const investmentSchema = z.object({
  depositId: z.string().min(1, 'Selecciona un depósito'),
  amount: z.string()
    .min(1, 'Ingresa el monto a invertir')
    .refine(validateAmount, 'Monto inválido')
    .refine((val) => parseAmount(val) >= 50000n, 'Monto mínimo: 50,000 KRW')
    .refine((val) => parseAmount(val) <= 1000000000n, 'Monto máximo: 1,000,000,000 KRW'),
  investmentType: z.enum(['fixed', 'flexible'], {
    required_error: 'Selecciona el tipo de inversión'
  })
})

type InvestmentFormData = z.infer<typeof investmentSchema>

interface InvestmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  initialData?: Partial<InvestmentFormData>
  availableDeposits?: Array<{
    id: string
    propertyAddress: string
    availableAmount: bigint
    expectedReturn: bigint
    endDate: bigint
    investorCount: number
  }>
}

export function InvestmentForm({ 
  onSuccess, 
  onCancel, 
  className, 
  initialData,
  availableDeposits = []
}: InvestmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInvesting, setIsInvesting] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)
  const [estimatedReturn, setEstimatedReturn] = useState<bigint>(0n)
  const [estimatedShares, setEstimatedShares] = useState<bigint>(0n)
  
  const { investInPoolDemo, isProcessing } = useDemoTransactions()
  const { checkTransactionLimits, transactionLimit } = useCompliance()
  const { success, error } = useToastHelpers()
  const { isOpen: isConfirmModalOpen, open: openConfirmModal, close: closeConfirmModal } = useModal()

  // Funciones de cálculo local
  const calculateShares = (amount: bigint, totalPoolValue: bigint): bigint => {
    if (totalPoolValue === BigInt(0)) return BigInt(0)
    return (amount * BigInt(1000000)) / totalPoolValue
  }

  const calculateReturns = (shares: bigint, totalReturns: bigint, totalShares: bigint): bigint => {
    if (totalShares === BigInt(0)) return BigInt(0)
    return (shares * totalReturns) / totalShares
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      depositId: initialData?.depositId || '',
      amount: initialData?.amount || '',
      investmentType: initialData?.investmentType || 'fixed'
    }
  })

  const watchedAmount = watch('amount')
  const watchedDepositId = watch('depositId')

  // Calcular retornos estimados cuando cambian los valores
  useEffect(() => {
    if (watchedAmount && selectedDeposit) {
      const amount = parseAmount(watchedAmount)
      if (amount > 0n) {
        // Calcular shares basado en el monto y el pool total
        const shares = calculateShares(amount, selectedDeposit.totalAmount)
        setEstimatedShares(shares)
        
        // Calcular retorno estimado (6% anual)
        const annualReturn = (amount * BigInt(6)) / BigInt(100)
        const daysRemaining = selectedDeposit.endDate - BigInt(Math.floor(Date.now() / 1000))
        const dailyReturn = annualReturn / BigInt(365)
        const estimatedReturn = dailyReturn * daysRemaining
        setEstimatedReturn(estimatedReturn > 0n ? estimatedReturn : 0n)
      }
    }
  }, [watchedAmount, selectedDeposit, calculateShares])

  // Actualizar depósito seleccionado
  useEffect(() => {
    if (watchedDepositId) {
      const deposit = availableDeposits.find(d => d.id === watchedDepositId)
      setSelectedDeposit(deposit)
    }
  }, [watchedDepositId, availableDeposits])

  const onSubmit = async (data: InvestmentFormData) => {
    try {
      setIsSubmitting(true)
      
      const amount = parseAmount(data.amount)
      const depositId = BigInt(data.depositId)

      // Verificar límites de transacción
      const canInvest = checkTransactionLimits(data.amount)
      if (!canInvest) {
        error(`Límite de transacción excedido. Límite: ${formatAmount(transactionLimit)}`)
        return
      }

      // Mostrar modal de confirmación
      openConfirmModal()
      
    } catch (err) {
      console.error('Error en validación:', err)
      error('Error al validar la inversión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmInvestment = async () => {
    try {
      setIsInvesting(true)
      closeConfirmModal()

      const amount = parseAmount(watchedAmount)
      const depositId = BigInt(watchedDepositId)

      await investInPoolDemo(depositId)
      
      success('Inversión realizada exitosamente')
      onSuccess?.()
      
    } catch (err) {
      console.error('Error al invertir:', err)
      error('Error al realizar la inversión')
    } finally {
      setIsInvesting(false)
    }
  }

  const investmentTypeOptions = [
    { value: 'fixed', label: 'Inversión Fija', description: 'Retorno garantizado del 6% anual' },
    { value: 'flexible', label: 'Inversión Flexible', description: 'Retorno variable según rendimiento' }
  ]

  const depositOptions = availableDeposits.map(deposit => ({
    value: deposit.id,
    label: `${deposit.propertyAddress}`,
    description: `Disponible: ${formatAmount(deposit.availableAmount)} | Retorno: ${formatPercentage(deposit.expectedReturn, deposit.availableAmount)}`
  }))

  return (
    <>
      <div className={clsx('space-y-6', className)}>
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invertir en Pool de Depósitos
          </h2>
          <p className="text-gray-600">
            Selecciona un depósito y el monto que deseas invertir
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selección de Depósito */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Depósito <span className="text-red-500">*</span>
            </label>
            <Controller
              name="depositId"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="Selecciona un depósito"
                  options={depositOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.depositId?.message}
                />
              )}
            />
          </div>

          {/* Información del Depósito Seleccionado */}
          {selectedDeposit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Información del Depósito</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Dirección:</span>
                  <p className="font-medium">{selectedDeposit.propertyAddress}</p>
                </div>
                <div>
                  <span className="text-gray-600">Monto Disponible:</span>
                  <p className="font-medium text-green-600">
                    {formatAmount(selectedDeposit.availableAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Retorno Esperado:</span>
                  <p className="font-medium text-blue-600">
                    {formatPercentage(selectedDeposit.expectedReturn, selectedDeposit.availableAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Inversores:</span>
                  <p className="font-medium">{selectedDeposit.investorCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Inversión */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Inversión <span className="text-red-500">*</span>
            </label>
            <Controller
              name="investmentType"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="Selecciona el tipo"
                  options={investmentTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.investmentType?.message}
                />
              )}
            />
          </div>

          {/* Monto de Inversión */}
          <div className="space-y-2">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  label="Monto a Invertir (KRW)"
                  placeholder="500,000"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.amount?.message}
                  isRequired
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  formatOnBlur={(value) => formatAmount(parseAmount(value))}
                />
              )}
            />
            <p className="text-sm text-gray-500">
              Monto mínimo: 50,000 KRW | Monto máximo: 1,000,000,000 KRW
            </p>
          </div>

          {/* Cálculos Estimados */}
          {watchedAmount && selectedDeposit && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Calculator className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Estimaciones</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Shares Estimados:</span>
                  <p className="font-medium">{formatAmount(estimatedShares)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Retorno Estimado:</span>
                  <p className="font-medium text-green-600">
                    {formatAmount(estimatedReturn)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">ROI Estimado:</span>
                  <p className="font-medium text-blue-600">
                    {watchedAmount && estimatedReturn > 0n 
                      ? formatPercentage(estimatedReturn, parseAmount(watchedAmount))
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting || isProcessing}
              disabled={!isValid || isSubmitting || isProcessing}
              className="flex-1"
              leftIcon={<TrendingUp className="w-4 h-4" />}
            >
              {isSubmitting || isProcessing ? 'Procesando...' : 'Invertir'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isProcessing}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        title="Confirmar Inversión"
        variant="success"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-900">Resumen de la Inversión</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monto a Invertir:</span>
                <span className="font-medium">{formatAmount(parseAmount(watchedAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Depósito:</span>
                <span className="font-medium">{selectedDeposit?.propertyAddress}</span>
              </div>
              <div className="flex justify-between">
                <span>Shares Estimados:</span>
                <span className="font-medium">{formatAmount(estimatedShares)}</span>
              </div>
              <div className="flex justify-between">
                <span>Retorno Estimado:</span>
                <span className="font-medium text-green-600">{formatAmount(estimatedReturn)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-900">Información Importante</span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Las inversiones están sujetas a riesgos del mercado</li>
              <li>• Los retornos no están garantizados</li>
              <li>• Puedes retirar tu inversión antes del vencimiento con penalización</li>
              <li>• Se aplicará una comisión del 0.5% sobre los retornos</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={confirmInvestment}
            isLoading={isInvesting || isProcessing}
            disabled={isInvesting || isProcessing}
            className="flex-1"
          >
            Confirmar Inversión
          </Button>
          <Button
            variant="outline"
            onClick={closeConfirmModal}
            disabled={isInvesting || isProcessing}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  )
}
