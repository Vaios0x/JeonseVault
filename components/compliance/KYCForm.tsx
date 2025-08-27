'use client'

import { useState, useEffect } from 'react'
import { User, Shield, CheckCircle, AlertCircle, Camera, Upload, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'
import { validateKoreanID, validateKoreanPhone, validateKoreanName } from '@/utils/validators'

export interface KYCFormData {
  realName: string
  identificationNumber: string
  phoneNumber: string
  bankAccount: string
  bankName: string
  dateOfBirth: string
  address: string
  occupation: string
  annualIncome: string
  sourceOfFunds: string
  politicallyExposed: boolean
  politicallyExposedDetails?: string
}

export interface KYCFormProps {
  onSubmit?: (data: KYCFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<KYCFormData>
  isEdit?: boolean
  className?: string
}

export function KYCForm({
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
  className = ''
}: KYCFormProps) {
  const [formData, setFormData] = useState<KYCFormData>({
    realName: '',
    identificationNumber: '',
    phoneNumber: '',
    bankAccount: '',
    bankName: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    annualIncome: '',
    sourceOfFunds: '',
    politicallyExposed: false,
    politicallyExposedDetails: '',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [documentUpload, setDocumentUpload] = useState<{
    idCard: File | null
    selfie: File | null
    bankStatement: File | null
  }>({
    idCard: null,
    selfie: null,
    bankStatement: null
  })

  const { verifyUserDemo, isProcessing } = useDemoTransactions()

  const totalSteps = 4

  // Validar campos
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'realName':
        if (!value.trim()) return 'El nombre real es requerido'
        if (!validateKoreanName(value)) return 'Nombre inválido (solo caracteres coreanos)'
        break
      case 'identificationNumber':
        if (!value.trim()) return 'El número de identificación es requerido'
        if (!validateKoreanID(value)) return 'Número de identificación inválido'
        break
      case 'phoneNumber':
        if (!value.trim()) return 'El número de teléfono es requerido'
        if (!validateKoreanPhone(value)) return 'Número de teléfono inválido'
        break
      case 'bankAccount':
        if (!value.trim()) return 'La cuenta bancaria es requerida'
        if (!/^\d{3}-\d{3}-\d{6}$/.test(value)) return 'Formato de cuenta bancaria inválido (XXX-XXX-XXXXXX)'
        break
      case 'bankName':
        if (!value.trim()) return 'El nombre del banco es requerido'
        break
      case 'dateOfBirth':
        if (!value) return 'La fecha de nacimiento es requerida'
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        if (age < 18) return 'Debes ser mayor de 18 años'
        break
      case 'address':
        if (!value.trim()) return 'La dirección es requerida'
        break
      case 'occupation':
        if (!value.trim()) return 'La ocupación es requerida'
        break
      case 'annualIncome':
        if (!value.trim()) return 'El ingreso anual es requerido'
        if (parseInt(value) < 1000000) return 'El ingreso anual debe ser al menos 1,000,000 KRW'
        break
      case 'sourceOfFunds':
        if (!value.trim()) return 'La fuente de fondos es requerida'
        break
    }
    return ''
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        ['realName', 'identificationNumber', 'phoneNumber'].forEach(field => {
          const error = validateField(field, formData[field as keyof KYCFormData] as string)
          if (error) newErrors[field] = error
        })
        break
      case 2:
        ['bankAccount', 'bankName', 'dateOfBirth', 'address'].forEach(field => {
          const error = validateField(field, formData[field as keyof KYCFormData] as string)
          if (error) newErrors[field] = error
        })
        break
      case 3:
        ['occupation', 'annualIncome', 'sourceOfFunds'].forEach(field => {
          const error = validateField(field, formData[field as keyof KYCFormData] as string)
          if (error) newErrors[field] = error
        })
        break
      case 4:
        if (!documentUpload.idCard) newErrors.idCard = 'Carga tu documento de identidad'
        if (!documentUpload.selfie) newErrors.selfie = 'Toma una selfie'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileUpload = (type: keyof typeof documentUpload, file: File) => {
    setDocumentUpload(prev => ({ ...prev, [type]: file }))
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: '' }))
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Ejecutar verificación demo
      await verifyUserDemo({
        realName: formData.realName,
        idNumber: formData.identificationNumber,
        bankAccount: formData.bankAccount,
        level: 1 // Nivel básico
      })
      
      await onSubmit?.(formData)
    } catch (error) {
      console.error('Error submitting KYC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }

  const formatBankAccount = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 12)}`
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Información Personal
        </h3>
        <p className="text-gray-600 mb-6">
          Proporciona tu información personal básica para la verificación de identidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Real *
          </label>
          <Input
            id="realName"
            type="text"
            value={formData.realName}
            onChange={(e) => handleInputChange('realName', e.target.value)}
            placeholder="김철수"
            className={errors.realName ? 'border-red-300' : ''}
          />
          {errors.realName && (
            <p className="mt-1 text-sm text-red-600">{errors.realName}</p>
          )}
        </div>

        <div>
          <label htmlFor="identificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Identificación *
          </label>
          <div className="relative">
            <Input
              id="identificationNumber"
              type={showPassword ? 'text' : 'password'}
              value={formData.identificationNumber}
              onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
              placeholder="123456-1234567"
              className={errors.identificationNumber ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          {errors.identificationNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.identificationNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Teléfono *
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', formatPhoneNumber(e.target.value))}
            placeholder="010-1234-5678"
            className={errors.phoneNumber ? 'border-red-300' : ''}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'border-red-300' : ''}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Información Bancaria
        </h3>
        <p className="text-gray-600 mb-6">
          Proporciona tu información bancaria para la verificación de cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
            Banco *
          </label>
          <Select
            id="bankName"
            value={formData.bankName}
            onChange={(value) => handleInputChange('bankName', value)}
            options={[
              { value: '', label: 'Selecciona un banco' },
              { value: 'KB국민은행', label: 'KB국민은행' },
              { value: '신한은행', label: '신한은행' },
              { value: '우리은행', label: '우리은행' },
              { value: '하나은행', label: '하나은행' },
              { value: 'NH농협은행', label: 'NH농협은행' },
              { value: '기업은행', label: '기업은행' },
              { value: 'SC제일은행', label: 'SC제일은행' },
              { value: '케이뱅크', label: '케이뱅크' },
              { value: '카카오뱅크', label: '카카오뱅크' },
              { value: '토스뱅크', label: '토스뱅크' }
            ]}
            className={errors.bankName ? 'border-red-300' : ''}
          />
          {errors.bankName && (
            <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
          )}
        </div>

        <div>
          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Cuenta *
          </label>
          <Input
            id="bankAccount"
            type="text"
            value={formData.bankAccount}
            onChange={(e) => handleInputChange('bankAccount', formatBankAccount(e.target.value))}
            placeholder="123-456-789012"
            className={errors.bankAccount ? 'border-red-300' : ''}
          />
          {errors.bankAccount && (
            <p className="mt-1 text-sm text-red-600">{errors.bankAccount}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="서울특별시 강남구 역삼동 123-45"
            className={errors.address ? 'border-red-300' : ''}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Información Financiera
        </h3>
        <p className="text-gray-600 mb-6">
          Proporciona información sobre tu situación financiera y ocupación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
            Ocupación *
          </label>
          <Select
            id="occupation"
            value={formData.occupation}
            onChange={(value) => handleInputChange('occupation', value)}
            options={[
              { value: '', label: 'Selecciona tu ocupación' },
              { value: '직장인', label: '직장인 (Empleado)' },
              { value: '자영업자', label: '자영업자 (Autónomo)' },
              { value: '프리랜서', label: '프리랜서 (Freelancer)' },
              { value: '학생', label: '학생 (Estudiante)' },
              { value: '주부', label: '주부 (Ama de casa)' },
              { value: '무직', label: '무직 (Desempleado)' },
              { value: '기타', label: '기타 (Otro)' }
            ]}
            className={errors.occupation ? 'border-red-300' : ''}
          />
          {errors.occupation && (
            <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
          )}
        </div>

        <div>
          <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-2">
            Ingreso Anual (KRW) *
          </label>
          <Input
            id="annualIncome"
            type="number"
            value={formData.annualIncome}
            onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            placeholder="50000000"
            className={errors.annualIncome ? 'border-red-300' : ''}
          />
          {errors.annualIncome && (
            <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="sourceOfFunds" className="block text-sm font-medium text-gray-700 mb-2">
            Fuente de Fondos *
          </label>
          <Select
            id="sourceOfFunds"
            value={formData.sourceOfFunds}
            onChange={(value) => handleInputChange('sourceOfFunds', value)}
            options={[
              { value: '', label: 'Selecciona la fuente de fondos' },
              { value: '급여', label: '급여 (Salario)' },
              { value: '사업수익', label: '사업수익 (Ingresos empresariales)' },
              { value: '투자수익', label: '투자수익 (Ingresos por inversiones)' },
              { value: '상속', label: '상속 (Herencia)' },
              { value: '기타', label: '기타 (Otro)' }
            ]}
            className={errors.sourceOfFunds ? 'border-red-300' : ''}
          />
          {errors.sourceOfFunds && (
            <p className="mt-1 text-sm text-red-600">{errors.sourceOfFunds}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <input
              id="politicallyExposed"
              type="checkbox"
              checked={formData.politicallyExposed}
              onChange={(e) => handleInputChange('politicallyExposed', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="politicallyExposed" className="text-sm text-gray-700">
              ¿Eres una persona políticamente expuesta (PEP)?
            </label>
          </div>
          
          {formData.politicallyExposed && (
            <div className="mt-4">
              <label htmlFor="politicallyExposedDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Detalles de exposición política
              </label>
              <Input
                id="politicallyExposedDetails"
                type="text"
                value={formData.politicallyExposedDetails || ''}
                onChange={(e) => handleInputChange('politicallyExposedDetails', e.target.value)}
                placeholder="Proporciona detalles sobre tu posición política..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Documentos de Verificación
        </h3>
        <p className="text-gray-600 mb-6">
          Sube los documentos necesarios para completar tu verificación KYC.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documento de Identidad *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Sube una foto clara de tu documento de identidad
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('idCard', e.target.files[0])}
              className="hidden"
              id="idCard"
            />
            <label htmlFor="idCard" className="cursor-pointer">
              <Button variant="outline" size="sm">
                Seleccionar archivo
              </Button>
            </label>
            {documentUpload.idCard && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {documentUpload.idCard.name}
              </p>
            )}
          </div>
          {errors.idCard && (
            <p className="mt-1 text-sm text-red-600">{errors.idCard}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selfie con Documento *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Toma una selfie sosteniendo tu documento de identidad
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
              className="hidden"
              id="selfie"
            />
            <label htmlFor="selfie" className="cursor-pointer">
              <Button variant="outline" size="sm">
                Tomar foto
              </Button>
            </label>
            {documentUpload.selfie && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {documentUpload.selfie.name}
              </p>
            )}
          </div>
          {errors.selfie && (
            <p className="mt-1 text-sm text-red-600">{errors.selfie}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado de Cuenta Bancaria (Opcional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Sube un estado de cuenta reciente para verificación
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('bankStatement', e.target.files[0])}
              className="hidden"
              id="bankStatement"
            />
            <label htmlFor="bankStatement" className="cursor-pointer">
              <Button variant="outline" size="sm">
                Seleccionar archivo
              </Button>
            </label>
            {documentUpload.bankStatement && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {documentUpload.bankStatement.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-6 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar KYC' : 'Verificación KYC'}
          </h2>
          <span className="text-sm text-gray-600">
            Paso {currentStep} de {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Error Display - Removed for demo mode */}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevStep}
          disabled={isSubmitting}
        >
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        <div className="flex space-x-3">
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Completar Verificación'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
