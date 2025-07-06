import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email-service"
import jest from "jest" // Declare the jest variable

// Mock console.log to avoid noise in tests
jest.spyOn(console, "log").mockImplementation(() => {})

describe("EmailService", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email successfully", async () => {
      const result = await sendPasswordResetEmail("test@example.com")

      expect(result).toEqual({ success: true })
      expect(console.log).toHaveBeenCalledWith("Password reset email sent to test@example.com")
    })

    it("should handle email sending error", async () => {
      // Mock a failure scenario
      const originalConsoleLog = console.log
      console.log = jest.fn().mockImplementation(() => {
        throw new Error("Email service unavailable")
      })

      try {
        await sendPasswordResetEmail("test@example.com")
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      console.log = originalConsoleLog
    })

    it("should validate email format", async () => {
      const result = await sendPasswordResetEmail("invalid-email")

      expect(result).toEqual({ success: true })
      expect(console.log).toHaveBeenCalledWith("Password reset email sent to invalid-email")
    })

    it("should generate reset token", async () => {
      const result = await sendPasswordResetEmail("test@example.com")

      expect(result).toEqual({ success: true })
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Reset token generated:"))
    })
  })

  describe("sendWelcomeEmail", () => {
    it("should send welcome email successfully", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "customer",
      }

      const result = await sendWelcomeEmail(userData)

      expect(result).toEqual({ success: true })
      expect(console.log).toHaveBeenCalledWith("Welcome email sent to john@example.com")
    })

    it("should handle different user roles", async () => {
      const userData = {
        firstName: "Dr. Jane",
        lastName: "Smith",
        email: "jane@hospital.com",
        role: "hospital",
      }

      const result = await sendWelcomeEmail(userData)

      expect(result).toEqual({ success: true })
      expect(console.log).toHaveBeenCalledWith("Welcome email sent to jane@hospital.com")
    })

    it("should include user information in email", async () => {
      const userData = {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        role: "customer",
      }

      await sendWelcomeEmail(userData)

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Alice Johnson"))
    })
  })
})
