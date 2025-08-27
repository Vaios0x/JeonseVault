'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { User as UserIcon, Mail, Phone, MapPin, Shield, Edit, Save, X, Camera, Upload, CheckCircle, AlertCircle, Calendar, CreditCard, TrendingUp, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/utils/formatters'
import { validateKoreanID, validateKoreanPhone } from '@/utils/validators'
import { User, ComplianceLevel } from '@/utils/types'

// Esquema de validación para el perfil
const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().refine(validateKoreanPhone, 'Número de teléfono inválido'),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'La calle es requerida'),
    city: z.string().min(1, 'La ciudad es requerida'),
    province: z.string().min(1, 'La provincia es requerida'),
    postalCode: z.string().min(1, 'El código postal es requerido')
  }),
  koreanID: z.string().refine(validateKoreanID, 'ID coreano inválido'),
  occupation: z.string().min(1, 'La ocupación es requerida'),
  annualIncome: z.string().min(1, 'El ingreso anual es requerido'),
  sourceOfFunds: z.string().min(1, 'La fuente de fondos es requerida'),
  riskTolerance: z.string().min(1, 'La tolerancia al riesgo es requerida'),
  investmentGoals: z.string().min(1, 'Al menos un objetivo de inversión es requerido'),
  notificationPreferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean()
  })
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfileProps {
  user: User
  className?: string
  onUpdate?: (data: ProfileFormData) => Promise<void>
  onLogout?: () => void
  onDeleteAccount?: () => void
  showActions?: boolean
}

