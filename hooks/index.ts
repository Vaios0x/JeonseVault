// Exportar todos los hooks Web3
export { useJeonseVault } from './useJeonseVault'
export { useKaiaGasless, useContractGaslessTransaction, useJeonseVaultGasless } from './useKaiaGasless'
export { useInvestmentPool } from './useInvestmentPool'
export { useCompliance, ComplianceLevel } from './useCompliance'
export { usePropertyOracle, PropertyType } from './usePropertyOracle'
export { useDeposits } from './useDeposits'
export { useUserProfile } from './useUserProfile'
export { useWeb3 } from './useWeb3'
export { useDemoTransactions } from './useDemoTransactions'

// Analytics Hooks
export {
  useAnalyticsStats,
  useUserMetrics,
  usePageMetrics,
  useAnalyticsEvents,
  useFunnelMetrics,
  useCohortMetrics,
  useAnalyticsReport,
  useGenerateReport,
  useTrackEvent,
  useTrackTransaction,
  useTrackError,
  useTrackPerformance,
  usePageTracking,
  useErrorTracking,
  useAnalyticsService,
  ANALYTICS_KEYS
} from './useAnalytics'

// Exportar tipos principales
export type {
  Deposit,
  CreateDepositParams,
  JeonseVaultState,
  UseJeonseVaultReturn,
} from './useJeonseVault'

export type {
  GaslessTransactionParams,
  GaslessTransactionResult,
  UseKaiaGaslessReturn,
} from './useKaiaGasless'

export type {
  DepositPool,
  InvestmentInfo,
  UseInvestmentPoolReturn,
} from './useInvestmentPool'

export type {
  UserCompliance,
  ComplianceLimits,
  UseComplianceReturn,
  VerifyUserParams,
} from './useCompliance'

export type {
  PropertyData,
  PropertyOracleStats,
  UsePropertyOracleReturn,
  RegisterPropertyParams,
} from './usePropertyOracle'

export type {
  DepositFilters,
  DepositStats,
  DepositSearchResult,
  UseDepositsReturn,
} from './useDeposits'

export type {
  UserProfile,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  UserStatistics,
  TransactionHistory,
  UseUserProfileReturn,
} from './useUserProfile'

export type {
  UseWeb3Return,
} from './useWeb3'

export type {
  UseDemoTransactionsReturn,
  CreateDepositDemoParams,
  RegisterPropertyDemoParams,
  VerifyUserDemoParams,
} from './useDemoTransactions'
