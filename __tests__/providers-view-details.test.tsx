import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare the variable

// Mock the auth context with different user roles
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

describe("Providers Page - View Details Feature", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContext.customer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should render provider cards with View Details buttons", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Providers")).toBeInTheDocument()
    })

    // Check that provider cards are rendered
    expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()

    // Check that View Details buttons are present
    const viewDetailsButtons = screen.getAllByText("View Details")
    expect(viewDetailsButtons).toHaveLength(6) // Should match number of providers
  })

  it("should open provider details modal when View Details is clicked", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Click the first View Details button
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    // Check that modal opens with provider details
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
      expect(screen.getByText("Hospital • General Practice • In-Network")).toBeInTheDocument()
    })
  })
})
