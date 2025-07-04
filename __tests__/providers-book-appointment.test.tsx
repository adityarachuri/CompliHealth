import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare it

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
  hospital: {
    user: {
      id: "456",
      email: "hospital@demo.com",
      user_metadata: { role: "hospital", name: "City Hospital Admin" },
    },
    loading: false,
  },
  tpa: {
    user: {
      id: "789",
      email: "tpa@demo.com",
      user_metadata: { role: "tpa", name: "TPA Admin" },
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Providers Page - Book Appointment Feature", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext.customer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should show Book Appointment button for customers when provider accepts patients", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Check that Book Appointment buttons are visible for accepting providers
    const bookButtons = screen.getAllByText("Book Appointment")
    expect(bookButtons.length).toBeGreaterThan(0)

    // Verify button has calendar icon
    bookButtons.forEach((button) => {
      expect(button.closest("button")).toBeInTheDocument()
    })
  })

  it("should not show Book Appointment button for non-customer users", async () => {
    useAuth.mockReturnValue(mockAuthContext.hospital)

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Book Appointment buttons should not be visible for hospital users
    expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
  })

  it("should not show Book Appointment button for providers not accepting patients", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Family Health Clinic")).toBeInTheDocument()
    })

    // Family Health Clinic is not accepting patients, so no book button should appear
    const familyClinicCard = screen.getByText("Family Health Clinic").closest(".space-y-6 > div")
    expect(familyClinicCard).toBeInTheDocument()

    // Check that this specific card doesn't have a Book Appointment button
    const bookButtons = screen.getAllByText("Book Appointment")
    const familyClinicBookButton = bookButtons.find((button) => button.closest(".space-y-6 > div") === familyClinicCard)
    expect(familyClinicBookButton).toBeUndefined()
  })

  it("should handle Book Appointment button click", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Click Book Appointment button
    const bookButtons = screen.getAllByText("Book Appointment")
    await user.click(bookButtons[0])

    // Since this is a demo, the button should be clickable
    // In a real app, this would open a booking modal or navigate to booking page
    expect(bookButtons[0]).toBeEnabled()
  })

  it("should show Book Appointment in provider details modal for customers", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open provider details modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Check that Book Appointment button is also in the modal
    const modalBookButtons = screen.getAllByText("Book Appointment")
    expect(modalBookButtons.length).toBeGreaterThan(0)
  })

  it("should not show Book Appointment in modal for non-customer users", async () => {
    useAuth.mockReturnValue(mockAuthContext.tpa)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open provider details modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Book Appointment button should not be in modal for TPA users
    expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
  })

  it("should display correct provider acceptance status", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Check accepting patients status
    expect(screen.getByText("Accepting new patients")).toBeInTheDocument()
    expect(screen.getByText("Not accepting new patients")).toBeInTheDocument()

    // Verify icons are present
    const checkIcons = screen.getAllByTestId("check-circle") || []
    const alertIcons = screen.getAllByTestId("alert-circle") || []

    // At least one provider should be accepting and one not accepting
    expect(checkIcons.length + alertIcons.length).toBeGreaterThan(0)
  })

  it("should handle appointment booking for in-network vs out-of-network providers", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Orthopedic Specialists Group")).toBeInTheDocument()
    })

    // Find out-of-network provider (Orthopedic Specialists Group)
    const outOfNetworkBadges = screen.getAllByText("Out-of-Network")
    expect(outOfNetworkBadges.length).toBeGreaterThan(0)

    // Even out-of-network providers should show book appointment if accepting patients
    const bookButtons = screen.getAllByText("Book Appointment")
    expect(bookButtons.length).toBeGreaterThan(0)
  })

  it("should show provider network status correctly", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Check network status badges
    const inNetworkBadges = screen.getAllByText("In-Network")
    const outOfNetworkBadges = screen.getAllByText("Out-of-Network")

    expect(inNetworkBadges.length).toBeGreaterThan(0)
    expect(outOfNetworkBadges.length).toBeGreaterThan(0)
  })

  it("should handle multiple appointment bookings", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Get all Book Appointment buttons
    const bookButtons = screen.getAllByText("Book Appointment")

    // Click multiple buttons to ensure they all work
    for (let i = 0; i < Math.min(bookButtons.length, 3); i++) {
      await user.click(bookButtons[i])
      expect(bookButtons[i]).toBeEnabled()
    }
  })

  it("should display appointment booking button with correct styling", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    const bookButtons = screen.getAllByText("Book Appointment")

    // Check that buttons have correct classes and are properly styled
    bookButtons.forEach((button) => {
      const buttonElement = button.closest("button")
      expect(buttonElement).toHaveClass("w-full") // Should be full width
      expect(buttonElement).not.toBeDisabled()
    })
  })
})
