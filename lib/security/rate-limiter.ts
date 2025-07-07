import { cache } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (identifier: string) => string
}

interface RateLimitInfo {
  count: number
  resetTime: number
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (id) => `rate_limit:${id}`,
      ...config,
    }
  }

  public async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator!(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Get current rate limit info
      const rateLimitInfo = await cache.get<RateLimitInfo>(key)

      if (!rateLimitInfo || rateLimitInfo.resetTime <= now) {
        // First request or window expired
        const newInfo: RateLimitInfo = {
          count: 1,
          resetTime: now + this.config.windowMs,
        }

        await cache.set(key, newInfo, Math.ceil(this.config.windowMs / 1000))

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: newInfo.resetTime,
        }
      }

      if (rateLimitInfo.count >= this.config.maxRequests) {
        // Rate limit exceeded
        logger.warn("Rate limit exceeded", {
          identifier,
          count: rateLimitInfo.count,
          maxRequests: this.config.maxRequests,
        })

        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitInfo.resetTime,
        }
      }

      // Increment counter
      const updatedInfo: RateLimitInfo = {
        count: rateLimitInfo.count + 1,
        resetTime: rateLimitInfo.resetTime,
      }

      await cache.set(key, updatedInfo, Math.ceil((rateLimitInfo.resetTime - now) / 1000))

      return {
        allowed: true,
        remaining: this.config.maxRequests - updatedInfo.count,
        resetTime: updatedInfo.resetTime,
      }
    } catch (error) {
      logger.error("Rate limiter error:", error)
      // Allow request on error to avoid blocking legitimate users
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }
  }

  public async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator!(identifier)
    await cache.delete(key)
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
})
