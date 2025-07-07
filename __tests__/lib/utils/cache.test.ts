import { cache, Cacheable } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"
import jest from "jest" // Declare the jest variable

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  flushall: jest.fn(),
  ping: jest.fn(),
  on: jest.fn(),
}

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => mockRedis)
})

// Mock logger
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe("CacheManager", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear memory cache
    cache["memoryCache"].clear()
  })

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = cache
      const instance2 = cache
      expect(instance1).toBe(instance2)
    })
  })

  describe("Get Method", () => {
    it("should get value from Redis when available", async () => {
      const testValue = { data: "test" }
      mockRedis.get.mockResolvedValue(JSON.stringify(testValue))

      const result = await cache.get("test-key")

      expect(mockRedis.get).toHaveBeenCalledWith("test-key")
      expect(result).toEqual(testValue)
    })

    it("should fallback to memory cache when Redis fails", async () => {
      mockRedis.get.mockResolvedValue(null)

      // Set value in memory cache
      const testValue = { data: "test" }
      cache["memoryCache"].set("test-key", {
        value: testValue,
        expires: Date.now() + 60000,
      })

      const result = await cache.get("test-key")

      expect(result).toEqual(testValue)
    })

    it("should return null for expired memory cache items", async () => {
      mockRedis.get.mockResolvedValue(null)

      // Set expired value in memory cache
      cache["memoryCache"].set("test-key", {
        value: { data: "test" },
        expires: Date.now() - 1000, // Expired
      })

      const result = await cache.get("test-key")

      expect(result).toBeNull()
    })

    it("should handle Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis error"))

      const result = await cache.get("test-key")

      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalledWith("Cache get error:", expect.any(Error))
    })
  })

  describe("Set Method", () => {
    it("should set value in both Redis and memory cache", async () => {
      const testValue = { data: "test" }
      mockRedis.setex.mockResolvedValue("OK")

      await cache.set("test-key", testValue, 3600)

      expect(mockRedis.setex).toHaveBeenCalledWith("test-key", 3600, JSON.stringify(testValue))

      const memoryItem = cache["memoryCache"].get("test-key")
      expect(memoryItem?.value).toEqual(testValue)
      expect(memoryItem?.expires).toBeGreaterThan(Date.now())
    })

    it("should limit memory cache size", async () => {
      // Fill memory cache to limit
      for (let i = 0; i < 101; i++) {
        await cache.set(`key-${i}`, { data: i })
      }

      // Should not exceed max size
      expect(cache["memoryCache"].size).toBeLessThanOrEqual(100)
    })

    it("should handle Redis set errors gracefully", async () => {
      mockRedis.setex.mockRejectedValue(new Error("Redis error"))

      await cache.set("test-key", { data: "test" })

      expect(logger.error).toHaveBeenCalledWith("Cache set error:", expect.any(Error))
    })
  })

  describe("Delete Method", () => {
    it("should delete from both Redis and memory cache", async () => {
      mockRedis.del.mockResolvedValue(1)
      cache["memoryCache"].set("test-key", { value: "test", expires: Date.now() + 60000 })

      await cache.delete("test-key")

      expect(mockRedis.del).toHaveBeenCalledWith("test-key")
      expect(cache["memoryCache"].has("test-key")).toBe(false)
    })

    it("should handle Redis delete errors gracefully", async () => {
      mockRedis.del.mockRejectedValue(new Error("Redis error"))

      await cache.delete("test-key")

      expect(logger.error).toHaveBeenCalledWith("Cache delete error:", expect.any(Error))
    })
  })

  describe("Clear Method", () => {
    it("should clear both Redis and memory cache", async () => {
      mockRedis.flushall.mockResolvedValue("OK")
      cache["memoryCache"].set("test-key", { value: "test", expires: Date.now() + 60000 })

      await cache.clear()

      expect(mockRedis.flushall).toHaveBeenCalled()
      expect(cache["memoryCache"].size).toBe(0)
    })
  })

  describe("Health Check", () => {
    it("should return true when Redis is healthy", async () => {
      mockRedis.ping.mockResolvedValue("PONG")

      const isHealthy = await cache.healthCheck()

      expect(isHealthy).toBe(true)
      expect(mockRedis.ping).toHaveBeenCalled()
    })

    it("should return false when Redis is unhealthy", async () => {
      mockRedis.ping.mockRejectedValue(new Error("Redis down"))

      const isHealthy = await cache.healthCheck()

      expect(isHealthy).toBe(false)
      expect(logger.error).toHaveBeenCalledWith("Cache health check failed:", expect.any(Error))
    })
  })

  describe("Memory Cache Cleanup", () => {
    it("should clean up expired items", () => {
      // Add expired item
      cache["memoryCache"].set("expired-key", {
        value: "test",
        expires: Date.now() - 1000,
      })

      // Add valid item
      cache["memoryCache"].set("valid-key", {
        value: "test",
        expires: Date.now() + 60000,
      })

      // Trigger cleanup
      cache["cleanupMemoryCache"]()

      expect(cache["memoryCache"].has("expired-key")).toBe(false)
      expect(cache["memoryCache"].has("valid-key")).toBe(true)
    })
  })
})

describe("Cacheable Decorator", () => {
  class TestService {
    callCount = 0

    @Cacheable(60)
    async getData(id: string): Promise<{ id: string; data: string }> {
      this.callCount++
      return { id, data: `data-${id}` }
    }

    @Cacheable()
    async getDataWithDefaultTTL(id: string): Promise<{ id: string; data: string }> {
      this.callCount++
      return { id, data: `data-${id}` }
    }
  }

  let service: TestService

  beforeEach(() => {
    service = new TestService()
    jest.clearAllMocks()
  })

  it("should cache method results", async () => {
    mockRedis.get.mockResolvedValue(null)
    mockRedis.setex.mockResolvedValue("OK")

    const result1 = await service.getData("123")
    const result2 = await service.getData("123")

    expect(result1).toEqual({ id: "123", data: "data-123" })
    expect(result2).toEqual({ id: "123", data: "data-123" })
    expect(service.callCount).toBe(1) // Method called only once
  })

  it("should return cached result on subsequent calls", async () => {
    const cachedResult = { id: "123", data: "data-123" }
    mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult))

    const result = await service.getData("123")

    expect(result).toEqual(cachedResult)
    expect(service.callCount).toBe(0) // Method not called
  })

  it("should use default TTL when not specified", async () => {
    mockRedis.get.mockResolvedValue(null)
    mockRedis.setex.mockResolvedValue("OK")

    await service.getDataWithDefaultTTL("123")

    expect(mockRedis.setex).toHaveBeenCalledWith(
      expect.any(String),
      3600, // Default TTL
      expect.any(String),
    )
  })

  it("should generate unique cache keys for different arguments", async () => {
    mockRedis.get.mockResolvedValue(null)
    mockRedis.setex.mockResolvedValue("OK")

    await service.getData("123")
    await service.getData("456")

    expect(service.callCount).toBe(2) // Different arguments, different cache keys
  })
})
