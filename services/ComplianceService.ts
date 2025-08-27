import { Address } from 'viem'
import { ComplianceStatus, ComplianceLevel, RiskLevel } from '../utils/types'

// Tipos específicos del servicio de compliance
export interface ComplianceProfile {
  id: string
  userId: string
  status: ComplianceStatus
  level: ComplianceLevel
  riskScore: number
  riskLevel: RiskLevel
  kycData: KYCData
  amlChecks: AMLCheck[]
  limits: ComplianceLimits
  documents: ComplianceDocument[]
  verificationHistory: VerificationEvent[]
  createdAt: Date
  updatedAt: Date
  verifiedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  nextReviewDate?: Date
}

export interface KYCData {
  personalInfo: PersonalInfo
  bankInfo: BankInfo
  financialInfo: FinancialInfo
  employmentInfo: EmploymentInfo
  sourceOfFunds: SourceOfFunds[]
  riskAssessment: RiskAssessment
  terms: TermsAcceptance
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: Date
  koreanID: string
  phoneNumber: string
  email: string
  address: AddressInfo
  nationality: string
  residencyStatus: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'visitor'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  dependents: number
}

export interface AddressInfo {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'residential' | 'business' | 'mailing'
  verified: boolean
  verificationDate?: Date
}

export interface BankInfo {
  bankName: string
  bankCode: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  accountType: 'checking' | 'savings' | 'business'
  verified: boolean
  verificationDate?: Date
  balance?: number
  currency: 'KRW' | 'USD'
}

export interface FinancialInfo {
  annualIncome: number
  incomeCurrency: 'KRW' | 'USD'
  incomeSource: 'employment' | 'business' | 'investment' | 'pension' | 'other'
  netWorth: number
  netWorthCurrency: 'KRW' | 'USD'
  liquidAssets: number
  investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
  riskTolerance: RiskLevel
  investmentGoals: string[]
  expectedInvestmentAmount: number
}

export interface EmploymentInfo {
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student'
  employerName?: string
  jobTitle?: string
  industry?: string
  employmentStartDate?: Date
  employmentEndDate?: Date
  employerAddress?: AddressInfo
  verified: boolean
  verificationDate?: Date
}

export interface SourceOfFunds {
  type: 'salary' | 'business' | 'investment' | 'inheritance' | 'gift' | 'loan' | 'other'
  description: string
  amount: number
  currency: 'KRW' | 'USD'
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  sourceName?: string
  sourceAddress?: AddressInfo
  verified: boolean
  verificationDate?: Date
}

export interface RiskAssessment {
  overallRisk: RiskLevel
  riskFactors: RiskFactor[]
  riskScore: number
  riskCategory: 'low' | 'medium' | 'high'
  assessmentDate: Date
  nextAssessmentDate: Date
}

export interface RiskFactor {
  factor: string
  risk: RiskLevel
  weight: number
  description: string
  mitigation?: string
}

export interface TermsAcceptance {
  termsAndConditions: boolean
  privacyPolicy: boolean
  riskDisclosure: boolean
  dataSharing: boolean
  marketingConsent: boolean
  acceptedAt: Date
  ipAddress: string
  userAgent: string
}

export interface AMLCheck {
  id: string
  checkType: 'sanctions' | 'pep' | 'adverse_media' | 'risk_assessment' | 'transaction_monitoring'
  status: 'pending' | 'passed' | 'failed' | 'manual_review' | 'escalated'
  score: number
  threshold: number
  details: AMLCheckDetails
  createdAt: Date
  completedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
}

export interface AMLCheckDetails {
  matches: AMLMatch[]
  riskIndicators: string[]
  recommendations: string[]
  metadata: Record<string, any>
}

export interface AMLMatch {
  type: string
  name: string
  confidence: number
  source: string
  description: string
  risk: RiskLevel
}

export interface ComplianceLimits {
  dailyTransactionLimit: number
  monthlyTransactionLimit: number
  singleTransactionLimit: number
  totalInvestmentLimit: number
  depositLimit: number
  withdrawalLimit: number
  currency: 'KRW' | 'USD'
  lastUpdated: Date
}

export interface ComplianceDocument {
  id: string
  type: 'id_card' | 'passport' | 'drivers_license' | 'bank_statement' | 'proof_of_address' | 'income_statement' | 'employment_letter' | 'tax_return' | 'other'
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  uploadedAt: Date
  verified: boolean
  verificationDate?: Date
  verificationMethod: 'automatic' | 'manual' | 'third_party'
  verifiedBy?: string
  rejectionReason?: string
  metadata: Record<string, any>
}

