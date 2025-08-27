import { Address } from 'viem'
import { KOREAN_BANKS } from '../utils/constants'

// Tipos específicos del servicio de verificación bancaria
export interface BankAccount {
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  accountType: 'checking' | 'savings' | 'business'
  status: 'active' | 'inactive' | 'suspended'
  balance?: number
  currency: 'KRW' | 'USD'
  createdAt: Date
  lastTransactionDate?: Date
}

export interface BankVerificationRequest {
  bankCode: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  verificationMethod: 'sms' | 'email' | 'app'
}

export interface BankVerificationResult {
  success: boolean
  verified: boolean
  accountExists: boolean
  accountHolderMatch: boolean
  verificationMethod: 'sms' | 'email' | 'app'
  verificationCode?: string
  expiresAt?: Date
  attempts: number
  maxAttempts: number
  error?: string
  metadata?: Record<string, any>
}

export interface VerificationCodeRequest {
  bankCode: string
  accountNumber: string
  method: 'sms' | 'email' | 'app'
  phoneNumber?: string
  email?: string
}

export interface VerificationCodeResponse {
  success: boolean
  codeSent: boolean
  expiresAt: Date
  attempts: number
  maxAttempts: number
  error?: string
}

export interface VerificationCodeValidation {
  bankCode: string
  accountNumber: string
  code: string
  sessionId: string
}

export interface VerificationCodeValidationResult {
  success: boolean
  valid: boolean
  verified: boolean
  accountHolderName?: string
  accountHolderID?: string
  error?: string
}

export interface TestTransferRequest {
  bankCode: string
  accountNumber: string
  amount: number
  description: string
  reference: string
}

export interface TestTransferResult {
  success: boolean
  transferId: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  fee: number
  totalAmount: number
  reference: string
  transactionDate: Date
  error?: string
}

export interface BankTransfer {
  id: string
  bankCode: string
  accountNumber: string
  type: 'incoming' | 'outgoing'
  amount: number
  fee: number
  totalAmount: number
  description: string
  reference: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transactionDate: Date
  completedDate?: Date
  error?: string
}

export interface BankBalance {
  bankCode: string
  accountNumber: string
  balance: number
  availableBalance: number
  currency: 'KRW' | 'USD'
  lastUpdated: Date
}

export interface BankTransaction {
  id: string
  bankCode: string
  accountNumber: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee'
  amount: number
  balance: number
  description: string
  reference: string
  transactionDate: Date
  category?: string
  tags?: string[]
}

export interface BankAccountInfo {
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  accountType: 'checking' | 'savings' | 'business'
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  availableBalance: number
  currency: 'KRW' | 'USD'
  lastTransactionDate?: Date
  monthlyLimit?: number
  dailyLimit?: number
  transactionLimit?: number
}

// Configuración del servicio
const BANK_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BANK_API_URL || 'https://api.koreanbanking.com',
  apiKey: process.env.NEXT_PUBLIC_BANK_API_KEY,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  verificationCodeExpiry: 5 * 60 * 1000, // 5 minutos
  maxVerificationAttempts: 3
}

