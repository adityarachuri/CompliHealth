import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: {
      id: "123",
      email: "test@example.com",
      user_metadata: { role: "customer", name: "Test User" },
    },
    loading: false,
  }),
}))

describe("Providers Page", () => {
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

  it("should open provider details modal", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText("View Details")[0]
      fireEvent.click(viewDetailsButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Provider Information")).toBeInTheDocument()
      expect(screen.getByText("Services")).toBeInTheDocument()
      expect(screen.getByText("Reviews")).toBeInTheDocument()
      expect(screen.getByText("Appointments")).toBeInTheDocument()
    })
  })

  it("should handle booking appointment", async () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    // Open provider modal first
    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText("View Details")[0]
      fireEvent.click(viewDetailsButton)
    })

    // Click book appointment
    await waitFor(() => {
      const bookButton = screen.getByText("Book Appointment")
      fireEvent.click(bookButton)
    })

    // Verify booking interface appears
    expect(screen.getByText("Schedule Appointment")).toBeInTheDocument()
  })
})
