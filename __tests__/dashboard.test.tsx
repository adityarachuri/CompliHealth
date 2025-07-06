import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import Dashboard from "@/app/dashboard/page"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the auth context
const mockAuthContext = {
  user: {
    id: "1",
    email: "test@example.com",
    role: "customer",
    name: "Test User",
    organization: null,
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  loading: false,
  updateProfile: jest.fn(),
}

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders dashboard page correctly", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })
  })

  it("displays key statistics for customer role", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText("Active Policies")).toBeInTheDocument()
      expect(screen.getByText("Pending Claims")).toBeInTheDocument()
      expect(screen.getByText("Coverage Used")).toBeInTheDocument()
    })
  })

  it("shows recent claims section", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText("Recent Claims")).toBeInTheDocument()
    })
  })

  it("displays upcoming appointments", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText("Upcoming Appointments")).toBeInTheDocument()
    })
  })

  it("shows coverage overview with progress bars", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText("Coverage Overview")).toBeInTheDocument()
    })
  })

  it("renders status badges correctly", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      const badges = screen.getAllByRole("status")
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it("displays trending indicators", async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/trending/i)).toBeInTheDocument()
    })
  })

  it("handles loading state correctly", () => {
    const loadingContext = { ...mockAuthContext, loading: true }
    jest.mocked(require("@/contexts/auth-context").useAuth).mockReturnValue(loadingContext)

    render(<Dashboard />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})
