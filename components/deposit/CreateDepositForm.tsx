'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { 
  Home, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast, useToastHelpers } from '@/components/ui/Toast'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'
import { usePropertyOracle } from '@/hooks/usePropertyOracle'
import { useCompliance } from '@/hooks/useCompliance'
import { formatAmount, parseAmount } from '@/utils/formatters'
import { useTranslations } from 'next-intl'

// Esquema de validación
const createDepositSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  propertyAddress: z.string().min(10, 'Address must have at least 10 characters'),
  landlordAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => {
      const amount = parseAmount(val)
      return amount >= BigInt(1000000) && amount <= BigInt(10000000000) // 1M - 10B KRW
    },
    'Amount must be between 1,000,000 and 10,000,000,000 KRW'
  ),
  endDate: z.string().min(1, 'End date is required').refine(
    (val) => {
      const date = new Date(val)
      const now = new Date()
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      return date > now && date <= oneYearFromNow
    },
    'Date must be between today and one year'
  ),
  enableInvestment: z.boolean().default(false),
  investmentPercentage: z.number().min(10).max(50).optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional()
})

type CreateDepositFormData = z.infer<typeof createDepositSchema>

// Props del componente
interface CreateDepositFormProps {
  onSuccess?: (depositId: string) => void
  onCancel?: () => void
  className?: string
  initialData?: Partial<CreateDepositFormData>
}

// Tipos de propiedad
const propertyTypes = [
  { value: 'apartment', label: '아파트 (Apartamento)', icon: <Home className="w-4 h-4" /> },
  { value: 'house', label: '단독주택 (Casa individual)', icon: <Home className="w-4 h-4" /> },
  { value: 'officetel', label: '오피스텔 (Oficetel)', icon: <Home className="w-4 h-4" /> },
  { value: 'villa', label: '빌라 (Villa)', icon: <Home className="w-4 h-4" /> },
  { value: 'commercial', label: '상업용 (Comercial)', icon: <Home className="w-4 h-4" /> }
]