export interface VerificationEvent {
  id: string
  type: 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected' | 'document_uploaded' | 'document_verified' | 'document_rejected' | 'aml_check' | 'risk_assessment' | 'limit_update'
  status: 'pending' | 'completed' | 'failed'
  description: string
  metadata: Record<string, any>
  createdAt: Date
  completedAt?: Date
  performedBy?: string
}

export interface ComplianceRequest {
  userId: string
  kycData: KYCData
  documents: File[]
  terms: TermsAcceptance
}

export interface ComplianceResult {
  success: boolean
  profileId: string
  status: ComplianceStatus
  level: ComplianceLevel
  riskScore: number
  riskLevel: RiskLevel
  limits: ComplianceLimits
  issues: string[]
  recommendations: string[]
  nextSteps: string[]
  estimatedReviewTime: string
}

export interface DocumentVerificationRequest {
  documentId: string
  documentType: ComplianceDocument['type']
  verificationMethod: 'automatic' | 'manual' | 'third_party'
  metadata?: Record<string, any>
}

export interface DocumentVerificationResult {
  success: boolean
  verified: boolean
  confidence: number
  extractedData: Record<string, any>
  issues: string[]
  recommendations: string[]
  verificationDate: Date
  verifiedBy?: string
}

export interface RiskAssessmentRequest {
  userId: string
  kycData: KYCData
  transactionHistory?: TransactionData[]
  riskFactors?: RiskFactor[]
}

export interface TransactionData {
  id: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'investment'
  amount: number
  currency: string
  date: Date
  counterparty?: string
  description: string
  riskScore?: number
}

export interface RiskAssessmentResult {
  success: boolean
  overallRisk: RiskLevel
  riskScore: number
  riskFactors: RiskFactor[]
  riskCategory: 'low' | 'medium' | 'high'
  recommendations: string[]
  assessmentDate: Date
  nextAssessmentDate: Date
}

// Configuración del servicio
const COMPLIANCE_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_COMPLIANCE_API_URL || 'https://api.compliance.jeonsevault.com',
  apiKey: process.env.NEXT_PUBLIC_COMPLIANCE_API_KEY,
  timeout: 60000, // 60 segundos para verificaciones complejas
  retryAttempts: 3,
  retryDelay: 2000,
  documentVerificationTimeout: 120000, // 2 minutos para verificación de documentos
  riskAssessmentTimeout: 45000 // 45 segundos para evaluación de riesgo
}

