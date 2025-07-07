import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest"
import { useAuth } from "@/contexts/auth-context"

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

describe("Providers Page - Integration Tests", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext.customer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should complete full workflow: search, view details, and book appointment", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Step 1: Search for a specific provider
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Cardiology")

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })

    // Step 2: View provider details
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })

    // Step 3: Navigate through tabs in modal
    await user.click(screen.getByRole("tab", { name: "Services" }))

    await waitFor(() => {
      expect(screen.getByText("Cardiac Catheterization")).toBeInTheDocument()
    })

    // Step 4: Book appointment
    const bookButton = screen.getByText("Book Appointment")
    await user.click(bookButton)

    // Verify button is functional
    expect(bookButton).toBeEnabled()
  })

  it("should handle filtering and then viewing details", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Filter by specialty
    const specialtySelect = screen.getByDisplayValue("All Specialties")
    await user.click(specialtySelect)

    const cardiologyOption = screen.getByText("Cardiology")
    await user.click(cardiologyOption)

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })

    // View details of filtered provider
    const viewDetailsButton = screen.getByText("View Details")
    await user.click(viewDetailsButton)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Specialist • Cardiology • In-Network")).toBeInTheDocument()
    })
  })

  it("should handle network filtering and booking", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Filter by In-Network only
    const networkSelect = screen.getByDisplayValue("All Networks")
    await user.click(networkSelect)

    const inNetworkOption = screen.getByText("In-Network")
    await user.click(inNetworkOption)

    // Verify only in-network providers are shown
    await waitFor(() => {
      const inNetworkBadges = screen.getAllByText("In-Network")
      expect(inNetworkBadges.length).toBeGreaterThan(0)

      // Should not show out-of-network providers
      expect(screen.queryByText("Out-of-Network")).not.toBeInTheDocument()
    })

    // Book appointment with in-network provider
    const bookButtons = screen.getAllByText("Book Appointment")
    if (bookButtons.length > 0) {
      await user.click(bookButtons[0])
      expect(bookButtons[0]).toBeEnabled()
    }
  })

  it("should handle sorting and then viewing details", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Sort by rating
    const sortSelect = screen.getByDisplayValue("Distance")
    await user.click(sortSelect)

    const ratingOption = screen.getByText("Rating")
    await user.click(ratingOption)

    // View details of first provider (should be highest rated)
    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText("View Details")
      await user.click(viewDetailsButtons[0])
    })

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Ratings & Reviews")).toBeInTheDocument()
    })
  })

  it("should clear filters and maintain functionality", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Apply filters
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Hospital")

    const specialtySelect = screen.getByDisplayValue("All Specialties")
    await user.click(specialtySelect)

    const generalOption = screen.getByText("General Practice")
    await user.click(generalOption)

    // Clear filters
    const clearButton = screen.getByText("Clear Filters")
    await user.click(clearButton)

    // Verify all providers are shown again
    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
      expect(screen.getByText("Family Health Clinic")).toBeInTheDocument()
    })

    // Verify functionality still works
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
  })

  it("should handle edge case: no search results", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Search for non-existent provider
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "NonExistentProvider123")

    await waitFor(() => {
      expect(screen.getByText("No providers found")).toBeInTheDocument()
      expect(
        screen.getByText("Try adjusting your search criteria or filters to find more providers."),
      ).toBeInTheDocument()
    })

    // Verify no View Details or Book Appointment buttons are shown
    expect(screen.queryByText("View Details")).not.toBeInTheDocument()
    expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
  })
})
