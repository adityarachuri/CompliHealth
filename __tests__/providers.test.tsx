import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"

// Mock the auth context
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: {
      id: "123",
      email: "customer@demo.com",
      name: "Test User",
      role: "customer",
      organization: "Personal Account",
    },
    loading: false,
  }),
}))

describe("Providers Page", () => {
  it("should render provider search interface", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    expect(screen.getByText("Find Providers")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Search by provider name, specialty, or services...")).toBeInTheDocument()
    expect(screen.getByText("All Specialties")).toBeInTheDocument()
    expect(screen.getByText("All Networks")).toBeInTheDocument()
  })

  it("should filter providers by specialty", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const specialtySelect = screen.getAllByRole("combobox")[1]
    await user.click(specialtySelect)

    const listbox = await screen.findByRole("listbox")
    await user.click(within(listbox).getByText("Cardiology"))

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })
    expect(screen.queryByText("City General Hospital")).not.toBeInTheDocument()
  })

  it("should search providers by name", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Metro")

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })
    expect(screen.queryByText("City General Hospital")).not.toBeInTheDocument()
  })

  it("should open provider details modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Metro Cardiology")

    const viewDetailsButton = await screen.findByText("View Details")
    await user.click(viewDetailsButton)

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Metro Cardiology Center")).toBeInTheDocument()
    expect(within(dialog).getByText("Specialist • Cardiology • In-Network")).toBeInTheDocument()
    expect(within(dialog).getByRole("tab", { name: "Overview" })).toBeInTheDocument()
    expect(within(dialog).getByRole("tab", { name: "Services" })).toBeInTheDocument()
    expect(within(dialog).getByRole("tab", { name: "Hours" })).toBeInTheDocument()
    expect(within(dialog).getByRole("tab", { name: "Insurance" })).toBeInTheDocument()
  })

  it("should handle booking appointment", async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {})

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Metro Cardiology")

    const bookButton = await screen.findByText("Book Appointment")
    await user.click(bookButton)

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Metro Cardiology Center"))
    alertSpy.mockRestore()
  })
})
