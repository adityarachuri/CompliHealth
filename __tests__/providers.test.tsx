import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare the variable

const mockUseAuth = {
  user: {
    id: "123",
    email: "test@example.com",
    user_metadata: { role: "customer", name: "Test User" },
  },
  loading: false,
  signOut: jest.fn(),
  signIn: jest.fn(),
}

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => mockUseAuth,
}))

describe("Providers Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render provider search interface", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Find Healthcare Providers")).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText("Search providers...")).toBeInTheDocument()
    expect(screen.getByText("All Specialties")).toBeInTheDocument()
    expect(screen.getByText("All Networks")).toBeInTheDocument()
  })

  it("should filter providers by specialty", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const specialtySelect = screen.getByRole("combobox", { name: /specialty/i })
    fireEvent.click(specialtySelect)

    await waitFor(() => {
      const cardiologyOption = screen.getByText("Cardiology")
      fireEvent.click(cardiologyOption)
    })

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
    })
  })

  it("should search providers by name", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const searchInput = screen.getByPlaceholderText("Search providers...")
    fireEvent.change(searchInput, { target: { value: "Johnson" } })

    await waitFor(() => {
      expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
    })
  })
})