export function CreateDepositForm({
  onSuccess,
  onCancel,
  className,
  initialData
}: CreateDepositFormProps) {
  const t = useTranslations('createDeposit')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propertyType, setPropertyType] = useState('apartment')
  const [showInvestmentOptions, setShowInvestmentOptions] = useState(false)
  const [estimatedReturn, setEstimatedReturn] = useState<bigint>(BigInt(0))
  
  const { success, error, warning } = useToastHelpers()
  const { createDepositDemo, isProcessing } = useDemoTransactions()
  const { getPropertyById, isVerifying } = usePropertyOracle()
  const { checkCompliance, userCompliance } = useCompliance()
  
  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors, isValid } 
  } = useForm<CreateDepositFormData>({
    resolver: zodResolver(createDepositSchema),
    defaultValues: {
      propertyId: '',
      propertyAddress: '',
      landlordAddress: '',
      amount: '',
      endDate: '',
      enableInvestment: false,
      investmentPercentage: 20,
      description: '',
      ...initialData
    },
    mode: 'onChange'
  })

  const watchedAmount = watch('amount')
  const watchedInvestmentPercentage = watch('investmentPercentage')
  const watchedEnableInvestment = watch('enableInvestment')

  // Calcular retorno estimado
    const calculateEstimatedReturn = useCallback((amount: string, percentage: number) => {
    if (!amount || !percentage) return BigInt(0)

    const depositAmount = parseAmount(amount)
    const investmentAmount = (depositAmount * BigInt(percentage)) / BigInt(100)
    const annualReturn = (investmentAmount * BigInt(6)) / BigInt(100) // 6% anual
    const duration = 365 // días
    
    return annualReturn
  }, [])

  // Actualizar retorno estimado cuando cambian los valores
  useEffect(() => {
    if (watchedAmount && watchedInvestmentPercentage && watchedEnableInvestment) {
      const returnAmount = calculateEstimatedReturn(watchedAmount, watchedInvestmentPercentage)
      setEstimatedReturn(returnAmount)
    }
  }, [watchedAmount, watchedInvestmentPercentage, watchedEnableInvestment, calculateEstimatedReturn])

  // Verificar propiedad
  const handlePropertyVerification = async (propertyId: string, landlordAddress: string) => {
    try {
      const property = getPropertyById(propertyId)
      if (property && property.isVerified && property.owner.toLowerCase() === landlordAddress.toLowerCase()) {
        success('Property verified successfully', 'Property verified')
        return true
      } else {
        warning('Property needs manual verification', 'Property not verified')
        return false
      }
    } catch (err) {
      error('Could not verify property', 'Verification error')
      return false
    }
  }

  // Verificar compliance del usuario
  const handleComplianceCheck = async () => {
    try {
      const isCompliant = await checkCompliance()
      if (!isCompliant) {
        error('You must complete the KYC process before creating deposits', 'User not verified')
        return false
      }
      return true
    } catch (err) {
      error('Could not verify compliance status', 'Verification error')
      return false
    }
  }

  // Manejar envío del formulario
  const onSubmit = async (data: CreateDepositFormData) => {
    try {
      setIsSubmitting(true)

      // Verificar compliance
      const isCompliant = await handleComplianceCheck()
      if (!isCompliant) return

      // Verificar límites de transacción
      const amount = parseAmount(data.amount)
      if (userCompliance && amount > userCompliance.transactionLimit) {
        error(`Amount exceeds your transaction limit of ${formatAmount(userCompliance.transactionLimit)} KRW`, 'Limit exceeded')
        return
      }

      // Crear depósito demo
      const endDateTimestamp = Math.floor(new Date(data.endDate).getTime() / 1000)
      
      await createDepositDemo({
        landlord: data.landlordAddress,
        endDate: endDateTimestamp,
        propertyId: data.propertyId,
        propertyAddress: data.propertyAddress,
        enableInvestment: data.enableInvestment
      })

      success('Deposit created successfully')
      onSuccess?.('success')
    } catch (err) {
      console.error('Error creating deposit:', err)
      error(err instanceof Error ? err.message : 'Unknown error', 'Error creating deposit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-gray-600 mt-2">
          {t('description')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información de la propiedad */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2 text-primary-600" />
            {t('form.propertyInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('form.propertyId')}
                  placeholder="gangnam-apt-101"
                  error={errors.propertyId?.message}
                  isRequired
                  leftIcon={<MapPin className="w-4 h-4" />}
                  helperText={t('form.propertyIdHelp')}
                />
              )}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.propertyType')}
              </label>
              <Select
                options={propertyTypes}
                value={propertyType}
                onChange={setPropertyType}
              />
            </div>
            
            <Controller
              name="propertyAddress"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('form.propertyAddress')}
                  placeholder="서울특별시 강남구 역삼동 123-45"
                  error={errors.propertyAddress?.message}
                  isRequired
                  leftIcon={<MapPin className="w-4 h-4" />}
                  helperText={t('form.propertyAddressHelp')}
                />
              )}
            />
            
            <Controller
              name="landlordAddress"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('form.landlordAddress')}
                  placeholder="0x..."
                  error={errors.landlordAddress?.message}
                  isRequired
                  leftIcon={<User className="w-4 h-4" />}
                  helperText={t('form.landlordAddressHelp')}
                />
              )}
            />
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const propertyId = watch('propertyId')
                const landlordAddress = watch('landlordAddress')
                if (propertyId && landlordAddress) {
                  handlePropertyVerification(propertyId, landlordAddress)
                }
              }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('form.verifyProperty')}</span>
            </Button>
          </div>
        </div>

        {/* Información del depósito */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
            {t('form.depositInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('form.amount')}
                  placeholder="500,000,000"
                  error={errors.amount?.message}
                  isRequired
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  helperText={t('form.amountHelp')}
                  formatOnBlur={(value) => {
                    const amount = parseAmount(value)
                    return formatAmount(amount)
                  }}
                />
              )}
            />
            
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label={t('form.endDate')}
                  error={errors.endDate?.message}
                  isRequired
                  leftIcon={<Calendar className="w-4 h-4" />}
                  helperText={t('form.endDateHelp')}
                />
              )}
            />
          </div>
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={t('form.description')}
                placeholder={t('form.descriptionPlaceholder')}
                error={errors.description?.message}
                leftIcon={<AlertCircle className="w-4 h-4" />}
                helperText={t('form.descriptionHelp')}
              />
            )}
          />
        </div>

        {/* Opciones de inversión */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              {t('form.investmentOptions')}
            </h3>
            
            <Controller
              name="enableInvestment"
              control={control}
              render={({ field }) => (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked)
                      setShowInvestmentOptions(e.target.checked)
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('form.enableInvestment')}
                  </span>
                </label>
              )}
            />
          </div>
          
          {showInvestmentOptions && (
            <div className="space-y-4">
              <Controller
                name="investmentPercentage"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.investmentPercentage')}: {field.value || 20}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={field.value || 20}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10%</span>
                      <span>50%</span>
                    </div>
                  </div>
                )}
              />
              
              {estimatedReturn > BigInt(0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                                      <span className="font-medium text-green-800">
                    {t('form.estimatedReturn')}: {formatAmount(estimatedReturn)} KRW
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {t('form.estimatedReturnDescription')}
                </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información de compliance */}
        {userCompliance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">
              {t('form.transactionLimit')}: {formatAmount(userCompliance.transactionLimit)} KRW
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {t('form.complianceLevel')}: {userCompliance.level}
          </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('form.cancel')}
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting || isProcessing}
            isLoading={isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('form.creating')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
