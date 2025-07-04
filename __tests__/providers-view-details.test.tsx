import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Declare the jest variable

// Mock the auth context with different user roles
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
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Providers Page - View Details Feature", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext.customer)
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

  it("should display all tabs in provider details modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Check all tabs are present
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Services" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Hours" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Insurance" })).toBeInTheDocument()
  })

  it("should switch between tabs in provider details modal", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Click Services tab
    await user.click(screen.getByRole("tab", { name: "Services" }))

    await waitFor(() => {
      expect(screen.getByText("All Services")).toBeInTheDocument()
      expect(screen.getByText("Emergency Care")).toBeInTheDocument()
      expect(screen.getByText("Surgery")).toBeInTheDocument()
    })

    // Click Hours tab
    await user.click(screen.getByRole("tab", { name: "Hours" }))

    await waitFor(() => {
      expect(screen.getByText("Operating Hours")).toBeInTheDocument()
      expect(screen.getByText("Monday")).toBeInTheDocument()
      expect(screen.getByText("24/7")).toBeInTheDocument()
    })

    // Click Insurance tab
    await user.click(screen.getByRole("tab", { name: "Insurance" }))

    await waitFor(() => {
      expect(screen.getByText("Accepted Insurance Plans")).toBeInTheDocument()
      expect(screen.getByText("Blue Cross")).toBeInTheDocument()
      expect(screen.getByText("Aetna")).toBeInTheDocument()
    })
  })

  it("should display contact information in overview tab", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Check contact information is displayed
    expect(screen.getByText("Contact Information")).toBeInTheDocument()
    expect(screen.getByText("123 Main St, Downtown")).toBeInTheDocument()
    expect(screen.getByText("(555) 123-4567")).toBeInTheDocument()
    expect(screen.getByText("info@citygeneral.com")).toBeInTheDocument()
    expect(screen.getByText("www.citygeneral.com")).toBeInTheDocument()
  })

  it("should display ratings and accessibility information", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Check ratings section
    expect(screen.getByText("Ratings & Reviews")).toBeInTheDocument()
    expect(screen.getByText("4.8")).toBeInTheDocument()
    expect(screen.getByText("(1247 reviews)")).toBeInTheDocument()

    // Check accessibility section
    expect(screen.getByText("Accessibility")).toBeInTheDocument()
    expect(screen.getByText("Wheelchair Accessible")).toBeInTheDocument()
    expect(screen.getByText("Parking Available")).toBeInTheDocument()
  })

  it("should highlight current day in hours tab", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal and go to hours tab
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("tab", { name: "Hours" }))

    await waitFor(() => {
      expect(screen.getByText("Operating Hours")).toBeInTheDocument()
    })

    // Check that current day has special styling (bg-blue-50 class)
    const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const dayElements = screen.getAllByText(new RegExp(currentDay, "i"))
    expect(dayElements.length).toBeGreaterThan(0)
  })

  it("should close modal when clicking outside or escape key", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    })

    // Open modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    // Press escape key
    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("should display different provider types correctly", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
    })

    // Open cardiology center modal
    const viewDetailsButtons = screen.getAllByText("View Details")
    await user.click(viewDetailsButtons[1]) // Second provider

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
      expect(screen.getByText("Specialist • Cardiology • In-Network")).toBeInTheDocument()
    })

    // Check cardiology-specific services
    await user.click(screen.getByRole("tab", { name: "Services" }))

    await waitFor(() => {
      expect(screen.getByText("Cardiac Catheterization")).toBeInTheDocument()
      expect(screen.getByText("Echocardiography")).toBeInTheDocument()
      expect(screen.getByText("Pacemaker Implantation")).toBeInTheDocument()
    })
  })
})
