import type React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/app/dashboard/page"
import Claims from "@/app/claims/page"
import Providers from "@/app/providers/page"
import Login from "@/app/login/page"
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
        data: { user: mockHospitalUser, session: { access_token: "mock-token" } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: mockHospitalUser } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockHospitalUser, error: null }),
      then: jest.fn().mockResolvedValue({ data: mockHospitalData, error: null }),
    })),
  }),
}))

// Mock hospital user
const mockHospitalUser = {
  id: "hospital-1",
  email: "hospital@demo.com",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  role: "hospital",
  organization: "City General Hospital",
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
}

// Mock hospital data
const mockHospitalData = {
  patients: [
    {
      id: "patient-1",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-06-15",
      insuranceId: "INS-123456",
      policyNumber: "POL-2024-001",
      eligibilityStatus: "active",
      lastVisit: "2024-01-20",
    },
    {
      id: "patient-2",
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "1990-03-22",
      insuranceId: "INS-789012",
      policyNumber: "POL-2024-002",
      eligibilityStatus: "active",
      lastVisit: "2024-01-18",
    },
  ],
  claims: [
    {
      id: "hospital-claim-1",
      patientId: "patient-1",
      claimNumber: "HCL-2024-001",
      status: "submitted",
      amount: 2500.0,
      serviceDate: "2024-01-20",
      diagnosis: "Chest pain evaluation",
      procedures: ["ECG", "Chest X-ray", "Blood work"],
      icdCodes: ["R06.02", "Z51.11"],
      cptCodes: ["93000", "71020", "80053"],
    },
    {
      id: "hospital-claim-2",
      patientId: "patient-2",
      claimNumber: "HCL-2024-002",
      status: "approved",
      amount: 1800.0,
      approvedAmount: 1620.0,
      serviceDate: "2024-01-18",
      diagnosis: "Routine physical examination",
      procedures: ["Physical exam", "Lab work"],
      icdCodes: ["Z00.00"],
      cptCodes: ["99213", "80050"],
    },
  ],
  revenue: {
    totalBilled: 125000.0,
    totalCollected: 98000.0,
    pendingClaims: 15000.0,
    rejectedClaims: 12000.0,
    collectionRate: 78.4,
    averageReimbursement: 0.72,
  },
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
)

