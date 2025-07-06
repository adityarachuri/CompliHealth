import { db } from "@/lib/database/connection"
import { logger } from "@/lib/utils/logger"
import { APP_CONFIG } from "@/lib/config/app-config"

export interface AuditEvent {
  id?: string
  userId: string
  userEmail?: string
  action: string
  resourceType: string
  resourceId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  timestamp?: Date
  metadata?: any
}

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PERMISSION_CHANGE = "PERMISSION_CHANGE",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
}

export enum ResourceType {
  USER = "USER",
  POLICY = "POLICY",
  CLAIM = "CLAIM",
  PROVIDER = "PROVIDER",
  PAYMENT = "PAYMENT",
  DOCUMENT = "DOCUMENT",
  REPORT = "REPORT",
  SYSTEM = "SYSTEM",
}

class AuditService {
  private static instance: AuditService
  private batchSize = 100
  private batchTimeout = 5000
  private eventBatch: AuditEvent[] = []
  private batchTimer: NodeJS.Timeout | null = null

  private constructor() {
    if (APP_CONFIG.features.enableAuditLog) {
      this.startBatchProcessor()
    }
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  public async logEvent(event: AuditEvent): Promise<void> {
    if (!APP_CONFIG.features.enableAuditLog) {
      return
    }

    try {
      // Enrich event with additional metadata
      const enrichedEvent: AuditEvent = {
        ...event,
        id: event.id || this.generateEventId(),
        timestamp: event.timestamp || new Date(),
        metadata: {
          ...event.metadata,
          environment: APP_CONFIG.environment,
          version: APP_CONFIG.version,
        },
      }

      // Add to batch for processing
      this.eventBatch.push(enrichedEvent)

      // Process batch if it reaches the size limit
      if (this.eventBatch.length >= this.batchSize) {
        await this.processBatch()
      }

      // Log critical events immediately
      if (this.isCriticalEvent(event.action)) {
        await this.processBatch()
      }

      logger.info("Audit event logged", {
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
      })
    } catch (error) {
      logger.error("Failed to log audit event:", error)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.eventBatch.length === 0) {
      return
    }

    const batch = [...this.eventBatch]
    this.eventBatch = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      await this.saveBatchToDatabase(batch)
    } catch (error) {
      logger.error("Failed to process audit batch:", error)
      // Re-add failed events to batch for retry
      this.eventBatch.unshift(...batch)
    }
  }

  private async saveBatchToDatabase(events: AuditEvent[]): Promise<void> {
    const query = `
      INSERT INTO audit_logs (
        id, user_id, user_email, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, session_id,
        timestamp, metadata
      ) VALUES ${events.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(", ")}
    `

    const values = events.flatMap((event) => [
      event.id,
      event.userId,
      event.userEmail,
      event.action,
      event.resourceType,
      event.resourceId,
      event.oldValues ? JSON.stringify(event.oldValues) : null,
      event.newValues ? JSON.stringify(event.newValues) : null,
      event.ipAddress,
      event.userAgent,
      event.sessionId,
      event.timestamp,
      event.metadata ? JSON.stringify(event.metadata) : null,
    ])

    await db.query(query, values)
  }

  private startBatchProcessor(): void {
    // Process batch periodically
    setInterval(async () => {
      if (this.eventBatch.length > 0) {
        await this.processBatch()
      }
    }, this.batchTimeout)
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isCriticalEvent(action: string): boolean {
    const criticalActions = [
      AuditAction.LOGIN_FAILED,
      AuditAction.PERMISSION_CHANGE,
      AuditAction.DELETE,
      AuditAction.EXPORT,
    ]
    return criticalActions.includes(action as AuditAction)
  }

  // Query methods for audit reports
  public async getAuditEvents(filters: {
    userId?: string
    action?: string
    resourceType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<{ events: AuditEvent[]; total: number }> {
    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (filters.userId) {
      whereClause += ` AND user_id = $${paramIndex++}`
      params.push(filters.userId)
    }

    if (filters.action) {
      whereClause += ` AND action = $${paramIndex++}`
      params.push(filters.action)
    }

    if (filters.resourceType) {
      whereClause += ` AND resource_type = $${paramIndex++}`
      params.push(filters.resourceType)
    }

    if (filters.startDate) {
      whereClause += ` AND timestamp >= $${paramIndex++}`
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      whereClause += ` AND timestamp <= $${paramIndex++}`
      params.push(filters.endDate)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`
    const countResult = await db.query(countQuery, params)
    const total = Number.parseInt(countResult.rows[0].count)

    // Get events with pagination
    const eventsQuery = `
      SELECT * FROM audit_logs ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `
    params.push(filters.limit || 50, filters.offset || 0)

    const eventsResult = await db.query(eventsQuery, params)
    const events = eventsResult.rows.map(this.mapRowToAuditEvent)

    return { events, total }
  }

  public async getUserActivity(userId: string, days = 30): Promise<AuditEvent[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const query = `
      SELECT * FROM audit_logs
      WHERE user_id = $1 AND timestamp >= $2
      ORDER BY timestamp DESC
      LIMIT 100
    `

    const result = await db.query(query, [userId, startDate])
    return result.rows.map(this.mapRowToAuditEvent)
  }

  public async getSecurityEvents(days = 7): Promise<AuditEvent[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const query = `
      SELECT * FROM audit_logs
      WHERE action IN ('LOGIN_FAILED', 'PERMISSION_CHANGE', 'PASSWORD_CHANGE')
        AND timestamp >= $1
      ORDER BY timestamp DESC
    `

    const result = await db.query(query, [startDate])
    return result.rows.map(this.mapRowToAuditEvent)
  }

  private mapRowToAuditEvent(row: any): AuditEvent {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      oldValues: row.old_values ? JSON.parse(row.old_values) : null,
      newValues: row.new_values ? JSON.parse(row.new_values) : null,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }
  }

  // Convenience methods for common audit events
  public async logUserLogin(userId: string, userEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action: AuditAction.LOGIN,
      resourceType: ResourceType.USER,
      resourceId: userId,
      ipAddress,
      userAgent,
    })
  }

  public async logUserLogout(userId: string, userEmail: string): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action: AuditAction.LOGOUT,
      resourceType: ResourceType.USER,
      resourceId: userId,
    })
  }

  public async logFailedLogin(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId: "anonymous",
      userEmail: email,
      action: AuditAction.LOGIN_FAILED,
      resourceType: ResourceType.USER,
      resourceId: email,
      ipAddress,
      userAgent,
    })
  }

  public async logDataChange(
    userId: string,
    userEmail: string,
    action: AuditAction,
    resourceType: ResourceType,
    resourceId: string,
    oldValues?: any,
    newValues?: any,
  ): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
    })
  }
}

export const auditService = AuditService.getInstance()

// Decorator for automatic audit logging
export function Auditable(resourceType: ResourceType, action: AuditAction) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)

      // Extract audit information from context or arguments
      const auditContext = this.auditContext || {}

      await auditService.logEvent({
        userId: auditContext.userId || "system",
        userEmail: auditContext.userEmail,
        action,
        resourceType,
        resourceId: auditContext.resourceId || args[0]?.id || "unknown",
        oldValues: auditContext.oldValues,
        newValues: result,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      })

      return result
    }
  }
}
