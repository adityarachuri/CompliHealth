import { db } from "@/lib/database/connection"
import { cache, Cacheable } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"

export interface AnalyticsMetric {
  name: string
  value: number
  timestamp: Date
  dimensions?: Record<string, string>
}

export interface AnalyticsQuery {
  metrics: string[]
  dimensions?: string[]
  filters?: Record<string, any>
  startDate: Date
  endDate: Date
  granularity?: "hour" | "day" | "week" | "month"
  limit?: number
}

export interface AnalyticsResult {
  data: Array<{
    timestamp: Date
    metrics: Record<string, number>
    dimensions?: Record<string, string>
  }>
  summary: Record<string, number>
  metadata: {
    totalRecords: number
    queryTime: number
    cached: boolean
  }
}

export interface PredictiveModel {
  id: string
  name: string
  type: "linear_regression" | "time_series" | "classification"
  features: string[]
  accuracy: number
  lastTrained: Date
  predictions: Array<{
    timestamp: Date
    value: number
    confidence: number
  }>
}

class AnalyticsService {
  private static instance: AnalyticsService
  private models: Map<string, PredictiveModel> = new Map()

  private constructor() {
    this.initializePredictiveModels()
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  @Cacheable(300) // Cache for 5 minutes
  public async executeQuery(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const startTime = Date.now()

    try {
      logger.info("Executing analytics query", { query })

      // Build SQL query based on analytics query
      const sqlQuery = this.buildSQLQuery(query)
      const result = await db.query(sqlQuery.text, sqlQuery.params)

      // Process and aggregate results
      const processedData = this.processQueryResults(result.rows, query)
      const summary = this.calculateSummary(processedData, query.metrics)

      const queryTime = Date.now() - startTime

      return {
        data: processedData,
        summary,
        metadata: {
          totalRecords: result.rowCount || 0,
          queryTime,
          cached: false,
        },
      }
    } catch (error) {
      logger.error("Analytics query failed:", error)
      throw new Error("Failed to execute analytics query")
    }
  }

  private buildSQLQuery(query: AnalyticsQuery): { text: string; params: any[] } {
    const params: any[] = []
    let paramIndex = 1

    // Base table selection based on metrics
    const tables = this.getRequiredTables(query.metrics)
    const baseTable = tables[0]

    // Build SELECT clause
    const selectClauses: string[] = []

    // Add time grouping
    if (query.granularity) {
      const timeGrouping = this.getTimeGrouping(query.granularity)
      selectClauses.push(`${timeGrouping} as time_bucket`)
    }

    // Add metrics
    query.metrics.forEach((metric) => {
      const metricSQL = this.getMetricSQL(metric)
      selectClauses.push(`${metricSQL} as ${metric}`)
    })

    // Add dimensions
    if (query.dimensions) {
      query.dimensions.forEach((dimension) => {
        selectClauses.push(dimension)
      })
    }

    // Build FROM clause with JOINs
    let fromClause = baseTable
    if (tables.length > 1) {
      for (let i = 1; i < tables.length; i++) {
        fromClause += ` LEFT JOIN ${tables[i]} ON ${this.getJoinCondition(tables[0], tables[i])}`
      }
    }

    // Build WHERE clause
    let whereClause = `WHERE created_at >= $${paramIndex++} AND created_at <= $${paramIndex++}`
    params.push(query.startDate, query.endDate)

    // Add filters
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        whereClause += ` AND ${key} = $${paramIndex++}`
        params.push(value)
      })
    }

    // Build GROUP BY clause
    let groupByClause = ""
    if (query.granularity || query.dimensions) {
      const groupFields: string[] = []
      if (query.granularity) {
        groupFields.push("time_bucket")
      }
      if (query.dimensions) {
        groupFields.push(...query.dimensions)
      }
      groupByClause = `GROUP BY ${groupFields.join(", ")}`
    }

    // Build ORDER BY clause
    const orderByClause = query.granularity ? "ORDER BY time_bucket" : ""

    // Build LIMIT clause
    const limitClause = query.limit ? `LIMIT ${query.limit}` : ""

    const sqlText = [
      `SELECT ${selectClauses.join(", ")}`,
      `FROM ${fromClause}`,
      whereClause,
      groupByClause,
      orderByClause,
      limitClause,
    ]
      .filter(Boolean)
      .join(" ")

    return { text: sqlText, params }
  }

  private getRequiredTables(metrics: string[]): string[] {
    const tableMap: Record<string, string> = {
      claims_count: "claims",
      claims_value: "claims",
      policies_count: "policies",
      users_count: "users",
      providers_count: "providers",
      approval_rate: "claims",
      average_processing_time: "claims",
    }

    const tables = new Set<string>()
    metrics.forEach((metric) => {
      const table = tableMap[metric]
      if (table) {
        tables.add(table)
      }
    })

    return Array.from(tables)
  }

  private getTimeGrouping(granularity: string): string {
    switch (granularity) {
      case "hour":
        return "DATE_TRUNC('hour', created_at)"
      case "day":
        return "DATE_TRUNC('day', created_at)"
      case "week":
        return "DATE_TRUNC('week', created_at)"
      case "month":
        return "DATE_TRUNC('month', created_at)"
      default:
        return "DATE_TRUNC('day', created_at)"
    }
  }

  private getMetricSQL(metric: string): string {
    switch (metric) {
      case "claims_count":
        return "COUNT(*)"
      case "claims_value":
        return "SUM(claim_amount)"
      case "policies_count":
        return "COUNT(DISTINCT policy_id)"
      case "users_count":
        return "COUNT(DISTINCT user_id)"
      case "approval_rate":
        return "AVG(CASE WHEN status = 'approved' THEN 1.0 ELSE 0.0 END) * 100"
      case "average_processing_time":
        return "AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) / 3600)"
      default:
        return "COUNT(*)"
    }
  }

  private getJoinCondition(table1: string, table2: string): string {
    // Define join conditions between tables
    const joinMap: Record<string, Record<string, string>> = {
      claims: {
        policies: "claims.policy_id = policies.id",
        users: "claims.user_id = users.id",
        providers: "claims.provider_id = providers.id",
      },
      policies: {
        users: "policies.user_id = users.id",
      },
    }

    return joinMap[table1]?.[table2] || joinMap[table2]?.[table1] || "1=1"
  }

  private processQueryResults(rows: any[], query: AnalyticsQuery): any[] {
    return rows.map((row) => {
      const result: any = {
        timestamp: row.time_bucket || new Date(),
        metrics: {},
      }

      // Extract metrics
      query.metrics.forEach((metric) => {
        result.metrics[metric] = Number.parseFloat(row[metric]) || 0
      })

      // Extract dimensions
      if (query.dimensions) {
        result.dimensions = {}
        query.dimensions.forEach((dimension) => {
          result.dimensions[dimension] = row[dimension]
        })
      }

      return result
    })
  }

  private calculateSummary(data: any[], metrics: string[]): Record<string, number> {
    const summary: Record<string, number> = {}

    metrics.forEach((metric) => {
      const values = data.map((d) => d.metrics[metric]).filter((v) => v !== undefined)

      if (values.length > 0) {
        summary[`${metric}_total`] = values.reduce((sum, val) => sum + val, 0)
        summary[`${metric}_average`] = summary[`${metric}_total`] / values.length
        summary[`${metric}_min`] = Math.min(...values)
        summary[`${metric}_max`] = Math.max(...values)
      }
    })

    return summary
  }

  // Predictive Analytics
  private initializePredictiveModels(): void {
    // Claims volume prediction model
    this.models.set("claims_volume", {
      id: "claims_volume",
      name: "Claims Volume Prediction",
      type: "time_series",
      features: ["historical_volume", "seasonality", "policy_count"],
      accuracy: 0.87,
      lastTrained: new Date(),
      predictions: [],
    })

    // Cost prediction model
    this.models.set("cost_prediction", {
      id: "cost_prediction",
      name: "Healthcare Cost Prediction",
      type: "linear_regression",
      features: ["age", "medical_history", "policy_type", "region"],
      accuracy: 0.82,
      lastTrained: new Date(),
      predictions: [],
    })

    // Fraud detection model
    this.models.set("fraud_detection", {
      id: "fraud_detection",
      name: "Fraud Detection",
      type: "classification",
      features: ["claim_amount", "provider_history", "diagnosis_frequency", "timing_patterns"],
      accuracy: 0.94,
      lastTrained: new Date(),
      predictions: [],
    })
  }

  public async generatePredictions(modelId: string, horizon = 30): Promise<PredictiveModel> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    try {
      // Get historical data for the model
      const historicalData = await this.getHistoricalData(model)

      // Generate predictions based on model type
      const predictions = await this.runPredictiveModel(model, historicalData, horizon)

      // Update model with new predictions
      model.predictions = predictions
      this.models.set(modelId, model)

      logger.info("Predictions generated", { modelId, horizon, predictionsCount: predictions.length })

      return model
    } catch (error) {
      logger.error("Prediction generation failed:", error)
      throw new Error("Failed to generate predictions")
    }
  }

  private async getHistoricalData(model: PredictiveModel): Promise<any[]> {
    // This would fetch relevant historical data based on model features
    const query = `
      SELECT * FROM analytics_data 
      WHERE model_features && $1 
      AND created_at >= NOW() - INTERVAL '1 year'
      ORDER BY created_at
    `

    const result = await db.query(query, [model.features])
    return result.rows
  }

  private async runPredictiveModel(
    model: PredictiveModel,
    historicalData: any[],
    horizon: number,
  ): Promise<Array<{ timestamp: Date; value: number; confidence: number }>> {
    // Simplified prediction logic - in production, this would use ML libraries
    const predictions: Array<{ timestamp: Date; value: number; confidence: number }> = []

    const baseValue = historicalData.length > 0 ? historicalData[historicalData.length - 1].value || 100 : 100

    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() + i)

      // Simple trend-based prediction with some randomness
      const trendFactor = 1 + (Math.random() - 0.5) * 0.1 // ±5% variation
      const seasonalFactor = 1 + Math.sin((i / 30) * Math.PI) * 0.1 // Monthly seasonality

      const value = baseValue * trendFactor * seasonalFactor
      const confidence = Math.max(0.5, model.accuracy - (i / horizon) * 0.3) // Decreasing confidence

      predictions.push({
        timestamp,
        value: Math.round(value),
        confidence: Math.round(confidence * 100) / 100,
      })
    }

    return predictions
  }

  // Real-time analytics
  public async trackEvent(event: AnalyticsMetric): Promise<void> {
    try {
      // Store event in database
      await db.query(`INSERT INTO analytics_events (name, value, timestamp, dimensions) VALUES ($1, $2, $3, $4)`, [
        event.name,
        event.value,
        event.timestamp,
        JSON.stringify(event.dimensions || {}),
      ])

      // Update real-time aggregations
      await this.updateRealTimeMetrics(event)

      logger.debug("Analytics event tracked", { event })
    } catch (error) {
      logger.error("Failed to track analytics event:", error)
    }
  }

  private async updateRealTimeMetrics(event: AnalyticsMetric): Promise<void> {
    const key = `realtime:${event.name}`
    const currentValue = (await cache.get<number>(key)) || 0
    await cache.set(key, currentValue + event.value, 3600) // 1 hour TTL
  }

  @Cacheable(60) // Cache for 1 minute
  public async getRealTimeMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {}

    // Get common real-time metrics
    const metricNames = ["active_users", "claims_submitted_today", "policies_created_today", "system_load"]

    for (const metricName of metricNames) {
      const key = `realtime:${metricName}`
      metrics[metricName] = (await cache.get<number>(key)) || 0
    }

    return metrics
  }

  // Dashboard data aggregation
  public async getDashboardData(userId: string, role: string): Promise<any> {
    const cacheKey = `dashboard:${userId}:${role}`
    const cached = await cache.get(cacheKey)

    if (cached) {
      return cached
    }

    const dashboardData = await this.buildDashboardData(userId, role)
    await cache.set(cacheKey, dashboardData, 300) // 5 minutes

    return dashboardData
  }

  private async buildDashboardData(userId: string, role: string): Promise<any> {
    const data: any = {
      summary: {},
      charts: {},
      alerts: [],
      trends: {},
    }

    switch (role) {
      case "customer":
        data.summary = await this.getCustomerSummary(userId)
        data.charts = await this.getCustomerCharts(userId)
        break
      case "hospital":
        data.summary = await this.getHospitalSummary(userId)
        data.charts = await this.getHospitalCharts(userId)
        break
      case "tpa":
        data.summary = await this.getTPASummary()
        data.charts = await this.getTPACharts()
        break
      case "insurer":
        data.summary = await this.getInsurerSummary()
        data.charts = await this.getInsurerCharts()
        break
      case "admin":
        data.summary = await this.getAdminSummary()
        data.charts = await this.getAdminCharts()
        break
    }

    return data
  }

  private async getCustomerSummary(userId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_claims,
        COUNT(p.id) as total_policies,
        SUM(c.claim_amount) as total_claimed,
        SUM(c.approved_amount) as total_approved
      FROM users u
      LEFT JOIN claims c ON u.id = c.user_id
      LEFT JOIN policies p ON u.id = p.user_id
      WHERE u.id = $1
    `

    const result = await db.query(query, [userId])
    return result.rows[0] || {}
  }

  private async getCustomerCharts(userId: string): Promise<any> {
    // Implementation for customer-specific charts
    return {
      claimsOverTime: await this.getClaimsOverTime(userId),
      coverageUtilization: await this.getCoverageUtilization(userId),
    }
  }

  private async getClaimsOverTime(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        SUM(claim_amount) as total_amount
      FROM claims
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `

    const result = await db.query(query, [userId])
    return result.rows
  }

  private async getCoverageUtilization(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        policy_type,
        SUM(approved_amount) as utilized,
        MAX(coverage_amount) as total_coverage
      FROM claims c
      JOIN policies p ON c.policy_id = p.id
      WHERE c.user_id = $1
      GROUP BY policy_type
    `

    const result = await db.query(query, [userId])
    return result.rows
  }

  // Additional role-specific summary methods would be implemented similarly
  private async getHospitalSummary(userId: string): Promise<any> {
    // Hospital-specific metrics
    return {}
  }

  private async getTPASummary(): Promise<any> {
    // TPA-specific metrics
    return {}
  }

  private async getInsurerSummary(): Promise<any> {
    // Insurer-specific metrics
    return {}
  }

  private async getAdminSummary(): Promise<any> {
    // Admin-specific metrics
    return {}
  }

  private async getHospitalCharts(userId: string): Promise<any> {
    return {}
  }

  private async getTPACharts(): Promise<any> {
    return {}
  }

  private async getInsurerCharts(): Promise<any> {
    return {}
  }

  private async getAdminCharts(): Promise<any> {
    return {}
  }
}

export const analyticsService = AnalyticsService.getInstance()

// Convenience functions for tracking common events
export async function trackUserAction(userId: string, action: string, metadata?: any): Promise<void> {
  await analyticsService.trackEvent({
    name: "user_action",
    value: 1,
    timestamp: new Date(),
    dimensions: {
      userId,
      action,
      ...metadata,
    },
  })
}

export async function trackClaimSubmission(claimId: string, amount: number, userId: string): Promise<void> {
  await analyticsService.trackEvent({
    name: "claim_submitted",
    value: amount,
    timestamp: new Date(),
    dimensions: {
      claimId,
      userId,
    },
  })
}

export async function trackPolicyCreation(policyId: string, premium: number, userId: string): Promise<void> {
  await analyticsService.trackEvent({
    name: "policy_created",
    value: premium,
    timestamp: new Date(),
    dimensions: {
      policyId,
      userId,
    },
  })
}
