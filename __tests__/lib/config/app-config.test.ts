import { APP_CONFIG } from "@/lib/config/app-config"
import jest from "jest"

describe("APP_CONFIG", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe("Environment Configuration", () => {
    it("should default to development environment", () => {
      delete process.env.NODE_ENV
      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.environment).toBe("development")
      expect(config.isDevelopment).toBe(true)
      expect(config.isProduction).toBe(false)
    })

    it("should detect production environment", () => {
      process.env.NODE_ENV = "production"
      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.environment).toBe("production")
      expect(config.isDevelopment).toBe(false)
      expect(config.isProduction).toBe(true)
    })

    it("should detect test environment", () => {
      process.env.NODE_ENV = "test"
      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.environment).toBe("test")
      expect(config.isDevelopment).toBe(false)
      expect(config.isProduction).toBe(false)
    })
  })

  describe("API Configuration", () => {
    it("should have default API configuration", () => {
      expect(APP_CONFIG.api.baseUrl).toBe("http://localhost:3000/api")
      expect(APP_CONFIG.api.timeout).toBe(30000)
      expect(APP_CONFIG.api.retryAttempts).toBe(3)
      expect(APP_CONFIG.api.retryDelay).toBe(1000)
    })

    it("should use custom API URL from environment", () => {
      process.env.NEXT_PUBLIC_API_URL = "https://api.example.com"
      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.api.baseUrl).toBe("https://api.example.com")
    })

    it("should parse numeric environment variables", () => {
      process.env.API_TIMEOUT = "45000"
      process.env.API_RETRY_ATTEMPTS = "5"
      process.env.API_RETRY_DELAY = "2000"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.api.timeout).toBe(45000)
      expect(config.api.retryAttempts).toBe(5)
      expect(config.api.retryDelay).toBe(2000)
    })
  })

  describe("Database Configuration", () => {
    it("should have default database configuration", () => {
      expect(APP_CONFIG.database.maxConnections).toBe(20)
      expect(APP_CONFIG.database.connectionTimeout).toBe(30000)
      expect(APP_CONFIG.database.queryTimeout).toBe(15000)
    })

    it("should parse database environment variables", () => {
      process.env.DB_MAX_CONNECTIONS = "50"
      process.env.DB_CONNECTION_TIMEOUT = "60000"
      process.env.DB_QUERY_TIMEOUT = "30000"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.database.maxConnections).toBe(50)
      expect(config.database.connectionTimeout).toBe(60000)
      expect(config.database.queryTimeout).toBe(30000)
    })
  })

  describe("Security Configuration", () => {
    it("should have default security configuration", () => {
      expect(APP_CONFIG.security.jwtSecret).toBe("fallback-secret-key")
      expect(APP_CONFIG.security.jwtExpiresIn).toBe("24h")
      expect(APP_CONFIG.security.bcryptRounds).toBe(12)
      expect(APP_CONFIG.security.sessionTimeout).toBe(3600000)
      expect(APP_CONFIG.security.maxLoginAttempts).toBe(5)
      expect(APP_CONFIG.security.lockoutDuration).toBe(900000)
    })

    it("should use custom security settings from environment", () => {
      process.env.JWT_SECRET = "custom-secret"
      process.env.JWT_EXPIRES_IN = "12h"
      process.env.BCRYPT_ROUNDS = "10"
      process.env.SESSION_TIMEOUT = "7200000"
      process.env.MAX_LOGIN_ATTEMPTS = "3"
      process.env.LOCKOUT_DURATION = "1800000"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.security.jwtSecret).toBe("custom-secret")
      expect(config.security.jwtExpiresIn).toBe("12h")
      expect(config.security.bcryptRounds).toBe(10)
      expect(config.security.sessionTimeout).toBe(7200000)
      expect(config.security.maxLoginAttempts).toBe(3)
      expect(config.security.lockoutDuration).toBe(1800000)
    })
  })

  describe("Feature Flags", () => {
    it("should have default feature flags disabled", () => {
      expect(APP_CONFIG.features.enableAnalytics).toBe(false)
      expect(APP_CONFIG.features.enableNotifications).toBe(false)
      expect(APP_CONFIG.features.enableAuditLog).toBe(false)
      expect(APP_CONFIG.features.enableTwoFactor).toBe(false)
      expect(APP_CONFIG.features.enableRealTimeUpdates).toBe(false)
    })

    it("should enable features from environment variables", () => {
      process.env.ENABLE_ANALYTICS = "true"
      process.env.ENABLE_NOTIFICATIONS = "true"
      process.env.ENABLE_AUDIT_LOG = "true"
      process.env.ENABLE_TWO_FACTOR = "true"
      process.env.ENABLE_REAL_TIME_UPDATES = "true"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.features.enableAnalytics).toBe(true)
      expect(config.features.enableNotifications).toBe(true)
      expect(config.features.enableAuditLog).toBe(true)
      expect(config.features.enableTwoFactor).toBe(true)
      expect(config.features.enableRealTimeUpdates).toBe(true)
    })

    it("should handle non-true values as false", () => {
      process.env.ENABLE_ANALYTICS = "false"
      process.env.ENABLE_NOTIFICATIONS = "0"
      process.env.ENABLE_AUDIT_LOG = "no"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.features.enableAnalytics).toBe(false)
      expect(config.features.enableNotifications).toBe(false)
      expect(config.features.enableAuditLog).toBe(false)
    })
  })

  describe("Business Rules", () => {
    it("should have default business rules", () => {
      expect(APP_CONFIG.business.claimProcessingTimeout).toBe(86400000)
      expect(APP_CONFIG.business.policyRenewalNotificationDays).toBe(30)
      expect(APP_CONFIG.business.maxClaimAmount).toBe(1000000)
      expect(APP_CONFIG.business.supportedCurrencies).toEqual(["USD", "EUR", "GBP", "CAD"])
      expect(APP_CONFIG.business.supportedLanguages).toEqual(["en", "es", "fr", "de"])
    })

    it("should parse business configuration from environment", () => {
      process.env.CLAIM_PROCESSING_TIMEOUT = "172800000"
      process.env.POLICY_RENEWAL_NOTIFICATION_DAYS = "45"
      process.env.MAX_CLAIM_AMOUNT = "2000000"
      process.env.SUPPORTED_CURRENCIES = "USD,EUR,JPY,AUD"
      process.env.SUPPORTED_LANGUAGES = "en,es,fr,de,it"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.business.claimProcessingTimeout).toBe(172800000)
      expect(config.business.policyRenewalNotificationDays).toBe(45)
      expect(config.business.maxClaimAmount).toBe(2000000)
      expect(config.business.supportedCurrencies).toEqual(["USD", "EUR", "JPY", "AUD"])
      expect(config.business.supportedLanguages).toEqual(["en", "es", "fr", "de", "it"])
    })
  })

  describe("Type Safety", () => {
    it("should export AppConfig interface", () => {
      const config: typeof APP_CONFIG = APP_CONFIG
      expect(config).toBeDefined()
      expect(typeof config.environment).toBe("string")
      expect(typeof config.isDevelopment).toBe("boolean")
      expect(typeof config.isProduction).toBe("boolean")
    })

    it("should have correct property types", () => {
      expect(typeof APP_CONFIG.api.timeout).toBe("number")
      expect(typeof APP_CONFIG.database.maxConnections).toBe("number")
      expect(typeof APP_CONFIG.security.bcryptRounds).toBe("number")
      expect(Array.isArray(APP_CONFIG.business.supportedCurrencies)).toBe(true)
      expect(Array.isArray(APP_CONFIG.business.supportedLanguages)).toBe(true)
    })
  })

  describe("Edge Cases", () => {
    it("should handle invalid numeric values gracefully", () => {
      process.env.API_TIMEOUT = "invalid"
      process.env.DB_MAX_CONNECTIONS = "not-a-number"

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(isNaN(config.api.timeout)).toBe(true)
      expect(isNaN(config.database.maxConnections)).toBe(true)
    })

    it("should handle empty environment variables", () => {
      process.env.SUPPORTED_CURRENCIES = ""
      process.env.SUPPORTED_LANGUAGES = ""

      jest.resetModules()
      const { APP_CONFIG: config } = require("@/lib/config/app-config")

      expect(config.business.supportedCurrencies).toEqual([""])
      expect(config.business.supportedLanguages).toEqual([""])
    })
  })
})
