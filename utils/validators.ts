import { z } from 'zod'

// Validadores básicos
export const requiredField = z.string().min(1, 'Este campo es obligatorio')

export const emailValidator = z
  .string()
  .min(1, 'El correo electrónico es obligatorio')
  .email('Formato de correo electrónico inválido')

export const passwordValidator = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número')

// Validadores específicos de Corea
export const koreanPhoneValidator = z
  .string()
  .min(1, 'El número de teléfono es obligatorio')
  .regex(/^01[0-9]-\d{3,4}-\d{4}$/, 'Formato de teléfono inválido (ej: 010-1234-5678)')
  .refine((phone) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 11
  }, 'El número de teléfono debe tener 11 dígitos')

export const koreanIDValidator = z
  .string()
  .min(1, 'El número de identificación es obligatorio')
  .regex(/^\d{6}-\d{7}$/, 'Formato de identificación inválido (ej: 123456-1234567)')
  .refine((id) => {
    const cleaned = id.replace(/\D/g, '')
    if (cleaned.length !== 13) return false
    
    // Algoritmo de validación de ID coreano
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
    let sum = 0
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * weights[i]
    }
    
    const remainder = sum % 11
    const checkDigit = (11 - remainder) % 10
    
    return parseInt(cleaned[12]) === checkDigit
  }, 'Número de identificación inválido')

export const koreanBankAccountValidator = z
  .string()
  .min(1, 'El número de cuenta bancaria es obligatorio')
  .regex(/^\d{3}-\d{3}-\d{6}$/, 'Formato de cuenta bancaria inválido (ej: 123-456-789012)')
  .refine((account) => {
    const cleaned = account.replace(/\D/g, '')
    return cleaned.length === 12
  }, 'El número de cuenta debe tener 12 dígitos')

export const koreanNameValidator = z
  .string()
  .min(1, 'El nombre es obligatorio')
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede exceder 50 caracteres')
  .regex(/^[가-힣\s]+$/, 'El nombre solo puede contener caracteres coreanos')

export const koreanAddressValidator = z
  .string()
  .min(1, 'La dirección es obligatoria')
  .min(10, 'La dirección debe tener al menos 10 caracteres')
  .max(200, 'La dirección no puede exceder 200 caracteres')

// Validadores de montos y números
export const amountValidator = z
  .string()
  .min(1, 'El monto es obligatorio')
  .refine((value) => {
    const num = parseFloat(value.replace(/[^\d.]/g, ''))
    return !isNaN(num) && num > 0
  }, 'El monto debe ser un número válido mayor a 0')
  .refine((value) => {
    const num = parseFloat(value.replace(/[^\d.]/g, ''))
    return num >= 1000000 // Mínimo 1 millón de KRW
  }, 'El monto mínimo es 1,000,000 KRW')
  .refine((value) => {
    const num = parseFloat(value.replace(/[^\d.]/g, ''))
    return num <= 1000000000000 // Máximo 1 billón de KRW
  }, 'El monto máximo es 1,000,000,000,000 KRW')

export const percentageValidator = z
  .string()
  .min(1, 'El porcentaje es obligatorio')
  .refine((value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num >= 0 && num <= 100
  }, 'El porcentaje debe estar entre 0 y 100')

export const positiveNumberValidator = z
  .string()
  .min(1, 'Este campo es obligatorio')
  .refine((value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num > 0
  }, 'Debe ser un número positivo')

// Validadores de fechas
export const futureDateValidator = z
  .string()
  .min(1, 'La fecha es obligatoria')
  .refine((value) => {
    const date = new Date(value)
    const now = new Date()
    return date > now
  }, 'La fecha debe ser futura')

export const dateRangeValidator = z
  .object({
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDate: z.string().min(1, 'La fecha de fin es obligatoria')
  })
  .refine((data) => {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    return endDate > startDate
  }, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate']
  })

// Validadores de archivos
export const fileValidator = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'El archivo no puede exceder 10MB')
  .refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    return allowedTypes.includes(file.type)
  }, 'Solo se permiten archivos JPG, PNG, WebP y PDF')

export const imageValidator = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'La imagen no puede exceder 5MB')
  .refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    return allowedTypes.includes(file.type)
  }, 'Solo se permiten imágenes JPG, PNG y WebP')

