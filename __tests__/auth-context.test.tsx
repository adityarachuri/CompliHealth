"use client"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "@/contexts/auth-context"

const STORAGE_KEY = "complihealth-user"

// Mock component to exercise the context
function TestComponent() {
  const { user, signIn, signOut, loading } = useAuth()

  const handleSignIn = async () => {
    try {
      await signIn("customer@demo.com", "wrong-password")
    } catch (err) {
      // surfaced via the "error" testid below
      const el = document.getElementById("error-slot")
      if (el) el.textContent = err instanceof Error ? err.message : "error"
    }
  }

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <div id="error-slot" data-testid="error" />
      <button onClick={() => signIn("customer@demo.com", "demo123")}>Sign In</button>
      <button onClick={handleSignIn}>Sign In Wrong Password</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("should finish loading with no authenticated user when no session is stored", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading")
    })
    expect(screen.getByTestId("user")).toHaveTextContent("no-user")
  })

  it("should restore a previously signed-in user from localStorage", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: "1", email: "customer@demo.com", name: "John Smith", role: "customer" }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("customer@demo.com")
    })
  })

  it("should sign in a valid demo account and persist the session", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("not-loading"))

    await user.click(screen.getByText("Sign In"))

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("customer@demo.com")
    })
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("customer@demo.com")
  })

  it("should reject an incorrect password", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("not-loading"))

    await user.click(screen.getByText("Sign In Wrong Password"))

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(/invalid password/i)
    })
    expect(screen.getByTestId("user")).toHaveTextContent("no-user")
  })

  it("should sign out and clear the stored session", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("not-loading"))
    await user.click(screen.getByText("Sign In"))
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("customer@demo.com"))

    await user.click(screen.getByText("Sign Out"))

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no-user")
    })
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
