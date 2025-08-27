'use client'

import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { User, Shield, CheckCircle, AlertCircle, Upload, Camera, FileText, Eye, EyeOff, Calendar, MapPin, Phone, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useDemoTransactions } from '@/hooks/useDemoTransactions'
import { validateKoreanID, validateKoreanPhone } from '@/utils/validators'

// Esquema de validación
const realNameVerificationSchema = z.object({
  realName: z.string()
    .min(1, 'Ingresa tu nombre real')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[가-힣\s]+$/, 'Solo se permiten caracteres coreanos'),
  identificationNumber: z.string()
    .min(1, 'Ingresa tu número de identificación')
    .refine(validateKoreanID, 'Número de identificación inválido'),
  dateOfBirth: z.string()
    .min(1, 'Selecciona tu fecha de nacimiento'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Selecciona tu género'
  }),
  phoneNumber: z.string()
    .min(1, 'Ingresa tu número de teléfono')
    .refine(validateKoreanPhone, 'Número de teléfono inválido'),
  address: z.object({
    postalCode: z.string().min(1, 'Ingresa el código postal'),
    address1: z.string().min(1, 'Ingresa la dirección'),
    address2: z.string().optional(),
    city: z.string().min(1, 'Ingresa la ciudad'),
    province: z.string().min(1, 'Selecciona la provincia')
  }),
  documentType: z.enum(['id_card', 'passport', 'driver_license'], {
    required_error: 'Selecciona el tipo de documento'
  }),
  documentFront: z.any().refine((file) => file && file.size > 0, 'Sube la imagen frontal del documento'),
  documentBack: z.any().refine((file) => file && file.size > 0, 'Sube la imagen trasera del documento'),
  selfie: z.any().refine((file) => file && file.size > 0, 'Sube una selfie con el documento')
})

type RealNameVerificationFormData = z.infer<typeof realNameVerificationSchema>

interface RealNameVerificationProps {
  className?: string
  onSuccess?: (verificationData: any) => void
  onCancel?: () => void
  initialData?: Partial<RealNameVerificationFormData>
}

