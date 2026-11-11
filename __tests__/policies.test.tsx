import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PoliciesPage from "@/app/policies/page"

const mockAuthContext = {
  customer: {
    user: { id: "1", email: "customer@demo.com", name: "John Smith", role: "customer", organization: "Personal Account" },
    loading: false,
  },
  insurer: {
    user: {
      id: "4",
      email: "insurer@demo.com",
      name: "Lisa Rodriguez",
      role: "insurer",
      organization: "CompliHealth Insurance",
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Policies Page", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows a customer-facing title and policy summary", async () => {
    useAuth.mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    expect(await screen.findByText("My Policies")).toBeInTheDocument()
    expect(screen.getByText("View your insurance policies and coverage details")).toBeInTheDocument()
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
  })

  it("shows an insurer-facing title", async () => {
    useAuth.mockReturnValue(mockAuthContext.insurer)

    render(<PoliciesPage />)

    expect(await screen.findByText("All Policies")).toBeInTheDocument()
    expect(screen.getByText("Monitor all policies across your network")).toBeInTheDocument()
  })

  it("lists demo policies with their premium and coverage details", async () => {
    useAuth.mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    expect(await screen.findByText("Comprehensive Health Insurance")).toBeInTheDocument()
    expect(screen.getByText("Dental Coverage")).toBeInTheDocument()
    expect(screen.getByText("Policy #POL-2024-001")).toBeInTheDocument()
  })

  it("opens a policy's coverage breakdown dialog", async () => {
    const user = userEvent.setup()
    useAuth.mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    await screen.findByText("Comprehensive Health Insurance")

    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Comprehensive Health Insurance - Coverage Details")).toBeInTheDocument()
    expect(within(dialog).getByText("Coverage Breakdown")).toBeInTheDocument()
  })
})
