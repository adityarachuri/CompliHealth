export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Demo email service for development
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Log email for development
    console.log("📧 Email sent (demo mode):")
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log(`Content: ${options.text || "HTML content"}`)

    return {
      success: true,
      messageId: `demo-${Date.now()}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email service unavailable",
    }
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: "Reset Your Password - Healthcare Insurance Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>You requested to reset your password for your Healthcare Insurance Portal account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Healthcare Insurance Portal</p>
      </div>
    `,
    text: `Reset Your Password\n\nYou requested to reset your password. Visit this link to reset it: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
  })
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Welcome to Healthcare Insurance Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Healthcare Insurance Portal!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for joining Healthcare Insurance Portal. Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>View and manage your insurance policies</li>
          <li>Submit and track claims</li>
          <li>Find healthcare providers</li>
          <li>Access predictive analytics</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Sign In Now</a>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Healthcare Insurance Portal</p>
      </div>
    `,
    text: `Welcome to Healthcare Insurance Portal!\n\nHi ${firstName},\n\nThank you for joining. Your account is ready. Sign in at: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  })
}
