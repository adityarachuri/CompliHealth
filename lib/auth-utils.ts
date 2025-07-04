import { supabase } from "./supabase"
import { EmailService } from "./email-service"

export interface PasswordResetToken {
  token: string
  email: string
  expiresAt: Date
}

// In-memory store for demo purposes - use Redis or database in production
const resetTokens = new Map<string, PasswordResetToken>()

export async function generateResetToken(email: string): Promise<string> {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

  resetTokens.set(token, {
    token,
    email,
    expiresAt,
  })

  // Clean up expired tokens
  setTimeout(
    () => {
      resetTokens.delete(token)
    },
    60 * 60 * 1000,
  ) // 1 hour

  return token
}

export function validateResetToken(token: string): PasswordResetToken | null {
  const resetToken = resetTokens.get(token)

  if (!resetToken) {
    return null
  }

  if (new Date() > resetToken.expiresAt) {
    resetTokens.delete(token)
    return null
  }

  return resetToken
}

export function invalidateResetToken(token: string): void {
  resetTokens.delete(token)
}

export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  try {
    // Check if user exists
    const { data: user } = await supabase.from("users").select("email").eq("email", email).single()

    if (!user) {
      // Don't reveal if email exists or not for security
      return true
    }

    const token = await generateResetToken(email)
    const emailService = EmailService.getInstance()

    return await emailService.sendPasswordResetEmail(email, token)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const resetToken = validateResetToken(token)

    if (!resetToken) {
      return false
    }

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error updating password:", error)
      return false
    }

    // Invalidate the token
    invalidateResetToken(token)

    return true
  } catch (error) {
    console.error("Error resetting password:", error)
    return false
  }
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Rate limiting for password reset requests
const resetAttempts = new Map<string, { count: number; lastAttempt: Date }>()

export function checkRateLimit(email: string): boolean {
  const now = new Date()
  const attempt = resetAttempts.get(email)

  if (!attempt) {
    resetAttempts.set(email, { count: 1, lastAttempt: now })
    return true
  }

  // Reset count if last attempt was more than 1 hour ago
  if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1000) {
    resetAttempts.set(email, { count: 1, lastAttempt: now })
    return true
  }

  // Allow max 3 attempts per hour
  if (attempt.count >= 3) {
    return false
  }

  attempt.count++
  attempt.lastAttempt = now
  resetAttempts.set(email, attempt)

  return true
}