export function UserProfile({
  user,
  className,
  onUpdate,
  onLogout,
  onDeleteAccount,
  showActions = true
}: UserProfileProps) {
  const { open, close } = useModal()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: ''
      },
      koreanID: user.koreanID || '',
      occupation: '',
      annualIncome: '',
      sourceOfFunds: '',
      riskTolerance: 'MEDIUM',
      investmentGoals: '',
      notificationPreferences: {
        email: user.preferences?.notifications?.email ?? true,
        sms: user.preferences?.notifications?.sms ?? false,
        push: user.preferences?.notifications?.push ?? true,
        marketing: user.preferences?.notifications?.marketing ?? false
      }
    }
  })

  // Configuración de nivel de compliance
  const complianceConfig = {
    'Basic': {
      label: 'Básico',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Verificación de identidad básica completada'
    },
    'Standard': {
      label: 'Estándar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Verificación bancaria y KYC completada'
    },
    'Premium': {
      label: 'Premium',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Verificación completa con límites elevados'
    },
    'Corporate': {
      label: 'Corporativo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Verificación corporativa completa'
    }
  }

  const compliance = complianceConfig[user.complianceLevel] || complianceConfig['Basic']

  // Opciones para los selects
  const occupationOptions = [
    { label: 'Empleado', value: 'EMPLOYEE' },
    { label: 'Autónomo', value: 'SELF_EMPLOYED' },
    { label: 'Empresario', value: 'BUSINESS_OWNER' },
    { label: 'Inversor', value: 'INVESTOR' },
    { label: 'Profesional', value: 'PROFESSIONAL' },
    { label: 'Estudiante', value: 'STUDENT' },
    { label: 'Jubilado', value: 'RETIRED' },
    { label: 'Otro', value: 'OTHER' }
  ]

  const incomeOptions = [
    { label: 'Menos de ₩30M', value: 'UNDER_30M' },
    { label: '₩30M - ₩50M', value: '30M_50M' },
    { label: '₩50M - ₩100M', value: '50M_100M' },
    { label: '₩100M - ₩200M', value: '100M_200M' },
    { label: 'Más de ₩200M', value: 'OVER_200M' }
  ]

  const sourceOfFundsOptions = [
    { label: 'Salario', value: 'SALARY' },
    { label: 'Negocios', value: 'BUSINESS' },
    { label: 'Inversiones', value: 'INVESTMENTS' },
    { label: 'Herencia', value: 'INHERITANCE' },
    { label: 'Ahorros', value: 'SAVINGS' },
    { label: 'Otro', value: 'OTHER' }
  ]

  const riskToleranceOptions = [
    { label: 'Bajo', value: 'LOW' },
    { label: 'Medio', value: 'MEDIUM' },
    { label: 'Alto', value: 'HIGH' }
  ]

  const investmentGoalsOptions = [
    { label: 'Ahorro para jubilación', value: 'RETIREMENT' },
    { label: 'Compra de vivienda', value: 'HOME_PURCHASE' },
    { label: 'Educación', value: 'EDUCATION' },
    { label: 'Ingresos pasivos', value: 'PASSIVE_INCOME' },
    { label: 'Diversificación', value: 'DIVERSIFICATION' },
    { label: 'Crecimiento de capital', value: 'CAPITAL_GROWTH' }
  ]

  const provinceOptions = [
    { label: 'Seúl', value: 'SEOUL' },
    { label: 'Busan', value: 'BUSAN' },
    { label: 'Incheon', value: 'INCHEON' },
    { label: 'Daegu', value: 'DAEGU' },
    { label: 'Daejeon', value: 'DAEJEON' },
    { label: 'Gwangju', value: 'GWANGJU' },
    { label: 'Suwon', value: 'SUWON' },
    { label: 'Ulsan', value: 'ULSAN' },
    { label: 'Sejong', value: 'SEJONG' },
    { label: 'Gyeonggi', value: 'GYEONGGI' },
    { label: 'Gangwon', value: 'GANGWON' },
    { label: 'Chungbuk', value: 'CHUNGBUK' },
    { label: 'Chungnam', value: 'CHUNGNAM' },
    { label: 'Jeonbuk', value: 'JEONBUK' },
    { label: 'Jeonnam', value: 'JEONNAM' },
    { label: 'Gyeongbuk', value: 'GYEONGBUK' },
    { label: 'Gyeongnam', value: 'GYEONGNAM' },
    { label: 'Jeju', value: 'JEJU' }
  ]

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = handleSubmit(async (data) => {
    setIsLoading(true)
    try {
      if (onUpdate) {
        await onUpdate(data)
      }
      
      setIsEditing(false)
      addToast({
        title: 'Perfil actualizado',
        message: 'Tu perfil se ha actualizado correctamente',
        variant: 'success'
      })
    } catch (error) {
      addToast({
        title: 'Error',
        message: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        variant: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  })

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Lógica de logout por defecto
      window.location.href = '/logout'
    }
  }

  const handleDeleteAccount = () => {
    open()
  }

  const confirmDeleteAccount = () => {
    if (onDeleteAccount) {
      onDeleteAccount()
    }
    close()
  }

  return (
    <>
      <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
        {/* Header del perfil */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.name || 'Usuario'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name || 'Usuario'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', compliance.bgColor, compliance.color)}>
                    {compliance.label}
                  </div>
                  <span className="text-xs text-gray-500">
                    Miembro desde {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!isDirty || isLoading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Nombre"
                      error={errors.firstName?.message}
                      disabled={!isEditing}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Apellido"
                      error={errors.lastName?.message}
                      disabled={!isEditing}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Email"
                      type="email"
                      error={errors.email?.message}
                      disabled={!isEditing}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Teléfono"
                      error={errors.phone?.message}
                      disabled={!isEditing}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />
                  )}
                />

                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Fecha de Nacimiento"
                      type="date"
                      error={errors.dateOfBirth?.message}
                      disabled={!isEditing}
                      leftIcon={<Calendar className="w-4 h-4" />}
                    />
                  )}
                />

                <Controller
                  name="koreanID"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="ID Coreano"
                      error={errors.koreanID?.message}
                      disabled={!isEditing}
                      leftIcon={<Shield className="w-4 h-4" />}
                    />
                  )}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dirección
                </h3>

                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Calle y Número"
                      error={errors.address?.street?.message}
                      disabled={!isEditing}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="address.city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Ciudad"
                        error={errors.address?.city?.message}
                        disabled={!isEditing}
                      />
                    )}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia
                    </label>
                    <Controller
                      name="address.province"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={provinceOptions}
                          error={errors.address?.province?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </div>
                </div>

                <Controller
                  name="address.postalCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Código Postal"
                      error={errors.address?.postalCode?.message}
                      disabled={!isEditing}
                    />
                  )}
                />
              </div>

              {/* Información Financiera */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Información Financiera
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ocupación
                    </label>
                    <Controller
                      name="occupation"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={occupationOptions}
                          error={errors.occupation?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingreso Anual
                    </label>
                    <Controller
                      name="annualIncome"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={incomeOptions}
                          error={errors.annualIncome?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuente de Fondos
                    </label>
                    <Controller
                      name="sourceOfFunds"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={sourceOfFundsOptions}
                          error={errors.sourceOfFunds?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tolerancia al Riesgo
                    </label>
                    <Controller
                      name="riskTolerance"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={riskToleranceOptions}
                          error={errors.riskTolerance?.message}
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivos de Inversión
                  </label>
                  <Controller
                    name="investmentGoals"
                    control={control}
                    render={({ field }) => (
                                              <Select
                          {...field}
                          options={investmentGoalsOptions}
                          error={errors.investmentGoals?.message}
                          disabled={!isEditing}
                        />
                    )}
                  />
                </div>
              </div>

              {/* Preferencias de Notificación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferencias de Notificación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="notificationPreferences.email"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email-notifications"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
                          Notificaciones por email
                        </label>
                      </div>
                    )}
                  />

                  <Controller
                    name="notificationPreferences.sms"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sms-notifications"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-900">
                          Notificaciones por SMS
                        </label>
                      </div>
                    )}
                  />

                  <Controller
                    name="notificationPreferences.push"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push-notifications"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-900">
                          Notificaciones push
                        </label>
                      </div>
                    )}
                  />

                  <Controller
                    name="notificationPreferences.marketing"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="marketing-notifications"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="marketing-notifications" className="ml-2 block text-sm text-gray-900">
                          Notificaciones de marketing
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Acciones adicionales */}
          {showActions && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Cerrar Sesión
                  </Button>
                </div>

                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  leftIcon={<AlertCircle className="w-4 h-4" />}
                >
                  Eliminar Cuenta
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación de cuenta */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Eliminar Cuenta"
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Estás seguro de que quieres eliminar tu cuenta?
            </h3>
            <p className="text-gray-600">
              Esta acción es irreversible. Se eliminarán todos tus datos, depósitos e inversiones.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => close()}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeleteAccount}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Eliminar Cuenta
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
