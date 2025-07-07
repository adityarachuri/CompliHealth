import { render, screen, fireEvent } from "@testing-library/react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare the variable

const mockUser = {
  id: "123",
  email: "test@example.com",
  user_metadata: { role: "customer", name: "Test User" },
}

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: mockUser,
    signOut: jest.fn(),
    loading: false,
  }),
}))

describe("MainLayout", () => {
  it("should render navigation for customer role", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("My Policies")).toBeInTheDocument()
    expect(screen.getByText("Claims")).toBeInTheDocument()
    expect(screen.getByText("Find Providers")).toBeInTheDocument()
    expect(screen.getByText("Coverage")).toBeInTheDocument()
  })

  it("should toggle mobile sidebar", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    const menuButton = screen.getByRole("button", { name: /menu/i })
    fireEvent.click(menuButton)

    // Check if sidebar is visible (this would depend on your implementation)
    expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument()
  })

  it("should display user name in header", () => {
    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    expect(screen.getByText("Test User")).toBeInTheDocument()
  })

  it("should handle sign out", () => {
    const mockSignOut = jest.fn()

    jest.mock("@/contexts/auth-context", () => ({
      useAuth: () => ({
        user: mockUser,
        signOut: mockSignOut,
        loading: false,
      }),
    }))

    render(
      <AuthProvider>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </AuthProvider>,
    )

    const signOutButton = screen.getByText("Sign Out")
    fireEvent.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })
})
