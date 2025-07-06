import { cache } from "@/lib/utils/cache"
import { APP_CONFIG } from "@/lib/config/app-config"
import { logger } from "@/lib/utils/logger"

export interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  keyGenerator?: (identifier: string) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export class RateLimiter {
  private options: Required<RateLimitOptions>

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      windowMs: options.windowMs || APP_CONFIG.rateLimit.windowMs,
      maxRequests: options.maxRequests || APP_CONFIG.rateLimit.maxRequests,
      keyGenerator: options.keyGenerator || ((id: string) => `rate_limit:${id}`),
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
    }
  }

  public async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.options.keyGenerator(identifier)
    const now = Date.now()
    const windowStart = now - this.options.windowMs

    try {
      // Get current window data
      const windowData = await cache.get<{
        requests: Array<{ timestamp: number; success?: boolean }>
        resetTime: number
      }>(key)

      let requests = windowData?.requests || []
      let resetTime = windowData?.resetTime || now + this.options.windowMs

      // Remove expired requests
      requests = requests.filter((req) => req.timestamp > windowStart)

      // Check if we're in a new window
      if (now >= resetTime) {
        requests = []
        resetTime = now + this.options.windowMs
      }

      const totalHits = requests.length
      const remaining = Math.max(0, this.options.maxRequests - totalHits)
      const allowed = totalHits < this.options.maxRequests

      // Update cache with new request
      if (allowed) {
        requests.push({ timestamp: now })
        await cache.set(key, { requests, resetTime }, Math.ceil(this.options.windowMs / 1000))
      }

      return {
        allowed,
        remaining,
        resetTime,
        totalHits,
      }
    } catch (error) {
      logger.error("Rate limiter error:", error)
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: this.options.maxRequests,
        resetTime: now + this.options.windowMs,
        totalHits: 0,
      }
    }
  }

  public async recordRequest(identifier: string, success = true): Promise<void> {
    if ((success && this.options.skipSuccessfulRequests) || (!success && this.options.skipFailedRequests)) {
      return
    }

    const key = this.options.keyGenerator(identifier)
    const now = Date.now()

    try {
      const windowData = await cache.get<{
        requests: Array<{ timestamp: number; success?: boolean }>
        resetTime: number
      }>(key)

      const requests = windowData?.requests || []
      const resetTime = windowData?.resetTime || now + this.options.windowMs

      requests.push({ timestamp: now, success })

      await cache.set(key, { requests, resetTime }, Math.ceil(this.options.windowMs / 1000))
    } catch (error) {
      logger.error("Rate limiter record error:", error)
    }
  }

  public async resetLimit(identifier: string): Promise<void> {
    const key = this.options.keyGenerator(identifier)
    await cache.delete(key)
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiter
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),

  // Authentication rate limiter
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true,
  }),

  // Password reset rate limiter
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  }),

  // File upload rate limiter
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  }),

  // Search rate limiter
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  }),
}
