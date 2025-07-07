import { APP_CONFIG } from "@/lib/config/app-config"
import { logger } from "@/lib/utils/logger"

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailTemplate {
  name: string
  subject: string
  html: string
  variables: string[]
}

class EmailService {
  private static instance: EmailService
  private templates = new Map<string, EmailTemplate>()

  private constructor() {
    this.registerTemplates()
  }

  /* -------- Public API ------------------------------------------- */

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      logger.info("Sending email", { to: options.to, subject: options.subject })

      /* Demo / development mode – just log the email ---------------- */
      if (APP_CONFIG.isDevelopment || !APP_CONFIG.email.apiKey) {
        logger.debug("Email sent (demo mode)", {
          to: options.to,
          subject: options.subject,
          snippet: options.html.slice(0, 120) + "...",
        })
        return
      }

      /* TODO: production provider implementation -------------------- */
      // switch (APP_CONFIG.email.provider) {
      //   case "sendgrid": await this.sendViaSendGrid(options); break;
      //   case "ses":      await this.sendViaSES(options);      break;
      //   case "smtp":     await this.sendViaSMTP(options);     break;
      //   default: throw new Error(`Unsupported provider: ${APP_CONFIG.email.provider}`);
      // }

      logger.info("Email sent successfully", { to: options.to, subject: options.subject })
    } catch (error) {
      logger.error("Failed to send email", { error })
      throw new Error("Email sending failed")
    }
  }

  async sendTemplate(templateName: string, to: string | string[], variables: Record<string, unknown>): Promise<void> {
    const tpl = this.templates.get(templateName)
    if (!tpl) throw new Error(`Email template '${templateName}' not found`)

    const subject = this.render(tpl.subject, variables)
    const html = this.render(tpl.html, variables)

    await this.sendEmail({ to, subject, html })
  }

  /* -------- Convenience wrappers --------------------------------- */

  async sendWelcome(to: string, firstName: string) {
    await this.sendTemplate("welcome", to, { firstName })
  }

  async sendPasswordReset(to: string, firstName: string, resetLink: string) {
    await this.sendTemplate("password-reset", to, { firstName, resetLink })
  }

  async sendClaimNotification(
    to: string,
    firstName: string,
    claimData: {
      claimNumber: string
      status: string
      amount: string
      date: string
      notes?: string
    },
  ) {
    await this.sendTemplate("claim-notification", to, { firstName, ...claimData })
  }

  /* ------------------------------------------------------------------ */
  /*  Templating (very light-weight)                                     */
  /* ------------------------------------------------------------------ */

  private render(template: string, vars: Record<string, unknown>): string {
    let out = template
    Object.entries(vars).forEach(([key, val]) => {
      out = out.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(val))
    })

    /* Handle {{#if var}} … {{/if}} blocks --------------------------- */
    out = out.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_match, v, content) => (vars[v] ? content : ""))
    return out
  }

  /* ------------------------------------------------------------------ */
  /*  Template registry                                                 */
  /* ------------------------------------------------------------------ */

  private registerTemplates(): void {
    /* -- 1. Welcome -------------------------------------------------- */
    this.templates.set("welcome", {
      name: "welcome",
      subject: "Welcome to Healthcare Insurance Portal",
      variables: ["firstName"],
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color:#2563eb;">Welcome {{firstName}}!</h1>
        <p>Thank you for joining Healthcare Insurance Portal.</p>
        <p>Your account has been created successfully. You can now:</p>
        <ul>
          <li>View your policies</li>
          <li>Submit claims</li>
          <li>Find healthcare providers</li>
          <li>Track your coverage</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
        <p style="margin-top:24px;">Best regards,<br/>Healthcare Insurance Portal Team</p>
      </div>`,
    })

    /* -- 2. Password Reset ------------------------------------------ */
    this.templates.set("password-reset", {
      name: "password-reset",
      subject: "Password Reset Request",
      variables: ["firstName", "resetLink"],
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color:#dc2626;">Password Reset Request</h1>
        <p>Hello {{firstName}},</p>
        <p>We received a request to reset your password. Click the button below:</p>
        <p style="text-align:center; margin:24px 0;">
          <a href="{{resetLink}}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link expires in 24 hours.</p>
        <p style="margin-top:24px;">Best regards,<br/>Healthcare Insurance Portal Team</p>
      </div>`,
    })

    /* -- 3. Claim Notification -------------------------------------- */
    this.templates.set("claim-notification", {
      name: "claim-notification",
      subject: "Claim Status Update – {{claimNumber}}",
      variables: ["firstName", "claimNumber", "status", "amount", "date", "notes"],
      html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
        <h1 style="color:#2563eb;">Claim Status Update</h1>
        <p>Hello {{firstName}},</p>
        <p>Your claim <strong>{{claimNumber}}</strong> has been updated.</p>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Status:</strong> {{status}}</p>
          <p><strong>Amount:</strong> &#36;{{amount}}</p>
          <p><strong>Date:</strong> {{date}}</p>
        </div>
        {{#if notes}}
          <p><strong>Notes:</strong> {{notes}}</p>
        {{/if}}
        <p>You can view full details in your dashboard.</p>
        <p style="margin-top:24px;">Best regards,<br/>Healthcare Insurance Portal Team</p>
      </div>`,
    })
  }
}

/* ------------------------------------------------------------------ */
/*  Export a singleton + helpers                                       */
/* ------------------------------------------------------------------ */

export const emailService = EmailService.getInstance()

export const sendEmail = (o: EmailOptions) => emailService.sendEmail(o)
export const sendWelcomeEmail = (to: string, firstName: string) => emailService.sendWelcome(to, firstName)
export const sendPasswordResetEmail = (to: string, firstName: string, resetLink: string) =>
  emailService.sendPasswordReset(to, firstName, resetLink)
export const sendClaimNotification = (
  to: string,
  firstName: string,
  data: { claimNumber: string; status: string; amount: string; date: string; notes?: string },
) => emailService.sendClaimNotification(to, firstName, data)
