import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import Coverage from "@/app/coverage/page"
import jest from "jest" // Import jest to fix the undeclared variable error

const mockAuthContext = {
  user: {
    id: "1",
    email: "test@example.com",
    role: "customer",
    name: "Test User",
    organization: null,
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  loading: false,
  updateProfile: jest.fn(),
}

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("Coverage", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders coverage page correctly", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Coverage Details")).toBeInTheDocument()
    })
  })

  it("displays coverage summary cards", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Medical Coverage")).toBeInTheDocument()
      expect(screen.getByText("Dental Coverage")).toBeInTheDocument()
      expect(screen.getByText("Vision Coverage")).toBeInTheDocument()
    })
  })

  it("shows benefit categories and limits", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Inpatient Care")).toBeInTheDocument()
      expect(screen.getByText("Outpatient Care")).toBeInTheDocument()
      expect(screen.getByText("Prescription Drugs")).toBeInTheDocument()
      expect(screen.getByText("Emergency Services")).toBeInTheDocument()
    })
  })

  it("displays coverage percentages and copays", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("80% covered")).toBeInTheDocument()
      expect(screen.getByText("$25 copay")).toBeInTheDocument()
      expect(screen.getByText("90% covered")).toBeInTheDocument()
    })
  })

  it("shows deductible progress", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Deductible Progress")).toBeInTheDocument()
      expect(screen.getByText("$1,200 of $2,500")).toBeInTheDocument()
    })
  })

  it("displays out-of-pocket maximum progress", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Out-of-Pocket Maximum")).toBeInTheDocument()
      expect(screen.getByText("$3,400 of $8,000")).toBeInTheDocument()
    })
  })

  it("shows network information", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("In-Network Providers")).toBeInTheDocument()
      expect(screen.getByText("Out-of-Network Providers")).toBeInTheDocument()
    })
  })

  it("displays wellness benefits", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Wellness Benefits")).toBeInTheDocument()
      expect(screen.getByText("Annual Physical")).toBeInTheDocument()
      expect(screen.getByText("Preventive Screenings")).toBeInTheDocument()
    })
  })

  it("shows document download options", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Download Summary")).toBeInTheDocument()
      expect(screen.getByText("Download Benefits Guide")).toBeInTheDocument()
    })
  })

  it("handles FAQ section interactions", async () => {
    render(<Coverage />)

    const faqButton = screen.getByText("What is my deductible?")
    await user.click(faqButton)

    await waitFor(() => {
      expect(screen.getByText("Your annual deductible is $2,500")).toBeInTheDocument()
    })
  })

  it("displays coverage effective dates", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Coverage Period")).toBeInTheDocument()
      expect(screen.getByText("Jan 1, 2024 - Dec 31, 2024")).toBeInTheDocument()
    })
  })

  it("shows prescription drug coverage tiers", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Tier 1 (Generic)")).toBeInTheDocument()
      expect(screen.getByText("Tier 2 (Preferred Brand)")).toBeInTheDocument()
      expect(screen.getByText("Tier 3 (Non-Preferred Brand)")).toBeInTheDocument()
    })
  })

  it("displays mental health coverage", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Mental Health Services")).toBeInTheDocument()
      expect(screen.getByText("Therapy Sessions")).toBeInTheDocument()
    })
  })

  it("shows maternity coverage details", async () => {
    render(<Coverage />)

    await waitFor(() => {
      expect(screen.getByText("Maternity Care")).toBeInTheDocument()
      expect(screen.getByText("Prenatal Care")).toBeInTheDocument()
    })
  })

  it("handles coverage calculator interactions", async () => {
    render(<Coverage />)

    const calculatorButton = screen.getByText("Coverage Calculator")
    await user.click(calculatorButton)

    await waitFor(() => {
      expect(screen.getByText("Estimate Your Costs")).toBeInTheDocument()
    })
  })
})
