import { db } from "@/lib/database/connection"
import { Cacheable } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"
import { auditService, AuditAction, ResourceType } from "@/lib/services/audit-service"
import {
  notificationService,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from "@/lib/services/notification-service"

export interface Claim {
  id: string
  claimNumber: string
  userId: string
  policyId: string
  providerId: string
  diagnosis: string
  treatmentDetails: string
  claimAmount: number
  approvedAmount?: number
  status: ClaimStatus
  priority: ClaimPriority
  serviceDate: Date
  submittedDate: Date
  processedDate?: Date
  rejectionReason?: string
  processorNotes?: string
  attachments: string[]
  emergencyService: boolean
  preAuthorization?: string
  createdAt: Date
  updatedAt: Date
}

export enum ClaimStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  PENDING_INFO = "pending_info",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum ClaimPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface ClaimSubmissionData {
  userId: string
  policyId: string
  providerId: string
  diagnosis: string
  treatmentDetails: string
  claimAmount: number
  serviceDate: Date
  attachments?: string[]
  emergencyService?: boolean
  preAuthorization?: string
}

export interface ClaimProcessingData {
  claimId: string
  status: ClaimStatus
  approvedAmount?: number
  rejectionReason?: string
  processorNotes?: string
  processorId: string
}

export interface ClaimSearchFilters {
  userId?: string
  status?: ClaimStatus
  priority?: ClaimPriority
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
  providerId?: string
  policyId?: string
}

class ClaimService {
  private static instance: ClaimService

  private constructor() {}

  public static getInstance(): ClaimService {
    if (!ClaimService.instance) {
      ClaimService.instance = new ClaimService()
    }
    return ClaimService.instance
  }

  public async submitClaim(data: ClaimSubmissionData): Promise<Claim> {
    try {
      const claimNumber = this.generateClaimNumber()
      const priority = this.calculatePriority(data)

      const claim: Claim = {
        id: crypto.randomUUID(),
        claimNumber,
        userId: data.userId,
        policyId: data.policyId,
        providerId: data.providerId,
        diagnosis: data.diagnosis,
        treatmentDetails: data.treatmentDetails,
        claimAmount: data.claimAmount,
        status: ClaimStatus.SUBMITTED,
        priority,
        serviceDate: data.serviceDate,
        submittedDate: new Date(),
        attachments: data.attachments || [],
        emergencyService: data.emergencyService || false,
        preAuthorization: data.preAuthorization,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Save to database
      await this.saveClaim(claim)

      // Log audit event
      await auditService.logDataChange(
        data.userId,
        "", // userEmail would be fetched from user service
        AuditAction.CREATE,
        ResourceType.CLAIM,
        claim.id,
        null,
        claim,
      )

      // Send notification
      await notificationService.sendNotification({
        id: `claim_submitted_${claim.claimNumber}`,
        userId: data.userId,
        type: NotificationType.CLAIM_SUBMITTED,
        title: "Claim Submitted",
        message: `Your claim ${claim.claimNumber} has been submitted successfully.`,
        data: { claimNumber: claim.claimNumber, amount: claim.claimAmount },
        priority: NotificationPriority.MEDIUM,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      })

      // Trigger automated processing for eligible claims
      if (this.isEligibleForAutoProcessing(claim)) {
        await this.processClaimAutomatically(claim)
      }

      logger.info("Claim submitted successfully", {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        userId: data.userId,
        amount: data.claimAmount,
      })

      return claim
    } catch (error) {
      logger.error("Failed to submit claim:", error)
      throw new Error("Claim submission failed")
    }
  }

  public async processClaim(data: ClaimProcessingData): Promise<Claim> {
    try {
      const existingClaim = await this.getClaimById(data.claimId)
      if (!existingClaim) {
        throw new Error("Claim not found")
      }

      const updatedClaim: Claim = {
        ...existingClaim,
        status: data.status,
        approvedAmount: data.approvedAmount,
        rejectionReason: data.rejectionReason,
        processorNotes: data.processorNotes,
        processedDate: new Date(),
        updatedAt: new Date(),
      }

      // Save updated claim
      await this.saveClaim(updatedClaim)

      // Log audit event
      await auditService.logDataChange(
        data.processorId,
        "", // userEmail would be fetched
        AuditAction.UPDATE,
        ResourceType.CLAIM,
        data.claimId,
        existingClaim,
        updatedClaim,
      )

      // Send notification based on status
      const notificationType =
        data.status === ClaimStatus.APPROVED ? NotificationType.CLAIM_APPROVED : NotificationType.CLAIM_REJECTED

      await notificationService.sendNotification({
        id: `claim_${data.status}_${updatedClaim.claimNumber}`,
        userId: updatedClaim.userId,
        type: notificationType,
        title: `Claim ${data.status === ClaimStatus.APPROVED ? "Approved" : "Rejected"}`,
        message: `Your claim ${updatedClaim.claimNumber} has been ${data.status}.`,
        data: {
          claimNumber: updatedClaim.claimNumber,
          status: data.status,
          approvedAmount: data.approvedAmount,
          rejectionReason: data.rejectionReason,
        },
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
      })

      // Trigger payment processing for approved claims
      if (data.status === ClaimStatus.APPROVED && data.approvedAmount) {
        await this.initiatePayment(updatedClaim)
      }

      logger.info("Claim processed successfully", {
        claimId: data.claimId,
        status: data.status,
        processorId: data.processorId,
      })

      return updatedClaim
    } catch (error) {
      logger.error("Failed to process claim:", error)
      throw new Error("Claim processing failed")
    }
  }

  @Cacheable(300) // Cache for 5 minutes
  public async getClaimById(claimId: string): Promise<Claim | null> {
    try {
      const query = `
        SELECT c.*, p.policy_number, pr.name as provider_name, u.email as user_email
        FROM claims c
        LEFT JOIN policies p ON c.policy_id = p.id
        LEFT JOIN providers pr ON c.provider_id = pr.id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `

      const result = await db.query(query, [claimId])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToClaim(result.rows[0])
    } catch (error) {
      logger.error("Failed to get claim by ID:", error)
      throw new Error("Failed to retrieve claim")
    }
  }

  public async searchClaims(
    filters: ClaimSearchFilters,
    page = 1,
    limit = 20,
  ): Promise<{ claims: Claim[]; total: number; page: number; totalPages: number }> {
    try {
      let whereClause = "WHERE 1=1"
      const params: any[] = []
      let paramIndex = 1

      // Build dynamic WHERE clause
      if (filters.userId) {
        whereClause += ` AND c.user_id = $${paramIndex++}`
        params.push(filters.userId)
      }

      if (filters.status) {
        whereClause += ` AND c.status = $${paramIndex++}`
        params.push(filters.status)
      }

      if (filters.priority) {
        whereClause += ` AND c.priority = $${paramIndex++}`
        params.push(filters.priority)
      }

      if (filters.startDate) {
        whereClause += ` AND c.service_date >= $${paramIndex++}`
        params.push(filters.startDate)
      }

      if (filters.endDate) {
        whereClause += ` AND c.service_date <= $${paramIndex++}`
        params.push(filters.endDate)
      }

      if (filters.minAmount) {
        whereClause += ` AND c.claim_amount >= $${paramIndex++}`
        params.push(filters.minAmount)
      }

      if (filters.maxAmount) {
        whereClause += ` AND c.claim_amount <= $${paramIndex++}`
        params.push(filters.maxAmount)
      }

      if (filters.providerId) {
        whereClause += ` AND c.provider_id = $${paramIndex++}`
        params.push(filters.providerId)
      }

      if (filters.policyId) {
        whereClause += ` AND c.policy_id = $${paramIndex++}`
        params.push(filters.policyId)
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM claims c ${whereClause}`
      const countResult = await db.query(countQuery, params)
      const total = Number.parseInt(countResult.rows[0].count)

      // Get paginated results
      const offset = (page - 1) * limit
      const dataQuery = `
        SELECT c.*, p.policy_number, pr.name as provider_name, u.email as user_email
        FROM claims c
        LEFT JOIN policies p ON c.policy_id = p.id
        LEFT JOIN providers pr ON c.provider_id = pr.id
        LEFT JOIN users u ON c.user_id = u.id
        ${whereClause}
        ORDER BY c.submitted_date DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `
      params.push(limit, offset)

      const dataResult = await db.query(dataQuery, params)
      const claims = dataResult.rows.map(this.mapRowToClaim)

      const totalPages = Math.ceil(total / limit)

      return {
        claims,
        total,
        page,
        totalPages,
      }
    } catch (error) {
      logger.error("Failed to search claims:", error)
      throw new Error("Claim search failed")
    }
  }

  public async getClaimsByUser(userId: string, limit = 10): Promise<Claim[]> {
    try {
      const query = `
        SELECT c.*, p.policy_number, pr.name as provider_name
        FROM claims c
        LEFT JOIN policies p ON c.policy_id = p.id
        LEFT JOIN providers pr ON c.provider_id = pr.id
        WHERE c.user_id = $1
        ORDER BY c.submitted_date DESC
        LIMIT $2
      `

      const result = await db.query(query, [userId, limit])
      return result.rows.map(this.mapRowToClaim)
    } catch (error) {
      logger.error("Failed to get claims by user:", error)
      throw new Error("Failed to retrieve user claims")
    }
  }

  public async getClaimStatistics(userId?: string): Promise<{
    total: number
    byStatus: Record<ClaimStatus, number>
    byPriority: Record<ClaimPriority, number>
    totalAmount: number
    approvedAmount: number
    averageProcessingTime: number
  }> {
    try {
      let whereClause = ""
      const params: any[] = []

      if (userId) {
        whereClause = "WHERE user_id = $1"
        params.push(userId)
      }

      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
          COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
          COUNT(CASE WHEN status = 'pending_info' THEN 1 END) as pending_info,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_priority,
          SUM(claim_amount) as total_amount,
          SUM(approved_amount) as approved_amount,
          AVG(EXTRACT(EPOCH FROM (processed_date - submitted_date)) / 3600) as avg_processing_hours
        FROM claims
        ${whereClause}
      `

      const result = await db.query(query, params)
      const row = result.rows[0]

      return {
        total: Number.parseInt(row.total) || 0,
        byStatus: {
          [ClaimStatus.DRAFT]: 0,
          [ClaimStatus.SUBMITTED]: Number.parseInt(row.submitted) || 0,
          [ClaimStatus.UNDER_REVIEW]: Number.parseInt(row.under_review) || 0,
          [ClaimStatus.PENDING_INFO]: Number.parseInt(row.pending_info) || 0,
          [ClaimStatus.APPROVED]: Number.parseInt(row.approved) || 0,
          [ClaimStatus.REJECTED]: Number.parseInt(row.rejected) || 0,
          [ClaimStatus.PAID]: Number.parseInt(row.paid) || 0,
          [ClaimStatus.CANCELLED]: Number.parseInt(row.cancelled) || 0,
        },
        byPriority: {
          [ClaimPriority.LOW]: Number.parseInt(row.low_priority) || 0,
          [ClaimPriority.MEDIUM]: Number.parseInt(row.medium_priority) || 0,
          [ClaimPriority.HIGH]: Number.parseInt(row.high_priority) || 0,
          [ClaimPriority.URGENT]: Number.parseInt(row.urgent_priority) || 0,
        },
        totalAmount: Number.parseFloat(row.total_amount) || 0,
        approvedAmount: Number.parseFloat(row.approved_amount) || 0,
        averageProcessingTime: Number.parseFloat(row.avg_processing_hours) || 0,
      }
    } catch (error) {
      logger.error("Failed to get claim statistics:", error)
      throw new Error("Failed to retrieve claim statistics")
    }
  }

  private async saveClaim(claim: Claim): Promise<void> {
    const query = `
      INSERT INTO claims (
        id, claim_number, user_id, policy_id, provider_id, diagnosis,
        treatment_details, claim_amount, approved_amount, status, priority,
        service_date, submitted_date, processed_date, rejection_reason,
        processor_notes, attachments, emergency_service, pre_authorization,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        approved_amount = EXCLUDED.approved_amount,
        processed_date = EXCLUDED.processed_date,
        rejection_reason = EXCLUDED.rejection_reason,
        processor_notes = EXCLUDED.processor_notes,
        updated_at = EXCLUDED.updated_at
    `

    await db.query(query, [
      claim.id,
      claim.claimNumber,
      claim.userId,
      claim.policyId,
      claim.providerId,
      claim.diagnosis,
      claim.treatmentDetails,
      claim.claimAmount,
      claim.approvedAmount,
      claim.status,
      claim.priority,
      claim.serviceDate,
      claim.submittedDate,
      claim.processedDate,
      claim.rejectionReason,
      claim.processorNotes,
      JSON.stringify(claim.attachments),
      claim.emergencyService,
      claim.preAuthorization,
      claim.createdAt,
      claim.updatedAt,
    ])
  }

  private mapRowToClaim(row: any): Claim {
    return {
      id: row.id,
      claimNumber: row.claim_number,
      userId: row.user_id,
      policyId: row.policy_id,
      providerId: row.provider_id,
      diagnosis: row.diagnosis,
      treatmentDetails: row.treatment_details,
      claimAmount: Number.parseFloat(row.claim_amount),
      approvedAmount: row.approved_amount ? Number.parseFloat(row.approved_amount) : undefined,
      status: row.status as ClaimStatus,
      priority: row.priority as ClaimPriority,
      serviceDate: new Date(row.service_date),
      submittedDate: new Date(row.submitted_date),
      processedDate: row.processed_date ? new Date(row.processed_date) : undefined,
      rejectionReason: row.rejection_reason,
      processorNotes: row.processor_notes,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
      emergencyService: row.emergency_service,
      preAuthorization: row.pre_authorization,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `CLM-${timestamp}-${random}`
  }

  private calculatePriority(data: ClaimSubmissionData): ClaimPriority {
    // Emergency services get urgent priority
    if (data.emergencyService) {
      return ClaimPriority.URGENT
    }

    // High amount claims get high priority
    if (data.claimAmount > 50000) {
      return ClaimPriority.HIGH
    }

    // Medium amount claims get medium priority
    if (data.claimAmount > 10000) {
      return ClaimPriority.MEDIUM
    }

    return ClaimPriority.LOW
  }

  private isEligibleForAutoProcessing(claim: Claim): boolean {
    // Auto-process low-priority claims under $1000
    return claim.priority === ClaimPriority.LOW && claim.claimAmount < 1000
  }

  private async processClaimAutomatically(claim: Claim): Promise<void> {
    try {
      // Simple auto-approval logic for eligible claims
      const approvedAmount = claim.claimAmount * 0.9 // 90% approval rate

      await this.processClaim({
        claimId: claim.id,
        status: ClaimStatus.APPROVED,
        approvedAmount,
        processorNotes: "Auto-processed based on eligibility criteria",
        processorId: "system",
      })

      logger.info("Claim auto-processed", {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        approvedAmount,
      })
    } catch (error) {
      logger.error("Auto-processing failed:", error)
      // Continue with manual processing
    }
  }

  private async initiatePayment(claim: Claim): Promise<void> {
    try {
      // This would integrate with payment processing system
      logger.info("Payment initiated for claim", {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        amount: claim.approvedAmount,
      })

      // Update claim status to paid after successful payment
      await this.processClaim({
        claimId: claim.id,
        status: ClaimStatus.PAID,
        processorId: "payment-system",
        processorNotes: "Payment processed successfully",
      })
    } catch (error) {
      logger.error("Payment initiation failed:", error)
      throw new Error("Payment processing failed")
    }
  }

  public async cancelClaim(claimId: string, userId: string, reason: string): Promise<Claim> {
    try {
      const existingClaim = await this.getClaimById(claimId)
      if (!existingClaim) {
        throw new Error("Claim not found")
      }

      if (existingClaim.userId !== userId) {
        throw new Error("Unauthorized to cancel this claim")
      }

      if (existingClaim.status === ClaimStatus.PAID || existingClaim.status === ClaimStatus.CANCELLED) {
        throw new Error("Cannot cancel claim in current status")
      }

      const updatedClaim: Claim = {
        ...existingClaim,
        status: ClaimStatus.CANCELLED,
        processorNotes: `Cancelled by user: ${reason}`,
        processedDate: new Date(),
        updatedAt: new Date(),
      }

      await this.saveClaim(updatedClaim)

      // Log audit event
      await auditService.logDataChange(
        userId,
        "",
        AuditAction.UPDATE,
        ResourceType.CLAIM,
        claimId,
        existingClaim,
        updatedClaim,
      )

      logger.info("Claim cancelled", {
        claimId,
        userId,
        reason,
      })

      return updatedClaim
    } catch (error) {
      logger.error("Failed to cancel claim:", error)
      throw new Error("Claim cancellation failed")
    }
  }

  public async addClaimAttachment(claimId: string, userId: string, attachment: string): Promise<Claim> {
    try {
      const existingClaim = await this.getClaimById(claimId)
      if (!existingClaim) {
        throw new Error("Claim not found")
      }

      if (existingClaim.userId !== userId) {
        throw new Error("Unauthorized to modify this claim")
      }

      const updatedClaim: Claim = {
        ...existingClaim,
        attachments: [...existingClaim.attachments, attachment],
        updatedAt: new Date(),
      }

      await this.saveClaim(updatedClaim)

      logger.info("Attachment added to claim", {
        claimId,
        userId,
        attachment,
      })

      return updatedClaim
    } catch (error) {
      logger.error("Failed to add claim attachment:", error)
      throw new Error("Failed to add attachment")
    }
  }
}

export const claimService = ClaimService.getInstance()
