"use client"

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import * as authUtils from "@/lib/auth-utils"
import * as supabaseLib from "@/lib/supabase"
import jest from "jest" // Import jest to declare it

// Mock dependencies
jest.mock("next/navigation")
jest.mock("@/lib/auth-utils")
jest.mock("@/lib/supabase")

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>
const mockSupabaseLib = supabaseLib as jest.Mocked<typeof supabaseLib>

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, signIn, signOut, signUp, updateProfile, requestPasswordReset, resetPassword, refreshUser } =
    useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="user-info">{user ? `${user.firstName} ${user.lastName} (${user.email})` : "Not logged in"}</div>
      <div data-testid="user-role">{user?.role || "No role"}</div>
      <button onClick={() => signIn("demo@healthinsurance.com", "demo123456")} data-testid="sign-in">
        Sign In
      </button>
      <button onClick={() => signOut()} data-testid="sign-out">
        Sign Out
      </button>
      <button
        onClick={() =>
          signUp({
            email: "new@test.com",
            password: "password123",
            firstName: "New",
            lastName: "User",
            role: "customer",
          })
        }
        data-testid="sign-up"
      >
        Sign Up
      </button>
      <button onClick={() => updateProfile({ firstName: "Updated" })} data-testid="update-profile">
        Update Profile
      </button>
      <button onClick={() => requestPasswordReset("test@example.com")} data-testid="request-reset">
        Request Reset
      </button>
      <button onClick={() => resetPassword("newpassword123")} data-testid="reset-password">
        Reset Password
      </button>
      <button onClick={() => refreshUser()} data-testid="refresh-user">
        Refresh User
      </button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter)
    mockSupabaseLib.isSupabaseConfigured.mockReturnValue(false)
    mockSupabaseLib.supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    mockSupabaseLib.supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
    localStorageMock.getItem.mockReturnValue(null)

    // Clear console mocks
    jest.mocked(console.log).mockClear()
    jest.mocked(console.error).mockClear()
  })

  it("should provide initial loading state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })
  })

  it("should load user from localStorage in demo mode", async () => {
    const storedUser = {
      id: "demo-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Demo Customer (demo@healthinsurance.com)")).toBeInTheDocument()
      expect(screen.getByText("customer")).toBeInTheDocument()
    })
  })

  it("should handle corrupted localStorage data gracefully", async () => {
    localStorageMock.getItem.mockReturnValue("invalid-json")

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("demo-user")
  })

  it("should sign in successfully", async () => {
    const mockUser = {
      id: "demo-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
    }

    mockAuthUtils.signIn.mockResolvedValue({ user: mockUser })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signInButton = screen.getByTestId("sign-in")
    await act(async () => {
      fireEvent.click(signInButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Demo Customer (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    expect(mockAuthUtils.signIn).toHaveBeenCalledWith("demo@healthinsurance.com", "demo123456")
    expect(localStorageMock.setItem).toHaveBeenCalledWith("demo-user", JSON.stringify(mockUser))
  })

  it("should handle sign in errors", async () => {
    mockAuthUtils.signIn.mockResolvedValue({ error: "Invalid credentials" })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signInButton = screen.getByTestId("sign-in")
    await act(async () => {
      fireEvent.click(signInButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(mockAuthUtils.signIn).toHaveBeenCalled()
  })

  it("should sign out successfully", async () => {
    const storedUser = {
      id: "demo-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))
    mockAuthUtils.signOut.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Demo Customer (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    const signOutButton = screen.getByTestId("sign-out")
    await act(async () => {
      fireEvent.click(signOutButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(mockAuthUtils.signOut).toHaveBeenCalled()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("demo-user")
    expect(mockRouter.push).toHaveBeenCalledWith("/login")
  })

  it("should sign up successfully", async () => {
    mockAuthUtils.signUp.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signUpButton = screen.getByTestId("sign-up")
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    expect(mockAuthUtils.signUp).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "password123",
      firstName: "New",
      lastName: "User",
      role: "customer",
    })
  })

  it("should handle sign up errors", async () => {
    mockAuthUtils.signUp.mockResolvedValue({ error: "Email already exists" })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signUpButton = screen.getByTestId("sign-up")
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    expect(mockAuthUtils.signUp).toHaveBeenCalled()
  })

  it("should update profile in demo mode", async () => {
    const storedUser = {
      id: "demo-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Demo Customer (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    const updateButton = screen.getByTestId("update-profile")
    await act(async () => {
      fireEvent.click(updateButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Updated Customer (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "demo-user",
      JSON.stringify({ ...storedUser, firstName: "Updated" }),
    )
  })

  it("should update profile with Supabase when configured", async () => {
    mockSupabaseLib.isSupabaseConfigured.mockReturnValue(true)
    mockAuthUtils.updateUserProfile.mockResolvedValue({})
    mockAuthUtils.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      firstName: "Updated",
      lastName: "User",
      role: "customer",
    } as any)

    const storedUser = {
      id: "user-1",
      email: "user@test.com",
      firstName: "User",
      lastName: "User",
      role: "customer",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("User User (user@test.com)")).toBeInTheDocument()
    })

    const updateButton = screen.getByTestId("update-profile")
    await act(async () => {
      fireEvent.click(updateButton)
    })

    expect(mockAuthUtils.updateUserProfile).toHaveBeenCalledWith("user-1", { firstName: "Updated" })
  })

  it("should handle profile update when no user is logged in", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const updateButton = screen.getByTestId("update-profile")
    await act(async () => {
      fireEvent.click(updateButton)
    })

    // Should handle gracefully without errors
    expect(screen.getByText("Not logged in")).toBeInTheDocument()
  })

  it("should request password reset", async () => {
    mockAuthUtils.requestPasswordReset.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const resetButton = screen.getByTestId("request-reset")
    await act(async () => {
      fireEvent.click(resetButton)
    })

    expect(mockAuthUtils.requestPasswordReset).toHaveBeenCalledWith("test@example.com")
  })

  it("should reset password", async () => {
    mockAuthUtils.resetPassword.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const resetButton = screen.getByTestId("reset-password")
    await act(async () => {
      fireEvent.click(resetButton)
    })

    expect(mockAuthUtils.resetPassword).toHaveBeenCalledWith("newpassword123")
  })

  it("should refresh user when Supabase is configured", async () => {
    mockSupabaseLib.isSupabaseConfigured.mockReturnValue(true)
    mockAuthUtils.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      firstName: "Refreshed",
      lastName: "User",
      role: "customer",
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const refreshButton = screen.getByTestId("refresh-user")
    await act(async () => {
      fireEvent.click(refreshButton)
    })

    expect(mockAuthUtils.getCurrentUser).toHaveBeenCalled()
  })

  it("should handle Supabase session initialization", async () => {
    mockSupabaseLib.isSupabaseConfigured.mockReturnValue(true)
    mockSupabaseLib.supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "user-1", email: "user@test.com" },
        },
      },
      error: null,
    })
    mockAuthUtils.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      firstName: "Supabase",
      lastName: "User",
      role: "customer",
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Supabase User (user@test.com)")).toBeInTheDocument()
    })

    expect(mockSupabaseLib.supabase.auth.getSession).toHaveBeenCalled()
    expect(mockAuthUtils.getCurrentUser).toHaveBeenCalled()
  })

  it("should handle auth state changes", async () => {
    mockSupabaseLib.isSupabaseConfigured.mockReturnValue(true)

    let authStateCallback: (event: string, session: any) => void = () => {}

    mockSupabaseLib.supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      }
    })

    mockAuthUtils.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      firstName: "Auth",
      lastName: "User",
      role: "customer",
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    // Simulate SIGNED_IN event
    await act(async () => {
      authStateCallback("SIGNED_IN", {
        user: { id: "user-1", email: "user@test.com" },
      })
    })

    await waitFor(() => {
      expect(screen.getByText("Auth User (user@test.com)")).toBeInTheDocument()
    })

    // Simulate SIGNED_OUT event
    await act(async () => {
      authStateCallback("SIGNED_OUT", null)
    })

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })
  })

  it("should throw error when useAuth is used outside provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useAuth must be used within an AuthProvider")

    consoleSpy.mockRestore()
  })

  it("should handle initialization errors gracefully", async () => {
    mockSupabaseLib.isSupabaseConfigured.mockImplementation(() => {
      throw new Error("Initialization error")
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    // Should not crash and should complete initialization
    expect(console.error).toHaveBeenCalledWith("💥 Error initializing auth:", expect.any(Error))
  })

  it("should handle sign in unexpected errors", async () => {
    mockAuthUtils.signIn.mockRejectedValue(new Error("Network error"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signInButton = screen.getByTestId("sign-in")
    await act(async () => {
      fireEvent.click(signInButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(mockAuthUtils.signIn).toHaveBeenCalled()
  })

  it("should handle sign up unexpected errors", async () => {
    mockAuthUtils.signUp.mockRejectedValue(new Error("Network error"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signUpButton = screen.getByTestId("sign-up")
    await act(async () => {
      fireEvent.click(signUpButton)
    })

    expect(mockAuthUtils.signUp).toHaveBeenCalled()
  })

  it("should handle sign out errors", async () => {
    const storedUser = {
      id: "demo-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))
    mockAuthUtils.signOut.mockRejectedValue(new Error("Network error"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Demo Customer (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    const signOutButton = screen.getByTestId("sign-out")
    await act(async () => {
      fireEvent.click(signOutButton)
    })

    // Should still clear user state even if signOut fails
    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(mockAuthUtils.signOut).toHaveBeenCalled()
  })
})
