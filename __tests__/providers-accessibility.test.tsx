import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import { getProviderCard, getViewDetailsButtonFor } from "@/test-utils/provider-test-helpers"

// Mock the auth context
const mockAuthContext = {
  customer: {
    user: {
      id: "123",
      email: "customer@demo.com",
      name: "John Customer",
      role: "customer",
      organization: "Personal Account",
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Providers Page - Accessibility Tests", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext.customer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should have proper ARIA labels and roles", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    expect(searchInput).toBeInTheDocument()

    const viewDetailsButtons = screen.getAllByText("View Details")
    viewDetailsButtons.forEach((button) => {
      expect(button.closest("button")).toHaveAttribute("type", "button")
    })

    const bookButtons = screen.getAllByText("Book Appointment")
    bookButtons.forEach((button) => {
      expect(button.closest("button")).toHaveAttribute("type", "button")
    })
  })

  it("should support keyboard navigation in provider details modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const viewDetailsButton = getViewDetailsButtonFor("City General Hospital")
    viewDetailsButton.focus()
    await user.keyboard("{Enter}")

    const dialog = await screen.findByRole("dialog")
    expect(dialog).toBeInTheDocument()

    const overviewTab = screen.getByRole("tab", { name: "Overview" })
    const servicesTab = screen.getByRole("tab", { name: "Services" })

    overviewTab.focus()
    await user.keyboard("{ArrowRight}")
    expect(servicesTab).toHaveFocus()

    await user.keyboard("{Enter}")
    expect(await screen.findByText("All Services")).toBeInTheDocument()
  })

  it("should return focus to the trigger button after closing the modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const viewDetailsButton = getViewDetailsButtonFor("City General Hospital")
    await user.click(viewDetailsButton)

    expect(await screen.findByRole("dialog")).toBeInTheDocument()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(viewDetailsButton).toHaveFocus()
  })

  it("should have proper ARIA attributes for provider status", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const familyClinicCard = getProviderCard("Family Health Clinic")
    expect(screen.getAllByText("Accepting new patients").length).toBeGreaterThan(0)
    expect(screen.getByText("Not accepting new patients")).toBeInTheDocument()
    expect(familyClinicCard).toContainElement(screen.getByText("Not accepting new patients"))
  })

  it("should update the results count as the user searches", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    expect(screen.getByText("Showing 6 of 6 providers")).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Hospital")

    expect(await screen.findByText("Showing 1 of 6 providers")).toBeInTheDocument()
  })

  it("should have proper heading hierarchy", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const mainHeading = screen.getByRole("heading", { level: 1 })
    expect(mainHeading).toHaveTextContent("Find Providers")
    expect(screen.getByText("Search & Filter")).toBeInTheDocument()
  })

  it("should describe accessibility features with text labels, not icons alone", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))
    await screen.findByRole("dialog")

    expect(screen.getByText("Wheelchair Accessible")).toBeInTheDocument()
    expect(screen.getByText("Parking Available")).toBeInTheDocument()
    expect(screen.getByText("Emergency Services")).toBeInTheDocument()
  })

  it("should distinguish network status with more than color alone", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const inNetworkBadges = screen.getAllByText("In-Network")
    const outOfNetworkBadges = screen.getAllByText("Out-of-Network")

    expect(inNetworkBadges.length).toBeGreaterThan(0)
    expect(outOfNetworkBadges.length).toBeGreaterThan(0)
  })
})
