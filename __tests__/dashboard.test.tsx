import { render, screen, waitFor } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"
import { AuthProvider } from "@/contexts/auth-context"

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: {
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: "customer",
      organization: "Personal Account",
    },
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}))

describe("Dashboard Page", () => {
  it("should render dashboard metrics", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByText("Test User").length).toBeGreaterThan(0)
    })

    // Check for customer metric cards
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
    expect(screen.getByText("Recent Claims")).toBeInTheDocument()
    expect(screen.getByText("Coverage Used")).toBeInTheDocument()
    expect(screen.getByText("Next Premium")).toBeInTheDocument()
  })

  it("should display recent activity", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
    })
  })

  it("should show role-specific content for customer", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Customer Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
      expect(screen.getByText("Annual Coverage Usage")).toBeInTheDocument()
    })
  })
})
