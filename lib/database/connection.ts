import { Pool, type PoolClient, type QueryResult } from "pg"
import { logger } from "@/lib/utils/logger"
import { APP_CONFIG } from "@/lib/config/app-config"

class DatabaseConnection {
  private static instance: DatabaseConnection
  private pool: Pool
  private isConnected = false

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: APP_CONFIG.database.maxConnections,
      connectionTimeoutMillis: APP_CONFIG.database.connectionTimeout,
      query_timeout: APP_CONFIG.database.queryTimeout,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })

    this.pool.on("connect", () => {
      this.isConnected = true
      logger.info("Database client connected")
    })

    this.pool.on("error", (err) => {
      this.isConnected = false
      logger.error("Database connection error:", err)
    })
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now()
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()
      const result = await client.query(text, params)
      const duration = Date.now() - start

      logger.debug("Query executed", {
        query: text,
        duration,
        rows: result.rowCount || 0,
      })

      return result
    } catch (error) {
      logger.error("Database query error:", { query: text, error })
      throw error
    } finally {
      if (client) {
        client.release()
      }
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()
      await client.query("BEGIN")

      const result = await callback(client)

      await client.query("COMMIT")
      return result
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK")
      }
      logger.error("Transaction error:", error)
      throw error
    } finally {
      if (client) {
        client.release()
      }
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.query("SELECT 1")
      return true
    } catch (error) {
      logger.error("Database health check failed:", error)
      return false
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  public async close(): Promise<void> {
    await this.pool.end()
    logger.info("Database connection pool closed")
  }
}

export const db = DatabaseConnection.getInstance()
