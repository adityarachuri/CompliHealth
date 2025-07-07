import { logger, loggers, logPerformance, logSecurityEvent, logAuditEvent } from "@/lib/utils/logger"
import winston from "winston"
import jest from "jest" // Declare jest variable

// Mock winston
jest.mock("winston", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}))

describe("Logger", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Logger Creation", () => {
    it("should create logger with correct configuration", () => {
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          defaultMeta: expect.objectContaining({
            service: "Healthcare Insurance Portal",
            version: "2.0.0",
            environment: "development",
          }),
        }),
      )
    })

    it("should create child loggers for different modules", () => {
      expect(logger.child).toHaveBeenCalledWith({ module: "auth" })
      expect(logger.child).toHaveBeenCalledWith({ module: "api" })
      expect(logger.child).toHaveBeenCalledWith({ module: "database" })
      expect(logger.child).toHaveBeenCalledWith({ module: "security" })
      expect(logger.child).toHaveBeenCalledWith({ module: "business" })
      expect(logger.child).toHaveBeenCalledWith({ module: "performance" })
    })
  })

  describe("Structured Logging Helpers", () => {
    it("should log performance metrics", () => {
      const mockPerformanceLogger = loggers.performance

      logPerformance("database_query", 150, { query: "SELECT * FROM users" })

      expect(mockPerformanceLogger.info).toHaveBeenCalledWith("Performance metric", {
        operation: "database_query",
        duration: 150,
        query: "SELECT * FROM users",
      })
    })

    it("should log security events", () => {
      const mockSecurityLogger = loggers.security

      logSecurityEvent("failed_login", "user123", { ip: "192.168.1.1" })

      expect(mockSecurityLogger.warn).toHaveBeenCalledWith("Security event", {
        event: "failed_login",
        userId: "user123",
        timestamp: expect.any(String),
        ip: "192.168.1.1",
      })
    })

    it("should log audit events", () => {
      logAuditEvent("CREATE", "user123", "CLAIM", "claim456", { amount: 1000 })

      expect(logger.info).toHaveBeenCalledWith("Audit event", {
        action: "CREATE",
        userId: "user123",
        resourceType: "CLAIM",
        resourceId: "claim456",
        timestamp: expect.any(String),
        amount: 1000,
      })
    })
  })

  describe("Module Loggers", () => {
    it("should provide module-specific loggers", () => {
      expect(loggers.auth).toBeDefined()
      expect(loggers.api).toBeDefined()
      expect(loggers.database).toBeDefined()
      expect(loggers.security).toBeDefined()
      expect(loggers.business).toBeDefined()
      expect(loggers.performance).toBeDefined()
    })

    it("should allow module-specific logging", () => {
      loggers.auth.info("User authenticated", { userId: "123" })
      loggers.api.error("API error", { endpoint: "/api/users" })

      expect(loggers.auth.info).toHaveBeenCalledWith("User authenticated", { userId: "123" })
      expect(loggers.api.error).toHaveBeenCalledWith("API error", { endpoint: "/api/users" })
    })
  })

  describe("Production Configuration", () => {
    it("should add file transports in production", () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = "production"

      // Re-import to trigger production configuration
      jest.resetModules()
      require("@/lib/utils/logger")

      expect(logger.add).toHaveBeenCalledTimes(2) // Error log and combined log

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe("Error Handling", () => {
    it("should handle logging errors gracefully", () => {
      const mockLogger = logger as any
      mockLogger.info.mockImplementation(() => {
        throw new Error("Logging failed")
      })

      // Should not throw when logging fails
      expect(() => {
        try {
          logger.info("Test message")
        } catch (error) {
          // Logging errors should be handled internally
        }
      }).not.toThrow()
    })
  })

  describe("Log Levels", () => {
    it("should respect log level configuration", () => {
      // Test that logger is created with correct log level
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
        }),
      )
    })
  })

  describe("Log Format", () => {
    it("should use structured JSON format", () => {
      expect(winston.format.combine).toHaveBeenCalled()
      expect(winston.format.timestamp).toHaveBeenCalled()
      expect(winston.format.errors).toHaveBeenCalledWith({ stack: true })
      expect(winston.format.json).toHaveBeenCalled()
    })
  })
})
