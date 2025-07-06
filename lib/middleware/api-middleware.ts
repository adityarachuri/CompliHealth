import { type NextRequest, NextResponse } from "next/server"
import { rateLimiters } from "@/lib/security/rate-limiter"
import { EncryptionService } from "@/lib/security/encryption"
import { auditService } from "@/lib/services/audit-service"
import { logger } from "@/lib/utils/logger"
import { APP_CONFIG } from "@/lib/config/app-config"

export interface ApiContext {
  user?: any
  requestId: string
  startTime: number
  ipAddress: string
  userAgent: string
}

// Request ID middleware
export function requestIdMiddleware() {
  return (req: NextRequest) => {
    const requestId = req.headers.get("x-request-id") || EncryptionService.generateSecureToken(16)
    req.headers.set("x-request-id", requestId)
    return requestId
  }
}

// Rate limiting middleware
export function rateLimitMiddleware(limiterName: keyof typeof rateLimiters = "api") {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const identifier = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const limiter = rateLimiters[limiterName]

    const result = await limiter.checkLimit(identifier)

    if (!result.allowed) {
      logger.warn("Rate limit exceeded", {
        identifier,
        limiter: limiterName,
        totalHits: result.totalHits,
      })

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimiters[limiterName]["options"].maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetTime.toString(),
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    return null // Continue to next middleware
  }
}

// Authentication middleware
export function authMiddleware() {
  return async (req: NextRequest): Promise<{ user: any } | NextResponse> => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required", message: "No token provided" }, { status: 401 })
    }

    try {
      const user = EncryptionService.verifyToken(token)
      return { user }
    } catch (error) {
      logger.warn("Invalid token", { token: token.substring(0, 10) + "..." })

      return NextResponse.json({ error: "Invalid token", message: "Authentication failed" }, { status: 401 })
    }
  }
}

// Authorization middleware
export function authorizationMiddleware(requiredRoles: string[]) {
  return (user: any): NextResponse | null => {
    if (!user || !user.role) {
      return NextResponse.json({ error: "Forbidden", message: "No role assigned" }, { status: 403 })
    }

    if (!requiredRoles.includes(user.role)) {
      logger.warn("Insufficient permissions", {
        userId: user.id,
        userRole: user.role,
        requiredRoles,
      })

      return NextResponse.json({ error: "Forbidden", message: "Insufficient permissions" }, { status: 403 })
    }

    return null // User is authorized
  }
}

// Request validation middleware
export function validationMiddleware(schema: any) {
  return async (req: NextRequest): Promise<{ data: any } | NextResponse> => {
    try {
      const body = await req.json()
      const validatedData = schema.parse(body)
      return { data: validatedData }
    } catch (error: any) {
      logger.warn("Request validation failed", { error: error.message })

      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid request data",
          details: error.errors || [error.message],
        },
        { status: 400 },
      )
    }
  }
}

// Audit logging middleware
export function auditMiddleware(action: string, resourceType: string) {
  return async (req: NextRequest, user: any, resourceId?: string): Promise<void> => {
    const ipAddress = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    await auditService.logEvent({
      userId: user?.id || "anonymous",
      userEmail: user?.email,
      action,
      resourceType,
      resourceId: resourceId || "unknown",
      ipAddress,
      userAgent,
    })
  }
}

// Error handling middleware
export function errorHandlerMiddleware() {
  return (error: Error, req: NextRequest, context: ApiContext): NextResponse => {
    const requestId = context.requestId
    const duration = Date.now() - context.startTime

    logger.error("API error", {
      error: error.message,
      stack: error.stack,
      requestId,
      duration,
      path: req.nextUrl.pathname,
      method: req.method,
      userId: context.user?.id,
    })

    // Don't expose internal errors in production
    const message = APP_CONFIG.isDevelopment ? error.message : "An internal error occurred"

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message,
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// CORS middleware
export function corsMiddleware() {
  return (req: NextRequest): NextResponse => {
    const response = NextResponse.next()

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
    response.headers.set("Access-Control-Max-Age", "86400")

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }

    return response
  }
}

// Security headers middleware
export function securityHeadersMiddleware() {
  return (response: NextResponse): NextResponse => {
    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

    if (APP_CONFIG.isProduction) {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }

    return response
  }
}

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: NextRequest, context: ApiContext): void => {
    const duration = Date.now() - context.startTime

    logger.info("API request completed", {
      method: req.method,
      path: req.nextUrl.pathname,
      duration,
      requestId: context.requestId,
      userId: context.user?.id,
    })

    // Track slow requests
    if (duration > 5000) {
      // 5 seconds
      logger.warn("Slow API request", {
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
        requestId: context.requestId,
      })
    }
  }
}

// Middleware composer utility
export function composeMiddleware(...middlewares: Array<(req: NextRequest, context?: any) => Promise<any> | any>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const context: ApiContext = {
      requestId: EncryptionService.generateSecureToken(16),
      startTime: Date.now(),
      ipAddress: req.ip || req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    }

    try {
      let result: any = null

      for (const middleware of middlewares) {
        result = await middleware(req, context)

        // If middleware returns a NextResponse, return it immediately
        if (result instanceof NextResponse) {
          return result
        }

        // If middleware returns data, add it to context
        if (result && typeof result === "object") {
          Object.assign(context, result)
        }
      }

      // If we get here, all middleware passed
      return NextResponse.json({ success: true })
    } catch (error) {
      return errorHandlerMiddleware()(error as Error, req, context)
    } finally {
      performanceMiddleware()(req, context)
    }
  }
}
