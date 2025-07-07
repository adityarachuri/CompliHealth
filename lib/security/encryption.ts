import crypto from "crypto"
import bcrypt from "bcryptjs"
import { APP_CONFIG } from "@/lib/config/app-config"

export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm"
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, APP_CONFIG.security.bcryptRounds)
  }

  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  public static encrypt(text: string, key?: string): string {
    const encryptionKey = key
      ? crypto.scryptSync(key, "salt", EncryptionService.KEY_LENGTH)
      : crypto.scryptSync(APP_CONFIG.security.jwtSecret, "salt", EncryptionService.KEY_LENGTH)

    const iv = crypto.randomBytes(EncryptionService.IV_LENGTH)
    const cipher = crypto.createCipher(EncryptionService.ALGORITHM, encryptionKey)
    cipher.setAAD(Buffer.from("healthcare-portal", "utf8"))

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted
  }

  public static decrypt(encryptedText: string, key?: string): string {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format")
    }

    const [ivHex, tagHex, encrypted] = parts
    const encryptionKey = key
      ? crypto.scryptSync(key, "salt", EncryptionService.KEY_LENGTH)
      : crypto.scryptSync(APP_CONFIG.security.jwtSecret, "salt", EncryptionService.KEY_LENGTH)

    const iv = Buffer.from(ivHex, "hex")
    const tag = Buffer.from(tagHex, "hex")

    const decipher = crypto.createDecipher(EncryptionService.ALGORITHM, encryptionKey)
    decipher.setAAD(Buffer.from("healthcare-portal", "utf8"))
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  public static generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  public static generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  public static generateHMAC(data: string, secret?: string): string {
    const key = secret || APP_CONFIG.security.jwtSecret
    return crypto.createHmac("sha256", key).update(data).digest("hex")
  }

  public static verifyHMAC(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.generateHMAC(data, secret)
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }
}
