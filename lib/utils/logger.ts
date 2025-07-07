/**
 * Isomorphic logger used by all shared code.
 *
 * • In the browser it just writes to the DevTools console.
 * • On the server it emits one-line JSON for easy log aggregation.
 *
 * Nothing else is imported, so there are **no relative-path dependencies**
 * that can break module resolution.
 */

type Meta = Record<string, unknown> | undefined

export interface Logger {
  error(message: string, meta?: Meta): void
  warn(message: string, meta?: Meta): void
  info(message: string, meta?: Meta): void
  debug(message: string, meta?: Meta): void
  child(meta: Meta): Logger
}

function isBrowser() {
  return typeof window !== "undefined"
}

/* ---------- Browser implementation ---------- */
function createBrowserLogger(ctx: Meta = {}): Logger {
  /* eslint-disable no-console */
  const make = (level: keyof Console) => (msg: string, meta?: Meta) =>
    console[level](`[${level.toUpperCase()}] ${msg}`, { ...ctx, ...meta })

  const base: Logger = {
    error: make("error"),
    warn: make("warn"),
    info: make("info"),
    debug: make("debug"),
    child: (meta: Meta) => createBrowserLogger({ ...ctx, ...meta }),
  }
  /* eslint-enable no-console */
  return base
}

/* ---------- Server implementation ---------- */
function createServerLogger(ctx: Meta = {}): Logger {
  const output = (level: string, message: string, meta?: Meta) => {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...ctx,
        ...meta,
      }),
    )
  }

  const make = (level: string) => (msg: string, meta?: Meta) => output(level, msg, meta)

  const base: Logger = {
    error: make("error"),
    warn: make("warn"),
    info: make("info"),
    debug: make("debug"),
    child: (meta: Meta) => createServerLogger({ ...ctx, ...meta }),
  }
  return base
}

/* ---------- Choose implementation ---------- */
export const logger: Logger = isBrowser()
  ? createBrowserLogger({
      service: "Healthcare Insurance Portal",
      environment: process.env.NODE_ENV ?? "development",
    })
  : createServerLogger({
      service: "Healthcare Insurance Portal",
      environment: process.env.NODE_ENV ?? "development",
    })

/* ---------- Named children for convenience ---------- */
export const loggers = {
  auth: logger.child({ module: "auth" }),
  api: logger.child({ module: "api" }),
  database: logger.child({ module: "database" }),
  security: logger.child({ module: "security" }),
  business: logger.child({ module: "business" }),
  performance: logger.child({ module: "performance" }),
}

/* ---------- Helper wrappers ---------- */
export function logPerformance(operation: string, duration: number, meta?: Meta) {
  loggers.performance.info(`Performance ${operation} – ${duration} ms`, meta)
}

export function logSecurityEvent(event: string, userId?: string, meta?: Meta) {
  loggers.security.warn("Security event", { event, userId, ...meta })
}

export function logAuditEvent(action: string, userId: string, resourceType: string, resourceId: string, meta?: Meta) {
  logger.info("Audit event", { action, userId, resourceType, resourceId, ...meta })
}