// Clase principal del servicio
export class BankVerificationService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 2 * 60 * 1000 // 2 minutos
  private verificationSessions: Map<string, {
    attempts: number
    expiresAt: Date
    bankCode: string
    accountNumber: string
  }> = new Map()

  constructor() {
    this.apiKey = BANK_API_CONFIG.apiKey || ''
    this.baseUrl = BANK_API_CONFIG.baseUrl
  }

  // Métodos principales
  async verifyBankAccount(request: BankVerificationRequest): Promise<BankVerificationResult> {
    try {
      const response = await this.makeRequest('/bank/verify', {
        method: 'POST',
        data: {
          bankCode: request.bankCode,
          accountNumber: request.accountNumber,
          accountHolderName: request.accountHolderName,
          accountHolderID: request.accountHolderID,
          verificationMethod: request.verificationMethod
        }
      })

      return this.mapVerificationResult(response.data)
    } catch (error) {
      console.error('Error verifying bank account:', error)
      throw new Error('Failed to verify bank account')
    }
  }

  async requestVerificationCode(request: VerificationCodeRequest): Promise<VerificationCodeResponse> {
    try {
      const sessionId = this.generateSessionId()
      const expiresAt = new Date(Date.now() + BANK_API_CONFIG.verificationCodeExpiry)

      const response = await this.makeRequest('/bank/verification-code', {
        method: 'POST',
        data: {
          bankCode: request.bankCode,
          accountNumber: request.accountNumber,
          method: request.method,
          phoneNumber: request.phoneNumber,
          email: request.email,
          sessionId
        }
      })

      // Guardar sesión de verificación
      this.verificationSessions.set(sessionId, {
        attempts: 0,
        expiresAt,
        bankCode: request.bankCode,
        accountNumber: request.accountNumber
      })

      return {
        success: response.data.success,
        codeSent: response.data.codeSent,
        expiresAt,
        attempts: 0,
        maxAttempts: BANK_API_CONFIG.maxVerificationAttempts,
        error: response.data.error
      }
    } catch (error) {
      console.error('Error requesting verification code:', error)
      throw new Error('Failed to request verification code')
    }
  }

  async validateVerificationCode(validation: VerificationCodeValidation): Promise<VerificationCodeValidationResult> {
    try {
      const session = this.verificationSessions.get(validation.sessionId)
      if (!session) {
        return {
          success: false,
          valid: false,
          verified: false,
          error: 'Invalid or expired session'
        }
      }

      if (session.attempts >= BANK_API_CONFIG.maxVerificationAttempts) {
        return {
          success: false,
          valid: false,
          verified: false,
          error: 'Maximum verification attempts exceeded'
        }
      }

      if (session.expiresAt < new Date()) {
        this.verificationSessions.delete(validation.sessionId)
        return {
          success: false,
          valid: false,
          verified: false,
          error: 'Verification code expired'
        }
      }

      // Incrementar intentos
      session.attempts++

      const response = await this.makeRequest('/bank/validate-code', {
        method: 'POST',
        data: {
          bankCode: validation.bankCode,
          accountNumber: validation.accountNumber,
          code: validation.code,
          sessionId: validation.sessionId
        }
      })

      const result = {
        success: response.data.success,
        valid: response.data.valid,
        verified: response.data.verified,
        accountHolderName: response.data.accountHolderName,
        accountHolderID: response.data.accountHolderID,
        error: response.data.error
      }

      // Limpiar sesión si la verificación fue exitosa
      if (result.verified) {
        this.verificationSessions.delete(validation.sessionId)
      }

      return result
    } catch (error) {
      console.error('Error validating verification code:', error)
      throw new Error('Failed to validate verification code')
    }
  }

  async performTestTransfer(request: TestTransferRequest): Promise<TestTransferResult> {
    try {
      const response = await this.makeRequest('/bank/test-transfer', {
        method: 'POST',
        data: {
          bankCode: request.bankCode,
          accountNumber: request.accountNumber,
          amount: request.amount,
          description: request.description,
          reference: request.reference
        }
      })

      return this.mapTestTransferResult(response.data)
    } catch (error) {
      console.error('Error performing test transfer:', error)
      throw new Error('Failed to perform test transfer')
    }
  }

  async getBankAccountInfo(bankCode: string, accountNumber: string): Promise<BankAccountInfo | null> {
    try {
      const cacheKey = `account_${bankCode}_${accountNumber}`
      const cached = this.getCachedData(cacheKey) as BankAccountInfo | null
      if (cached) return cached

      const response = await this.makeRequest(`/bank/account/${bankCode}/${accountNumber}`, {
        method: 'GET'
      })

      const accountInfo = this.mapBankAccountInfo(response.data)
      this.setCachedData(cacheKey, accountInfo)
      
      return accountInfo
    } catch (error) {
      console.error('Error getting bank account info:', error)
      return null
    }
  }

  async getBankBalance(bankCode: string, accountNumber: string): Promise<BankBalance | null> {
    try {
      const cacheKey = `balance_${bankCode}_${accountNumber}`
      const cached = this.getCachedData(cacheKey) as BankBalance | null
      if (cached) return cached

      const response = await this.makeRequest(`/bank/balance/${bankCode}/${accountNumber}`, {
        method: 'GET'
      })

      const balance = this.mapBankBalance(response.data)
      this.setCachedData(cacheKey, balance)
      
      return balance
    } catch (error) {
      console.error('Error getting bank balance:', error)
      return null
    }
  }

  async getBankTransactions(
    bankCode: string,
    accountNumber: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<BankTransaction[]> {
    try {
      const params: Record<string, any> = { limit }
      if (startDate) params.startDate = startDate.toISOString()
      if (endDate) params.endDate = endDate.toISOString()

      const response = await this.makeRequest(`/bank/transactions/${bankCode}/${accountNumber}`, {
        method: 'GET',
        params
      })

      return response.data.map((tx: any) => this.mapBankTransaction(tx))
    } catch (error) {
      console.error('Error getting bank transactions:', error)
      return []
    }
  }

  async getTransferStatus(transferId: string): Promise<BankTransfer | null> {
    try {
      const response = await this.makeRequest(`/bank/transfer/${transferId}`, {
        method: 'GET'
      })

      return this.mapBankTransfer(response.data)
    } catch (error) {
      console.error('Error getting transfer status:', error)
      return null
    }
  }

  async cancelTransfer(transferId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/bank/transfer/${transferId}/cancel`, {
        method: 'POST'
      })

      return response.data.success
    } catch (error) {
      console.error('Error cancelling transfer:', error)
      return false
    }
  }

  // Métodos de utilidad
  getBankList(): Array<{ code: string; name: string; englishName: string }> {
    return [...KOREAN_BANKS]
  }

  getBankByCode(code: string): { code: string; name: string; englishName: string } | null {
    return KOREAN_BANKS.find(bank => bank.code === code) || null
  }

  getBankByName(name: string): { code: string; name: string; englishName: string } | null {
    return KOREAN_BANKS.find(bank => 
      bank.name === name || bank.englishName === name
    ) || null
  }

  validateAccountNumber(accountNumber: string): boolean {
    // Validación básica de número de cuenta coreano
    const cleaned = accountNumber.replace(/\D/g, '')
    return cleaned.length === 12
  }

  formatAccountNumber(accountNumber: string): string {
    const cleaned = accountNumber.replace(/\D/g, '')
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return accountNumber
  }

  private async makeRequest(
    endpoint: string,
    options: {
      method: string
      params?: Record<string, any>
      data?: any
      headers?: Record<string, string>
    }
  ): Promise<any> {
    const url = new URL(endpoint, this.baseUrl)
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const config: RequestInit = {
      method: options.method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(BANK_API_CONFIG.timeout)
    }

    if (options.data) {
      config.body = JSON.stringify(options.data)
    }

    let lastError: Error
    for (let attempt = 1; attempt <= BANK_API_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await fetch(url.toString(), config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < BANK_API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, BANK_API_CONFIG.retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Métodos de mapeo de datos
  private mapVerificationResult(data: any): BankVerificationResult {
    return {
      success: data.success,
      verified: data.verified,
      accountExists: data.accountExists,
      accountHolderMatch: data.accountHolderMatch,
      verificationMethod: data.verificationMethod,
      verificationCode: data.verificationCode,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      attempts: data.attempts || 0,
      maxAttempts: data.maxAttempts || BANK_API_CONFIG.maxVerificationAttempts,
      error: data.error,
      metadata: data.metadata
    }
  }

  private mapTestTransferResult(data: any): TestTransferResult {
    return {
      success: data.success,
      transferId: data.transferId,
      status: data.status,
      amount: data.amount,
      fee: data.fee,
      totalAmount: data.totalAmount,
      reference: data.reference,
      transactionDate: new Date(data.transactionDate),
      error: data.error
    }
  }

  private mapBankAccountInfo(data: any): BankAccountInfo {
    return {
      bankCode: data.bankCode,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      accountHolderID: data.accountHolderID,
      accountType: data.accountType,
      status: data.status,
      balance: data.balance,
      availableBalance: data.availableBalance,
      currency: data.currency,
      lastTransactionDate: data.lastTransactionDate ? new Date(data.lastTransactionDate) : undefined,
      monthlyLimit: data.monthlyLimit,
      dailyLimit: data.dailyLimit,
      transactionLimit: data.transactionLimit
    }
  }

  private mapBankBalance(data: any): BankBalance {
    return {
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
      balance: data.balance,
      availableBalance: data.availableBalance,
      currency: data.currency,
      lastUpdated: new Date(data.lastUpdated)
    }
  }

  private mapBankTransaction(data: any): BankTransaction {
    return {
      id: data.id,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
      type: data.type,
      amount: data.amount,
      balance: data.balance,
      description: data.description,
      reference: data.reference,
      transactionDate: new Date(data.transactionDate),
      category: data.category,
      tags: data.tags
    }
  }

  private mapBankTransfer(data: any): BankTransfer {
    return {
      id: data.id,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
      type: data.type,
      amount: data.amount,
      fee: data.fee,
      totalAmount: data.totalAmount,
      description: data.description,
      reference: data.reference,
      status: data.status,
      transactionDate: new Date(data.transactionDate),
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      error: data.error
    }
  }

  // Métodos de limpieza
  clearCache(): void {
    this.cache.clear()
  }

  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }

  clearExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of this.verificationSessions.entries()) {
      if (session.expiresAt < now) {
        this.verificationSessions.delete(sessionId)
      }
    }
  }

  getActiveSessionsCount(): number {
    return this.verificationSessions.size
  }
}

// Instancia singleton del servicio
export const bankVerificationService = new BankVerificationService()

// Hooks de React para usar el servicio
export function useBankVerificationService() {
  return {
    verifyBankAccount: bankVerificationService.verifyBankAccount.bind(bankVerificationService),
    requestVerificationCode: bankVerificationService.requestVerificationCode.bind(bankVerificationService),
    validateVerificationCode: bankVerificationService.validateVerificationCode.bind(bankVerificationService),
    performTestTransfer: bankVerificationService.performTestTransfer.bind(bankVerificationService),
    getBankAccountInfo: bankVerificationService.getBankAccountInfo.bind(bankVerificationService),
    getBankBalance: bankVerificationService.getBankBalance.bind(bankVerificationService),
    getBankTransactions: bankVerificationService.getBankTransactions.bind(bankVerificationService),
    getTransferStatus: bankVerificationService.getTransferStatus.bind(bankVerificationService),
    cancelTransfer: bankVerificationService.cancelTransfer.bind(bankVerificationService),
    getBankList: bankVerificationService.getBankList.bind(bankVerificationService),
    getBankByCode: bankVerificationService.getBankByCode.bind(bankVerificationService),
    getBankByName: bankVerificationService.getBankByName.bind(bankVerificationService),
    validateAccountNumber: bankVerificationService.validateAccountNumber.bind(bankVerificationService),
    formatAccountNumber: bankVerificationService.formatAccountNumber.bind(bankVerificationService),
    clearCache: bankVerificationService.clearCache.bind(bankVerificationService)
  }
}
