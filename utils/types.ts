import { Address, Hash } from 'viem'

// Tipos básicos
export type Status = 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'expired'
export type ComplianceStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type ComplianceLevel = 'Basic' | 'Standard' | 'Premium' | 'Corporate'
export type PropertyType = 'apartment' | 'house' | 'officetel' | 'villa' | 'commercial'
export type TransactionType = 'create_deposit' | 'release_deposit' | 'dispute_deposit' | 'invest_in_pool' | 'withdraw_investment' | 'claim_returns' | 'verify_property' | 'verify_user'
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled'
export type Language = 'ko' | 'en'
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY'
export type Theme = 'light' | 'dark' | 'system'

// Enum para estados de depósito
export enum DepositStatus {
  ACTIVE = 0,
  FUNDED = 1,
  EXPIRED = 2,
  CANCELLED = 3,
  COMPLETED = 4
}

// Tipos de usuario
export interface User {
  id: string
  address: Address
  email?: string
  name?: string
  phone?: string
  koreanID?: string
  complianceStatus: ComplianceStatus
  complianceLevel: ComplianceLevel
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  preferences: UserPreferences
}

export interface UserPreferences {
  language: Language
  currency: Currency
  theme: Theme
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  transaction: boolean
  compliance: boolean
  system: boolean
  marketing: boolean
}

export interface PrivacySettings {
  shareData: boolean
  marketingEmails: boolean
  analytics: boolean
}

// Tipos de depósito
export interface Deposit {
  id: string
  propertyId: string
  propertyAddress: string
  amount: bigint
  totalInvested?: bigint
  landlord: string
  tenant: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'disputed' | 'pending' | 'cancelled'
  isInvestmentEnabled: boolean
  investmentPoolShare?: bigint
  expectedReturn?: bigint
  actualReturn?: bigint
  annualReturn?: number
  duration: number
  investorCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Property {
  id: string
  propertyId: string
  type: PropertyType
  address: string
  size: number
  verified: boolean
  verificationDate?: Date
  landlordAddress: Address
  createdAt: Date
  updatedAt: Date
}

// Tipos de inversión
export interface InvestmentPool {
  id: string
  name: string
  totalValue: bigint
  availableValue: bigint
  expectedReturn: bigint
  duration: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'full' | 'closed'
  investors: number
  minInvestment: bigint
  maxInvestment: bigint
  endDate: Date
  description: string
  propertyType: string
  location: string
}

export interface Investment {
  id: string
  investmentId: bigint
  poolId: bigint
  investorAddress: Address
  amount: bigint
  shares: bigint
  status: Status
  createdAt: Date
  updatedAt: Date
  withdrawnAt?: Date
  returns: bigint
  claimedReturns: bigint
}

export interface InvestmentInfo {
  depositId: bigint
  poolId: bigint
  amount: bigint
  shares: bigint
  status: Status
  createdAt: Date
  returns: bigint
  claimedReturns: bigint
}

// Tipos de compliance
export interface ComplianceProfile {
  id: string
  userId: string
  status: ComplianceStatus
  level: ComplianceLevel
  kycData: KYCData
  amlChecks: AMLCheck[]
  riskScore: number
  limits: ComplianceLimits
  createdAt: Date
  updatedAt: Date
  verifiedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}

export interface KYCData {
  personalInfo: PersonalInfo
  bankInfo: BankInfo
  financialInfo: FinancialInfo
  documents: DocumentInfo[]
  terms: TermsAcceptance
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: Date
  koreanID: string
  phoneNumber: string
  email: string
  address: string
  nationality: string
  occupation: string
}

export interface BankInfo {
  bankName: string
  bankCode: string
  accountNumber: string
  accountHolderName: string
  verified: boolean
  verificationDate?: Date
}

export interface FinancialInfo {
  annualIncome: number
  sourceOfFunds: string
  employmentStatus: string
  employerName?: string
  riskTolerance: RiskLevel
}

export interface DocumentInfo {
  id: string
  type: 'id_card' | 'bank_statement' | 'proof_of_address' | 'income_statement' | 'other'
  filename: string
  originalName: string
  size: number
  mimeType: string
  uploadedAt: Date
  verified: boolean
  verificationDate?: Date
  rejectionReason?: string
}

export interface TermsAcceptance {
  termsAndConditions: boolean
  privacyPolicy: boolean
  marketingConsent: boolean
  riskDisclosure: boolean
  acceptedAt: Date
}

export interface AMLCheck {
  id: string
  checkType: 'sanctions' | 'pep' | 'adverse_media' | 'risk_assessment'
  status: 'pending' | 'passed' | 'failed' | 'manual_review'
  score: number
  details: Record<string, any>
  createdAt: Date
  completedAt?: Date
}

export interface ComplianceLimits {
  dailyTransactionLimit: bigint
  monthlyTransactionLimit: bigint
  singleTransactionLimit: bigint
  totalInvestmentLimit: bigint
  depositLimit: bigint
}

// Tipos de transacción
export interface Transaction {
  id: string
  hash: Hash
  type: TransactionType
  status: TransactionStatus
  from: Address
  to: Address
  value: bigint
  gasUsed: bigint
  gasPrice: bigint
  blockNumber: bigint
  blockHash: Hash
  timestamp: Date
  confirmations: number
  error?: string
  metadata: TransactionMetadata
  createdAt: Date
  updatedAt: Date
}

export interface TransactionMetadata {
  depositId?: bigint
  poolId?: bigint
  propertyId?: string
  userId?: string
  description?: string
  tags?: string[]
}

// Tipos de estadísticas
export interface UserStats {
  totalDeposits: bigint
  activeDeposits: bigint
  totalInvestments: bigint
  activeInvestments: bigint
  totalReturns: bigint
  pendingReturns: bigint
  complianceScore: number
  riskLevel: RiskLevel
}

export interface PlatformStats {
  totalDeposits: bigint
  activeDeposits: bigint
  totalInvestments: bigint
  activeInvestments: bigint
  totalUsers: number
  verifiedUsers: number
  totalVolume: bigint
  averageReturn: number
  riskDistribution: Record<RiskLevel, number>
}

export interface PoolStats {
  totalPoolValue: bigint
  totalShares: bigint
  userShares: bigint
  utilizationRate: number
  averageReturn: number
  investorCount: number
  daysRemaining: number
}

// Tipos de métricas
export interface Metric {
  id: string
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  format?: 'currency' | 'percentage' | 'number' | 'duration'
  icon?: string
  color?: string
  trend?: MetricTrend[]
}

export interface MetricTrend {
  date: Date
  value: number
}

// Tipos de filtros y búsqueda
export interface FilterOptions {
  minAmount?: bigint
  maxAmount?: bigint
  propertyType?: PropertyType
  status?: Status
  dateRange?: DateRange
  riskLevel?: RiskLevel
  complianceLevel?: ComplianceLevel
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface SearchOptions {
  query: string
  filters: FilterOptions
  pagination: PaginationOptions
  sort: SortOptions
}

export interface PaginationOptions {
  page: number
  limit: number
  total?: number
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

// Tipos de formularios
export interface CreateDepositFormData {
  propertyType: PropertyType
  propertyAddress: string
  propertySize: string
  amount: string
  endDate: string
  enableInvestment?: boolean
  investmentPercentage?: string
}

export interface KYCFormData {
  // Información personal
  firstName: string
  lastName: string
  dateOfBirth: string
  koreanID: string
  phoneNumber: string
  email: string
  address: string
  
