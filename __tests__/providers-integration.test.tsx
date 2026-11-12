import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import { useAuth } from "@/contexts/auth-context"

// Mock the auth context
const mockAuthContext = {
  customer: {
    user: {
      id: "123",
      email: "customer@demo.com",
      name: "John Customer",
      role: "customer",
      organization: "Personal Account",
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

/** Select index order on the page: Provider Type, Specialty, Network Status, Sort By. */
async function chooseSelectOption(user: ReturnType<typeof userEvent.setup>, comboboxIndex: number, optionText: string) {
  const combobox = screen.getAllByRole("combobox")[comboboxIndex]
  await user.click(combobox)
  const listbox = await screen.findByRole("listbox")
  await user.click(within(listbox).getByText(optionText))
}

describe("Providers Page - Integration Tests", () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext.customer)
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    alertSpy.mockRestore()
  })

  it("should complete full workflow: search, view details, and book appointment", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    // Step 1: Search for a specific provider
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Metro Cardiology")

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })

    // Step 2: View provider details
    await user.click(screen.getByText("View Details"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Metro Cardiology Center")).toBeInTheDocument()

    // Step 3: Navigate through tabs in modal
    await user.click(screen.getByRole("tab", { name: "Services" }))
    await waitFor(() => {
      expect(within(dialog).getByText("Cardiac Catheterization")).toBeInTheDocument()
    })

    // Step 4: Book appointment from the Overview tab inside the modal
    await user.click(screen.getByRole("tab", { name: "Overview" }))
    await user.click(within(dialog).getByText("Book Appointment"))
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Metro Cardiology Center"))
  }, 30000)

  it("should handle filtering and then viewing details", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await chooseSelectOption(user, 1, "Cardiology")

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })
    expect(screen.queryByText("City General Hospital")).not.toBeInTheDocument()

    await user.click(screen.getByText("View Details"))

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

    await chooseSelectOption(user, 2, "Out-of-Network")

    await waitFor(() => {
      expect(screen.getByText("Orthopedic Specialists Group")).toBeInTheDocument()
    })
    expect(screen.queryByText("City General Hospital")).not.toBeInTheDocument()

    const bookButton = screen.getByText("Book Appointment")
    await user.click(bookButton)
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Orthopedic Specialists Group"))
  })

  it("should handle sorting and then viewing details", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await chooseSelectOption(user, 3, "Rating")

    // After sorting by rating, City General Hospital (4.8) is the highest rated
    const headings = await waitFor(() => screen.getAllByRole("heading", { level: 3 }))
    expect(headings[0]).toHaveTextContent("City General Hospital")

    await user.click(screen.getAllByText("View Details")[0])

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

    // Apply filters
    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "Hospital")

    await waitFor(() => {
      expect(screen.queryByText("Metro Cardiology Center")).not.toBeInTheDocument()
    })

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
    await user.click(screen.getAllByText("View Details")[0])

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

    const searchInput = screen.getByPlaceholderText("Search by provider name, specialty, or services...")
    await user.type(searchInput, "NonExistentProvider123")

    await waitFor(() => {
      expect(screen.getByText("No providers found")).toBeInTheDocument()
      expect(
        screen.getByText("Try adjusting your search criteria or filters to find more providers."),
      ).toBeInTheDocument()
    })

    expect(screen.queryByText("View Details")).not.toBeInTheDocument()
    expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
  })
})