describe("Hospital Workflow E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.performance.now = jest.fn(() => Date.now())
  })

  describe("Hospital Authentication and Dashboard", () => {
    test("should authenticate hospital user and load dashboard", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>,
      )

      // Login as hospital user
      await user.type(screen.getByLabelText(/email/i), "hospital@demo.com")
      await user.type(screen.getByLabelText(/password/i), "HospitalPass123!")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard")
      })

      // Load hospital dashboard
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/hospital dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/city general hospital/i)).toBeInTheDocument()
      })

      // Check hospital-specific metrics
      expect(screen.getByText(/total billed/i)).toBeInTheDocument()
      expect(screen.getByText(/collection rate/i)).toBeInTheDocument()
      expect(screen.getByText(/pending claims/i)).toBeInTheDocument()
      expect(screen.getByText("$125,000.00")).toBeInTheDocument()
      expect(screen.getByText("78.4%")).toBeInTheDocument()
    })

    test("should display hospital-specific navigation and features", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/hospital dashboard/i)).toBeInTheDocument()
      })

      // Check hospital-specific navigation
      expect(screen.getByRole("link", { name: /patient management/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /claims submission/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /revenue tracking/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /compliance/i })).toBeInTheDocument()

      // Check quick actions
      expect(screen.getByRole("button", { name: /submit new claim/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /verify eligibility/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /generate report/i })).toBeInTheDocument()
    })
  })

  describe("Patient Management and Eligibility", () => {
    test("should search and verify patient eligibility", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/hospital dashboard/i)).toBeInTheDocument()
      })

      // Click eligibility verification
      await user.click(screen.getByRole("button", { name: /verify eligibility/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/eligibility verification/i)).toBeInTheDocument()
      })

      // Search for patient
      await user.type(screen.getByLabelText(/patient id/i), "INS-123456")
      await user.click(screen.getByRole("button", { name: /verify/i }))

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument()
        expect(screen.getByText(/active/i)).toBeInTheDocument()
        expect(screen.getByText(/pol-2024-001/i)).toBeInTheDocument()
      })

      // Check eligibility details
      expect(screen.getByText(/coverage active/i)).toBeInTheDocument()
      expect(screen.getByText(/deductible met/i)).toBeInTheDocument()
      expect(screen.getByText(/copay required/i)).toBeInTheDocument()
    })

    test("should handle patient registration for new patients", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Open patient registration
      await user.click(screen.getByRole("button", { name: /register patient/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/patient registration/i)).toBeInTheDocument()
      })

      // Fill patient information
      await user.type(screen.getByLabelText(/first name/i), "Michael")
      await user.type(screen.getByLabelText(/last name/i), "Wilson")
      await user.type(screen.getByLabelText(/date of birth/i), "1988-09-12")
      await user.type(screen.getByLabelText(/insurance id/i), "INS-345678")
      await user.type(screen.getByLabelText(/policy number/i), "POL-2024-003")

      // Submit registration
      await user.click(screen.getByRole("button", { name: /register/i }))

      await waitFor(() => {
        expect(screen.getByText(/patient registered successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Claims Submission Process", () => {
    test("should submit new claim with medical coding", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Click submit new claim
      await user.click(screen.getByRole("button", { name: /submit new claim/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/claim submission/i)).toBeInTheDocument()
      })

      // Fill patient information
      await user.type(screen.getByLabelText(/patient id/i), "patient-1")
      await user.type(screen.getByLabelText(/service date/i), "2024-02-01")

      // Add diagnosis codes
      await user.type(screen.getByLabelText(/primary diagnosis/i), "Hypertension")
      await user.type(screen.getByLabelText(/icd-10 code/i), "I10")

      // Add procedure codes
      await user.click(screen.getByRole("button", { name: /add procedure/i }))
      await user.type(screen.getByLabelText(/procedure description/i), "Office visit")
      await user.type(screen.getByLabelText(/cpt code/i), "99213")
      await user.type(screen.getByLabelText(/charge amount/i), "150.00")

      // Add another procedure
      await user.click(screen.getByRole("button", { name: /add procedure/i }))
      await user.type(screen.getAllByLabelText(/procedure description/i)[1], "Blood pressure check")
      await user.type(screen.getAllByLabelText(/cpt code/i)[1], "93000")
      await user.type(screen.getAllByLabelText(/charge amount/i)[1], "75.00")

      // Upload supporting documents
      const fileInput = screen.getByLabelText(/upload documents/i)
      const file = new File(["medical record"], "medical-record.pdf", { type: "application/pdf" })
      await user.upload(fileInput, file)

      // Submit claim
      await user.click(screen.getByRole("button", { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/claim number: hcl-2024-003/i)).toBeInTheDocument()
      })
    })

    test("should validate medical coding compliance", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("button", { name: /submit new claim/i }))

      // Submit with invalid ICD-10 code
      await user.type(screen.getByLabelText(/icd-10 code/i), "INVALID")
      await user.click(screen.getByRole("button", { name: /validate codes/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid icd-10 code/i)).toBeInTheDocument()
      })

      // Submit with invalid CPT code
      await user.clear(screen.getByLabelText(/icd-10 code/i))
      await user.type(screen.getByLabelText(/icd-10 code/i), "I10")
      await user.type(screen.getByLabelText(/cpt code/i), "00000")
      await user.click(screen.getByRole("button", { name: /validate codes/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid cpt code/i)).toBeInTheDocument()
      })
    })

    test("should handle claim status tracking", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("HCL-2024-001")).toBeInTheDocument()
        expect(screen.getByText("HCL-2024-002")).toBeInTheDocument()
      })

      // Click on claim to view status
      const claimRow = screen.getByText("HCL-2024-001").closest("tr")
      const statusButton = within(claimRow!).getByRole("button", { name: /track status/i })
      await user.click(statusButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/claim tracking/i)).toBeInTheDocument()
      })

      // Check status timeline
      expect(screen.getByText(/submitted/i)).toBeInTheDocument()
      expect(screen.getByText(/under review/i)).toBeInTheDocument()
      expect(screen.getByText(/pending additional information/i)).toBeInTheDocument()

      // Check required actions
      expect(screen.getByText(/additional documentation required/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /upload documents/i })).toBeInTheDocument()
    })
  })

  describe("Revenue and Billing Management", () => {
    test("should display revenue analytics and metrics", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/revenue analytics/i)).toBeInTheDocument()
      })

      // Check revenue metrics
      expect(screen.getByText("$125,000.00")).toBeInTheDocument() // Total billed
      expect(screen.getByText("$98,000.00")).toBeInTheDocument() // Total collected
      expect(screen.getByText("$15,000.00")).toBeInTheDocument() // Pending claims
      expect(screen.getByText("78.4%")).toBeInTheDocument() // Collection rate

      // Check charts and visualizations
      expect(screen.getByRole("img", { name: /revenue trend chart/i })).toBeInTheDocument()
      expect(screen.getByRole("img", { name: /claims status distribution/i })).toBeInTheDocument()
    })

    test("should generate financial reports", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Click generate report
      await user.click(screen.getByRole("button", { name: /generate report/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/report generation/i)).toBeInTheDocument()
      })

      // Select report type
      await user.click(screen.getByRole("combobox", { name: /report type/i }))
      await user.click(screen.getByText(/monthly revenue report/i))

      // Select date range
      await user.type(screen.getByLabelText(/start date/i), "2024-01-01")
      await user.type(screen.getByLabelText(/end date/i), "2024-01-31")

      // Generate report
      await user.click(screen.getByRole("button", { name: /generate/i }))

      await waitFor(() => {
        expect(screen.getByText(/report generated successfully/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /download excel/i })).toBeInTheDocument()
      })
    })
  })

  describe("Provider Network and Referrals", () => {
    test("should manage specialist referrals", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Providers />
        </TestWrapper>,
      )

      // Click create referral
      await user.click(screen.getByRole("button", { name: /create referral/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/create referral/i)).toBeInTheDocument()
      })

      // Fill referral information
      await user.type(screen.getByLabelText(/patient id/i), "patient-1")
      await user.click(screen.getByRole("combobox", { name: /specialty/i }))
      await user.click(screen.getByText(/cardiology/i))
      await user.click(screen.getByRole("combobox", { name: /provider/i }))
      await user.click(screen.getByText(/dr. sarah johnson/i))

      // Add referral reason
      await user.type(screen.getByLabelText(/reason for referral/i), "Chest pain evaluation")
      await user.type(screen.getByLabelText(/clinical notes/i), "Patient reports intermittent chest pain")

      // Set urgency
      await user.click(screen.getByRole("radio", { name: /routine/i }))

      // Submit referral
      await user.click(screen.getByRole("button", { name: /submit referral/i }))

      await waitFor(() => {
        expect(screen.getByText(/referral created successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/referral id: ref-2024-001/i)).toBeInTheDocument()
      })
    })

    test("should track referral status and outcomes", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Providers />
        </TestWrapper>,
      )

      // View referrals list
      await waitFor(() => {
        expect(screen.getByText(/active referrals/i)).toBeInTheDocument()
      })

      // Click on referral to view details
      const referralRow = screen.getByText("REF-2024-001").closest("tr")
      const viewButton = within(referralRow!).getByRole("button", { name: /view details/i })
      await user.click(viewButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/referral details/i)).toBeInTheDocument()
      })

      // Check referral status
      expect(screen.getByText(/pending appointment/i)).toBeInTheDocument()
      expect(screen.getByText(/dr. sarah johnson/i)).toBeInTheDocument()
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument()

      // Update referral status
      await user.click(screen.getByRole("button", { name: /update status/i }))
      await user.click(screen.getByText(/appointment scheduled/i))
      await user.click(screen.getByRole("button", { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText(/referral updated successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Compliance and Documentation", () => {
    test("should maintain HIPAA compliance audit trail", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Navigate to compliance section
      await user.click(screen.getByRole("link", { name: /compliance/i }))

      await waitFor(() => {
        expect(screen.getByText(/hipaa compliance/i)).toBeInTheDocument()
        expect(screen.getByText(/audit trail/i)).toBeInTheDocument()
      })

      // Check audit log entries
      expect(screen.getByText(/patient record accessed/i)).toBeInTheDocument()
      expect(screen.getByText(/claim submitted/i)).toBeInTheDocument()
      expect(screen.getByText(/document uploaded/i)).toBeInTheDocument()

      // Filter audit log
      await user.click(screen.getByRole("combobox", { name: /filter by action/i }))
      await user.click(screen.getByText(/patient access/i))

      await waitFor(() => {
        expect(screen.getByText(/patient record accessed/i)).toBeInTheDocument()
        expect(screen.queryByText(/claim submitted/i)).not.toBeInTheDocument()
      })
    })

    test("should generate compliance reports", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("link", { name: /compliance/i }))

      // Generate compliance report
      await user.click(screen.getByRole("button", { name: /generate compliance report/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/compliance report/i)).toBeInTheDocument()
      })

      // Select report parameters
      await user.click(screen.getByRole("combobox", { name: /report type/i }))
      await user.click(screen.getByText(/hipaa audit report/i))

      await user.type(screen.getByLabelText(/start date/i), "2024-01-01")
      await user.type(screen.getByLabelText(/end date/i), "2024-01-31")

      // Generate report
      await user.click(screen.getByRole("button", { name: /generate/i }))

      await waitFor(() => {
        expect(screen.getByText(/compliance report generated/i)).toBeInTheDocument()
        expect(screen.getByText(/total access events: 156/i)).toBeInTheDocument()
        expect(screen.getByText(/violations detected: 0/i)).toBeInTheDocument()
      })
    })
  })

  describe("Error Handling and Edge Cases", () => {
    test("should handle claim submission errors", async () => {
      const user = userEvent.setup()

      // Mock API error
      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.from().insert.mockRejectedValueOnce(new Error("Claim validation failed"))

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("button", { name: /submit new claim/i }))

      // Fill minimal claim data
      await user.type(screen.getByLabelText(/patient id/i), "patient-1")
      await user.type(screen.getByLabelText(/icd-10 code/i), "I10")
      await user.type(screen.getByLabelText(/cpt code/i), "99213")

      await user.click(screen.getByRole("button", { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim submission failed/i)).toBeInTheDocument()
        expect(screen.getByText(/claim validation failed/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
      })
    })

    test("should handle patient eligibility verification failures", async () => {
      const user = userEvent.setup()

      // Mock eligibility check failure
      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.from().single.mockRejectedValueOnce(new Error("Patient not found"))

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("button", { name: /verify eligibility/i }))
      await user.type(screen.getByLabelText(/patient id/i), "INVALID-ID")
      await user.click(screen.getByRole("button", { name: /verify/i }))

      await waitFor(() => {
        expect(screen.getByText(/patient not found/i)).toBeInTheDocument()
        expect(screen.getByText(/please verify the patient id/i)).toBeInTheDocument()
      })
    })
  })

  describe("Performance and Scalability", () => {
    test("should handle large patient datasets efficiently", async () => {
      // Mock large patient dataset
      const largePatientData = Array.from({ length: 5000 }, (_, i) => ({
        id: `patient-${i}`,
        firstName: `Patient${i}`,
        lastName: `Test${i}`,
        insuranceId: `INS-${String(i).padStart(6, "0")}`,
        eligibilityStatus: ["active", "inactive", "pending"][i % 3],
      }))

      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.from().then.mockResolvedValueOnce({ data: largePatientData, error: null })

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/patient management/i)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test("should optimize claim processing workflows", async () => {
      const user = userEvent.setup()

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Simulate rapid claim processing
      await user.click(screen.getByRole("button", { name: /submit new claim/i }))

      // Quick form fill
      await user.type(screen.getByLabelText(/patient id/i), "patient-1")
      await user.type(screen.getByLabelText(/icd-10 code/i), "I10")
      await user.type(screen.getByLabelText(/cpt code/i), "99213")

      await user.click(screen.getByRole("button", { name: /submit claim/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(2000) // Should process within 2 seconds
    })
  })
})