  // Información bancaria
  bankName: string
  bankAccountNumber: string
  accountHolderName: string
  
  // Información financiera
  annualIncome: string
  sourceOfFunds: string
  occupation: string
  
  // Documentos
  idCardFile?: File
  bankStatementFile?: File
  proofOfAddressFile?: File
  
  // Términos
  acceptTerms: boolean
  acceptPrivacyPolicy: boolean
  acceptMarketing?: boolean
}

export interface InvestmentFormData {
  amount: string
  poolId: string
  acceptRisk: boolean
  acceptTerms: boolean
}

export interface BankVerificationFormData {
  bankName: string
  accountNumber: string
  accountHolderName: string
  accountHolderID: string
  verificationCode: string
}

// Tipos de notificaciones
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  duration?: number
  action?: NotificationAction
  metadata?: Record<string, any>
}

export interface NotificationAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  action?: NotificationAction
}

// Tipos de configuración
export interface AppConfig {
  blockchain: BlockchainConfig
  contracts: ContractConfig
  limits: FinancialLimits
  features: FeatureFlags
  integrations: IntegrationConfig
}

export interface BlockchainConfig {
  chainId: number
  chainName: string
  currencySymbol: string
  decimals: number
  blockTime: number
  explorerUrl: string
  rpcUrl: string
  wsUrl: string
}

export interface ContractConfig {
  jeonseVault: Address
  propertyOracle: Address
  complianceModule: Address
  investmentPool: Address
}

export interface FinancialLimits {
  minDepositAmount: bigint
  maxDepositAmount: bigint
  minInvestmentAmount: bigint
  maxInvestmentAmount: bigint
  minPropertySize: number
  maxPropertySize: number
  minDepositPeriod: number
  maxDepositPeriod: number
  maxInvestmentPercentage: number
  minInvestmentPercentage: number
  defaultGasLimit: bigint
  maxGasPrice: bigint
}

export interface FeatureFlags {
  enableInvestment: boolean
  enableCompliance: boolean
  enableAnalytics: boolean
  enablePushNotifications: boolean
  enableMultiLanguage: boolean
  enableDarkMode: boolean
}

export interface IntegrationConfig {
  reown: ReownConfig
  analytics: AnalyticsConfig
  notifications: NotificationConfig
}

export interface ReownConfig {
  appId: string
  apiKey: string
  enableAnalytics: boolean
  enableWalletConnect: boolean
}

export interface AnalyticsConfig {
  trackingId?: string
  enableTracking: boolean
  events: Record<string, string>
}

export interface NotificationConfig {
  vapidPublicKey?: string
  enablePush: boolean
  types: Record<string, string>
}

// Tipos de errores
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
  userId?: string
  transactionHash?: Hash
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

// Tipos de eventos
export interface AppEvent {
  id: string
  type: string
  userId?: string
  data: Record<string, any>
  timestamp: Date
  metadata?: Record<string, any>
}

// Tipos de caché
export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: Date
  ttl: number
  expiresAt: Date
}

