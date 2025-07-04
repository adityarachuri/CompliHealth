"use client"
import jest from "jest" // Import jest to fix the undeclared variable error
import { render, screen } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/contexts/auth-context"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Test component to access auth context
function TestComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <button onClick={() => signIn("customer@demo.com", "demo123")}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })
    mockPush.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("provides initial state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId("loading")).toHaveTextContent("not-loading")
    expect(screen.getByTestId("user")).toHaveTextContent("no-user")
  })

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useAuth must be used within an AuthProvider")

    consoleSpy.mockRestore()
  })
})
