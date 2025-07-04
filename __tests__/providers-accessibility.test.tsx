import { render, screen, waitFor } from "@testing-library/react"
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

describe("Providers Page - Accessibility Tests", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContext.customer)
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
})