export interface CacheConfig {
  defaultTtl: number
  longTtl: number
  shortTtl: number
  maxCacheSize: number
}

// Tipos de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: AppError
  message?: string
  timestamp: Date
}

export interface ApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: T
  headers?: Record<string, string>
  params?: Record<string, string>
}

// Tipos de archivos
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url?: string
  uploadedAt: Date
  metadata?: Record<string, any>
}

export interface FileValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Tipos de seguridad
export interface SecurityContext {
  userId?: string
  address?: Address
  permissions: string[]
  sessionId: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
}

// Tipos de utilidades
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export type NonNullable<T> = T extends null | undefined ? never : T

export type ValueOf<T> = T[keyof T]

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// Tipos de componentes
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps {
  isLoading?: boolean
  loadingText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
}

export interface FormFieldProps {
  label?: string
  error?: string
  success?: string
  helperText?: string
  isRequired?: boolean
  disabled?: boolean
}

// Tipos de hooks
export interface UseQueryOptions<T> {
  enabled?: boolean
  refetchInterval?: number
  refetchOnWindowFocus?: boolean
  retry?: number | boolean
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void
  onError?: (error: Error, variables: V) => void
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void
}

// Tipos de contexto
export interface AppContextValue {
  user?: User
  config: AppConfig
  theme: Theme
  language: Language
  currency: Currency
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

// Tipos de rutas
export interface RouteConfig {
  path: string
  component: React.ComponentType
  exact?: boolean
  protected?: boolean
  roles?: string[]
  layout?: React.ComponentType
}

// Tipos de menú
export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
  badge?: string | number
}

// Tipos de breadcrumb
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

// Tipos de tabla
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationOptions
  sort?: SortOptions
  onSort?: (field: string, order: 'asc' | 'desc') => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  rowKey?: string | ((record: T) => string)
  rowSelection?: {
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[]) => void
  }
}

// Tipos de gráficos
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
}

export interface ChartOptions {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: Record<string, any>
  scales?: Record<string, any>
  animation?: Record<string, any>
}

// Tipos de exportación
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  filename?: string
  includeHeaders?: boolean
  dateFormat?: string
  numberFormat?: string
}

// Tipos de importación
export interface ImportOptions {
  format: 'csv' | 'excel' | 'json'
  validateData?: boolean
  skipErrors?: boolean
  onProgress?: (progress: number) => void
  onComplete?: (result: ImportResult) => void
  onError?: (error: Error) => void
}

export interface ImportResult {
  totalRows: number
  importedRows: number
  failedRows: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: any
}

// Tipos principales de la aplicación

export interface Deposit {
  id: string
  propertyId: string
  propertyAddress: string
  amount: bigint
  totalInvested?: bigint
  landlord: string
  tenant: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'disputed' | 'pending' | 'cancelled'
  isInvestmentEnabled: boolean
  investmentPoolShare?: bigint
  expectedReturn?: bigint
  actualReturn?: bigint
  annualReturn?: number
  duration: number
  investorCount: number
  createdAt: Date
  updatedAt: Date
}

export interface UserCompliance {
  isVerified: boolean
  level: 'Basic' | 'Premium' | 'Enterprise'
  transactionLimit: bigint
  monthlyLimit: bigint
  monthlySpent: bigint
  lastMonthReset: bigint
}

export interface InvestmentPool {
  id: string
  name: string
  totalValue: bigint
  availableValue: bigint
  expectedReturn: bigint
  duration: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'full' | 'closed'
  investors: number
  minInvestment: bigint
  maxInvestment: bigint
  endDate: Date
  description: string
  propertyType: string
  location: string
}

export interface PoolStats {
  totalPoolValue: bigint
  totalUserValue: bigint
  expectedAnnualReturn: bigint
  totalInvestors: number
}

export interface UserInvestment {
  depositId: bigint
  amount: bigint
  shares: bigint
  expectedReturn: bigint
  createdAt: bigint
}
