import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PoliciesPage from "@/app/policies/page"
import { useAuth } from "@/contexts/auth-context"

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
  tpa: {
    user: { id: "3", email: "tpa@demo.com", name: "Michael Chen", role: "tpa", organization: "HealthCare TPA Services" },
    loading: false,
  },
  hospital: {
    user: {
      id: "2",
      email: "hospital@demo.com",
      name: "Dr. Sarah Johnson",
      role: "hospital",
      organization: "City General Hospital",
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

describe("Policies Page", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows a customer-facing title and policy summary", async () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    expect(await screen.findByText("My Policies")).toBeInTheDocument()
    expect(screen.getByText("View your insurance policies and coverage details")).toBeInTheDocument()
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
  })

  it("shows an insurer-facing title", async () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.insurer)

    render(<PoliciesPage />)

    expect(await screen.findByText("All Policies")).toBeInTheDocument()
    expect(screen.getByText("Monitor all policies across your network")).toBeInTheDocument()
  })

  it("lists demo policies with their premium and coverage details", async () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    expect(await screen.findByText("Comprehensive Health Insurance")).toBeInTheDocument()
    expect(screen.getByText("Dental Coverage")).toBeInTheDocument()
    expect(screen.getByText(`Policy #POL-${new Date().getFullYear()}-001`)).toBeInTheDocument()
  })

  it("opens a policy's coverage breakdown dialog", async () => {
    const user = userEvent.setup()
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    await screen.findByText("Comprehensive Health Insurance")

    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Comprehensive Health Insurance - Coverage Details")).toBeInTheDocument()
    expect(within(dialog).getByText("Coverage Breakdown")).toBeInTheDocument()
  })

  it("shows a tpa-facing title and description", async () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.tpa)

    render(<PoliciesPage />)

    expect(await screen.findByText("Manage Policies")).toBeInTheDocument()
    expect(screen.getByText("Manage and process insurance policies")).toBeInTheDocument()
  })

  it("falls back to a generic title for a role without a dedicated policies view", async () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.hospital)

    render(<PoliciesPage />)

    expect(await screen.findByText("Policies")).toBeInTheDocument()
  })

  it("stops loading and logs an error if building the policy list fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const originalGetFullYear = Date.prototype.getFullYear
    Date.prototype.getFullYear = () => {
      throw new Error("clock unavailable")
    }
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.customer)

    render(<PoliciesPage />)

    await screen.findByText("My Policies")

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching policies:", expect.any(Error))
    expect(screen.queryByText("Comprehensive Health Insurance")).not.toBeInTheDocument()

    Date.prototype.getFullYear = originalGetFullYear
    consoleErrorSpy.mockRestore()
  })
})
