export const APP_CONFIG = {
  // Application Information
  name: "Healthcare Insurance Portal",
  version: "2.0.0",
  description: "Enterprise Healthcare Insurance Management System",

  // Environment Configuration
  environment: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Database Configuration
  database: {
    maxConnections: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
    connectionTimeout: Number.parseInt(process.env.DB_CONNECTION_TIMEOUT || "30000"),
    queryTimeout: Number.parseInt(process.env.DB_QUERY_TIMEOUT || "15000"),
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12"),
    sessionTimeout: Number.parseInt(process.env.SESSION_TIMEOUT || "3600000"), // 1 hour
    maxLoginAttempts: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
    lockoutDuration: Number.parseInt(process.env.LOCKOUT_DURATION || "900000"), // 15 minutes
  },

  // Rate Limiting
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"),
    skipSuccessfulRequests: true,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/csv"],
    uploadPath: process.env.UPLOAD_PATH || "/tmp/uploads",
  },

  // Email Configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || "sendgrid",
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.FROM_EMAIL || "noreply@healthinsurance.com",
    fromName: process.env.FROM_NAME || "Healthcare Insurance Portal",
  },

  // Monitoring and Logging
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === "true",
    enableTracing: process.env.ENABLE_TRACING === "true",
    logLevel: process.env.LOG_LEVEL || "info",
    sentryDsn: process.env.SENTRY_DSN,
  },

  // Cache Configuration
  cache: {
    redis: {
      url: process.env.REDIS_URL,
      ttl: Number.parseInt(process.env.CACHE_TTL || "3600"), // 1 hour
    },
    memory: {
      maxSize: Number.parseInt(process.env.MEMORY_CACHE_SIZE || "100"),
      ttl: Number.parseInt(process.env.MEMORY_CACHE_TTL || "300"), // 5 minutes
    },
  },

  // Feature Flags
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS === "true",
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === "true",
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === "true",
    enableTwoFactor: process.env.ENABLE_TWO_FACTOR === "true",
    enableRealTimeUpdates: process.env.ENABLE_REALTIME === "true",
  },

  // Business Rules
  business: {
    claimProcessingTimeout: Number.parseInt(process.env.CLAIM_PROCESSING_TIMEOUT || "86400000"), // 24 hours
    policyRenewalNotificationDays: Number.parseInt(process.env.POLICY_RENEWAL_DAYS || "30"),
    maxClaimAmount: Number.parseInt(process.env.MAX_CLAIM_AMOUNT || "1000000"),
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD"],
    supportedLanguages: ["en", "es", "fr", "de"],
  },
}

export type AppConfig = typeof APP_CONFIG
