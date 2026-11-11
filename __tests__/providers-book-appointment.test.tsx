import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProvidersPage from "@/app/providers/page"
import { AuthProvider } from "@/contexts/auth-context"
import { getProviderCard } from "@/test-utils/provider-test-helpers"

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
  tpa: {
    user: {
      id: "789",
      email: "tpa@demo.com",
      name: "TPA Admin",
      role: "tpa",
      organization: "HealthCare TPA Services",
    },
    loading: false,
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Providers Page - Book Appointment Feature", () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthContext.customer)
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    alertSpy.mockRestore()
  })

  it("should show Book Appointment button for customers when provider accepts patients", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const bookButtons = screen.getAllByText("Book Appointment")
    expect(bookButtons.length).toBeGreaterThan(0)

    bookButtons.forEach((button) => {
      expect(button.closest("button")).toBeInTheDocument()
    })
  })

  it("should not show Book Appointment button for non-customer users", () => {
    useAuth.mockReturnValue(mockAuthContext.hospital)

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    expect(screen.getByText("City General Hospital")).toBeInTheDocument()
    expect(screen.queryByText("Book Appointment")).not.toBeInTheDocument()
  })

  it("should not show Book Appointment button for providers not accepting patients", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const familyClinicCard = getProviderCard("Family Health Clinic")
    expect(within(familyClinicCard).queryByText("Book Appointment")).not.toBeInTheDocument()
    expect(within(familyClinicCard).getByText("Not accepting new patients")).toBeInTheDocument()
  })

  it("should handle Book Appointment button click", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const cityGeneralCard = getProviderCard("City General Hospital")
    await user.click(within(cityGeneralCard).getByText("Book Appointment"))

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("City General Hospital"))
  })

  it("should show Book Appointment in provider details modal for customers", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const cityGeneralCard = getProviderCard("City General Hospital")
    await user.click(within(cityGeneralCard).getByText("View Details"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Book Appointment")).toBeInTheDocument()
  })

  it("should not show Book Appointment in modal for non-customer users", async () => {
    useAuth.mockReturnValue(mockAuthContext.tpa)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const cityGeneralCard = getProviderCard("City General Hospital")
    await user.click(within(cityGeneralCard).getByText("View Details"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).queryByText("Book Appointment")).not.toBeInTheDocument()
  })

  it("should display correct provider acceptance status", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    expect(screen.getAllByText("Accepting new patients").length).toBeGreaterThan(0)
    expect(screen.getByText("Not accepting new patients")).toBeInTheDocument()

    const checkIcons = screen.getAllByTestId("check-circle")
    const alertIcons = screen.getAllByTestId("alert-circle")
    expect(checkIcons.length + alertIcons.length).toBeGreaterThan(0)
  })

  it("should handle appointment booking for an out-of-network provider", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const orthoCard = getProviderCard("Orthopedic Specialists Group")
    expect(within(orthoCard).getByText("Out-of-Network")).toBeInTheDocument()

    // Out-of-network providers still accepting patients should show Book Appointment
    await user.click(within(orthoCard).getByText("Book Appointment"))
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Orthopedic Specialists Group"))
  })

  it("should show provider network status correctly", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    expect(screen.getAllByText("In-Network").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Out-of-Network").length).toBeGreaterThan(0)
  })

  it("should display appointment booking button with correct styling", () => {
    render(
      <AuthProvider>
        <ProvidersPage />
      </AuthProvider>,
    )

    const bookButtons = screen.getAllByText("Book Appointment")

    bookButtons.forEach((button) => {
      const buttonElement = button.closest("button")
      expect(buttonElement).toHaveClass("w-full")
      expect(buttonElement).not.toBeDisabled()
    })
  })
})
