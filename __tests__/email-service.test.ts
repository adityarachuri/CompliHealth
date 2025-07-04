import { EmailService, emailService } from "@/lib/email-service"
import jest from "jest"

// Mock environment variables
const originalEnv = process.env

describe("EmailService", () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    // Clear console.log and console.error mocks
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe("Singleton Pattern", () => {
    it("returns the same instance", () => {
      const instance1 = EmailService.getInstance()
      const instance2 = EmailService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it("exports singleton instance", () => {
      expect(emailService).toBeInstanceOf(EmailService)
    })
  })

  describe("sendPasswordResetEmail", () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it("sends password reset email successfully", async () => {
      const result = await emailService.sendPasswordResetEmail("test@example.com", "reset-token-123")

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Password reset email would be sent:",
        expect.objectContaining({
          to: "test@example.com",
          resetUrl: expect.stringContaining("reset-token-123"),
          token: "reset-token-123",
        }),
      )
    })
  })
})
