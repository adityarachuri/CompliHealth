import { render, screen, waitFor } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"
import { AuthProvider, useAuth } from "@/contexts/auth-context"

type MockUser = {
  id: string
  email: string
  name: string
  role: string
  organization?: string
} | null

const authState: { user: MockUser; loading: boolean } = {
  user: {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    role: "customer",
    organization: "Personal Account",
  },
  loading: false,
}

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

beforeEach(() => {
  authState.user = {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    role: "customer",
    organization: "Personal Account",
  }
  authState.loading = false
  ;(useAuth as jest.Mock).mockImplementation(() => ({
    user: authState.user,
    loading: authState.loading,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }))
})

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

  it("should render nothing when there is no authenticated user", () => {
    authState.user = null

    const { container } = render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("should show role-specific content and quick actions for hospital staff", async () => {
    authState.user = { id: "2", email: "hospital@demo.com", name: "Dr. Sarah Johnson", role: "hospital" }

    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Hospital Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Patients Today")).toBeInTheDocument()
      expect(screen.getByText("Verify Insurance")).toBeInTheDocument()
    })
    // organization is undefined for this user, so the org line should not render
    expect(screen.queryByText("City General Hospital")).not.toBeInTheDocument()
    // Coverage Progress card is customer-only
    expect(screen.queryByText("Annual Coverage Usage")).not.toBeInTheDocument()
  })

  it("should show role-specific content and quick actions for tpa", async () => {
    authState.user = { id: "3", email: "tpa@demo.com", name: "Michael Chen", role: "tpa", organization: "HealthCare TPA Services" }

    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("TPA Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Claims Queue")).toBeInTheDocument()
      expect(screen.getByText("Review Claims")).toBeInTheDocument()
      expect(screen.getByText("HealthCare TPA Services")).toBeInTheDocument()
    })
  })

  it("should show role-specific content and quick actions for insurer", async () => {
    authState.user = {
      id: "4",
      email: "insurer@demo.com",
      name: "Lisa Rodriguez",
      role: "insurer",
      organization: "CompliHealth Insurance",
    }

    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Insurer Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Active Policies")).toBeInTheDocument()
      expect(screen.getByText("Generate Reports")).toBeInTheDocument()
    })
  })

  it("should fall back to a generic dashboard for an unrecognized role", async () => {
    authState.user = { id: "5", email: "auditor@demo.com", name: "Auditor Jane", role: "auditor" }

    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument()
      expect(screen.getByText("Welcome to CompliHealth")).toBeInTheDocument()
    })
    // Recent Activity section header always renders, but the list itself is empty for this role
    expect(screen.getByText("Recent Activity")).toBeInTheDocument()
  })
})
