import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ClaimsPage from "@/app/claims/page"
import { AuthProvider } from "@/contexts/auth-context"

const mockAuthContext = {
  customer: {
    user: { id: "1", email: "customer@demo.com", name: "John Smith", role: "customer", organization: "Personal Account" },
    loading: false,
    signOut: jest.fn(),
  },
  hospital: {
    user: {
      id: "2",
      email: "hospital@demo.com",
      name: "Dr. Sarah Johnson",
      role: "hospital",
      organization: "City General Hospital",
    },
    loading: false,
    signOut: jest.fn(),
  },
}

jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}))

const { useAuth } = require("@/contexts/auth-context")

describe("Claims Page", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows a customer-facing title and claim summary for customers", () => {
    useAuth.mockReturnValue(mockAuthContext.customer)

    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>,
    )

    expect(screen.getByText("My Claims")).toBeInTheDocument()
    expect(screen.getByText("Track your insurance claims and their status")).toBeInTheDocument()
    expect(screen.queryByText("New Claim")).not.toBeInTheDocument()

    expect(screen.getByText("Total Claims")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument() // mockClaims has 3 entries
  })

  it("lets hospital staff submit a new claim", async () => {
    const user = userEvent.setup()
    useAuth.mockReturnValue(mockAuthContext.hospital)

    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>,
    )

    expect(screen.getByText("Submit Claims")).toBeInTheDocument()

    await user.click(screen.getByText("New Claim"))
    expect(screen.getByText("Submit New Claim")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Diagnosis"), "Sprained Ankle")
    await user.type(screen.getByLabelText("Provider"), "City General Hospital")
    await user.type(screen.getByLabelText("Treatment Details"), "X-ray and brace")
    await user.type(screen.getByLabelText("Claim Amount"), "250")

    await user.click(screen.getByRole("button", { name: "Submit Claim" }))

    // Form closes and resets after submission
    expect(screen.queryByText("Submit New Claim")).not.toBeInTheDocument()
  }, 30000)

  it("lets the user cancel the new claim form", async () => {
    const user = userEvent.setup()
    useAuth.mockReturnValue(mockAuthContext.hospital)

    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>,
    )

    await user.click(screen.getByText("New Claim"))
    expect(screen.getByText("Submit New Claim")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByText("Submit New Claim")).not.toBeInTheDocument()
  })

  it("renders the claims list with status badges", () => {
    useAuth.mockReturnValue(mockAuthContext.customer)

    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>,
    )

    expect(screen.getByText("CLM-2024-001")).toBeInTheDocument()
    expect(screen.getByText("Annual Physical Examination")).toBeInTheDocument()
    expect(screen.getByText("approved")).toBeInTheDocument()
    expect(screen.getByText("under review")).toBeInTheDocument()
  })
})
