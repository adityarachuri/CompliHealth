import { render, screen, waitFor } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Declare the jest variable

const mockUseAuth = {
  user: {
    id: "123",
    email: "test@example.com",
    user_metadata: { role: "customer", name: "Test User" },
  },
  loading: false,
  signOut: jest.fn(),
  signIn: jest.fn(),
}

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => mockUseAuth,
}))

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render dashboard metrics", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Welcome back, Test User")).toBeInTheDocument()
    })

    // Check for metric cards
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
    expect(screen.getByText("Pending Claims")).toBeInTheDocument()
    expect(screen.getByText("Coverage Amount")).toBeInTheDocument()
  })

  it("should display recent activities", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Recent Activities")).toBeInTheDocument()
    })
  })

  it("should show role-specific content for customer", async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      // Customer-specific content
      expect(screen.getByText("Your Health Summary")).toBeInTheDocument()
      expect(screen.getByText("Upcoming Appointments")).toBeInTheDocument()
    })
  })
})
