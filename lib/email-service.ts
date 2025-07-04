interface EmailOptions {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private static instance: EmailService
  private apiKey: string
  private fromEmail: string

  private constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || ""
    this.fromEmail = process.env.FROM_EMAIL || "noreply@healthinsurance.com"
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Simulate email sending in development
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Email would be sent:", {
          to: options.to,
          subject: options.subject,
          from: this.fromEmail,
        })
        return true
      }

      // In production, integrate with your email service (SendGrid, AWS SES, etc.)
      const response = await fetch("https://api.sendgrid.v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: { email: this.fromEmail },
          content: [
            {
              type: "text/html",
              value: options.html,
            },
          ],
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset for your Health Insurance Portal account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
        </p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: "Reset Your Password - Health Insurance Portal",
      html,
    })
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Health Insurance Portal!</h2>
        <p>Hello ${name},</p>
        <p>Welcome to your Health Insurance Portal. You can now:</p>
        <ul>
          <li>View your policy details and coverage</li>
          <li>Submit and track claims</li>
          <li>Find healthcare providers</li>
          <li>Book appointments</li>
          <li>Access your health analytics</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Access Your Dashboard
        </a>
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: "Welcome to Health Insurance Portal",
      html,
    })
  }
}
