import { Pool, type PoolClient } from "pg"
import { APP_CONFIG } from "@/lib/config/app-config"
import { logger } from "@/lib/utils/logger"

class DatabaseConnection {
  private static instance: DatabaseConnection
  private pool: Pool
  private isConnected = false

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: APP_CONFIG.database.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: APP_CONFIG.database.connectionTimeout,
      statement_timeout: APP_CONFIG.database.queryTimeout,
      ssl: APP_CONFIG.isProduction ? { rejectUnauthorized: false } : false,
    })

    this.pool.on("connect", () => {
      logger.info("Database connection established")
      this.isConnected = true
    })

    this.pool.on("error", (err) => {
      logger.error("Database connection error:", err)
      this.isConnected = false
    })
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect()
      return client
    } catch (error) {
      logger.error("Failed to get database client:", error)
      throw new Error("Database connection failed")
    }
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient()
    try {
      const start = Date.now()
      const result = await client.query(text, params)
      const duration = Date.now() - start

      logger.debug("Query executed", {
        query: text,
        duration,
        rows: result.rowCount,
      })

      return result
    } catch (error) {
      logger.error("Database query error:", error)
      throw error
    } finally {
      client.release()
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      logger.error("Transaction error:", error)
      throw error
    } finally {
      client.release()
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
    this.isConnected = false
    logger.info("Database connection pool closed")
  }
}

export const db = DatabaseConnection.getInstance()
