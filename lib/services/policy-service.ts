import { db } from "@/lib/database/connection"
import { Cacheable } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"
import { auditService, AuditAction, ResourceType } from "@/lib/services/audit-service"

export interface Policy {
  id: string
  policyNumber: string
  userId: string
  policyType: PolicyType
  status: PolicyStatus
  premiumAmount: number
  coverageAmount: number
  deductible: number
  copay: number
  outOfPocketMax: number
  networkType: NetworkType
  startDate: Date
  endDate: Date
  renewalDate: Date
  beneficiaries: Beneficiary[]
  coverageDetails: CoverageDetail[]
  exclusions: string[]
  terms: string
  createdAt: Date
  updatedAt: Date
}

export enum PolicyType {
  INDIVIDUAL = "individual",
  FAMILY = "family",
  GROUP = "group",
  MEDICARE = "medicare",
  MEDICAID = "medicaid",
}

export enum PolicyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
}

export enum NetworkType {
  HMO = "HMO",
  PPO = "PPO",
  EPO = "EPO",
  POS = "POS",
}

export interface Beneficiary {
  id: string
  name: string
  relationship: string
  dateOfBirth: Date
  ssn?: string
  isActive: boolean
}

export interface CoverageDetail {
  id: string
  category: string
  description: string
  coverageLimit: number
  deductible: number
  copay: number
  coinsurance: number
  isActive: boolean
}

export interface PolicyCreationData {
  userId: string
  policyType: PolicyType
  premiumAmount: number
  coverageAmount: number
  deductible: number
  copay: number
  outOfPocketMax: number
  networkType: NetworkType
  startDate: Date
  endDate: Date
  beneficiaries?: Beneficiary[]
  coverageDetails?: CoverageDetail[]
  exclusions?: string[]
}

class PolicyService {
  private static instance: PolicyService

  private constructor() {}

  public static getInstance(): PolicyService {
    if (!PolicyService.instance) {
      PolicyService.instance = new PolicyService()
    }
    return PolicyService.instance
  }

