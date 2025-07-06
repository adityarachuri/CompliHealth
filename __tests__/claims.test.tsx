import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import Claims from "@/app/claims/page"
import jest from "jest"

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

describe("Claims", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders claims page correctly", async () => {
    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText("Claims")).toBeInTheDocument()
    })
  })

  it("displays claims summary cards", async () => {
    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText("Total Claims")).toBeInTheDocument()
      expect(screen.getByText("Pending Claims")).toBeInTheDocument()
      expect(screen.getByText("Approved Claims")).toBeInTheDocument()
    })
  })

  it("shows new claim button for customers", async () => {
    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText("New Claim")).toBeInTheDocument()
    })
  })

  it("opens new claim form when button clicked", async () => {
    render(<Claims />)

    const newClaimButton = screen.getByText("New Claim")
    await user.click(newClaimButton)

    await waitFor(() => {
      expect(screen.getByText("Submit New Claim")).toBeInTheDocument()
    })
  })

  it("validates claim form fields", async () => {
    render(<Claims />)

    const newClaimButton = screen.getByText("New Claim")
    await user.click(newClaimButton)

    const submitButton = screen.getByText("Submit Claim")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Treatment type is required")).toBeInTheDocument()
    })
  })

  it("filters claims by status", async () => {
    render(<Claims />)

    const statusFilter = screen.getByRole("combobox", { name: /status/i })
    await user.click(statusFilter)

    const pendingOption = screen.getByText("Pending")
    await user.click(pendingOption)

    await waitFor(() => {
      expect(screen.getByDisplayValue("Pending")).toBeInTheDocument()
    })
  })

  it("displays claims list with correct columns", async () => {
    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText("Claim ID")).toBeInTheDocument()
      expect(screen.getByText("Date")).toBeInTheDocument()
      expect(screen.getByText("Amount")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
    })
  })

  it("shows claim details when row clicked", async () => {
    render(<Claims />)

    await waitFor(() => {
      const claimRow = screen.getByText("CLM-001")
      fireEvent.click(claimRow)
    })

    await waitFor(() => {
      expect(screen.getByText("Claim Details")).toBeInTheDocument()
    })
  })

  it("handles empty claims state", async () => {
    // Mock empty claims
    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText(/no claims found/i)).toBeInTheDocument()
    })
  })

  it("submits new claim form successfully", async () => {
    render(<Claims />)

    const newClaimButton = screen.getByText("New Claim")
    await user.click(newClaimButton)

    // Fill form fields
    const treatmentInput = screen.getByLabelText(/treatment type/i)
    await user.type(treatmentInput, "Consultation")

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, "150")

    const submitButton = screen.getByText("Submit Claim")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Claim submitted successfully")).toBeInTheDocument()
    })
  })

  it("displays different views for hospital role", async () => {
    const hospitalContext = { ...mockAuthContext, user: { ...mockAuthContext.user, role: "hospital" } }
    jest.mocked(require("@/contexts/auth-context").useAuth).mockReturnValue(hospitalContext)

    render(<Claims />)

    await waitFor(() => {
      expect(screen.getByText("Patient Claims")).toBeInTheDocument()
    })
  })

  it("shows processing status correctly", async () => {
    render(<Claims />)

    await waitFor(() => {
      const statusBadges = screen.getAllByRole("status")
      expect(statusBadges.length).toBeGreaterThan(0)
    })
  })
})
