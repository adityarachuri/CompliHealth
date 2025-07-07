import { db } from "@/lib/database/connection"
import { logger } from "@/lib/utils/logger"
import jest from "jest" // Declare the jest variable

// Mock the logger
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock pg Pool
const mockQuery = jest.fn()
const mockConnect = jest.fn()
const mockEnd = jest.fn()
const mockOn = jest.fn()

jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    connect: mockConnect,
    end: mockEnd,
    on: mockOn,
  })),
}))

describe("DatabaseConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = db
      const instance2 = db
      expect(instance1).toBe(instance2)
    })
  })

  describe("Query Method", () => {
    it("should execute query successfully", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }),
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      const result = await db.query("SELECT * FROM users WHERE id = $1", [1])

      expect(mockConnect).toHaveBeenCalled()
      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users WHERE id = $1", [1])
      expect(mockClient.release).toHaveBeenCalled()
      expect(result.rows).toEqual([{ id: 1 }])
    })

    it("should handle query errors", async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error("Query failed")),
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      await expect(db.query("INVALID SQL")).rejects.toThrow("Query failed")
      expect(mockClient.release).toHaveBeenCalled()
    })

    it("should log query performance", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      await db.query("SELECT 1")

      expect(logger.debug).toHaveBeenCalledWith(
        "Query executed",
        expect.objectContaining({
          query: "SELECT 1",
          duration: expect.any(Number),
          rows: 0,
        }),
      )
    })
  })

  describe("Transaction Method", () => {
    it("should execute transaction successfully", async () => {
      const mockClient = {
        query: jest
          .fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Callback query
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      const callback = jest.fn().mockResolvedValue({ id: 1 })
      const result = await db.transaction(callback)

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN")
      expect(callback).toHaveBeenCalledWith(mockClient)
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT")
      expect(result).toEqual({ id: 1 })
    })

    it("should rollback on error", async () => {
      const mockClient = {
        query: jest
          .fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}), // ROLLBACK
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      const callback = jest.fn().mockRejectedValue(new Error("Transaction failed"))

      await expect(db.transaction(callback)).rejects.toThrow("Transaction failed")
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN")
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK")
    })
  })

  describe("Health Check", () => {
    it("should return true for successful health check", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
        release: jest.fn(),
      }
      mockConnect.mockResolvedValue(mockClient)

      const isHealthy = await db.healthCheck()

      expect(isHealthy).toBe(true)
      expect(mockClient.query).toHaveBeenCalledWith("SELECT 1", undefined)
    })

    it("should return false for failed health check", async () => {
      mockConnect.mockRejectedValue(new Error("Connection failed"))

      const isHealthy = await db.healthCheck()

      expect(isHealthy).toBe(false)
      expect(logger.error).toHaveBeenCalledWith("Database health check failed:", expect.any(Error))
    })
  })

  describe("Connection Status", () => {
    it("should track connection status", () => {
      // Initially false
      expect(db.getConnectionStatus()).toBe(false)

      // Simulate connection event
      const connectHandler = mockOn.mock.calls.find((call) => call[0] === "connect")?.[1]
      if (connectHandler) {
        connectHandler()
      }

      expect(db.getConnectionStatus()).toBe(true)
    })
  })

  describe("Close Connection", () => {
    it("should close connection pool", async () => {
      await db.close()

      expect(mockEnd).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith("Database connection pool closed")
    })
  })

  describe("Error Handling", () => {
    it("should handle connection errors", async () => {
      mockConnect.mockRejectedValue(new Error("Connection failed"))

      await expect(db.query("SELECT 1")).rejects.toThrow("Database connection failed")
      expect(logger.error).toHaveBeenCalledWith("Failed to get database client:", expect.any(Error))
    })
  })
})
