// Server-side logger with structured JSON output
export interface Logger {
  info(message: string, meta?: any): void
  error(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  debug(message: string, meta?: any): void
  child(meta: any): Logger
}

class ServerLogger implements Logger {
  private context: any = {}

  constructor(context: any = {}) {
    this.context = context
  }

  private formatLog(level: string, message: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta,
    }
    console.log(JSON.stringify(logEntry))
  }

  info(message: string, meta?: any): void {
    this.formatLog("info", message, meta)
  }

  error(message: string, meta?: any): void {
    this.formatLog("error", message, meta)
  }

  warn(message: string, meta?: any): void {
    this.formatLog("warn", message, meta)
  }

  debug(message: string, meta?: any): void {
    this.formatLog("debug", message, meta)
  }

  child(meta: any): Logger {
    return new ServerLogger({ ...this.context, ...meta })
  }
}

export const logger = new ServerLogger({
  service: "Healthcare Insurance Portal",
  version: "2.0.0",
  environment: process.env.NODE_ENV || "development",
})

export const loggers = {
  auth: logger.child({ module: "auth" }),
  api: logger.child({ module: "api" }),
  database: logger.child({ module: "database" }),
  security: logger.child({ module: "security" }),
  business: logger.child({ module: "business" }),
  performance: logger.child({ module: "performance" }),
}

export function logPerformance(operation: string, duration: number, meta?: any): void {
  loggers.performance.info("Performance metric", {
    operation,
    duration,
    ...meta,
  })
}

export function logSecurityEvent(event: string, userId?: string, meta?: any): void {
  loggers.security.warn("Security event", {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...meta,
  })
}

export function logAuditEvent(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  meta?: any,
): void {
  logger.info("Audit event", {
    action,
    userId,
    resourceType,
    resourceId,
    timestamp: new Date().toISOString(),
    ...meta,
  })
}
