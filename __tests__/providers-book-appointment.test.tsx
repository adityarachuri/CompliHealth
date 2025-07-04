import { render, screen, waitFor } from "@testing-library/react"
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
    signOut: jest.fn(),
    signIn: jest.fn(),
  },
  hospital: {
    user: {
      id: "456",
      email: "hospital@demo.com",
      user_metadata: { role: "hospital", name: "City Hospital Admin" },
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

describe("Providers Page - Book Appointment Feature", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContext.customer)
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
    mockUseAuth.mockReturnValue(mockAuthContext.hospital)

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
})
