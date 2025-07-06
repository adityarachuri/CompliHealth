import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { APP_CONFIG } from "@/lib/config/app-config"
import { logger } from "@/lib/utils/logger"

export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm"
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  // Password hashing
  public static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(APP_CONFIG.security.bcryptRounds)
      return await bcrypt.hash(password, salt)
    } catch (error) {
      logger.error("Password hashing error:", error)
      throw new Error("Password hashing failed")
    }
  }

  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      logger.error("Password verification error:", error)
      return false
    }
  }

  // JWT token management
  public static generateToken(payload: any, expiresIn?: string): string {
    try {
      return jwt.sign(payload, APP_CONFIG.security.jwtSecret, {
        expiresIn: expiresIn || APP_CONFIG.security.jwtExpiresIn,
        issuer: APP_CONFIG.name,
        audience: APP_CONFIG.name,
      })
    } catch (error) {
      logger.error("Token generation error:", error)
      throw new Error("Token generation failed")
    }
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, APP_CONFIG.security.jwtSecret, {
        issuer: APP_CONFIG.name,
        audience: APP_CONFIG.name,
      })
    } catch (error) {
      logger.error("Token verification error:", error)
      throw new Error("Invalid token")
    }
  }

  // Data encryption/decryption
  public static encrypt(text: string, key?: string): string {
    try {
      const encryptionKey = key ? crypto.scryptSync(key, "salt", this.KEY_LENGTH) : crypto.randomBytes(this.KEY_LENGTH)
      const iv = crypto.randomBytes(this.IV_LENGTH)

      const cipher = crypto.createCipher(this.ALGORITHM, encryptionKey)
      cipher.setAAD(Buffer.from("additional-data"))

      let encrypted = cipher.update(text, "utf8", "hex")
      encrypted += cipher.final("hex")

      const tag = cipher.getAuthTag()

      return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`
    } catch (error) {
      logger.error("Encryption error:", error)
      throw new Error("Encryption failed")
    }
  }

  public static decrypt(encryptedText: string, key?: string): string {
    try {
      const [ivHex, tagHex, encrypted] = encryptedText.split(":")
      const encryptionKey = key ? crypto.scryptSync(key, "salt", this.KEY_LENGTH) : crypto.randomBytes(this.KEY_LENGTH)

      const iv = Buffer.from(ivHex, "hex")
      const tag = Buffer.from(tagHex, "hex")

      const decipher = crypto.createDecipher(this.ALGORITHM, encryptionKey)
      decipher.setAAD(Buffer.from("additional-data"))
      decipher.setAuthTag(tag)

      let decrypted = decipher.update(encrypted, "hex", "utf8")
      decrypted += decipher.final("utf8")

      return decrypted
    } catch (error) {
      logger.error("Decryption error:", error)
      throw new Error("Decryption failed")
    }
  }

  // Generate secure random tokens
  public static generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  // Generate API keys
  public static generateApiKey(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = crypto.randomBytes(16).toString("hex")
    return `hip_${timestamp}_${randomPart}`
  }

  // Hash sensitive data
  public static hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  // Generate HMAC signature
  public static generateSignature(data: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(data).digest("hex")
  }

  // Verify HMAC signature
  public static verifySignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(data, secret)
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }
}
