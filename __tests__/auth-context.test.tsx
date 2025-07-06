"use client"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

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

// Mock useRouter
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, signIn, signOut, signUp, resetPassword, updateProfile } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="user-info">{user ? `${user.firstName} ${user.lastName} (${user.email})` : "Not logged in"}</div>
      <button onClick={() => signIn("demo@healthinsurance.com", "demo123456")}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button
        onClick={() =>
          signUp("new@test.com", "password123", {
            firstName: "New",
            lastName: "User",
            phone: "+1-555-0000",
            dateOfBirth: "1990-01-01",
            role: "customer",
          })
        }
      >
        Sign Up
      </button>
      <button onClick={() => resetPassword("test@example.com")}>Reset Password</button>
      <button onClick={() => updateProfile({ firstName: "Updated" })}>Update Profile</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("provides initial loading state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("loads user from localStorage on mount", async () => {
    const storedUser = {
      id: "stored-user",
      email: "stored@test.com",
      firstName: "Stored",
      lastName: "User",
      phone: "+1-555-0123",
      dateOfBirth: "1990-01-01",
      role: "customer",
      emailVerified: true,
      createdAt: "2024-01-01T00:00:00Z",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Stored User (stored@test.com)")).toBeInTheDocument()
    })
  })

  it("handles corrupted localStorage data gracefully", async () => {
    localStorageMock.getItem.mockReturnValue("invalid-json")

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("health-insurance-user")
  })

  it("signs in with demo credentials successfully", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signInButton = screen.getByText("Sign In")
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText("Demo User (demo@healthinsurance.com)")).toBeInTheDocument()
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "health-insurance-user",
      expect.stringContaining("demo@healthinsurance.com"),
    )
  })

  it("handles invalid login credentials", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    // Mock signIn with invalid credentials
    const { signIn } = useAuth()
    const result = await signIn("invalid@test.com", "wrongpassword")

    expect(result.error).toBe("Invalid email or password")
  })

  it("signs out user successfully", async () => {
    const storedUser = {
      id: "test-user",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "+1-555-0123",
      dateOfBirth: "1990-01-01",
      role: "customer",
      emailVerified: true,
      createdAt: "2024-01-01T00:00:00Z",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Test User (test@example.com)")).toBeInTheDocument()
    })

    const signOutButton = screen.getByText("Sign Out")
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("health-insurance-user")
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("handles user registration", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const signUpButton = screen.getByText("Sign Up")
    fireEvent.click(signUpButton)

    // Registration should complete without error
    await waitFor(() => {
      // The mock implementation doesn't actually sign in the user after registration
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })
  })

  it("handles password reset request", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    const resetPasswordButton = screen.getByText("Reset Password")
    fireEvent.click(resetPasswordButton)

    // Password reset should complete without error
    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })
  })

  it("updates user profile", async () => {
    const storedUser = {
      id: "test-user",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "+1-555-0123",
      dateOfBirth: "1990-01-01",
      role: "customer",
      emailVerified: true,
      createdAt: "2024-01-01T00:00:00Z",
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Test User (test@example.com)")).toBeInTheDocument()
    })

    const updateProfileButton = screen.getByText("Update Profile")
    fireEvent.click(updateProfileButton)

    await waitFor(() => {
      expect(screen.getByText("Updated User (test@example.com)")).toBeInTheDocument()
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith("health-insurance-user", expect.stringContaining("Updated"))
  })

  it("throws error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useAuth must be used within an AuthProvider")

    consoleSpy.mockRestore()
  })

  describe("Demo Users", () => {
    it("signs in hospital user correctly", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText("Not logged in")).toBeInTheDocument()
      })

      // Mock signIn with hospital credentials
      const { signIn } = useAuth()
      const result = await signIn("hospital@demo.com", "demo123456")

      expect(result.error).toBeUndefined()
    })

    it("signs in TPA user correctly", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText("Not logged in")).toBeInTheDocument()
      })

      // Mock signIn with TPA credentials
      const { signIn } = useAuth()
      const result = await signIn("tpa@demo.com", "demo123456")

      expect(result.error).toBeUndefined()
    })

    it("signs in insurer user correctly", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText("Not logged in")).toBeInTheDocument()
      })

      // Mock signIn with insurer credentials
      const { signIn } = useAuth()
      const result = await signIn("insurer@demo.com", "demo123456")

      expect(result.error).toBeUndefined()
    })
  })
})
