import winston from "winston"
import { APP_CONFIG } from "@/lib/config/app-config"

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    })
  }),
)

// Create logger instance
export const logger = winston.createLogger({
  level: APP_CONFIG.monitoring.logLevel,
  format: logFormat,
  defaultMeta: {
    service: APP_CONFIG.name,
    version: APP_CONFIG.version,
    environment: APP_CONFIG.environment,
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

// Add file transport for production
if (APP_CONFIG.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )
}

// Structured logging helpers
export const loggers = {
  auth: logger.child({ module: "auth" }),
  api: logger.child({ module: "api" }),
  database: logger.child({ module: "database" }),
  security: logger.child({ module: "security" }),
  business: logger.child({ module: "business" }),
  performance: logger.child({ module: "performance" }),
}

// Performance monitoring
export function logPerformance(operation: string, duration: number, metadata?: any) {
  loggers.performance.info("Performance metric", {
    operation,
    duration,
    ...metadata,
  })
}

// Security event logging
export function logSecurityEvent(event: string, userId?: string, metadata?: any) {
  loggers.security.warn("Security event", {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}

// Audit logging
export function logAuditEvent(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  metadata?: any,
) {
  logger.info("Audit event", {
    action,
    userId,
    resourceType,
    resourceId,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}