// Validadores de direcciones blockchain
export const ethereumAddressValidator = z
  .string()
  .min(1, 'La dirección es obligatoria')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Formato de dirección Ethereum inválido')

export const kaiaAddressValidator = z
  .string()
  .min(1, 'La dirección es obligatoria')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Formato de dirección Kaia inválido')

// Validadores de transacciones
export const transactionHashValidator = z
  .string()
  .min(1, 'El hash de transacción es obligatorio')
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Formato de hash de transacción inválido')

// Validadores de propiedades
export const propertyTypeValidator = z
  .enum(['apartment', 'house', 'officetel', 'villa', 'commercial'], {
    errorMap: () => ({ message: 'Tipo de propiedad inválido' })
  })

export const propertySizeValidator = z
  .string()
  .min(1, 'El tamaño de la propiedad es obligatorio')
  .refine((value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num > 0 && num <= 1000
  }, 'El tamaño debe estar entre 0 y 1000 m²')

// Validadores de compliance
export const complianceLevelValidator = z
  .enum(['Basic', 'Standard', 'Premium', 'Corporate'], {
    errorMap: () => ({ message: 'Nivel de compliance inválido' })
  })

export const riskLevelValidator = z
  .enum(['Low', 'Medium', 'High'], {
    errorMap: () => ({ message: 'Nivel de riesgo inválido' })
  })

// Validadores de formularios completos
export const createDepositSchema = z.object({
  propertyType: propertyTypeValidator,
  propertyAddress: koreanAddressValidator,
  propertySize: propertySizeValidator,
  amount: amountValidator,
  endDate: futureDateValidator,
  enableInvestment: z.boolean().optional(),
  investmentPercentage: z.string().optional().refine((value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num >= 0 && num <= 100
  }, 'El porcentaje debe estar entre 0 y 100')
})

export const kycSchema = z.object({
  // Información personal
  firstName: koreanNameValidator,
  lastName: koreanNameValidator,
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  koreanID: koreanIDValidator,
  phoneNumber: koreanPhoneValidator,
  email: emailValidator,
  address: koreanAddressValidator,
  
  // Información bancaria
  bankName: z.string().min(1, 'El banco es obligatorio'),
  bankAccountNumber: koreanBankAccountValidator,
  accountHolderName: koreanNameValidator,
  
  // Información financiera
  annualIncome: z.string().min(1, 'El ingreso anual es obligatorio').refine((value) => {
    const num = parseFloat(value.replace(/[^\d]/g, ''))
    return !isNaN(num) && num > 0
  }, 'El ingreso anual debe ser un número válido'),
  sourceOfFunds: z.string().min(1, 'La fuente de fondos es obligatoria'),
  occupation: z.string().min(1, 'La ocupación es obligatoria'),
  
  // Documentos
  idCardFile: fileValidator.optional(),
  bankStatementFile: fileValidator.optional(),
  proofOfAddressFile: fileValidator.optional(),
  
  // Términos
  acceptTerms: z.boolean().refine((val) => val === true, 'Debe aceptar los términos y condiciones'),
  acceptPrivacyPolicy: z.boolean().refine((val) => val === true, 'Debe aceptar la política de privacidad'),
  acceptMarketing: z.boolean().optional()
})

export const investmentSchema = z.object({
  amount: amountValidator,
  poolId: z.string().min(1, 'El pool de inversión es obligatorio'),
  acceptRisk: z.boolean().refine((val) => val === true, 'Debe aceptar los riesgos de inversión'),
  acceptTerms: z.boolean().refine((val) => val === true, 'Debe aceptar los términos de inversión')
})

export const bankVerificationSchema = z.object({
  bankName: z.string().min(1, 'El banco es obligatorio'),
  accountNumber: koreanBankAccountValidator,
  accountHolderName: koreanNameValidator,
  accountHolderID: koreanIDValidator,
  verificationCode: z.string().min(1, 'El código de verificación es obligatorio').length(6, 'El código debe tener 6 dígitos')
})

// Validadores de búsqueda y filtros
export const searchValidator = z
  .string()
  .min(1, 'El término de búsqueda es obligatorio')
  .min(2, 'El término de búsqueda debe tener al menos 2 caracteres')
  .max(100, 'El término de búsqueda no puede exceder 100 caracteres')

