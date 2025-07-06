import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import Providers from "@/app/providers/page"
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

describe("Providers", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders providers page correctly", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("Healthcare Providers")).toBeInTheDocument()
    })
  })

  it("displays search and filter controls", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search providers/i)).toBeInTheDocument()
      expect(screen.getByText("All Specialties")).toBeInTheDocument()
      expect(screen.getByText("All Networks")).toBeInTheDocument()
    })
  })

  it("filters providers by specialty", async () => {
    render(<Providers />)

    const specialtyFilter = screen.getByRole("combobox", { name: /specialty/i })
    await user.click(specialtyFilter)

    const cardiologyOption = screen.getByText("Cardiology")
    await user.click(cardiologyOption)

    await waitFor(() => {
      expect(screen.getByDisplayValue("Cardiology")).toBeInTheDocument()
    })
  })

  it("searches providers by name", async () => {
    render(<Providers />)

    const searchInput = screen.getByPlaceholderText(/search providers/i)
    await user.type(searchInput, "Dr. Smith")

    await waitFor(() => {
      expect(searchInput).toHaveValue("Dr. Smith")
    })
  })

  it("displays provider cards with correct information", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
      expect(screen.getByText("Cardiology")).toBeInTheDocument()
      expect(screen.getByText("In Network")).toBeInTheDocument()
    })
  })

  it("shows provider ratings and reviews", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("4.8")).toBeInTheDocument()
      expect(screen.getByText("(124 reviews)")).toBeInTheDocument()
    })
  })

  it("opens provider details modal", async () => {
    render(<Providers />)

    const viewDetailsButton = screen.getByText("View Details")
    await user.click(viewDetailsButton)

    await waitFor(() => {
      expect(screen.getByText("Provider Details")).toBeInTheDocument()
    })
  })

  it("displays appointment booking functionality", async () => {
    render(<Providers />)

    const bookButton = screen.getByText("Book Appointment")
    await user.click(bookButton)

    await waitFor(() => {
      expect(screen.getByText("Book Appointment")).toBeInTheDocument()
    })
  })

  it("shows network status indicators", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("In Network")).toBeInTheDocument()
      expect(screen.getByText("Out of Network")).toBeInTheDocument()
    })
  })

  it("displays accessibility indicators", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("Wheelchair Accessible")).toBeInTheDocument()
    })
  })

  it("handles network status filtering", async () => {
    render(<Providers />)

    const networkFilter = screen.getByRole("combobox", { name: /network/i })
    await user.click(networkFilter)

    const inNetworkOption = screen.getByText("In Network")
    await user.click(inNetworkOption)

    await waitFor(() => {
      expect(screen.getByDisplayValue("In Network")).toBeInTheDocument()
    })
  })

  it("shows provider contact information", async () => {
    render(<Providers />)

    const viewDetailsButton = screen.getByText("View Details")
    await user.click(viewDetailsButton)

    await waitFor(() => {
      expect(screen.getByText("(555) 123-4567")).toBeInTheDocument()
      expect(screen.getByText("123 Medical Center Dr")).toBeInTheDocument()
    })
  })

  it("displays provider availability", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("Available Today")).toBeInTheDocument()
    })
  })

  it("handles booking appointment form", async () => {
    render(<Providers />)

    const bookButton = screen.getByText("Book Appointment")
    await user.click(bookButton)

    const dateInput = screen.getByLabelText(/preferred date/i)
    await user.type(dateInput, "2024-01-15")

    const timeSelect = screen.getByLabelText(/preferred time/i)
    await user.selectOptions(timeSelect, "10:00 AM")

    const submitButton = screen.getByText("Book Appointment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Appointment booked successfully")).toBeInTheDocument()
    })
  })

  it("shows provider specializations", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("Heart Surgery")).toBeInTheDocument()
      expect(screen.getByText("Preventive Care")).toBeInTheDocument()
    })
  })

  it("displays distance from user location", async () => {
    render(<Providers />)

    await waitFor(() => {
      expect(screen.getByText("2.3 miles away")).toBeInTheDocument()
    })
  })
})
