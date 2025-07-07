// Browser-safe logger implementation
export interface Logger {
  info(message: string, meta?: any): void
  error(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  debug(message: string, meta?: any): void
  child(meta: any): Logger
}

class ClientLogger implements Logger {
  private context: any = {}

  constructor(context: any = {}) {
    this.context = context
  }

  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, { ...this.context, ...meta })
  }

  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, { ...this.context, ...meta })
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, { ...this.context, ...meta })
  }

  debug(message: string, meta?: any): void {
    console.debug(`[DEBUG] ${message}`, { ...this.context, ...meta })
  }

  child(meta: any): Logger {
    return new ClientLogger({ ...this.context, ...meta })
  }
}

export const logger = new ClientLogger({
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
