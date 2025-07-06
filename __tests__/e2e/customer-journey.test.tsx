import type React from "react"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/app/dashboard/page"
import Claims from "@/app/claims/page"
import Providers from "@/app/providers/page"
import Policies from "@/app/policies/page"
import Coverage from "@/app/coverage/page"
import Login from "@/app/login/page"
import Register from "@/app/register/page"
import jest from "jest" // Import jest to declare it

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: mockCustomerUser, session: { access_token: "mock-token" } },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: mockCustomerUser, session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: mockCustomerUser } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockCustomerUser, error: null }),
      then: jest.fn().mockResolvedValue({ data: mockClaimsData, error: null }),
    })),
  }),
}))

// Mock user data
const mockCustomerUser = {
  id: "customer-1",
  email: "demo@healthinsurance.com",
  firstName: "Demo",
  lastName: "Customer",
  role: "customer",
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
}

// Mock claims data
const mockClaimsData = [
  {
    id: "claim-1",
    claimNumber: "CLM-2024-001",
    status: "approved",
    amount: 1250.0,
    submittedDate: "2024-01-15",
    provider: "City General Hospital",
    description: "Emergency Room Visit",
    approvedAmount: 1000.0,
  },
  {
    id: "claim-2",
    claimNumber: "CLM-2024-002",
    status: "pending",
    amount: 850.0,
    submittedDate: "2024-01-20",
    provider: "Downtown Medical Center",
    description: "Routine Checkup",
    approvedAmount: null,
  },
  {
    id: "claim-3",
    claimNumber: "CLM-2024-003",
    status: "rejected",
    amount: 2100.0,
    submittedDate: "2024-01-10",
    provider: "Specialty Care Clinic",
    description: "Specialist Consultation",
    rejectionReason: "Service not covered under current plan",
  },
]

// Mock providers data
const mockProvidersData = [
  {
    id: "provider-1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    hospital: "City General Hospital",
    rating: 4.8,
    distance: "2.3 miles",
    inNetwork: true,
    acceptingPatients: true,
    nextAvailable: "2024-02-15",
  },
  {
    id: "provider-2",
    name: "Dr. Michael Chen",
    specialty: "Orthopedics",
    hospital: "Downtown Medical Center",
    rating: 4.6,
    distance: "3.1 miles",
    inNetwork: true,
    acceptingPatients: true,
    nextAvailable: "2024-02-20",
  },
  {
    id: "provider-3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    hospital: "Specialty Care Clinic",
    rating: 4.9,
    distance: "1.8 miles",
    inNetwork: false,
    acceptingPatients: true,
    nextAvailable: "2024-02-18",
  },
]

// Mock policy data
const mockPolicyData = {
  id: "policy-1",
  policyNumber: "POL-2024-001",
  planName: "Premium Health Plan",
  status: "active",
  effectiveDate: "2024-01-01",
  renewalDate: "2024-12-31",
  premium: 450.0,
  deductible: 2000.0,
  deductibleMet: 1250.0,
  outOfPocketMax: 8000.0,
  outOfPocketMet: 1250.0,
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
)