  public async createPolicy(data: PolicyCreationData): Promise<Policy> {
    try {
      const policyNumber = this.generatePolicyNumber()
      const renewalDate = new Date(data.endDate)
      renewalDate.setFullYear(renewalDate.getFullYear() + 1)

      const policy: Policy = {
        id: crypto.randomUUID(),
        policyNumber,
        userId: data.userId,
        policyType: data.policyType,
        status: PolicyStatus.PENDING,
        premiumAmount: data.premiumAmount,
        coverageAmount: data.coverageAmount,
        deductible: data.deductible,
        copay: data.copay,
        outOfPocketMax: data.outOfPocketMax,
        networkType: data.networkType,
        startDate: data.startDate,
        endDate: data.endDate,
        renewalDate,
        beneficiaries: data.beneficiaries || [],
        coverageDetails: data.coverageDetails || [],
        exclusions: data.exclusions || [],
        terms: this.generatePolicyTerms(data),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await this.savePolicy(policy)

      // Log audit event
      await auditService.logDataChange(
        data.userId,
        "",
        AuditAction.CREATE,
        ResourceType.POLICY,
        policy.id,
        null,
        policy,
      )

      logger.info("Policy created successfully", {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        userId: data.userId,
      })

      return policy
    } catch (error) {
      logger.error("Failed to create policy:", error)
      throw new Error("Policy creation failed")
    }
  }

  @Cacheable(300)
  public async getPolicyById(policyId: string): Promise<Policy | null> {
    try {
      const query = `
        SELECT p.*, u.email as user_email
        FROM policies p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
      `

      const result = await db.query(query, [policyId])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapRowToPolicy(result.rows[0])
    } catch (error) {
      logger.error("Failed to get policy by ID:", error)
      throw new Error("Failed to retrieve policy")
    }
  }

  public async getPoliciesByUser(userId: string): Promise<Policy[]> {
    try {
      const query = `
        SELECT * FROM policies
        WHERE user_id = $1
        ORDER BY created_at DESC
      `

      const result = await db.query(query, [userId])
      return result.rows.map(this.mapRowToPolicy)
    } catch (error) {
      logger.error("Failed to get policies by user:", error)
      throw new Error("Failed to retrieve user policies")
    }
  }

  public async updatePolicyStatus(policyId: string, status: PolicyStatus, updatedBy: string): Promise<Policy> {
    try {
      const existingPolicy = await this.getPolicyById(policyId)
      if (!existingPolicy) {
        throw new Error("Policy not found")
      }

      const updatedPolicy: Policy = {
        ...existingPolicy,
        status,
        updatedAt: new Date(),
      }

      await this.savePolicy(updatedPolicy)

      // Log audit event
      await auditService.logDataChange(
        updatedBy,
        "",
        AuditAction.UPDATE,
        ResourceType.POLICY,
        policyId,
        existingPolicy,
        updatedPolicy,
      )

      logger.info("Policy status updated", {
        policyId,
        oldStatus: existingPolicy.status,
        newStatus: status,
        updatedBy,
      })

      return updatedPolicy
    } catch (error) {
      logger.error("Failed to update policy status:", error)
      throw new Error("Policy status update failed")
    }
  }

  public async renewPolicy(policyId: string, renewalData: Partial<PolicyCreationData>): Promise<Policy> {
    try {
      const existingPolicy = await this.getPolicyById(policyId)
      if (!existingPolicy) {
        throw new Error("Policy not found")
      }

      if (existingPolicy.status !== PolicyStatus.ACTIVE) {
        throw new Error("Only active policies can be renewed")
      }

      // Create new policy for renewal
      const newStartDate = new Date(existingPolicy.endDate)
      newStartDate.setDate(newStartDate.getDate() + 1)

      const newEndDate = new Date(newStartDate)
      newEndDate.setFullYear(newEndDate.getFullYear() + 1)

      const renewedPolicy = await this.createPolicy({
        userId: existingPolicy.userId,
        policyType: existingPolicy.policyType,
        premiumAmount: renewalData.premiumAmount || existingPolicy.premiumAmount,
        coverageAmount: renewalData.coverageAmount || existingPolicy.coverageAmount,
        deductible: renewalData.deductible || existingPolicy.deductible,
        copay: renewalData.copay || existingPolicy.copay,
        outOfPocketMax: renewalData.outOfPocketMax || existingPolicy.outOfPocketMax,
        networkType: renewalData.networkType || existingPolicy.networkType,
        startDate: newStartDate,
        endDate: newEndDate,
        beneficiaries: renewalData.beneficiaries || existingPolicy.beneficiaries,
        coverageDetails: renewalData.coverageDetails || existingPolicy.coverageDetails,
        exclusions: renewalData.exclusions || existingPolicy.exclusions,
      })

      // Mark old policy as expired
      await this.updatePolicyStatus(policyId, PolicyStatus.EXPIRED, "system")

      logger.info("Policy renewed successfully", {
        oldPolicyId: policyId,
        newPolicyId: renewedPolicy.id,
        userId: existingPolicy.userId,
      })

      return renewedPolicy
    } catch (error) {
      logger.error("Failed to renew policy:", error)
      throw new Error("Policy renewal failed")
    }
  }

  public async addBeneficiary(policyId: string, beneficiary: Omit<Beneficiary, "id">): Promise<Policy> {
    try {
      const existingPolicy = await this.getPolicyById(policyId)
      if (!existingPolicy) {
        throw new Error("Policy not found")
      }

      const newBeneficiary: Beneficiary = {
        ...beneficiary,
        id: crypto.randomUUID(),
      }

      const updatedPolicy: Policy = {
        ...existingPolicy,
        beneficiaries: [...existingPolicy.beneficiaries, newBeneficiary],
        updatedAt: new Date(),
      }

      await this.savePolicy(updatedPolicy)

      logger.info("Beneficiary added to policy", {
        policyId,
        beneficiaryName: beneficiary.name,
      })

      return updatedPolicy
    } catch (error) {
      logger.error("Failed to add beneficiary:", error)
      throw new Error("Failed to add beneficiary")
    }
  }

  public async removeBeneficiary(policyId: string, beneficiaryId: string): Promise<Policy> {
    try {
      const existingPolicy = await this.getPolicyById(policyId)
      if (!existingPolicy) {
        throw new Error("Policy not found")
      }

      const updatedPolicy: Policy = {
        ...existingPolicy,
        beneficiaries: existingPolicy.beneficiaries.filter((b) => b.id !== beneficiaryId),
        updatedAt: new Date(),
      }

      await this.savePolicy(updatedPolicy)

      logger.info("Beneficiary removed from policy", {
        policyId,
        beneficiaryId,
      })

      return updatedPolicy
    } catch (error) {
      logger.error("Failed to remove beneficiary:", error)
      throw new Error("Failed to remove beneficiary")
    }
  }

  public async getPolicyStatistics(userId?: string): Promise<{
    total: number
    byType: Record<PolicyType, number>
    byStatus: Record<PolicyStatus, number>
    totalPremiums: number
    totalCoverage: number
    expiringPolicies: number
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
          COUNT(CASE WHEN policy_type = 'individual' THEN 1 END) as individual,
          COUNT(CASE WHEN policy_type = 'family' THEN 1 END) as family,
          COUNT(CASE WHEN policy_type = 'group' THEN 1 END) as group,
          COUNT(CASE WHEN policy_type = 'medicare' THEN 1 END) as medicare,
          COUNT(CASE WHEN policy_type = 'medicaid' THEN 1 END) as medicaid,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
          COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
          SUM(premium_amount) as total_premiums,
          SUM(coverage_amount) as total_coverage,
          COUNT(CASE WHEN end_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'active' THEN 1 END) as expiring
        FROM policies
        ${whereClause}
      `

      const result = await db.query(query, params)
      const row = result.rows[0]

      return {
        total: Number.parseInt(row.total) || 0,
        byType: {
          [PolicyType.INDIVIDUAL]: Number.parseInt(row.individual) || 0,
          [PolicyType.FAMILY]: Number.parseInt(row.family) || 0,
          [PolicyType.GROUP]: Number.parseInt(row.group) || 0,
          [PolicyType.MEDICARE]: Number.parseInt(row.medicare) || 0,
          [PolicyType.MEDICAID]: Number.parseInt(row.medicaid) || 0,
        },
        byStatus: {
          [PolicyStatus.ACTIVE]: Number.parseInt(row.active) || 0,
          [PolicyStatus.INACTIVE]: Number.parseInt(row.inactive) || 0,
          [PolicyStatus.PENDING]: Number.parseInt(row.pending) || 0,
          [PolicyStatus.CANCELLED]: Number.parseInt(row.cancelled) || 0,
          [PolicyStatus.EXPIRED]: Number.parseInt(row.expired) || 0,
          [PolicyStatus.SUSPENDED]: Number.parseInt(row.suspended) || 0,
        },
        totalPremiums: Number.parseFloat(row.total_premiums) || 0,
        totalCoverage: Number.parseFloat(row.total_coverage) || 0,
        expiringPolicies: Number.parseInt(row.expiring) || 0,
      }
    } catch (error) {
      logger.error("Failed to get policy statistics:", error)
      throw new Error("Failed to retrieve policy statistics")
    }
  }

  private async savePolicy(policy: Policy): Promise<void> {
    const query = `
      INSERT INTO policies (
        id, policy_number, user_id, policy_type, status, premium_amount,
        coverage_amount, deductible, copay, out_of_pocket_max, network_type,
        start_date, end_date, renewal_date, beneficiaries, coverage_details,
        exclusions, terms, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        premium_amount = EXCLUDED.premium_amount,
        coverage_amount = EXCLUDED.coverage_amount,
        deductible = EXCLUDED.deductible,
        copay = EXCLUDED.copay,
        out_of_pocket_max = EXCLUDED.out_of_pocket_max,
        network_type = EXCLUDED.network_type,
        end_date = EXCLUDED.end_date,
        renewal_date = EXCLUDED.renewal_date,
        beneficiaries = EXCLUDED.beneficiaries,
        coverage_details = EXCLUDED.coverage_details,
        exclusions = EXCLUDED.exclusions,
        terms = EXCLUDED.terms,
        updated_at = EXCLUDED.updated_at
    `

    await db.query(query, [
      policy.id,
      policy.policyNumber,
      policy.userId,
      policy.policyType,
      policy.status,
      policy.premiumAmount,
      policy.coverageAmount,
      policy.deductible,
      policy.copay,
      policy.outOfPocketMax,
      policy.networkType,
      policy.startDate,
      policy.endDate,
      policy.renewalDate,
      JSON.stringify(policy.beneficiaries),
      JSON.stringify(policy.coverageDetails),
      JSON.stringify(policy.exclusions),
      policy.terms,
      policy.createdAt,
      policy.updatedAt,
    ])
  }

  private mapRowToPolicy(row: any): Policy {
    return {
      id: row.id,
      policyNumber: row.policy_number,
      userId: row.user_id,
      policyType: row.policy_type as PolicyType,
      status: row.status as PolicyStatus,
      premiumAmount: Number.parseFloat(row.premium_amount),
      coverageAmount: Number.parseFloat(row.coverage_amount),
      deductible: Number.parseFloat(row.deductible),
      copay: Number.parseFloat(row.copay),
      outOfPocketMax: Number.parseFloat(row.out_of_pocket_max),
      networkType: row.network_type as NetworkType,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      renewalDate: new Date(row.renewal_date),
      beneficiaries: row.beneficiaries ? JSON.parse(row.beneficiaries) : [],
      coverageDetails: row.coverage_details ? JSON.parse(row.coverage_details) : [],
      exclusions: row.exclusions ? JSON.parse(row.exclusions) : [],
      terms: row.terms,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private generatePolicyNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `POL-${timestamp}-${random}`
  }

  private generatePolicyTerms(data: PolicyCreationData): string {
    return `
      HEALTHCARE INSURANCE POLICY TERMS AND CONDITIONS
      
      Policy Type: ${data.policyType}
      Network Type: ${data.networkType}
      
      COVERAGE DETAILS:
      - Total Coverage Amount: $${data.coverageAmount.toLocaleString()}
      - Annual Deductible: $${data.deductible.toLocaleString()}
      - Copay: $${data.copay}
      - Out-of-Pocket Maximum: $${data.outOfPocketMax.toLocaleString()}
      
      PREMIUM:
      - Monthly Premium: $${data.premiumAmount.toLocaleString()}
      
      EFFECTIVE PERIOD:
      - Start Date: ${data.startDate.toDateString()}
      - End Date: ${data.endDate.toDateString()}
      
      GENERAL TERMS:
      1. This policy is subject to all terms and conditions outlined in the master policy document.
      2. Coverage is effective only after premium payment is received and processed.
      3. Pre-existing conditions may be subject to waiting periods as defined in the policy schedule.
      4. Emergency services are covered regardless of network status.
      5. Preventive care services are covered at 100% within network.
      
      For complete terms and conditions, please refer to your policy handbook.
    `
  }
}

export const policyService = PolicyService.getInstance()
