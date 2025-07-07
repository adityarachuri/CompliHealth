export interface AppConfig {
  environment: string
  isDevelopment: boolean
  isProduction: boolean
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
    retryDelay: number
  }
  database: {
    maxConnections: number
    connectionTimeout: number
    queryTimeout: number
  }
  security: {
    jwtSecret: string
    jwtExpiresIn: string
    bcryptRounds: number
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
  }
  features: {
    enableAnalytics: boolean
    enableNotifications: boolean
    enableAuditLog: boolean
    enableTwoFactor: boolean
    enableRealTimeUpdates: boolean
  }
  business: {
    claimProcessingTimeout: number
    policyRenewalNotificationDays: number
    maxClaimAmount: number
    supportedCurrencies: string[]
    supportedLanguages: string[]
  }
}

const environment = process.env.NODE_ENV || "development"

export const APP_CONFIG: AppConfig = {
  environment,
  isDevelopment: environment === "development",
  isProduction: environment === "production",

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    timeout: Number.parseInt(process.env.API_TIMEOUT || "30000"),
    retryAttempts: Number.parseInt(process.env.API_RETRY_ATTEMPTS || "3"),
    retryDelay: Number.parseInt(process.env.API_RETRY_DELAY || "1000"),
  },

  database: {
    maxConnections: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
    connectionTimeout: Number.parseInt(process.env.DB_CONNECTION_TIMEOUT || "30000"),
    queryTimeout: Number.parseInt(process.env.DB_QUERY_TIMEOUT || "15000"),
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12"),
    sessionTimeout: Number.parseInt(process.env.SESSION_TIMEOUT || "3600000"),
    maxLoginAttempts: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
    lockoutDuration: Number.parseInt(process.env.LOCKOUT_DURATION || "900000"),
  },

  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS === "true",
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === "true",
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === "true",
    enableTwoFactor: process.env.ENABLE_TWO_FACTOR === "true",
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === "true",
  },

  business: {
    claimProcessingTimeout: Number.parseInt(process.env.CLAIM_PROCESSING_TIMEOUT || "86400000"),
    policyRenewalNotificationDays: Number.parseInt(process.env.POLICY_RENEWAL_NOTIFICATION_DAYS || "30"),
    maxClaimAmount: Number.parseInt(process.env.MAX_CLAIM_AMOUNT || "1000000"),
    supportedCurrencies: (process.env.SUPPORTED_CURRENCIES || "USD,EUR,GBP,CAD").split(","),
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || "en,es,fr,de").split(","),
  },
}
