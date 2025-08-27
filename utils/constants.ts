// Configuración de blockchain - Updated for 2025
export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: 1001, // Kaia testnet (Kairos)
  CHAIN_NAME: 'Kaia Testnet (Kairos)',
  CURRENCY_SYMBOL: 'KAIA',
  DECIMALS: 18,
  BLOCK_TIME: 12, // segundos
  EXPLORER_URL: 'https://explorer.kaia.io',
  RPC_URL: 'https://public-en-kairos.node.kaia.io',
  WS_URL: 'wss://public-en-kairos.node.kaia.io'
} as const

// Direcciones de contratos desplegados en Kaia testnet
export const CONTRACT_ADDRESSES = {
  JEONSE_VAULT: '0x6287ac251C19bFDfc7AE8247D64B952727855Dae',
  PROPERTY_ORACLE: '0xF38701CCCE9190D1445c8cB3561104e811CB1468',
  COMPLIANCE_MODULE: '0xf18Fa2873244423cb2247C2b64B5992418001702',
  INVESTMENT_POOL: '0xe9B843Bd787B433015e77F1Ad00eF0ad8dF056bB'
} as const

// Límites y configuraciones financieras
export const FINANCIAL_LIMITS = {
  MIN_DEPOSIT_AMOUNT: 1000000n, // 1 millón KRW
  MAX_DEPOSIT_AMOUNT: 1000000000000n, // 1 billón KRW
  MIN_INVESTMENT_AMOUNT: 100000n, // 100,000 KRW
  MAX_INVESTMENT_AMOUNT: 100000000000n, // 100 billones KRW
  MIN_PROPERTY_SIZE: 10, // 10 m²
  MAX_PROPERTY_SIZE: 1000, // 1000 m²
  MIN_DEPOSIT_PERIOD: 30, // 30 días
  MAX_DEPOSIT_PERIOD: 365 * 5, // 5 años
  MAX_INVESTMENT_PERCENTAGE: 100, // 100%
  MIN_INVESTMENT_PERCENTAGE: 0, // 0%
  DEFAULT_GAS_LIMIT: 300000n,
  MAX_GAS_PRICE: 100000000000n // 100 Gwei
} as const

// Estados de depósitos
export const DEPOSIT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  EXPIRED: 'expired'
} as const

// Estados de inversiones
export const INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn'
} as const

// Estados de compliance
export const COMPLIANCE_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
} as const

// Niveles de compliance
export const COMPLIANCE_LEVELS = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  CORPORATE: 'Corporate'
} as const

// Niveles de riesgo
export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
} as const

// Tipos de propiedad
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  OFFICETEL: 'officetel',
  VILLA: 'villa',
  COMMERCIAL: 'commercial'
} as const

// Tipos de transacción
export const TRANSACTION_TYPES = {
  CREATE_DEPOSIT: 'create_deposit',
  RELEASE_DEPOSIT: 'release_deposit',
  DISPUTE_DEPOSIT: 'dispute_deposit',
  INVEST_IN_POOL: 'invest_in_pool',
  WITHDRAW_INVESTMENT: 'withdraw_investment',
  CLAIM_RETURNS: 'claim_returns',
  VERIFY_PROPERTY: 'verify_property',
  VERIFY_USER: 'verify_user'
} as const

// Estados de transacción
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const

// Configuración de caché
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  LONG_TTL: 30 * 60 * 1000, // 30 minutos
  SHORT_TTL: 1 * 60 * 1000, // 1 minuto
  MAX_CACHE_SIZE: 1000
} as const

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  AUTO_HIDE_DELAY: 5000, // 5 segundos
  MAX_NOTIFICATIONS: 5,
  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left'
  }
} as const

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const

