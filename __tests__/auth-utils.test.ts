import { validatePasswordStrength, generateResetToken, resetPassword } from "@/lib/auth-utils"

describe("AuthUtils", () => {
  describe("validatePasswordStrength", () => {
    it("should validate strong password", () => {
      const result = validatePasswordStrength("StrongPass123!")

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject weak passwords", () => {
      const result = validatePasswordStrength("weak")

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must be at least 8 characters long")
    })

    it("should require uppercase letter", () => {
      const result = validatePasswordStrength("lowercase123!")

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one uppercase letter")
    })

    it("should require lowercase letter", () => {
      const result = validatePasswordStrength("UPPERCASE123!")

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one lowercase letter")
    })

    it("should require number", () => {
      const result = validatePasswordStrength("NoNumbers!")

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one number")
    })

    it("should require special character", () => {
      const result = validatePasswordStrength("NoSpecial123")

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one special character")
    })
  })

  describe("generateResetToken", () => {
    it("should generate a valid token", () => {
      const token = generateResetToken()

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.length).toBeGreaterThan(0)
    })

    it("should generate unique tokens", () => {
      const token1 = generateResetToken()
      const token2 = generateResetToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const result = await resetPassword("valid-token", "NewPassword123!")

      expect(result).toEqual({ success: true })
    })

    it("should reject invalid token", async () => {
      try {
        await resetPassword("invalid-token", "NewPassword123!")
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain("Invalid or expired token")
      }
    })

    it("should validate new password strength", async () => {
      try {
        await resetPassword("valid-token", "weak")
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain("Password does not meet requirements")
      }
    })
  })
})
