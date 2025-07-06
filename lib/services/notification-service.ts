import { EventEmitter } from "events"
import { cache } from "@/lib/utils/cache"
import { logger } from "@/lib/utils/logger"
import { sendEmail } from "@/lib/email-service"
import { data } from "@/lib/data" // Declare the variable before using it

export interface NotificationPayload {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  priority: NotificationPriority
  channels: NotificationChannel[]
  scheduledFor?: Date
  expiresAt?: Date
}

export enum NotificationType {
  CLAIM_SUBMITTED = "claim_submitted",
  CLAIM_APPROVED = "claim_approved",
  CLAIM_REJECTED = "claim_rejected",
  POLICY_RENEWAL = "policy_renewal",
  PAYMENT_DUE = "payment_due",
  SECURITY_ALERT = "security_alert",
  SYSTEM_MAINTENANCE = "system_maintenance",
  APPOINTMENT_REMINDER = "appointment_reminder",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
}

export interface NotificationTemplate {
  type: NotificationType
  channels: NotificationChannel[]
  templates: {
    [key in NotificationChannel]?: {
      subject?: string
      body: string
    }
  }
}

class NotificationService extends EventEmitter {
  private static instance: NotificationService
  private templates: Map<NotificationType, NotificationTemplate> = new Map()
  private queue: NotificationPayload[] = []
  private processing = false

  private constructor() {
    super()
    this.initializeTemplates()
    this.startQueueProcessor()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private initializeTemplates(): void {
    // Claim submitted template
    this.templates.set(NotificationType.CLAIM_SUBMITTED, {
      type: NotificationType.CLAIM_SUBMITTED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      templates: {
        [NotificationChannel.EMAIL]: {
          subject: "Claim Submitted Successfully",
          body: `
            <h2>Claim Submitted</h2>
            <p>Your claim has been submitted successfully.</p>
            <p><strong>Claim Number:</strong> {{claimNumber}}</p>\
            <p><strong>Amount:</strong> ${{data.amount}}</p>
            <p>We will process your claim and notify you of the status.</p>
          `,
        },
        [NotificationChannel.IN_APP]: {
          body: "Your claim {{data.claimNumber}} has been submitted successfully.",
        },
      },
    })

    // Claim approved template
    this.templates.set(NotificationType.CLAIM_APPROVED, {
      type: NotificationType.CLAIM_APPROVED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
      templates: {
        [NotificationChannel.EMAIL]: {
          subject: "Claim Approved",
          body: `
            <h2>Great News! Your Claim Has Been Approved</h2>
            <p><strong>Claim Number:</strong> {{data.claimNumber}}</p>\
            <p><strong>Approved Amount:</strong> ${{data.approvedAmount}}</p>
            <p><strong>Payment Date:</strong> {{data.paymentDate}}</p>
            <p>The payment will be processed within 3-5 business days.</p>
          `,
        },
        [NotificationChannel.SMS]: {
          body: "Your claim {{data.claimNumber}} has been approved for ${{data.approvedAmount}}. Payment processing within 3-5 days.",
        },
        [NotificationChannel.IN_APP]: {
          body: "Your claim {{data.claimNumber}} has been approved for ${{data.approvedAmount}}.",
        },
      },
    })

    // Policy renewal template
    this.templates.set(NotificationType.POLICY_RENEWAL, {
      type: NotificationType.POLICY_RENEWAL,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      templates: {
        [NotificationChannel.EMAIL]: {
          subject: "Policy Renewal Reminder",
          body: `
            <h2>Policy Renewal Reminder</h2>
            <p>Your policy {{data.policyNumber}} is due for renewal.</p>
            <p><strong>Expiration Date:</strong> {{data.expirationDate}}</p>\
            <p><strong>Premium Amount:</strong> ${{data.premiumAmount}}</p>
            <p>Please renew your policy to avoid any interruption in coverage.</p>
          `,
        },
        [NotificationChannel.IN_APP]: {
          body: "Your policy {{data.policyNumber}} expires on {{data.expirationDate}}. Please renew to maintain coverage.",
        },
      },
    })

    // Security alert template
    this.templates.set(NotificationType.SECURITY_ALERT, {
      type: NotificationType.SECURITY_ALERT,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      templates: {
        [NotificationChannel.EMAIL]: {
          subject: "Security Alert - Unusual Activity Detected",
          body: `
            <h2>Security Alert</h2>
            <p>We detected unusual activity on your account.</p>
            <p><strong>Activity:</strong> {{data.activity}}</p>
            <p><strong>Time:</strong> {{data.timestamp}}</p>
            <p><strong>Location:</strong> {{data.location}}</p>
            <p>If this wasn't you, please contact support immediately.</p>
          `,
        },
        [NotificationChannel.SMS]: {
          body: "Security Alert: {{data.activity}} detected on your account at {{data.timestamp}}. Contact support if this wasn't you.",
        },
      },
    })
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Validate user preferences
      const userPreferences = await this.getUserNotificationPreferences(payload.userId)
      const allowedChannels = payload.channels.filter((channel) => userPreferences[channel] !== false)

      if (allowedChannels.length === 0) {
        logger.info("Notification skipped - user preferences", { userId: payload.userId, type: payload.type })
        return
      }

      // Update payload with allowed channels
      payload.channels = allowedChannels

      // Add to queue or process immediately based on priority
      if (payload.priority === NotificationPriority.URGENT) {
        await this.processNotification(payload)
      } else {
        this.queue.push(payload)
      }

      // Store notification in database/cache for in-app display
      await this.storeNotification(payload)

      logger.info("Notification queued", {
        id: payload.id,
        userId: payload.userId,
        type: payload.type,
        channels: payload.channels,
      })
    } catch (error) {
      logger.error("Failed to send notification:", error)
      throw error
    }
  }