// Clase principal del servicio
export class ComplianceService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 10 * 60 * 1000 // 10 minutos
  private verificationQueue: Map<string, Promise<any>> = new Map()

  constructor() {
    this.apiKey = COMPLIANCE_API_CONFIG.apiKey || ''
    this.baseUrl = COMPLIANCE_API_CONFIG.baseUrl
  }

  // Métodos principales
  async submitCompliance(request: ComplianceRequest): Promise<ComplianceResult> {
    try {
      const formData = new FormData()
      formData.append('userId', request.userId)
      formData.append('kycData', JSON.stringify(request.kycData))
      formData.append('terms', JSON.stringify(request.terms))
      
      request.documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc)
      })

      const response = await this.makeRequest('/compliance/submit', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: COMPLIANCE_API_CONFIG.timeout
      })

      return this.mapComplianceResult(response.data)
    } catch (error) {
      console.error('Error submitting compliance:', error)
      throw new Error('Failed to submit compliance')
    }
  }

  async getComplianceProfile(userId: string): Promise<ComplianceProfile | null> {
    try {
      const cacheKey = `profile_${userId}`
      const cached = this.getCachedData(cacheKey) as ComplianceProfile | null
      if (cached) return cached

      const response = await this.makeRequest(`/compliance/profile/${userId}`, {
        method: 'GET'
      })

      const profile = this.mapComplianceProfile(response.data)
      this.setCachedData(cacheKey, profile)
      
      return profile
    } catch (error) {
      console.error('Error getting compliance profile:', error)
      return null
    }
  }

  async updateComplianceProfile(
    userId: string,
    updates: Partial<KYCData>
  ): Promise<ComplianceProfile | null> {
    try {
      const response = await this.makeRequest(`/compliance/profile/${userId}`, {
        method: 'PUT',
        data: { kycData: updates }
      })

      const profile = this.mapComplianceProfile(response.data)
      this.clearProfileCache(userId)
      
      return profile
    } catch (error) {
      console.error('Error updating compliance profile:', error)
      return null
    }
  }

  async uploadDocument(
    userId: string,
    document: File,
    type: ComplianceDocument['type'],
    metadata?: Record<string, any>
  ): Promise<ComplianceDocument> {
    try {
      const formData = new FormData()
      formData.append('document', document)
      formData.append('type', type)
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }

      const response = await this.makeRequest(`/compliance/documents/${userId}`, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return this.mapComplianceDocument(response.data)
    } catch (error) {
      console.error('Error uploading document:', error)
      throw new Error('Failed to upload document')
    }
  }

  async verifyDocument(request: DocumentVerificationRequest): Promise<DocumentVerificationResult> {
    try {
      const queueKey = `doc_verification_${request.documentId}`
      
      // Evitar verificaciones duplicadas
      if (this.verificationQueue.has(queueKey)) {
        return await this.verificationQueue.get(queueKey)!
      }

      const verificationPromise = this.performDocumentVerification(request)
      this.verificationQueue.set(queueKey, verificationPromise)

      try {
        const result = await verificationPromise
        return result
      } finally {
        this.verificationQueue.delete(queueKey)
      }
    } catch (error) {
      console.error('Error verifying document:', error)
      throw new Error('Failed to verify document')
    }
  }

  async performRiskAssessment(request: RiskAssessmentRequest): Promise<RiskAssessmentResult> {
    try {
      const response = await this.makeRequest('/compliance/risk-assessment', {
        method: 'POST',
        data: request,
        timeout: COMPLIANCE_API_CONFIG.riskAssessmentTimeout
      })

      return this.mapRiskAssessmentResult(response.data)
    } catch (error) {
      console.error('Error performing risk assessment:', error)
      throw new Error('Failed to perform risk assessment')
    }
  }

  async runAMLCheck(userId: string, checkType: AMLCheck['checkType']): Promise<AMLCheck> {
    try {
      const response = await this.makeRequest('/compliance/aml-check', {
        method: 'POST',
        data: {
          userId,
          checkType
        }
      })

      return this.mapAMLCheck(response.data)
    } catch (error) {
      console.error('Error running AML check:', error)
      throw new Error('Failed to run AML check')
    }
  }

  async getAMLChecks(userId: string): Promise<AMLCheck[]> {
    try {
      const response = await this.makeRequest(`/compliance/aml-checks/${userId}`, {
        method: 'GET'
      })

      return response.data.map((check: any) => this.mapAMLCheck(check))
    } catch (error) {
      console.error('Error getting AML checks:', error)
      return []
    }
  }

  async updateComplianceLimits(
    userId: string,
    limits: Partial<ComplianceLimits>
  ): Promise<ComplianceLimits | null> {
    try {
      const response = await this.makeRequest(`/compliance/limits/${userId}`, {
        method: 'PUT',
        data: limits
      })

      return this.mapComplianceLimits(response.data)
    } catch (error) {
      console.error('Error updating compliance limits:', error)
      return null
    }
  }

  async getVerificationHistory(userId: string): Promise<VerificationEvent[]> {
    try {
      const response = await this.makeRequest(`/compliance/history/${userId}`, {
        method: 'GET'
      })

      return response.data.map((event: any) => this.mapVerificationEvent(event))
    } catch (error) {
      console.error('Error getting verification history:', error)
      return []
    }
  }

  async approveCompliance(userId: string, approvedBy: string, notes?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/compliance/approve/${userId}`, {
        method: 'POST',
        data: {
          approvedBy,
          notes
        }
      })

      this.clearProfileCache(userId)
      return response.data.success
    } catch (error) {
      console.error('Error approving compliance:', error)
      return false
    }
  }

  async rejectCompliance(
    userId: string,
    rejectedBy: string,
    reason: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/compliance/reject/${userId}`, {
        method: 'POST',
        data: {
          rejectedBy,
          reason,
          notes
        }
      })

      this.clearProfileCache(userId)
      return response.data.success
    } catch (error) {
      console.error('Error rejecting compliance:', error)
      return false
    }
  }

  async escalateCompliance(
    userId: string,
    escalatedBy: string,
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/compliance/escalate/${userId}`, {
        method: 'POST',
        data: {
          escalatedBy,
          reason,
          priority
        }
      })

      return response.data.success
    } catch (error) {
      console.error('Error escalating compliance:', error)
      return false
    }
  }

  // Métodos de utilidad
  async checkComplianceStatus(userId: string): Promise<ComplianceStatus> {
    try {
      const profile = await this.getComplianceProfile(userId)
      return profile?.status || 'unverified'
    } catch (error) {
      console.error('Error checking compliance status:', error)
      return 'unverified'
    }
  }

  async getComplianceLevel(userId: string): Promise<ComplianceLevel> {
    try {
      const profile = await this.getComplianceProfile(userId)
      return profile?.level || 'Basic'
    } catch (error) {
      console.error('Error getting compliance level:', error)
      return 'Basic'
    }
  }

  async getRiskLevel(userId: string): Promise<RiskLevel> {
    try {
      const profile = await this.getComplianceProfile(userId)
      return profile?.riskLevel || 'Medium'
    } catch (error) {
      console.error('Error getting risk level:', error)
      return 'Medium'
    }
  }

  async validateTransaction(
    userId: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'transfer' | 'investment'
  ): Promise<{
    allowed: boolean
    reason?: string
    limits?: ComplianceLimits
  }> {
    try {
      const profile = await this.getComplianceProfile(userId)
      if (!profile) {
        return { allowed: false, reason: 'Compliance profile not found' }
      }

      if (profile.status !== 'verified') {
        return { allowed: false, reason: 'Compliance not verified' }
      }

      const limits = profile.limits
      let allowed = true
      let reason: string | undefined

      switch (type) {
        case 'deposit':
          if (amount > limits.depositLimit) {
            allowed = false
            reason = 'Amount exceeds deposit limit'
          }
          break
        case 'withdrawal':
          if (amount > limits.withdrawalLimit) {
            allowed = false
            reason = 'Amount exceeds withdrawal limit'
          }
          break
        case 'investment':
          if (amount > limits.totalInvestmentLimit) {
            allowed = false
            reason = 'Amount exceeds investment limit'
          }
          break
      }

      return { allowed, reason, limits }
    } catch (error) {
      console.error('Error validating transaction:', error)
      return { allowed: false, reason: 'Error validating transaction' }
    }
  }

  // Métodos privados
  private async makeRequest(
    endpoint: string,
    options: {
      method: string
      params?: Record<string, any>
      data?: any
      headers?: Record<string, string>
      timeout?: number
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
      signal: AbortSignal.timeout(options.timeout || COMPLIANCE_API_CONFIG.timeout)
    }

    if (options.data && !options.headers?.['Content-Type']?.includes('multipart/form-data')) {
      config.body = JSON.stringify(options.data)
    } else if (options.data) {
      config.body = options.data
    }

    let lastError: Error
    for (let attempt = 1; attempt <= COMPLIANCE_API_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await fetch(url.toString(), config)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        if (attempt < COMPLIANCE_API_CONFIG.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, COMPLIANCE_API_CONFIG.retryDelay * attempt))
        }
      }
    }

    throw lastError!
  }

  private async performDocumentVerification(request: DocumentVerificationRequest): Promise<DocumentVerificationResult> {
    const response = await this.makeRequest(`/compliance/documents/${request.documentId}/verify`, {
      method: 'POST',
      data: {
        verificationMethod: request.verificationMethod,
        metadata: request.metadata
      },
      timeout: COMPLIANCE_API_CONFIG.documentVerificationTimeout
    })

    return this.mapDocumentVerificationResult(response.data)
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

  private clearProfileCache(userId: string): void {
    this.cache.delete(`profile_${userId}`)
  }

  // Métodos de mapeo de datos
  private mapComplianceProfile(data: any): ComplianceProfile {
    return {
      id: data.id,
      userId: data.userId,
      status: data.status,
      level: data.level,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      kycData: this.mapKYCData(data.kycData),
      amlChecks: data.amlChecks?.map((check: any) => this.mapAMLCheck(check)) || [],
      limits: this.mapComplianceLimits(data.limits),
      documents: data.documents?.map((doc: any) => this.mapComplianceDocument(doc)) || [],
      verificationHistory: data.verificationHistory?.map((event: any) => this.mapVerificationEvent(event)) || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
      rejectedAt: data.rejectedAt ? new Date(data.rejectedAt) : undefined,
      rejectionReason: data.rejectionReason,
      nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined
    }
  }

  private mapKYCData(data: any): KYCData {
    return {
      personalInfo: this.mapPersonalInfo(data.personalInfo),
      bankInfo: this.mapBankInfo(data.bankInfo),
      financialInfo: this.mapFinancialInfo(data.financialInfo),
      employmentInfo: this.mapEmploymentInfo(data.employmentInfo),
      sourceOfFunds: data.sourceOfFunds?.map((source: any) => this.mapSourceOfFunds(source)) || [],
      riskAssessment: this.mapRiskAssessment(data.riskAssessment),
      terms: this.mapTermsAcceptance(data.terms)
    }
  }

  private mapPersonalInfo(data: any): PersonalInfo {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      koreanID: data.koreanID,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: this.mapAddressInfo(data.address),
      nationality: data.nationality,
      residencyStatus: data.residencyStatus,
      maritalStatus: data.maritalStatus,
      dependents: data.dependents
    }
  }

  private mapAddressInfo(data: any): AddressInfo {
    return {
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      type: data.type,
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined
    }
  }

  private mapBankInfo(data: any): BankInfo {
    return {
      bankName: data.bankName,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      accountHolderID: data.accountHolderID,
      accountType: data.accountType,
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined,
      balance: data.balance,
      currency: data.currency
    }
  }

  private mapFinancialInfo(data: any): FinancialInfo {
    return {
      annualIncome: data.annualIncome,
      incomeCurrency: data.incomeCurrency,
      incomeSource: data.incomeSource,
      netWorth: data.netWorth,
      netWorthCurrency: data.netWorthCurrency,
      liquidAssets: data.liquidAssets,
      investmentExperience: data.investmentExperience,
      riskTolerance: data.riskTolerance,
      investmentGoals: data.investmentGoals,
      expectedInvestmentAmount: data.expectedInvestmentAmount
    }
  }

  private mapEmploymentInfo(data: any): EmploymentInfo {
    return {
      employmentStatus: data.employmentStatus,
      employerName: data.employerName,
      jobTitle: data.jobTitle,
      industry: data.industry,
      employmentStartDate: data.employmentStartDate ? new Date(data.employmentStartDate) : undefined,
      employmentEndDate: data.employmentEndDate ? new Date(data.employmentEndDate) : undefined,
      employerAddress: data.employerAddress ? this.mapAddressInfo(data.employerAddress) : undefined,
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined
    }
  }

  private mapSourceOfFunds(data: any): SourceOfFunds {
    return {
      type: data.type,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      sourceName: data.sourceName,
      sourceAddress: data.sourceAddress ? this.mapAddressInfo(data.sourceAddress) : undefined,
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined
    }
  }

  private mapRiskAssessment(data: any): RiskAssessment {
    return {
      overallRisk: data.overallRisk,
      riskFactors: data.riskFactors?.map((factor: any) => this.mapRiskFactor(factor)) || [],
      riskScore: data.riskScore,
      riskCategory: data.riskCategory,
      assessmentDate: new Date(data.assessmentDate),
      nextAssessmentDate: new Date(data.nextAssessmentDate)
    }
  }

  private mapRiskFactor(data: any): RiskFactor {
    return {
      factor: data.factor,
      risk: data.risk,
      weight: data.weight,
      description: data.description,
      mitigation: data.mitigation
    }
  }

  private mapTermsAcceptance(data: any): TermsAcceptance {
    return {
      termsAndConditions: data.termsAndConditions,
      privacyPolicy: data.privacyPolicy,
      riskDisclosure: data.riskDisclosure,
      dataSharing: data.dataSharing,
      marketingConsent: data.marketingConsent,
      acceptedAt: new Date(data.acceptedAt),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    }
  }

  private mapAMLCheck(data: any): AMLCheck {
    return {
      id: data.id,
      checkType: data.checkType,
      status: data.status,
      score: data.score,
      threshold: data.threshold,
      details: this.mapAMLCheckDetails(data.details),
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      reviewedBy: data.reviewedBy,
      reviewNotes: data.reviewNotes
    }
  }

  private mapAMLCheckDetails(data: any): AMLCheckDetails {
    return {
      matches: data.matches?.map((match: any) => ({
        type: match.type,
        name: match.name,
        confidence: match.confidence,
        source: match.source,
        description: match.description,
        risk: match.risk
      })) || [],
      riskIndicators: data.riskIndicators || [],
      recommendations: data.recommendations || [],
      metadata: data.metadata || {}
    }
  }

  private mapComplianceLimits(data: any): ComplianceLimits {
    return {
      dailyTransactionLimit: data.dailyTransactionLimit,
      monthlyTransactionLimit: data.monthlyTransactionLimit,
      singleTransactionLimit: data.singleTransactionLimit,
      totalInvestmentLimit: data.totalInvestmentLimit,
      depositLimit: data.depositLimit,
      withdrawalLimit: data.withdrawalLimit,
      currency: data.currency,
      lastUpdated: new Date(data.lastUpdated)
    }
  }

  private mapComplianceDocument(data: any): ComplianceDocument {
    return {
      id: data.id,
      type: data.type,
      filename: data.filename,
      originalName: data.originalName,
      size: data.size,
      mimeType: data.mimeType,
      url: data.url,
      uploadedAt: new Date(data.uploadedAt),
      verified: data.verified,
      verificationDate: data.verificationDate ? new Date(data.verificationDate) : undefined,
      verificationMethod: data.verificationMethod,
      verifiedBy: data.verifiedBy,
      rejectionReason: data.rejectionReason,
      metadata: data.metadata || {}
    }
  }

  private mapVerificationEvent(data: any): VerificationEvent {
    return {
      id: data.id,
      type: data.type,
      status: data.status,
      description: data.description,
      metadata: data.metadata || {},
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      performedBy: data.performedBy
    }
  }

  private mapComplianceResult(data: any): ComplianceResult {
    return {
      success: data.success,
      profileId: data.profileId,
      status: data.status,
      level: data.level,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      limits: this.mapComplianceLimits(data.limits),
      issues: data.issues || [],
      recommendations: data.recommendations || [],
      nextSteps: data.nextSteps || [],
      estimatedReviewTime: data.estimatedReviewTime
    }
  }

  private mapDocumentVerificationResult(data: any): DocumentVerificationResult {
    return {
      success: data.success,
      verified: data.verified,
      confidence: data.confidence,
      extractedData: data.extractedData || {},
      issues: data.issues || [],
      recommendations: data.recommendations || [],
      verificationDate: new Date(data.verificationDate),
      verifiedBy: data.verifiedBy
    }
  }

  private mapRiskAssessmentResult(data: any): RiskAssessmentResult {
    return {
      success: data.success,
      overallRisk: data.overallRisk,
      riskScore: data.riskScore,
      riskFactors: data.riskFactors?.map((factor: any) => this.mapRiskFactor(factor)) || [],
      riskCategory: data.riskCategory,
      recommendations: data.recommendations || [],
      assessmentDate: new Date(data.assessmentDate),
      nextAssessmentDate: new Date(data.nextAssessmentDate)
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

  getActiveVerificationsCount(): number {
    return this.verificationQueue.size
  }
}

// Instancia singleton del servicio
export const complianceService = new ComplianceService()

// Hooks de React para usar el servicio
export function useComplianceService() {
  return {
    submitCompliance: complianceService.submitCompliance.bind(complianceService),
    getComplianceProfile: complianceService.getComplianceProfile.bind(complianceService),
    updateComplianceProfile: complianceService.updateComplianceProfile.bind(complianceService),
    uploadDocument: complianceService.uploadDocument.bind(complianceService),
    verifyDocument: complianceService.verifyDocument.bind(complianceService),
    performRiskAssessment: complianceService.performRiskAssessment.bind(complianceService),
    runAMLCheck: complianceService.runAMLCheck.bind(complianceService),
    getAMLChecks: complianceService.getAMLChecks.bind(complianceService),
    updateComplianceLimits: complianceService.updateComplianceLimits.bind(complianceService),
    getVerificationHistory: complianceService.getVerificationHistory.bind(complianceService),
    approveCompliance: complianceService.approveCompliance.bind(complianceService),
    rejectCompliance: complianceService.rejectCompliance.bind(complianceService),
    escalateCompliance: complianceService.escalateCompliance.bind(complianceService),
    checkComplianceStatus: complianceService.checkComplianceStatus.bind(complianceService),
    getComplianceLevel: complianceService.getComplianceLevel.bind(complianceService),
    getRiskLevel: complianceService.getRiskLevel.bind(complianceService),
    validateTransaction: complianceService.validateTransaction.bind(complianceService),
    clearCache: complianceService.clearCache.bind(complianceService)
  }
}
