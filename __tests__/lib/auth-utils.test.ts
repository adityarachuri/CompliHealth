import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
} from "@/lib/auth-utils"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"
import jest from "jest" // Import jest to declare the variable

// Mock dependencies
jest.mock("@/lib/supabase")
jest.mock("@/lib/email-service")

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockIsSupabaseConfigured = isSupabaseConfigured as jest.MockedFunction<typeof isSupabaseConfigured>
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    origin: "http://localhost:3000",
  },
  writable: true,
})

describe("auth-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset console mocks
    jest.mocked(console.log).mockClear()
    jest.mocked(console.error).mockClear()
  })

  describe("signIn", () => {
    it("should successfully sign in with demo customer credentials", async () => {
      const result = await signIn("demo@healthinsurance.com", "demo123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("demo@healthinsurance.com")
      expect(result.user?.role).toBe("customer")
      expect(result.user?.firstName).toBe("Demo")
      expect(result.user?.lastName).toBe("Customer")
      expect(result.error).toBeUndefined()
    })

    it("should successfully sign in with demo hospital credentials", async () => {
      const result = await signIn("hospital@demo.com", "demo123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("hospital@demo.com")
      expect(result.user?.role).toBe("hospital")
      expect(result.user?.firstName).toBe("Hospital")
      expect(result.user?.lastName).toBe("Admin")
      expect(result.error).toBeUndefined()
    })

    it("should successfully sign in with demo TPA credentials", async () => {
      const result = await signIn("tpa@demo.com", "demo123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("tpa@demo.com")
      expect(result.user?.role).toBe("tpa")
      expect(result.error).toBeUndefined()
    })

    it("should successfully sign in with demo insurer credentials", async () => {
      const result = await signIn("insurer@demo.com", "demo123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("insurer@demo.com")
      expect(result.user?.role).toBe("insurer")
      expect(result.error).toBeUndefined()
    })

    it("should successfully sign in with demo admin credentials", async () => {
      const result = await signIn("admin@demo.com", "admin123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("admin@demo.com")
      expect(result.user?.role).toBe("admin")
      expect(result.error).toBeUndefined()
    })

    it("should handle case-insensitive email matching", async () => {
      const result = await signIn("DEMO@HEALTHINSURANCE.COM", "demo123456")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("demo@healthinsurance.com")
      expect(result.user?.role).toBe("customer")
      expect(result.error).toBeUndefined()
    })

    it("should handle email and password trimming", async () => {
      const result = await signIn("  demo@healthinsurance.com  ", "  demo123456  ")

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("demo@healthinsurance.com")
      expect(result.user?.role).toBe("customer")
      expect(result.error).toBeUndefined()
    })

    it("should reject invalid demo credentials", async () => {
      const result = await signIn("demo@healthinsurance.com", "wrongpassword")

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Invalid email or password")
    })

    it("should reject non-existent demo user", async () => {
      const result = await signIn("nonexistent@test.com", "password123")

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Invalid email or password")
    })

    it("should use Supabase when configured and demo user not found", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "supabase-user-1",
            email: "real@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      const mockProfile = {
        id: "supabase-user-1",
        email: "real@user.com",
        first_name: "Real",
        last_name: "User",
        role: "customer",
        organization: "Real Company",
        avatar_url: null,
        is_active: true,
        email_verified: true,
        last_login: null,
        preferences: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await signIn("real@user.com", "realpassword")

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "real@user.com",
        password: "realpassword",
      })
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe("real@user.com")
      expect(result.user?.firstName).toBe("Real")
      expect(result.user?.lastName).toBe("User")
    })

    it("should handle Supabase authentication errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      } as any)

      const result = await signIn("real@user.com", "wrongpassword")

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Invalid login credentials")
    })

    it("should handle Supabase profile fetch errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "supabase-user-1",
            email: "real@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Profile not found" } }),
          }),
        }),
      } as any)

      const result = await signIn("real@user.com", "realpassword")

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Failed to load user profile")
    })

    it("should handle unexpected errors gracefully", async () => {
      mockIsSupabaseConfigured.mockImplementation(() => {
        throw new Error("Unexpected error")
      })

      const result = await signIn("test@test.com", "password")

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("An unexpected error occurred during sign in")
    })
  })

  describe("signUp", () => {
    it("should return error in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)

      const result = await signUp({
        email: "new@user.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: "customer",
      })

      expect(result.error).toBe("Registration is not available in demo mode")
      expect(result.user).toBeUndefined()
    })

    it("should successfully sign up with Supabase", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "new-user-1",
            email: "new@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any)

      const result = await signUp({
        email: "new@user.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: "customer",
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "new@user.com",
        password: "password123",
        options: {
          data: {
            first_name: "New",
            last_name: "User",
            phone: undefined,
            date_of_birth: undefined,
            role: "customer",
            organization: undefined,
          },
        },
      })
      expect(result.error).toBeUndefined()
    })

    it("should handle Supabase signup errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "Email already registered" },
      } as any)

      const result = await signUp({
        email: "existing@user.com",
        password: "password123",
        firstName: "Existing",
        lastName: "User",
        role: "customer",
      })

      expect(result.error).toBe("Email already registered")
      expect(result.user).toBeUndefined()
    })

    it("should handle profile creation errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "new-user-1",
            email: "new@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: "Profile creation failed" } }),
      } as any)

      const result = await signUp({
        email: "new@user.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: "customer",
      })

      expect(result.error).toBe("Failed to create user profile")
      expect(result.user).toBeUndefined()
    })

    it("should handle unexpected signup errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signUp.mockRejectedValue(new Error("Network error"))

      const result = await signUp({
        email: "new@user.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: "customer",
      })

      expect(result.error).toBe("An unexpected error occurred during registration")
    })
  })

  describe("signOut", () => {
    it("should sign out successfully with Supabase", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("should handle Supabase signout errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: "Signout failed" } })

      const result = await signOut()

      expect(result.error).toBe("Signout failed")
    })

    it("should work in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)

      const result = await signOut()

      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("should handle unexpected signout errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.signOut.mockRejectedValue(new Error("Network error"))

      const result = await signOut()

      expect(result.error).toBe("An unexpected error occurred during sign out")
    })
  })

  describe("getCurrentUser", () => {
    it("should return null in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it("should get current user from Supabase", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "current-user-1",
            email: "current@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      const mockProfile = {
        id: "current-user-1",
        email: "current@user.com",
        first_name: "Current",
        last_name: "User",
        role: "customer",
        organization: "Current Company",
        avatar_url: null,
        is_active: true,
        email_verified: true,
        last_login: null,
        preferences: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      } as any)

      const result = await getCurrentUser()

      expect(result).toBeDefined()
      expect(result?.email).toBe("current@user.com")
      expect(result?.firstName).toBe("Current")
      expect(result?.lastName).toBe("User")
    })

    it("should return null when no user is authenticated", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it("should handle profile fetch errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "current-user-1",
            email: "current@user.com",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      } as any)

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Profile not found" } }),
          }),
        }),
      } as any)

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it("should handle unexpected errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.getUser.mockRejectedValue(new Error("Network error"))

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe("updateUserProfile", () => {
    it("should return error in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)

      const result = await updateUserProfile("user-1", { firstName: "Updated" })

      expect(result.error).toBe("Profile updates are not available in demo mode")
    })

    it("should update user profile successfully", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await updateUserProfile("user-1", {
        firstName: "Updated",
        lastName: "Name",
      })

      expect(result.error).toBeUndefined()
    })

    it("should handle update errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: "Update failed" } }),
        }),
      } as any)

      const result = await updateUserProfile("user-1", { firstName: "Updated" })

      expect(result.error).toBe("Update failed")
    })

    it("should handle unexpected update errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.from.mockImplementation(() => {
        throw new Error("Network error")
      })

      const result = await updateUserProfile("user-1", { firstName: "Updated" })

      expect(result.error).toBe("An unexpected error occurred while updating profile")
    })
  })

  describe("requestPasswordReset", () => {
    it("should send demo email in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)
      mockSendEmail.mockResolvedValue(undefined)

      const result = await requestPasswordReset("test@example.com")

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Password Reset Request (Demo)",
        html: expect.stringContaining("This is a demo email"),
      })
      expect(result.error).toBeUndefined()
    })

    it("should use Supabase password reset when configured", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await requestPasswordReset("test@example.com")

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@example.com", {
        redirectTo: "http://localhost:3000/reset-password",
      })
      expect(result.error).toBeUndefined()
    })

    it("should handle Supabase password reset errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "Email not found" },
      })

      const result = await requestPasswordReset("nonexistent@example.com")

      expect(result.error).toBe("Email not found")
    })

    it("should handle unexpected password reset errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)
      mockSendEmail.mockRejectedValue(new Error("Email service error"))

      const result = await requestPasswordReset("test@example.com")

      expect(result.error).toBe("An unexpected error occurred while requesting password reset")
    })
  })

  describe("resetPassword", () => {
    it("should return error in demo mode", async () => {
      mockIsSupabaseConfigured.mockReturnValue(false)

      const result = await resetPassword("newpassword123")

      expect(result.error).toBe("Password reset is not available in demo mode")
    })

    it("should reset password successfully with Supabase", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      const result = await resetPassword("newpassword123")

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newpassword123",
      })
      expect(result.error).toBeUndefined()
    })

    it("should handle password reset errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: "Password update failed" },
      })

      const result = await resetPassword("newpassword123")

      expect(result.error).toBe("Password update failed")
    })

    it("should handle unexpected password reset errors", async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockSupabase.auth.updateUser.mockRejectedValue(new Error("Network error"))

      const result = await resetPassword("newpassword123")

      expect(result.error).toBe("An unexpected error occurred while resetting password")
    })
  })
})