  private async processNotification(payload: NotificationPayload): Promise<void> {
    const template = this.templates.get(payload.type)
    if (!template) {
      logger.error("No template found for notification type:", payload.type)
      return
    }

    for (const channel of payload.channels) {
      try {
        await this.sendToChannel(channel, payload, template)
      } catch (error) {
        logger.error(`Failed to send notification via ${channel}:`, error)
      }
    }

    // Emit event for real-time updates
    this.emit("notification_sent", payload)
  }

  private async sendToChannel(
    channel: NotificationChannel,
    payload: NotificationPayload,
    template: NotificationTemplate,
  ): Promise<void> {
    const channelTemplate = template.templates[channel]
    if (!channelTemplate) {
      return
    }

    const renderedContent = this.renderTemplate(channelTemplate.body, payload.data || {})
    const renderedSubject = channelTemplate.subject
      ? this.renderTemplate(channelTemplate.subject, payload.data || {})
      : payload.title

    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmailNotification(payload.userId, renderedSubject, renderedContent)
        break
      case NotificationChannel.SMS:
        await this.sendSMSNotification(payload.userId, renderedContent)
        break
      case NotificationChannel.PUSH:
        await this.sendPushNotification(payload.userId, renderedSubject, renderedContent)
        break
      case NotificationChannel.IN_APP:
        // In-app notifications are stored and displayed in the UI
        break
    }
  }

  private renderTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  private async sendEmailNotification(userId: string, subject: string, body: string): Promise<void> {
    // Get user email from database
    const userEmail = await this.getUserEmail(userId)
    if (!userEmail) {
      throw new Error("User email not found")
    }

    await sendEmail({
      to: userEmail,
      subject,
      html: body,
    })
  }

  private async sendSMSNotification(userId: string, message: string): Promise<void> {
    // Implementation would depend on SMS provider (Twilio, AWS SNS, etc.)
    logger.info("SMS notification sent", { userId, message })
  }

  private async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // Implementation would depend on push notification service (Firebase, etc.)
    logger.info("Push notification sent", { userId, title, body })
  }

  private async storeNotification(payload: NotificationPayload): Promise<void> {
    const key = `notifications:${payload.userId}`
    const notifications = (await cache.get<NotificationPayload[]>(key)) || []

    notifications.unshift(payload)

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100)
    }

    await cache.set(key, notifications, 7 * 24 * 60 * 60) // 7 days
  }

  private async getUserNotificationPreferences(userId: string): Promise<any> {
    // This would typically fetch from database
    // For now, return default preferences
    return {
      [NotificationChannel.EMAIL]: true,
      [NotificationChannel.SMS]: false,
      [NotificationChannel.PUSH]: true,
      [NotificationChannel.IN_APP]: true,
    }
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // This would typically fetch from database
    // For demo purposes, return a placeholder
    return `user-${userId}@example.com`
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.processing || this.queue.length === 0) {
        return
      }

      this.processing = true

      try {
        const batch = this.queue.splice(0, 10) // Process 10 at a time

        await Promise.all(batch.map((notification) => this.processNotification(notification)))
      } catch (error) {
        logger.error("Queue processing error:", error)
      } finally {
        this.processing = false
      }
    }, 5000) // Process every 5 seconds
  }

  public async getNotifications(userId: string, limit = 20): Promise<NotificationPayload[]> {
    const key = `notifications:${userId}`
    const notifications = (await cache.get<NotificationPayload[]>(key)) || []
    return notifications.slice(0, limit)
  }

  public async markAsRead(userId: string, notificationId: string): Promise<void> {
    const key = `notifications:${userId}`
    const notifications = (await cache.get<NotificationPayload[]>(key)) || []

    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.data = { ...notification.data, read: true }
      await cache.set(key, notifications, 7 * 24 * 60 * 60)
    }
  }
}

export const notificationService = NotificationService.getInstance()

// Convenience functions for common notifications
export async function notifyClaimSubmitted(userId: string, claimData: any): Promise<void> {
  await notificationService.sendNotification({
    id: `claim_submitted_${claimData.claimNumber}`,
    userId,
    type: NotificationType.CLAIM_SUBMITTED,
    title: "Claim Submitted",
    message: `Your claim ${claimData.claimNumber} has been submitted successfully.`,
    data: claimData,
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  })
}

export async function notifyClaimApproved(userId: string, claimData: any): Promise<void> {
  await notificationService.sendNotification({
    id: `claim_approved_${claimData.claimNumber}`,
    userId,
    type: NotificationType.CLAIM_APPROVED,
    title: "Claim Approved",
    message: `Your claim ${claimData.claimNumber} has been approved.`,
    data: claimData,
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
  })
}

export async function notifyPolicyRenewal(userId: string, policyData: any): Promise<void> {
  await notificationService.sendNotification({
    id: `policy_renewal_${policyData.policyNumber}`,
    userId,
    type: NotificationType.POLICY_RENEWAL,
    title: "Policy Renewal Reminder",
    message: `Your policy ${policyData.policyNumber} is due for renewal.`,
    data: policyData,
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  })
}

export async function notifySecurityAlert(userId: string, alertData: any): Promise<void> {
  await notificationService.sendNotification({
    id: `security_alert_${Date.now()}`,
    userId,
    type: NotificationType.SECURITY_ALERT,
    title: "Security Alert",
    message: "Unusual activity detected on your account.",
    data: alertData,
    priority: NotificationPriority.URGENT,
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
  })
}
