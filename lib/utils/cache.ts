import { Redis } from "ioredis"
import { APP_CONFIG } from "@/lib/config/app-config"
import { logger } from "@/lib/utils/logger"

class CacheManager {
  private static instance: CacheManager
  private redis: Redis | null = null
  private memoryCache: Map<string, { value: any; expires: number }> = new Map()

  private constructor() {
    if (APP_CONFIG.cache.redis.url) {
      this.redis = new Redis(APP_CONFIG.cache.redis.url, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      this.redis.on("connect", () => {
        logger.info("Redis cache connected")
      })

      this.redis.on("error", (error) => {
        logger.error("Redis cache error:", error)
      })
    }

    // Clean up memory cache periodically
    setInterval(() => {
      this.cleanupMemoryCache()
    }, 60000) // Every minute
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
      if (memoryItem && memoryItem.expires > Date.now()) {
        return memoryItem.value
      }

      return null
    } catch (error) {
      logger.error("Cache get error:", error)
      return null
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      const cacheTtl = ttl || APP_CONFIG.cache.redis.ttl

      // Set in Redis
      if (this.redis) {
        await this.redis.setex(key, cacheTtl, serializedValue)
      }

      // Set in memory cache as fallback
      this.memoryCache.set(key, {
        value,
        expires: Date.now() + cacheTtl * 1000,
      })

      // Limit memory cache size
      if (this.memoryCache.size > APP_CONFIG.cache.memory.maxSize) {
        const firstKey = this.memoryCache.keys().next().value
        this.memoryCache.delete(firstKey)
      }
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

  private cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires <= now) {
        this.memoryCache.delete(key)
      }
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
}

export const cache = CacheManager.getInstance()

// Cache decorators
export function Cacheable(ttl?: number) {
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
      await cache.set(cacheKey, result, ttl)

      return result
    }
  }
}
