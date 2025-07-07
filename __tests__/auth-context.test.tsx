"use client"

import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock component to test the context
function TestComponent() {
  const { user, signIn, signOut, loading } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <button onClick={() => signIn("test@example.com", "password")}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should provide initial loading state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId("loading")).toHaveTextContent("loading")
    expect(screen.getByTestId("user")).toHaveTextContent("no-user")
  })

  it("should handle successful sign in", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      user_metadata: { role: "customer", name: "Test User" },
    }
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    const signInButton = screen.getByText("Sign In")
    signInButton.click()

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password",
      })
    })
  })

  it("should handle sign in error", async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid credentials" },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    const signInButton = screen.getByText("Sign In")
    signInButton.click()

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    })
  })

  it("should handle sign out", async () => {
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    const signOutButton = screen.getByText("Sign Out")
    signOutButton.click()

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })
})