export const filterValidator = z.object({
  minAmount: z.string().optional().refine((value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num >= 0
  }, 'El monto mínimo debe ser un número válido'),
  maxAmount: z.string().optional().refine((value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num >= 0
  }, 'El monto máximo debe ser un número válido'),
  propertyType: propertyTypeValidator.optional(),
  status: z.enum(['active', 'pending', 'completed', 'cancelled', 'disputed']).optional(),
  dateRange: dateRangeValidator.optional()
})

// Validadores de paginación
export const paginationValidator = z.object({
  page: z.number().int().min(1, 'La página debe ser mayor a 0'),
  limit: z.number().int().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite no puede exceder 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// Validadores de configuración
export const userSettingsSchema = z.object({
  language: z.enum(['ko', 'en']),
  currency: z.enum(['KRW', 'USD']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  }),
  privacy: z.object({
    shareData: z.boolean(),
    marketingEmails: z.boolean()
  })
})

// Funciones de validación personalizadas
export function validateKoreanPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {
    return 'El número de teléfono debe tener 11 dígitos'
  }
  
  if (!cleaned.startsWith('01')) {
    return 'El número debe comenzar con 01'
  }
  
  return null
}

export function validateKoreanBankAccount(account: string): string | null {
  const cleaned = account.replace(/\D/g, '')
  
  if (cleaned.length !== 12) {
    return 'El número de cuenta debe tener 12 dígitos'
  }
  
  // Validación básica de formato
  if (!/^\d{3}-\d{3}-\d{6}$/.test(account)) {
    return 'Formato de cuenta inválido (ej: 123-456-789012)'
  }
  
  return null
}

export function validateKoreanName(name: string): boolean {
  // Validar que solo contenga caracteres coreanos y espacios
  return /^[가-힣\s]+$/.test(name.trim()) && name.trim().length >= 2
}

export function validateKoreanID(id: string): string | null {
  const cleaned = id.replace(/\D/g, '')
  
  if (cleaned.length !== 13) {
    return 'El número de identificación debe tener 13 dígitos'
  }
  
  // Validación del algoritmo de checksum
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
  let sum = 0
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights[i]
  }
  
  const remainder = sum % 11
  const checkDigit = (11 - remainder) % 10
  
  if (parseInt(cleaned[12]) !== checkDigit) {
    return 'Número de identificación inválido'
  }
  
  return null
}

export function validateAmount(amount: string, min: number = 0, max: number = Infinity): string | null {
  const num = parseFloat(amount.replace(/[^\d.]/g, ''))
  
  if (isNaN(num)) {
    return 'El monto debe ser un número válido'
  }
  
  if (num < min) {
    return `El monto mínimo es ${min.toLocaleString('ko-KR')} KRW`
  }
  
  if (num > max) {
    return `El monto máximo es ${max.toLocaleString('ko-KR')} KRW`
  }
  
  return null
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (end <= start) {
    return 'La fecha de fin debe ser posterior a la fecha de inicio'
  }
  
  const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 30) {
    return 'El período mínimo es de 30 días'
  }
  
  if (diffInDays > 365 * 5) {
    return 'El período máximo es de 5 años'
  }
  
  return null
}

// Validadores de seguridad
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 1
  else feedback.push('Al menos 8 caracteres')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Al menos una letra minúscula')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Al menos una letra mayúscula')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Al menos un número')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Al menos un carácter especial')
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

// Validadores de formato
export function formatAndValidateKoreanPhone(phone: string): {
  formatted: string
  isValid: boolean
  error: string | null
} {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    const formatted = cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    const error = validateKoreanPhone(formatted)
    return {
      formatted,
      isValid: !error,
      error
    }
  } else if (cleaned.length === 10) {
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    const error = validateKoreanPhone(formatted)
    return {
      formatted,
      isValid: !error,
      error
    }
  }
  
  return {
    formatted: phone,
    isValid: false,
    error: 'Formato de teléfono inválido'
  }
}

export function formatAndValidateKoreanID(id: string): {
  formatted: string
  isValid: boolean
  error: string | null
} {
  const cleaned = id.replace(/\D/g, '')
  
  if (cleaned.length === 13) {
    const formatted = cleaned.replace(/(\d{6})(\d{7})/, '$1-$2')
    const error = validateKoreanID(formatted)
    return {
      formatted,
      isValid: !error,
      error
    }
  }
  
  return {
    formatted: id,
    isValid: false,
    error: 'Formato de identificación inválido'
  }
}
