import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the auth context
const mockAuthContext = {
  customer: {
    user: {
      id: "123",
      email: "customer@demo.com",
      user_metadata: { role: "customer", name: "John Customer" },
    },
    loading: false,
    signOut: jest.fn(),
    signIn: jest.fn(),
  },
}

const mockUseAuth = jest.fn()

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => mockUseAuth(),
}))

describe("Providers Page - Integration Tests", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContext.customer)
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
})