export function RealNameVerification({ 
  className, 
  onSuccess, 
  onCancel,
  initialData 
}: RealNameVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showIdNumber, setShowIdNumber] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{
    documentFront?: File
    documentBack?: File
    selfie?: File
  }>({})
  
  const { verifyUserDemo, isProcessing } = useDemoTransactions()
  const { addToast } = useToast()
  const { isOpen: isConfirmModalOpen, open: openConfirmModal, close: closeConfirmModal } = useModal()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RealNameVerificationFormData>({
    resolver: zodResolver(realNameVerificationSchema),
    defaultValues: {
      realName: initialData?.realName || '',
      identificationNumber: initialData?.identificationNumber || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      gender: initialData?.gender || 'male',
      phoneNumber: initialData?.phoneNumber || '',
      address: initialData?.address || {
        postalCode: '',
        address1: '',
        address2: '',
        city: '',
        province: ''
      },
      documentType: initialData?.documentType || 'id_card'
    }
  })

  const watchedValues = watch()

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' }
  ]

  const documentTypeOptions = [
    { value: 'id_card', label: 'Cédula de Identidad', description: '주민등록증' },
    { value: 'passport', label: 'Pasaporte', description: '여권' },
    { value: 'driver_license', label: 'Licencia de Conducir', description: '운전면허증' }
  ]

  const provinceOptions = [
    { value: 'seoul', label: 'Seúl (서울)' },
    { value: 'busan', label: 'Busan (부산)' },
    { value: 'daegu', label: 'Daegu (대구)' },
    { value: 'incheon', label: 'Incheon (인천)' },
    { value: 'gwangju', label: 'Gwangju (광주)' },
    { value: 'daejeon', label: 'Daejeon (대전)' },
    { value: 'ulsan', label: 'Ulsan (울산)' },
    { value: 'sejong', label: 'Sejong (세종)' },
    { value: 'gyeonggi', label: 'Gyeonggi (경기)' },
    { value: 'gangwon', label: 'Gangwon (강원)' },
    { value: 'chungbuk', label: 'Chungcheong del Norte (충북)' },
    { value: 'chungnam', label: 'Chungcheong del Sur (충남)' },
    { value: 'jeonbuk', label: 'Jeolla del Norte (전북)' },
    { value: 'jeonnam', label: 'Jeolla del Sur (전남)' },
    { value: 'gyeongbuk', label: 'Gyeongsang del Norte (경북)' },
    { value: 'gyeongnam', label: 'Gyeongsang del Sur (경남)' },
    { value: 'jeju', label: 'Jeju (제주)' }
  ]

  const onSubmit = async (data: RealNameVerificationFormData) => {
    try {
      setIsSubmitting(true)
      
      // Ejecutar verificación demo
      await verifyUserDemo({
        realName: data.realName,
        idNumber: data.identificationNumber,
        bankAccount: '', // Placeholder - se obtendría en un step posterior
        level: 1 // ComplianceLevel.Basic
      })

      addToast({
        message: 'Verificación de nombre real completada exitosamente',
        variant: 'success'
      })
      onSuccess?.({ verified: true })
      
    } catch (err) {
      console.error('Error en verificación de nombre real:', err)
      addToast({
        message: 'Error al verificar identidad',
        variant: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (field: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [field]: file }))
    setValue(field as any, file)
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }

  const formatIdNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 6) return cleaned
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 13)}`
  }

  const FileUploadField = ({ 
    label, 
    field, 
    accept = 'image/*',
    required = false 
  }: { 
    label: string
    field: keyof typeof uploadedFiles
    accept?: string
    required?: boolean
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
        {uploadedFiles[field] ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {uploadedFiles[field]?.name}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadedFiles(prev => ({ ...prev, [field]: undefined }))
                setValue(field as any, null)
              }}
            >
              Cambiar Archivo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="text-sm text-gray-600">
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">Sube un archivo</span>
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(field, file)
                  }}
                />
              </label>
              {' '}o arrastra y suelta
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG hasta 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verificación de Nombre Real
          </h3>
          <p className="text-gray-600">
            Verifica tu identidad con documentos oficiales
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Información Personal</h4>
            
            <Controller
              name="realName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nombre Real"
                  placeholder="홍길동"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.realName?.message}
                  isRequired
                  leftIcon={<User className="w-4 h-4" />}
                />
              )}
            />

            <Controller
              name="identificationNumber"
              control={control}
              render={({ field }) => (
                <Input
                  label="Número de Identificación"
                  placeholder="123456-1234567"
                  value={field.value}
                  onChange={(e) => {
                    const formatted = formatIdNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  error={errors.identificationNumber?.message}
                  isRequired
                  leftIcon={<Shield className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowIdNumber(!showIdNumber)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showIdNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  type={showIdNumber ? 'text' : 'password'}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dateOfBirth?.message}
                    isRequired
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                )}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Selecciona tu género"
                      options={genderOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.gender?.message}
                      required
                    />
                  )}
                />
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  label="Número de Teléfono"
                  placeholder="010-1234-5678"
                  value={field.value}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  error={errors.phoneNumber?.message}
                  isRequired
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              )}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Dirección</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="address.postalCode"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Código Postal"
                    placeholder="12345"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.address?.postalCode?.message}
                    isRequired
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                )}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia *
                </label>
                <Controller
                  name="address.province"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Selecciona la provincia"
                      options={provinceOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.address?.province?.message}
                      required
                    />
                  )}
                />
                {errors.address?.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.province.message}</p>
                )}
              </div>
            </div>

            <Controller
              name="address.city"
              control={control}
              render={({ field }) => (
                <Input
                  label="Ciudad"
                  placeholder="Seúl"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.address?.city?.message}
                  isRequired
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              )}
            />

            <Controller
              name="address.address1"
              control={control}
              render={({ field }) => (
                <Input
                  label="Dirección Principal"
                  placeholder="강남구 역삼동 123-45"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.address?.address1?.message}
                  isRequired
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              )}
            />

            <Controller
              name="address.address2"
              control={control}
              render={({ field }) => (
                <Input
                  label="Dirección Secundaria (Opcional)"
                  placeholder="Apto 101"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.address?.address2?.message}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              )}
            />
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Documentos de Identidad</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <Controller
                name="documentType"
                control={control}
                render={({ field }) => (
                  <Select
                    placeholder="Selecciona el tipo de documento"
                    options={documentTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.documentType?.message}
                    required
                  />
                )}
              />
              {errors.documentType && (
                <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadField
                label="Frente del Documento"
                field="documentFront"
                required
              />
              <FileUploadField
                label="Reverso del Documento"
                field="documentBack"
                required
              />
            </div>

            <FileUploadField
              label="Selfie con Documento"
              field="selfie"
              required
            />
          </div>

          {/* Información de seguridad */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-900">Seguridad y Privacidad</span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Todos los datos están encriptados y protegidos</li>
              <li>• Los documentos se verifican automáticamente</li>
              <li>• Solo se almacena información necesaria para compliance</li>
              <li>• Cumplimos con todas las regulaciones de protección de datos</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting || isProcessing}
              disabled={!isValid || isSubmitting || isProcessing || !uploadedFiles.documentFront || !uploadedFiles.documentBack || !uploadedFiles.selfie}
              className="flex-1"
              leftIcon={<User className="w-4 h-4" />}
            >
              {isSubmitting || isProcessing ? 'Verificando...' : 'Verificar Identidad'}
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

      {/* Modal de confirmación */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        title="Confirmar Verificación"
        variant="success"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-900">Información Personal</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nombre:</span>
                <span className="font-medium">{watchedValues.realName}</span>
              </div>
              <div className="flex justify-between">
                <span>Documento:</span>
                <span className="font-medium">
                  {documentTypeOptions.find(d => d.value === watchedValues.documentType)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Teléfono:</span>
                <span className="font-medium">{watchedValues.phoneNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-900">Proceso de Verificación</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Se verificará la autenticidad de los documentos</li>
              <li>• Se validará la información personal</li>
              <li>• Se realizará una verificación biométrica</li>
              <li>• El proceso puede tomar hasta 24 horas</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => {
              closeConfirmModal()
              handleSubmit(onSubmit)()
            }}
            className="flex-1"
          >
            Confirmar y Enviar
          </Button>
          <Button
            variant="outline"
            onClick={closeConfirmModal}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  )
}
