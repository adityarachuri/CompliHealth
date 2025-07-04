import { AuthUtils } from "@/lib/auth-utils"

describe("AuthUtils", () => {
  describe("generateResetToken", () => {
    it("generates a valid reset token", () => {
      const email = "test@example.com"
      const token = AuthUtils.generateResetToken(email)

      expect(token.token).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token.hashedToken).toHaveLength(64) // SHA256 = 64 hex chars
      expect(token.email).toBe(email.toLowerCase())
      expect(token.expiresAt).toBeInstanceOf(Date)
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it("generates different tokens for same email", () => {
      const email = "test@example.com"
      const token1 = AuthUtils.generateResetToken(email)
      const token2 = AuthUtils.generateResetToken(email)

      expect(token1.token).not.toBe(token2.token)
      expect(token1.hashedToken).not.toBe(token2.hashedToken)
    })
  })

  describe("hashToken", () => {
    it("hashes token consistently", () => {
      const token = "test-token-123"
      const hash1 = AuthUtils.hashToken(token)
      const hash2 = AuthUtils.hashToken(token)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA256 = 64 hex chars
    })
  })

  describe("isValidTokenFormat", () => {
    it("validates correct token format", () => {
      const validToken = "a".repeat(64)
      expect(AuthUtils.isValidTokenFormat(validToken)).toBe(true)
    })

    it("rejects tokens that are too short", () => {
      const shortToken = "a".repeat(63)
      expect(AuthUtils.isValidTokenFormat(shortToken)).toBe(false)
    })
  })

  describe("validatePasswordStrength", () => {
    it("validates strong password", () => {
      const strongPassword = "StrongPass123!"
      const result = AuthUtils.validatePasswordStrength(strongPassword)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("validates weak password with all errors", () => {
      const weakPassword = "weak"
      const result = AuthUtils.validatePasswordStrength(weakPassword)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(5)
    })
  })
})
