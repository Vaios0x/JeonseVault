'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface BankVerificationData {
  bankName: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  verificationCode: string
}

export interface UseBankVerificationReturn {
  isVerifying: boolean
  error: string | null
  verifyBankAccount: (data: BankVerificationData) => Promise<boolean>
  requestVerificationCode: (bankName: string, accountNumber: string) => Promise<boolean>
  validateVerificationCode: (code: string) => Promise<boolean>
  clearError: () => void
}

export function useBankVerification(): UseBankVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyBankAccount = useCallback(async (data: BankVerificationData): Promise<boolean> => {
    setIsVerifying(true)
    setError(null)

    try {
      // Simular verificación bancaria
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular éxito
      toast.success('Verificación bancaria completada exitosamente')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la verificación bancaria'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const requestVerificationCode = useCallback(async (bankName: string, accountNumber: string): Promise<boolean> => {
    setIsVerifying(true)
    setError(null)

    try {
      // Simular solicitud de código de verificación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Código de verificación enviado')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al solicitar código de verificación'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const validateVerificationCode = useCallback(async (code: string): Promise<boolean> => {
    setIsVerifying(true)
    setError(null)

    try {
      // Simular validación de código
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (code === '123456') {
        toast.success('Código de verificación válido')
        return true
      } else {
        throw new Error('Código de verificación inválido')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar código de verificación'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isVerifying,
    error,
    verifyBankAccount,
    requestVerificationCode,
    validateVerificationCode,
    clearError
  }
}