// Configuración de validación
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 200,
  PHONE_REGEX: /^01[0-9]-\d{3,4}-\d{4}$/,
  ID_REGEX: /^\d{6}-\d{7}$/,
  BANK_ACCOUNT_REGEX: /^\d{3}-\d{3}-\d{6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const

// Configuración de bancos coreanos
export const KOREAN_BANKS = [
  { code: '001', name: '한국은행', englishName: 'Bank of Korea' },
  { code: '002', name: '산업은행', englishName: 'Industrial Bank of Korea' },
  { code: '003', name: '기업은행', englishName: 'IBK Bank' },
  { code: '004', name: '국민은행', englishName: 'KB Kookmin Bank' },
  { code: '005', name: '하나은행', englishName: 'Hana Bank' },
  { code: '007', name: '수협은행', englishName: 'SuHyup Bank' },
  { code: '008', name: '수출입은행', englishName: 'Export-Import Bank of Korea' },
  { code: '011', name: '농협은행', englishName: 'NH Bank' },
  { code: '012', name: '농협회원조합', englishName: 'NH Member Cooperative' },
  { code: '020', name: '우리은행', englishName: 'Woori Bank' },
  { code: '023', name: 'SC제일은행', englishName: 'SC First Bank' },
  { code: '027', name: '한국씨티은행', englishName: 'Citibank Korea' },
  { code: '031', name: '대구은행', englishName: 'Daegu Bank' },
  { code: '032', name: '부산은행', englishName: 'Busan Bank' },
  { code: '034', name: '광주은행', englishName: 'Gwangju Bank' },
  { code: '035', name: '제주은행', englishName: 'Jeju Bank' },
  { code: '037', name: '전북은행', englishName: 'Jeonbuk Bank' },
  { code: '039', name: '경남은행', englishName: 'Gyeongnam Bank' },
  { code: '045', name: '새마을금고', englishName: 'Saemaul Geumgo' },
  { code: '048', name: '신협', englishName: 'ShinHyup Bank' },
  { code: '050', name: '상호저축은행', englishName: 'Mutual Savings Bank' },
  { code: '052', name: '모간스탠리은행', englishName: 'Morgan Stanley Bank' },
  { code: '054', name: 'HSBC은행', englishName: 'HSBC Bank' },
  { code: '055', name: '도이치은행', englishName: 'Deutsche Bank' },
  { code: '057', name: '제이피모간체이스은행', englishName: 'JP Morgan Chase Bank' },
  { code: '058', name: '미즈호은행', englishName: 'Mizuho Bank' },
  { code: '059', name: '미쓰비시도쿄UFJ은행', englishName: 'Mitsubishi UFJ Bank' },
  { code: '060', name: '미쓰이스미토모은행', englishName: 'Sumitomo Mitsui Bank' },
  { code: '061', name: 'BOA은행', englishName: 'Bank of America' },
  { code: '062', name: '비엔피파리바은행', englishName: 'BNP Paribas Bank' },
  { code: '063', name: '중국공상은행', englishName: 'Industrial and Commercial Bank of China' },
  { code: '064', name: '중국은행', englishName: 'Bank of China' },
  { code: '065', name: '농업은행', englishName: 'Agricultural Bank of China' },
  { code: '066', name: '중국건설은행', englishName: 'China Construction Bank' },
  { code: '067', name: '교통은행', englishName: 'Bank of Communications' },
  { code: '071', name: '우체국예금', englishName: 'Post Office Savings' },
  { code: '081', name: '하나증권', englishName: 'Hana Securities' },
  { code: '088', name: '신한증권', englishName: 'Shinhan Securities' },
  { code: '089', name: 'KB증권', englishName: 'KB Securities' },
  { code: '090', name: 'NH투자증권', englishName: 'NH Investment & Securities' },
  { code: '092', name: '미래에셋증권', englishName: 'Mirae Asset Securities' },
  { code: '093', name: '한국투자증권', englishName: 'Korea Investment & Securities' },
  { code: '094', name: '키움증권', englishName: 'Kiwoom Securities' },
  { code: '095', name: '이베스트증권', englishName: 'eBEST Securities' },
  { code: '096', name: '대우증권', englishName: 'Daewoo Securities' },
  { code: '097', name: '삼성증권', englishName: 'Samsung Securities' },
  { code: '098', name: '교보증권', englishName: 'Kyobo Securities' },
  { code: '099', name: '현대증권', englishName: 'Hyundai Securities' }
] as const

// Configuración de idiomas
export const LANGUAGES = {
  KOREAN: 'ko',
  ENGLISH: 'en'
} as const

// Configuración de monedas
export const CURRENCIES = {
  KRW: 'KRW',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  CNY: 'CNY'
} as const

// Configuración de zonas horarias
export const TIMEZONES = {
  SEOUL: 'Asia/Seoul',
  UTC: 'UTC'
} as const

// Configuración de errores
export const ERROR_CODES = {
  // Errores de blockchain
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Errores de autenticación
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Errores de compliance
  COMPLIANCE_FAILED: 'COMPLIANCE_FAILED',
  KYC_REQUIRED: 'KYC_REQUIRED',
  AML_CHECK_FAILED: 'AML_CHECK_FAILED',
  
  // Errores de negocio
  DEPOSIT_NOT_FOUND: 'DEPOSIT_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_STATUS: 'INVALID_STATUS',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED'
} as const

// Configuración de eventos
export const EVENTS = {
  // Eventos de depósito
  DEPOSIT_CREATED: 'deposit_created',
  DEPOSIT_RELEASED: 'deposit_released',
  DEPOSIT_DISPUTED: 'deposit_disputed',
  DEPOSIT_COMPLETED: 'deposit_completed',
  
  // Eventos de inversión
  INVESTMENT_CREATED: 'investment_created',
  INVESTMENT_WITHDRAWN: 'investment_withdrawn',
  RETURNS_CLAIMED: 'returns_claimed',
  
  // Eventos de compliance
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  
  // Eventos de sistema
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_CHANGED: 'password_changed'
} as const

// Configuración de rutas
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DEPOSITS: '/deposits',
  INVESTMENTS: '/investments',
  COMPLIANCE: '/compliance',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms'
} as const

// Configuración de API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.jeonsevault.com',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
} as const

// Configuración de analytics
export const ANALYTICS_CONFIG = {
  TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  ENABLE_TRACKING: process.env.NODE_ENV === 'production',
  EVENTS: {
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    TRANSACTION: 'transaction'
  }
} as const

// Configuración de seguridad
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  PASSWORD_EXPIRY_DAYS: 90,
  REQUIRE_2FA: false,
  ALLOWED_ORIGINS: ['https://jeonsevault.com', 'https://www.jeonsevault.com']
} as const

// Configuración de notificaciones push
export const PUSH_CONFIG = {
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  ENABLE_PUSH: true,
  TYPES: {
    TRANSACTION: 'transaction',
    COMPLIANCE: 'compliance',
    SYSTEM: 'system',
    MARKETING: 'marketing'
  }
} as const

// Configuración de caché local
export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
  WALLET_CONNECTION: 'wallet_connection',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications'
} as const

// Configuración de temas
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

// Configuración de breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const