describe("Customer Journey E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock performance.now for timing tests
    global.performance.now = jest.fn(() => Date.now())
  })

  describe("Complete Customer Onboarding Flow", () => {
    test("should complete full registration and login flow", async () => {
      const user = userEvent.setup()
      const startTime = performance.now()

      // Step 1: Registration
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      )

      // Fill registration form
      await user.type(screen.getByLabelText(/first name/i), "Demo")
      await user.type(screen.getByLabelText(/last name/i), "Customer")
      await user.type(screen.getByLabelText(/email/i), "demo@healthinsurance.com")
      await user.type(screen.getByLabelText(/password/i), "SecurePassword123!")
      await user.type(screen.getByLabelText(/confirm password/i), "SecurePassword123!")

      // Accept terms
      await user.click(screen.getByLabelText(/terms and conditions/i))

      // Submit registration
      await user.click(screen.getByRole("button", { name: /create account/i }))

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
      })

      // Step 2: Login
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>,
      )

      await user.type(screen.getByLabelText(/email/i), "demo@healthinsurance.com")
      await user.type(screen.getByLabelText(/password/i), "SecurePassword123!")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      // Wait for dashboard redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard")
      })

      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test("should handle registration validation errors", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      )

      // Submit empty form
      await user.click(screen.getByRole("button", { name: /create account/i }))

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })

      // Test password mismatch
      await user.type(screen.getByLabelText(/password/i), "password1")
      await user.type(screen.getByLabelText(/confirm password/i), "password2")
      await user.click(screen.getByRole("button", { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    test("should navigate to dashboard after successful login", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Check dashboard elements load
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
        expect(screen.getByText(/recent claims/i)).toBeInTheDocument()
        expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
      })

      // Check navigation menu
      expect(screen.getByRole("link", { name: /claims/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /providers/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /policies/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /coverage/i })).toBeInTheDocument()
    })
  })

  describe("Claims Management Flow", () => {
    test("should display and filter claims correctly", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Wait for claims to load
      await waitFor(() => {
        expect(screen.getByText("CLM-2024-001")).toBeInTheDocument()
        expect(screen.getByText("CLM-2024-002")).toBeInTheDocument()
        expect(screen.getByText("CLM-2024-003")).toBeInTheDocument()
      })

      // Test status filter
      const statusFilter = screen.getByRole("combobox", { name: /filter by status/i })
      await user.click(statusFilter)
      await user.click(screen.getByText(/approved/i))

      await waitFor(() => {
        expect(screen.getByText("CLM-2024-001")).toBeInTheDocument()
        expect(screen.queryByText("CLM-2024-002")).not.toBeInTheDocument()
        expect(screen.queryByText("CLM-2024-003")).not.toBeInTheDocument()
      })

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search claims/i)
      await user.type(searchInput, "Emergency")

      await waitFor(() => {
        expect(screen.getByText("Emergency Room Visit")).toBeInTheDocument()
        expect(screen.queryByText("Routine Checkup")).not.toBeInTheDocument()
      })
    })

    test("should handle claim details view", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("CLM-2024-001")).toBeInTheDocument()
      })

      // Click on claim to view details
      const claimRow = screen.getByText("CLM-2024-001").closest("tr")
      const viewButton = within(claimRow!).getByRole("button", { name: /view details/i })
      await user.click(viewButton)

      // Check modal opens with claim details
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/claim details/i)).toBeInTheDocument()
        expect(screen.getByText("$1,250.00")).toBeInTheDocument()
        expect(screen.getByText("City General Hospital")).toBeInTheDocument()
      })

      // Close modal
      await user.click(screen.getByRole("button", { name: /close/i }))
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })

    test("should handle new claim submission", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Click new claim button
      await user.click(screen.getByRole("button", { name: /file new claim/i }))

      // Fill claim form
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/provider name/i), "Test Provider")
      await user.type(screen.getByLabelText(/service date/i), "2024-02-01")
      await user.type(screen.getByLabelText(/amount/i), "500.00")
      await user.type(screen.getByLabelText(/description/i), "Test medical service")

      // Submit claim
      await user.click(screen.getByRole("button", { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Provider Search and Booking Flow", () => {
    test("should search and filter providers", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Providers />
        </TestWrapper>,
      )

      // Wait for providers to load
      await waitFor(() => {
        expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
        expect(screen.getByText("Dr. Michael Chen")).toBeInTheDocument()
        expect(screen.getByText("Dr. Emily Rodriguez")).toBeInTheDocument()
      })

      // Test specialty filter
      const specialtyFilter = screen.getByRole("combobox", { name: /specialty/i })
      await user.click(specialtyFilter)
      await user.click(screen.getByText(/cardiology/i))

      await waitFor(() => {
        expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
        expect(screen.queryByText("Dr. Michael Chen")).not.toBeInTheDocument()
        expect(screen.queryByText("Dr. Emily Rodriguez")).not.toBeInTheDocument()
      })

      // Test network filter
      const networkFilter = screen.getByRole("checkbox", { name: /in-network only/i })
      await user.click(networkFilter)

      await waitFor(() => {
        expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
        expect(screen.queryByText("Dr. Emily Rodriguez")).not.toBeInTheDocument()
      })
    })

    test("should handle provider details and appointment booking", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Providers />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument()
      })

      // Click view details
      const providerCard = screen.getByText("Dr. Sarah Johnson").closest(".card")
      const viewButton = within(providerCard!).getByRole("button", { name: /view details/i })
      await user.click(viewButton)

      // Check provider details modal
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/provider details/i)).toBeInTheDocument()
        expect(screen.getByText("Cardiology")).toBeInTheDocument()
        expect(screen.getByText("City General Hospital")).toBeInTheDocument()
        expect(screen.getByText("4.8")).toBeInTheDocument()
      })

      // Book appointment
      await user.click(screen.getByRole("button", { name: /book appointment/i }))

      await waitFor(() => {
        expect(screen.getByText(/select appointment date/i)).toBeInTheDocument()
      })

      // Select date and time
      await user.click(screen.getByText("15")) // Select 15th of month
      await user.click(screen.getByText("10:00 AM"))

      // Confirm booking
      await user.click(screen.getByRole("button", { name: /confirm booking/i }))

      await waitFor(() => {
        expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Policy and Coverage Management", () => {
    test("should display policy information correctly", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Policies />
        </TestWrapper>,
      )

      // Wait for policy data to load
      await waitFor(() => {
        expect(screen.getByText("POL-2024-001")).toBeInTheDocument()
        expect(screen.getByText("Premium Health Plan")).toBeInTheDocument()
        expect(screen.getByText("Active")).toBeInTheDocument()
      })

      // Check policy details
      expect(screen.getByText("$450.00")).toBeInTheDocument() // Premium
      expect(screen.getByText("01/01/2024")).toBeInTheDocument() // Effective date
      expect(screen.getByText("12/31/2024")).toBeInTheDocument() // Renewal date
    })

    test("should display coverage breakdown", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Coverage />
        </TestWrapper>,
      )

      // Wait for coverage data to load
      await waitFor(() => {
        expect(screen.getByText(/deductible progress/i)).toBeInTheDocument()
        expect(screen.getByText(/out-of-pocket maximum/i)).toBeInTheDocument()
      })

      // Check deductible progress
      expect(screen.getByText("$1,250")).toBeInTheDocument() // Met amount
      expect(screen.getByText("$2,000")).toBeInTheDocument() // Total deductible

      // Check coverage categories
      expect(screen.getByText(/preventive care/i)).toBeInTheDocument()
      expect(screen.getByText(/emergency services/i)).toBeInTheDocument()
      expect(screen.getByText(/prescription drugs/i)).toBeInTheDocument()
    })

    test("should handle document downloads", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Policies />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("POL-2024-001")).toBeInTheDocument()
      })

      // Mock download functionality
      const downloadSpy = jest.spyOn(document, "createElement")
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      }
      downloadSpy.mockReturnValue(mockLink as any)

      // Click download button
      await user.click(screen.getByRole("button", { name: /download policy/i }))

      expect(mockLink.click).toHaveBeenCalled()
      downloadSpy.mockRestore()
    })
  })

  describe("Error Handling and Edge Cases", () => {
    test("should handle network errors gracefully", async () => {
      // Mock network error
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"))

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/unable to load claims/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
      })
    })

    test("should handle session expiration", async () => {
      // Mock session expiration
      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Session expired" },
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/login")
      })
    })

    test("should validate form inputs", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Open new claim form
      await user.click(screen.getByRole("button", { name: /file new claim/i }))

      // Submit empty form
      await user.click(screen.getByRole("button", { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText(/provider name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/service date is required/i)).toBeInTheDocument()
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
      })
    })
  })

  describe("Accessibility and User Experience", () => {
    test("should support keyboard navigation", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Test tab navigation
      const firstLink = screen.getByRole("link", { name: /claims/i })
      firstLink.focus()
      expect(document.activeElement).toBe(firstLink)

      // Test arrow key navigation in menus
      fireEvent.keyDown(firstLink, { key: "ArrowDown" })
      const nextLink = screen.getByRole("link", { name: /providers/i })
      expect(document.activeElement).toBe(nextLink)
    })

    test("should have proper ARIA labels", async () => {
      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByRole("main")).toBeInTheDocument()
        expect(screen.getByRole("navigation")).toBeInTheDocument()
      })

      // Check table accessibility
      const table = screen.getByRole("table")
      expect(table).toHaveAttribute("aria-label", expect.stringContaining("claims"))

      // Check form accessibility
      const searchInput = screen.getByRole("searchbox")
      expect(searchInput).toHaveAttribute("aria-label", expect.stringContaining("search"))
    })

    test("should provide screen reader announcements", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Mock screen reader announcements
      const announceRegion = screen.getByRole("status", { name: /announcements/i })
      expect(announceRegion).toBeInTheDocument()

      // Trigger action that should announce
      await user.click(screen.getByRole("button", { name: /file new claim/i }))

      await waitFor(() => {
        expect(announceRegion).toHaveTextContent(/claim form opened/i)
      })
    })
  })

  describe("Performance Benchmarks", () => {
    test("should load dashboard within performance threshold", async () => {
      const startTime = performance.now()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(2000) // Should load within 2 seconds
    })

    test("should handle large datasets efficiently", async () => {
      // Mock large dataset
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        id: `claim-${i}`,
        claimNumber: `CLM-2024-${String(i).padStart(3, "0")}`,
        status: ["approved", "pending", "rejected"][i % 3],
        amount: Math.random() * 5000,
        submittedDate: "2024-01-15",
        provider: `Provider ${i}`,
        description: `Service ${i}`,
      }))

      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.from().then.mockResolvedValueOnce({ data: largeMockData, error: null })

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("CLM-2024-000")).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(3000) // Should render within 3 seconds
    })
  })
})
