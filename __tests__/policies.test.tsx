import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import Policies from "@/app/policies/page"
import jest from "jest" // Import jest to fix the undeclared variable error

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

describe("Policies", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders policies page correctly", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Insurance Policies")).toBeInTheDocument()
    })
  })

  it("displays policy overview cards", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Active Policies")).toBeInTheDocument()
      expect(screen.getByText("Premium Health Plan")).toBeInTheDocument()
      expect(screen.getByText("Family Coverage")).toBeInTheDocument()
    })
  })

  it("shows policy details and coverage information", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Policy Number")).toBeInTheDocument()
      expect(screen.getByText("POL-2024-001")).toBeInTheDocument()
      expect(screen.getByText("Coverage Amount")).toBeInTheDocument()
      expect(screen.getByText("$500,000")).toBeInTheDocument()
    })
  })

  it("displays premium and payment information", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Monthly Premium")).toBeInTheDocument()
      expect(screen.getByText("$450")).toBeInTheDocument()
      expect(screen.getByText("Next Payment Due")).toBeInTheDocument()
    })
  })

  it("shows coverage breakdown modal", async () => {
    render(<Policies />)

    const viewCoverageButton = screen.getByText("View Coverage Details")
    await user.click(viewCoverageButton)

    await waitFor(() => {
      expect(screen.getByText("Coverage Breakdown")).toBeInTheDocument()
    })
  })

  it("displays deductible and out-of-pocket information", async () => {
    render(<Policies />)

    const viewCoverageButton = screen.getByText("View Coverage Details")
    await user.click(viewCoverageButton)

    await waitFor(() => {
      expect(screen.getByText("Annual Deductible")).toBeInTheDocument()
      expect(screen.getByText("$2,500")).toBeInTheDocument()
      expect(screen.getByText("Out-of-Pocket Maximum")).toBeInTheDocument()
      expect(screen.getByText("$8,000")).toBeInTheDocument()
    })
  })

  it("shows policy renewal alerts", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Renewal Due")).toBeInTheDocument()
      expect(screen.getByText("45 days")).toBeInTheDocument()
    })
  })

  it("displays beneficiary information", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Beneficiaries")).toBeInTheDocument()
      expect(screen.getByText("John Doe (Spouse)")).toBeInTheDocument()
      expect(screen.getByText("Jane Doe (Child)")).toBeInTheDocument()
    })
  })

  it("shows policy documents and downloads", async () => {
    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("Policy Documents")).toBeInTheDocument()
      expect(screen.getByText("Download Policy")).toBeInTheDocument()
      expect(screen.getByText("Download ID Card")).toBeInTheDocument()
    })
  })

  it("handles role-based access for different user types", async () => {
    const insurerContext = { ...mockAuthContext, user: { ...mockAuthContext.user, role: "insurer" } }
    jest.mocked(require("@/contexts/auth-context").useAuth).mockReturnValue(insurerContext)

    render(<Policies />)

    await waitFor(() => {
      expect(screen.getByText("All Policies")).toBeInTheDocument()
      expect(screen.getByText("Policy Management")).toBeInTheDocument()
    })
  })

  it("displays coverage progress bars", async () => {
    render(<Policies />)

    await waitFor(() => {
      const progressBars = screen.getAllByRole("progressbar")
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })
})
