import Redis from "ioredis"
import { logger } from "@/lib/utils/logger"

interface CacheItem {
  value: any
  expires: number
}

class CacheManager {
  private static instance: CacheManager
  private redis: Redis | null = null
  private memoryCache = new Map<string, CacheItem>()
  private readonly maxMemoryItems = 100

  private constructor() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL)
        this.redis.on("error", (error) => {
          logger.error("Redis connection error:", error)
          this.redis = null
        })
      }
    } catch (error) {
      logger.error("Failed to initialize Redis:", error)
    }

    // Cleanup expired memory cache items every 5 minutes
    setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000)
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key)
        if (value) {
          return JSON.parse(value)
        }
      }

      // Fallback to memory cache
      const memoryItem = this.memoryCache.get(key)
      if (memoryItem) {
        if (memoryItem.expires > Date.now()) {
          return memoryItem.value
        } else {
          this.memoryCache.delete(key)
        }
      }

      return null
    } catch (error) {
      logger.error("Cache get error:", error)
      return null
    }
  }

  public async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)

      // Set in Redis
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, serializedValue)
      }

      // Set in memory cache
      this.setMemoryCache(key, value, ttlSeconds)
    } catch (error) {
      logger.error("Cache set error:", error)
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key)
      }
      this.memoryCache.delete(key)
    } catch (error) {
      logger.error("Cache delete error:", error)
    }
  }

  public async clear(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.flushall()
      }
      this.memoryCache.clear()
    } catch (error) {
      logger.error("Cache clear error:", error)
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.ping()
      }
      return true
    } catch (error) {
      logger.error("Cache health check failed:", error)
      return false
    }
  }

  private setMemoryCache(key: string, value: any, ttlSeconds: number): void {
    // Limit memory cache size
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }

    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  private cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires <= now) {
        this.memoryCache.delete(key)
      }
    }
  }
}

export const cache = CacheManager.getInstance()

// Decorator for caching method results
export function Cacheable(ttlSeconds = 3600) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache
      const cachedResult = await cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      await cache.set(cacheKey, result, ttlSeconds)

      return result
    }
  }
}
