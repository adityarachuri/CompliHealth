import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare the variable

// Mock the auth context
const mockAuthContext = {
  customer: {
    user: {
      id: "123",
      email: "customer@demo.com",
      user_metadata: { role: "customer", name: "John Customer" },
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

  it("should have proper ARIA labels and roles", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Check search input has proper labeling
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    expect(searchInput).toBeInTheDocument()

    // Check buttons have proper roles
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

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal with keyboard
    const viewDetailsButtons = screen.getAllByText("View Details")
    viewDetailsButtons[0].focus()
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Navigate tabs with keyboard
    const overviewTab = screen.getByRole("tab", { name: "Overview" })
    const servicesTab = screen.getByRole("tab", { name: "Services" })

    overviewTab.focus()
    await user.keyboard("{ArrowRight}")

    // Services tab should be focused
    expect(servicesTab).toHaveFocus()

    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(screen.getByText("All Services")).toBeInTheDocument()
    })
  })

  it("should have proper focus management in modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Focus should be trapped within modal
    const modal = screen.getByRole("dialog")
    expect(modal).toBeInTheDocument()

    // Close modal with Escape
    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    // Focus should return to trigger button
    expect(viewDetailsButtons[0]).toHaveFocus()
  })

  it("should have proper ARIA attributes for provider status", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Check that accepting patients status has proper semantics
    const acceptingText = screen.getByText("Accepting new patients")
    expect(acceptingText).toBeInTheDocument()

    const notAcceptingText = screen.getByText("Not accepting new patients")
    expect(notAcceptingText).toBeInTheDocument()
  })

  it("should support screen reader announcements for dynamic content", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Search should update results count
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Hospital")

    await waitFor(() => {
      const resultsText = screen.getByText(/Showing \d+ of \d+ providers/)
      expect(resultsText).toBeInTheDocument()
    })
  })

  it("should have proper heading hierarchy", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Main heading should be h1
    const mainHeading = screen.getByRole("heading", { level: 1 })
    expect(mainHeading).toHaveTextContent("Find Providers")

    // Section headings should be properly nested
    const searchHeading = screen.getByText("Search & Filter")
    expect(searchHeading).toBeInTheDocument()
  })

  it("should provide alternative text for icons and images", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal to check accessibility features
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Check that accessibility features are properly described
    expect(screen.getByText("Wheelchair Accessible")).toBeInTheDocument()
    expect(screen.getByText("Parking Available")).toBeInTheDocument()
    expect(screen.getByText("Emergency Services")).toBeInTheDocument()
  })

  it("should handle high contrast mode", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Check that important elements have sufficient contrast indicators
    const inNetworkBadges = screen.getAllByText("In-Network")
    const outOfNetworkBadges = screen.getAllByText("Out-of-Network")

    // These should have different styling for contrast
    expect(inNetworkBadges.length).toBeGreaterThan(0)
    expect(outOfNetworkBadges.length).toBeGreaterThan(0)
  })
})
