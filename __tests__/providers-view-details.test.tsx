import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import { getViewDetailsButtonFor } from "@/test-utils/provider-test-helpers"

// Mock the auth context with different user roles
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
  hospital: {
    user: {
      id: "456",
      email: "hospital@demo.com",
      name: "City Hospital Admin",
      role: "hospital",
      organization: "City General Hospital",
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

    expect(screen.getByText("Find Providers")).toBeInTheDocument()
    expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()

    const viewDetailsButtons = screen.getAllByText("View Details")
    expect(viewDetailsButtons).toHaveLength(6)
  })

  it("should open provider details modal when View Details is clicked", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
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

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

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

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    const dialog = screen.getByRole("dialog")

    await user.click(screen.getByRole("tab", { name: "Services" }))
    await waitFor(() => {
      expect(within(dialog).getByText("All Services")).toBeInTheDocument()
      expect(within(dialog).getByText("Emergency Care")).toBeInTheDocument()
      expect(within(dialog).getByText("Surgery")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("tab", { name: "Hours" }))
    await waitFor(() => {
      expect(within(dialog).getByText("Operating Hours")).toBeInTheDocument()
      expect(within(dialog).getByText("monday")).toBeInTheDocument()
      expect(within(dialog).getAllByText("24/7").length).toBeGreaterThan(0)
    })

    await user.click(screen.getByRole("tab", { name: "Insurance" }))
    await waitFor(() => {
      expect(within(dialog).getByText("Accepted Insurance Plans")).toBeInTheDocument()
      expect(within(dialog).getByText("Blue Cross")).toBeInTheDocument()
      expect(within(dialog).getByText("Aetna")).toBeInTheDocument()
    })
  })

  it("should display contact information in overview tab", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).getByText("Contact Information")).toBeInTheDocument()
    expect(within(dialog).getByText("123 Main St, Downtown")).toBeInTheDocument()
    expect(within(dialog).getByText("(555) 123-4567")).toBeInTheDocument()
    expect(within(dialog).getByText("info@citygeneral.com")).toBeInTheDocument()
    expect(within(dialog).getByText("www.citygeneral.com")).toBeInTheDocument()
  })

  it("should display ratings and accessibility information", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).getByText("Ratings & Reviews")).toBeInTheDocument()
    expect(within(dialog).getByText("(1247 reviews)")).toBeInTheDocument()

    expect(within(dialog).getByText("Accessibility")).toBeInTheDocument()
    expect(within(dialog).getByText("Wheelchair Accessible")).toBeInTheDocument()
    expect(within(dialog).getByText("Parking Available")).toBeInTheDocument()
  })

  it("should highlight current day in hours tab", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("tab", { name: "Hours" }))

    await waitFor(() => {
      expect(screen.getByText("Operating Hours")).toBeInTheDocument()
    })

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const currentDay = days[new Date().getDay()]
    expect(screen.getByText(currentDay)).toBeInTheDocument()
  })

  it("should close modal when pressing escape", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    await user.click(getViewDetailsButtonFor("City General Hospital"))

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

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

    await user.click(getViewDetailsButtonFor("Metro Cardiology Center"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Specialist • Cardiology • In-Network")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Services" }))

    await waitFor(() => {
      expect(within(dialog).getByText("Cardiac Catheterization")).toBeInTheDocument()
      expect(within(dialog).getByText("Echocardiography")).toBeInTheDocument()
      expect(within(dialog).getByText("Pacemaker Implantation")).toBeInTheDocument()
    })
  })
})
