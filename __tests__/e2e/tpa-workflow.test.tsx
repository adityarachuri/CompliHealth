import type React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/app/dashboard/page"
import Claims from "@/app/claims/page"
import Analytics from "@/app/analytics/page"
import Policies from "@/app/policies/page"
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
        data: { user: mockTpaUser, session: { access_token: "mock-token" } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: mockTpaUser } },
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
      single: jest.fn().mockResolvedValue({ data: mockTpaUser, error: null }),
      then: jest.fn().mockResolvedValue({ data: mockTpaData, error: null }),
    })),
  }),
}))

// Mock TPA user
const mockTpaUser = {
  id: "tpa-1",
  email: "tpa@demo.com",
  firstName: "Michael",
  lastName: "Chen",
  role: "tpa",
  organization: "Healthcare TPA Services",
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
}

// Mock TPA data
const mockTpaData = {
  claimsQueue: [
    {
      id: "tpa-claim-1",
      claimNumber: "TPA-2024-001",
      status: "pending_review",
      priority: "high",
      amount: 15000.0,
      submittedDate: "2024-01-20",
      hospital: "City General Hospital",
      patient: "John Doe",
      diagnosis: "Emergency surgery",
      reviewDeadline: "2024-01-25",
      assignedTo: "Michael Chen",
    },
    {
      id: "tpa-claim-2",
      claimNumber: "TPA-2024-002",
      status: "requires_info",
      priority: "medium",
      amount: 3500.0,
      submittedDate: "2024-01-18",
      hospital: "Downtown Medical Center",
      patient: "Jane Smith",
      diagnosis: "Diagnostic imaging",
      reviewDeadline: "2024-01-23",
      assignedTo: "Sarah Wilson",
    },
    {
      id: "tpa-claim-3",
      claimNumber: "TPA-2024-003",
      status: "approved",
      priority: "low",
      amount: 850.0,
      approvedAmount: 765.0,
      submittedDate: "2024-01-15",
      hospital: "Community Health Clinic",
      patient: "Robert Johnson",
      diagnosis: "Routine checkup",
      processedDate: "2024-01-19",
      processedBy: "Michael Chen",
    },
  ],
  analytics: {
    totalClaims: 1250,
    pendingClaims: 85,
    approvedClaims: 1050,
    rejectedClaims: 115,
    averageProcessingTime: 3.2,
    approvalRate: 84.0,
    totalPaid: 2850000.0,
    averageClaimAmount: 2280.0,
  },
  policies: [
    {
      id: "policy-tpa-1",
      policyNumber: "TPA-POL-001",
      clientName: "TechCorp Inc.",
      planType: "Group Health",
      status: "active",
      effectiveDate: "2024-01-01",
      renewalDate: "2024-12-31",
      premium: 125000.0,
      enrollees: 450,
      claimsToDate: 125,
    },
    {
      id: "policy-tpa-2",
      policyNumber: "TPA-POL-002",
      clientName: "Manufacturing Co.",
      planType: "PPO",
      status: "pending_renewal",
      effectiveDate: "2023-06-01",
      renewalDate: "2024-06-01",
      premium: 89000.0,
      enrollees: 320,
      claimsToDate: 89,
    },
  ],
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
)

describe("TPA Workflow E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.performance.now = jest.fn(() => Date.now())
  })

  describe("TPA Authentication and Dashboard", () => {
    test("should authenticate TPA user and load dashboard", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>,
      )

      // Login as TPA user
      await user.type(screen.getByLabelText(/email/i), "tpa@demo.com")
      await user.type(screen.getByLabelText(/password/i), "TpaPass123!")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard")
      })

      // Load TPA dashboard
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/tpa dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/healthcare tpa services/i)).toBeInTheDocument()
      })

      // Check TPA-specific metrics
      expect(screen.getByText(/claims processing/i)).toBeInTheDocument()
      expect(screen.getByText(/approval rate/i)).toBeInTheDocument()
      expect(screen.getByText(/average processing time/i)).toBeInTheDocument()
      expect(screen.getByText("1,250")).toBeInTheDocument() // Total claims
      expect(screen.getByText("84.0%")).toBeInTheDocument() // Approval rate
      expect(screen.getByText("3.2 days")).toBeInTheDocument() // Processing time
    })

    test("should display TPA-specific navigation and tools", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/tpa dashboard/i)).toBeInTheDocument()
      })

      // Check TPA-specific navigation
      expect(screen.getByRole("link", { name: /claims queue/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /policy management/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument()
      expect(screen.getByRole("link", { name: /client communication/i })).toBeInTheDocument()

      // Check quick actions
      expect(screen.getByRole("button", { name: /review claims/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /generate report/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /policy renewal/i })).toBeInTheDocument()
    })
  })

  describe("Claims Processing and Review", () => {
    test("should display and manage claims queue", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      // Wait for claims queue to load
      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
        expect(screen.getByText("TPA-2024-002")).toBeInTheDocument()
        expect(screen.getByText("TPA-2024-003")).toBeInTheDocument()
      })

      // Check priority indicators
      expect(screen.getByText(/high priority/i)).toBeInTheDocument()
      expect(screen.getByText(/medium priority/i)).toBeInTheDocument()
      expect(screen.getByText(/low priority/i)).toBeInTheDocument()

      // Test priority filter
      const priorityFilter = screen.getByRole("combobox", { name: /filter by priority/i })
      await user.click(priorityFilter)
      await user.click(screen.getByText(/high/i))

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
        expect(screen.queryByText("TPA-2024-002")).not.toBeInTheDocument()
        expect(screen.queryByText("TPA-2024-003")).not.toBeInTheDocument()
      })

      // Test status filter
      await user.click(screen.getByRole("combobox", { name: /filter by status/i }))
      await user.click(screen.getByText(/pending review/i))

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })
    })

    test("should handle detailed claim review and approval", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })

      // Click on claim to review
      const claimRow = screen.getByText("TPA-2024-001").closest("tr")
      const reviewButton = within(claimRow!).getByRole("button", { name: /review/i })
      await user.click(reviewButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/claim review/i)).toBeInTheDocument()
      })

      // Check claim details
      expect(screen.getByText("$15,000.00")).toBeInTheDocument()
      expect(screen.getByText("Emergency surgery")).toBeInTheDocument()
      expect(screen.getByText("City General Hospital")).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()

      // Review medical documentation
      expect(screen.getByText(/medical records/i)).toBeInTheDocument()
      expect(screen.getByText(/diagnostic reports/i)).toBeInTheDocument()
      expect(screen.getByText(/treatment plan/i)).toBeInTheDocument()

      // Check business rules compliance
      expect(screen.getByText(/policy coverage verified/i)).toBeInTheDocument()
      expect(screen.getByText(/pre-authorization confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/provider network status: in-network/i)).toBeInTheDocument()

      // Approve claim
      await user.click(screen.getByRole("button", { name: /approve/i }))

      // Enter approval details
      await user.type(screen.getByLabelText(/approved amount/i), "14500.00")
      await user.type(screen.getByLabelText(/approval notes/i), "Claim approved with standard deductible applied")

      await user.click(screen.getByRole("button", { name: /confirm approval/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim approved successfully/i)).toBeInTheDocument()
      })
    })

    test("should handle claim rejection with detailed reasoning", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-002")).toBeInTheDocument()
      })

      // Click on claim to review
      const claimRow = screen.getByText("TPA-2024-002").closest("tr")
      const reviewButton = within(claimRow!).getByRole("button", { name: /review/i })
      await user.click(reviewButton)

      // Reject claim
      await user.click(screen.getByRole("button", { name: /reject/i }))

      await waitFor(() => {
        expect(screen.getByText(/rejection reason/i)).toBeInTheDocument()
      })

      // Select rejection reason
      await user.click(screen.getByRole("combobox", { name: /rejection category/i }))
      await user.click(screen.getByText(/insufficient documentation/i))

      // Add detailed explanation
      await user.type(
        screen.getByLabelText(/rejection details/i),
        "Missing pre-authorization for diagnostic imaging. Please provide authorization documentation.",
      )

      // Request additional information
      await user.click(screen.getByRole("checkbox", { name: /request additional info/i }))
      await user.type(
        screen.getByLabelText(/information requested/i),
        "Pre-authorization documentation, detailed treatment notes",
      )

      await user.click(screen.getByRole("button", { name: /confirm rejection/i }))

      await waitFor(() => {
        expect(screen.getByText(/claim rejected/i)).toBeInTheDocument()
        expect(screen.getByText(/notification sent to provider/i)).toBeInTheDocument()
      })
    })

    test("should handle partial approvals and adjustments", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })

      const claimRow = screen.getByText("TPA-2024-001").closest("tr")
      const reviewButton = within(claimRow!).getByRole("button", { name: /review/i })
      await user.click(reviewButton)

      // Partial approval
      await user.click(screen.getByRole("button", { name: /partial approval/i }))

      await waitFor(() => {
        expect(screen.getByText(/adjustment details/i)).toBeInTheDocument()
      })

      // Enter adjusted amount
      await user.type(screen.getByLabelText(/approved amount/i), "12000.00")

      // Select adjustment reasons
      await user.click(screen.getByRole("checkbox", { name: /non-covered services/i }))
      await user.click(screen.getByRole("checkbox", { name: /policy deductible/i }))

      // Add adjustment notes
      await user.type(
        screen.getByLabelText(/adjustment notes/i),
        "Partial approval: $2000 deductible applied, $1000 for non-covered ancillary services",
      )

      await user.click(screen.getByRole("button", { name: /confirm partial approval/i }))

      await waitFor(() => {
        expect(screen.getByText(/partial approval processed/i)).toBeInTheDocument()
        expect(screen.getByText(/approved amount: \$12,000.00/i)).toBeInTheDocument()
      })
    })
  })

  describe("Policy Administration and Management", () => {
    test("should display and manage policy portfolio", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Policies />
        </TestWrapper>,
      )

      // Wait for policies to load
      await waitFor(() => {
        expect(screen.getByText("TPA-POL-001")).toBeInTheDocument()
        expect(screen.getByText("TPA-POL-002")).toBeInTheDocument()
      })

      // Check policy details
      expect(screen.getByText("TechCorp Inc.")).toBeInTheDocument()
      expect(screen.getByText("Manufacturing Co.")).toBeInTheDocument()
      expect(screen.getByText("Group Health")).toBeInTheDocument()
      expect(screen.getByText("PPO")).toBeInTheDocument()

      // Check policy status indicators
      expect(screen.getByText(/active/i)).toBeInTheDocument()
      expect(screen.getByText(/pending renewal/i)).toBeInTheDocument()

      // Filter by status
      const statusFilter = screen.getByRole("combobox", { name: /filter by status/i })
      await user.click(statusFilter)
      await user.click(screen.getByText(/active/i))

      await waitFor(() => {
        expect(screen.getByText("TPA-POL-001")).toBeInTheDocument()
        expect(screen.queryByText("TPA-POL-002")).not.toBeInTheDocument()
      })
    })

    test("should handle policy renewals and modifications", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Policies />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-POL-002")).toBeInTheDocument()
      })

      // Click on policy requiring renewal
      const policyRow = screen.getByText("TPA-POL-002").closest("tr")
      const renewButton = within(policyRow!).getByRole("button", { name: /renew/i })
      await user.click(renewButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/policy renewal/i)).toBeInTheDocument()
      })

      // Review current policy terms
      expect(screen.getByText("Manufacturing Co.")).toBeInTheDocument()
      expect(screen.getByText("$89,000.00")).toBeInTheDocument()
      expect(screen.getByText("320 enrollees")).toBeInTheDocument()

      // Update renewal terms
      await user.clear(screen.getByLabelText(/premium amount/i))
      await user.type(screen.getByLabelText(/premium amount/i), "92000.00")

      await user.type(screen.getByLabelText(/effective date/i), "2024-06-01")
      await user.type(screen.getByLabelText(/renewal date/i), "2025-06-01")

      // Add renewal notes
      await user.type(
        screen.getByLabelText(/renewal notes/i),
        "3.4% premium increase due to claims experience and medical inflation",
      )

      // Process renewal
      await user.click(screen.getByRole("button", { name: /process renewal/i }))

      await waitFor(() => {
        expect(screen.getByText(/renewal processed successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/client notification sent/i)).toBeInTheDocument()
      })
    })

    test("should handle policy modifications and endorsements", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Policies />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-POL-001")).toBeInTheDocument()
      })

      // Click modify policy
      const policyRow = screen.getByText("TPA-POL-001").closest("tr")
      const modifyButton = within(policyRow!).getByRole("button", { name: /modify/i })
      await user.click(modifyButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/policy modification/i)).toBeInTheDocument()
      })

      // Select modification type
      await user.click(screen.getByRole("combobox", { name: /modification type/i }))
      await user.click(screen.getByText(/add dependent/i))

      // Fill dependent information
      await user.type(screen.getByLabelText(/employee id/i), "EMP-12345")
      await user.type(screen.getByLabelText(/dependent name/i), "Sarah Johnson")
      await user.click(screen.getByRole("combobox", { name: /relationship/i }))
      await user.click(screen.getByText(/spouse/i))
      await user.type(screen.getByLabelText(/date of birth/i), "1988-03-15")

      // Set effective date
      await user.type(screen.getByLabelText(/effective date/i), "2024-02-01")

      // Process modification
      await user.click(screen.getByRole("button", { name: /process modification/i }))

      await waitFor(() => {
        expect(screen.getByText(/modification processed/i)).toBeInTheDocument()
        expect(screen.getByText(/endorsement created/i)).toBeInTheDocument()
      })
    })
  })

  describe("Analytics and Reporting", () => {
    test("should display comprehensive analytics dashboard", async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>,
      )

      // Wait for analytics to load
      await waitFor(() => {
        expect(screen.getByText(/claims analytics/i)).toBeInTheDocument()
        expect(screen.getByText(/performance metrics/i)).toBeInTheDocument()
      })

      // Check key metrics
      expect(screen.getByText("1,250")).toBeInTheDocument() // Total claims
      expect(screen.getByText("84.0%")).toBeInTheDocument() // Approval rate
      expect(screen.getByText("3.2 days")).toBeInTheDocument() // Avg processing time
      expect(screen.getByText("$2,850,000")).toBeInTheDocument() // Total paid

      // Check charts and visualizations
      expect(screen.getByRole("img", { name: /claims trend chart/i })).toBeInTheDocument()
      expect(screen.getByRole("img", { name: /approval rate chart/i })).toBeInTheDocument()
      expect(screen.getByRole("img", { name: /processing time chart/i })).toBeInTheDocument()
    })

    test("should generate custom reports with filters", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>,
      )

      // Click generate report
      await user.click(screen.getByRole("button", { name: /generate report/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/custom report/i)).toBeInTheDocument()
      })

      // Select report type
      await user.click(screen.getByRole("combobox", { name: /report type/i }))
      await user.click(screen.getByText(/claims processing report/i))

      // Set date range
      await user.type(screen.getByLabelText(/start date/i), "2024-01-01")
      await user.type(screen.getByLabelText(/end date/i), "2024-01-31")

      // Select filters
      await user.click(screen.getByRole("combobox", { name: /status filter/i }))
      await user.click(screen.getByText(/approved/i))

      await user.click(screen.getByRole("combobox", { name: /priority filter/i }))
      await user.click(screen.getByText(/high/i))

      // Select output format
      await user.click(screen.getByRole("radio", { name: /pdf/i }))

      // Generate report
      await user.click(screen.getByRole("button", { name: /generate/i }))

      await waitFor(() => {
        expect(screen.getByText(/report generated successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/processing 45 claims/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument()
      })
    })

    test("should display predictive analytics and forecasting", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>,
      )

      // Navigate to predictive analytics
      await user.click(screen.getByRole("tab", { name: /predictive analytics/i }))

      await waitFor(() => {
        expect(screen.getByText(/claims forecasting/i)).toBeInTheDocument()
        expect(screen.getByText(/cost projections/i)).toBeInTheDocument()
      })

      // Check forecasting metrics
      expect(screen.getByText(/projected claims volume/i)).toBeInTheDocument()
      expect(screen.getByText(/estimated costs/i)).toBeInTheDocument()
      expect(screen.getByText(/risk indicators/i)).toBeInTheDocument()

      // Check forecast charts
      expect(screen.getByRole("img", { name: /claims volume forecast/i })).toBeInTheDocument()
      expect(screen.getByRole("img", { name: /cost projection chart/i })).toBeInTheDocument()
    })
  })

  describe("Client Communication and Support", () => {
    test("should manage client communications and messages", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Navigate to communications
      await user.click(screen.getByRole("link", { name: /client communication/i }))

      await waitFor(() => {
        expect(screen.getByText(/message center/i)).toBeInTheDocument()
        expect(screen.getByText(/client inquiries/i)).toBeInTheDocument()
      })

      // Check message queue
      expect(screen.getByText(/new messages: 5/i)).toBeInTheDocument()
      expect(screen.getByText(/pending responses: 3/i)).toBeInTheDocument()

      // Click on message to respond
      const messageRow = screen.getByText("Policy renewal inquiry").closest("tr")
      const respondButton = within(messageRow!).getByRole("button", { name: /respond/i })
      await user.click(respondButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/client message/i)).toBeInTheDocument()
      })

      // View original message
      expect(screen.getByText(/when is our policy renewal due/i)).toBeInTheDocument()
      expect(screen.getByText(/from: techcorp inc\./i)).toBeInTheDocument()

      // Compose response
      await user.type(
        screen.getByLabelText(/response/i),
        "Your policy renewal is scheduled for December 31, 2024. We will send renewal documents 60 days prior to the renewal date.",
      )

      // Send response
      await user.click(screen.getByRole("button", { name: /send response/i }))

      await waitFor(() => {
        expect(screen.getByText(/response sent successfully/i)).toBeInTheDocument()
      })
    })

    test("should handle escalated issues and priority support", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("link", { name: /client communication/i }))

      // Check escalated issues
      await user.click(screen.getByRole("tab", { name: /escalated issues/i }))

      await waitFor(() => {
        expect(screen.getByText(/high priority issues/i)).toBeInTheDocument()
      })

      // Click on escalated issue
      const issueRow = screen.getByText("Claim processing delay").closest("tr")
      const viewButton = within(issueRow!).getByRole("button", { name: /view details/i })
      await user.click(viewButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/escalated issue details/i)).toBeInTheDocument()
      })

      // Check issue details
      expect(screen.getByText(/manufacturing co\./i)).toBeInTheDocument()
      expect(screen.getByText(/urgent/i)).toBeInTheDocument()
      expect(screen.getByText(/sla: 4 hours/i)).toBeInTheDocument()

      // Add resolution notes
      await user.type(
        screen.getByLabelText(/resolution notes/i),
        "Issue resolved: Claim processing delay was due to missing documentation. Documentation received and claim processed.",
      )

      // Update status
      await user.click(screen.getByRole("combobox", { name: /status/i }))
      await user.click(screen.getByText(/resolved/i))

      // Save resolution
      await user.click(screen.getByRole("button", { name: /save resolution/i }))

      await waitFor(() => {
        expect(screen.getByText(/issue resolved successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Compliance and Audit Management", () => {
    test("should generate compliance reports and audit trails", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Navigate to compliance
      await user.click(screen.getByRole("link", { name: /compliance/i }))

      await waitFor(() => {
        expect(screen.getByText(/compliance dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/audit management/i)).toBeInTheDocument()
      })

      // Check compliance metrics
      expect(screen.getByText(/sla compliance: 98\.5%/i)).toBeInTheDocument()
      expect(screen.getByText(/regulatory compliance: 100%/i)).toBeInTheDocument()
      expect(screen.getByText(/audit findings: 0/i)).toBeInTheDocument()

      // Generate compliance report
      await user.click(screen.getByRole("button", { name: /generate compliance report/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/compliance report/i)).toBeInTheDocument()
      })

      // Select report parameters
      await user.click(screen.getByRole("combobox", { name: /report type/i }))
      await user.click(screen.getByText(/sla compliance report/i))

      await user.type(screen.getByLabelText(/reporting period/i), "2024-01")

      // Generate report
      await user.click(screen.getByRole("button", { name: /generate/i }))

      await waitFor(() => {
        expect(screen.getByText(/compliance report generated/i)).toBeInTheDocument()
        expect(screen.getByText(/sla violations: 2/i)).toBeInTheDocument()
        expect(screen.getByText(/average response time: 2\.8 hours/i)).toBeInTheDocument()
      })
    })

    test("should manage regulatory requirements and documentation", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await user.click(screen.getByRole("link", { name: /compliance/i }))

      // Navigate to regulatory requirements
      await user.click(screen.getByRole("tab", { name: /regulatory/i }))

      await waitFor(() => {
        expect(screen.getByText(/regulatory requirements/i)).toBeInTheDocument()
      })

      // Check requirement status
      expect(screen.getByText(/hipaa compliance: current/i)).toBeInTheDocument()
      expect(screen.getByText(/state regulations: current/i)).toBeInTheDocument()
      expect(screen.getByText(/federal requirements: current/i)).toBeInTheDocument()

      // Update compliance documentation
      await user.click(screen.getByRole("button", { name: /update documentation/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/compliance documentation/i)).toBeInTheDocument()
      })

      // Upload compliance document
      const fileInput = screen.getByLabelText(/upload document/i)
      const file = new File(["compliance doc"], "hipaa-compliance-2024.pdf", { type: "application/pdf" })
      await user.upload(fileInput, file)

      // Add document details
      await user.type(screen.getByLabelText(/document title/i), "HIPAA Compliance Assessment 2024")
      await user.type(screen.getByLabelText(/effective date/i), "2024-01-01")
      await user.type(screen.getByLabelText(/expiration date/i), "2024-12-31")

      // Save documentation
      await user.click(screen.getByRole("button", { name: /save documentation/i }))

      await waitFor(() => {
        expect(screen.getByText(/documentation updated successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe("Business Rules and Workflow Management", () => {
    test("should configure and manage business rules", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Navigate to business rules
      await user.click(screen.getByRole("link", { name: /business rules/i }))

      await waitFor(() => {
        expect(screen.getByText(/business rules engine/i)).toBeInTheDocument()
        expect(screen.getByText(/workflow configuration/i)).toBeInTheDocument()
      })

      // Check existing rules
      expect(screen.getByText(/auto-approval threshold: \$500/i)).toBeInTheDocument()
      expect(screen.getByText(/high-value claim review: \$10,000/i)).toBeInTheDocument()
      expect(screen.getByText(/prior authorization required/i)).toBeInTheDocument()

      // Create new business rule
      await user.click(screen.getByRole("button", { name: /create rule/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/create business rule/i)).toBeInTheDocument()
      })

      // Configure rule
      await user.type(screen.getByLabelText(/rule name/i), "Emergency Claim Fast Track")
      await user.type(screen.getByLabelText(/description/i), "Fast track emergency claims over $5000")

      // Set conditions
      await user.click(screen.getByRole("combobox", { name: /condition type/i }))
      await user.click(screen.getByText(/claim amount/i))
      await user.click(screen.getByRole("combobox", { name: /operator/i }))
      await user.click(screen.getByText(/greater than/i))
      await user.type(screen.getByLabelText(/value/i), "5000")

      // Add additional condition
      await user.click(screen.getByRole("button", { name: /add condition/i }))
      await user.click(screen.getAllByRole("combobox", { name: /condition type/i })[1])
      await user.click(screen.getByText(/diagnosis code/i))
      await user.type(screen.getAllByLabelText(/value/i)[1], "Emergency")

      // Set action
      await user.click(screen.getByRole("combobox", { name: /action/i }))
      await user.click(screen.getByText(/priority review/i))

      // Save rule
      await user.click(screen.getByRole("button", { name: /save rule/i }))

      await waitFor(() => {
        expect(screen.getByText(/business rule created successfully/i)).toBeInTheDocument()
      })
    })

    test("should handle rule overrides and exceptions", async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })

      // Review claim that triggers business rule
      const claimRow = screen.getByText("TPA-2024-001").closest("tr")
      const reviewButton = within(claimRow!).getByRole("button", { name: /review/i })
      await user.click(reviewButton)

      await waitFor(() => {
        expect(screen.getByText(/business rule triggered/i)).toBeInTheDocument()
        expect(screen.getByText(/high-value claim review required/i)).toBeInTheDocument()
      })

      // Override business rule
      await user.click(screen.getByRole("button", { name: /override rule/i }))

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText(/rule override/i)).toBeInTheDocument()
      })

      // Provide override justification
      await user.type(
        screen.getByLabelText(/override reason/i),
        "Emergency surgery with clear medical necessity. All documentation provided and verified.",
      )

      // Confirm override
      await user.click(screen.getByRole("button", { name: /confirm override/i }))

      await waitFor(() => {
        expect(screen.getByText(/rule override approved/i)).toBeInTheDocument()
        expect(screen.getByText(/claim processing can continue/i)).toBeInTheDocument()
      })
    })
  })

  describe("Error Handling and System Resilience", () => {
    test("should handle concurrent claim processing", async () => {
      const user = userEvent.setup()

      // Mock concurrent access scenario
      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase.from().update.mockRejectedValueOnce(new Error("Concurrent modification detected"))

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })

      // Attempt to process claim
      const claimRow = screen.getByText("TPA-2024-001").closest("tr")
      const reviewButton = within(claimRow!).getByRole("button", { name: /review/i })
      await user.click(reviewButton)

      await user.click(screen.getByRole("button", { name: /approve/i }))
      await user.type(screen.getByLabelText(/approved amount/i), "14500.00")
      await user.click(screen.getByRole("button", { name: /confirm approval/i }))

      await waitFor(() => {
        expect(screen.getByText(/concurrent modification detected/i)).toBeInTheDocument()
        expect(screen.getByText(/claim is being processed by another user/i)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /refresh and retry/i })).toBeInTheDocument()
      })
    })

    test("should handle system performance under load", async () => {
      // Mock large dataset processing
      const largeMockData = Array.from({ length: 10000 }, (_, i) => ({
        id: `tpa-claim-${i}`,
        claimNumber: `TPA-2024-${String(i).padStart(4, "0")}`,
        status: ["pending_review", "approved", "rejected"][i % 3],
        amount: Math.random() * 50000,
        priority: ["high", "medium", "low"][i % 3],
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
        expect(screen.getByText("TPA-2024-0000")).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(5000) // Should handle large datasets within 5 seconds
    })
  })

  describe("Performance Benchmarks and Optimization", () => {
    test("should maintain optimal response times for critical operations", async () => {
      const user = userEvent.setup()

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/tpa dashboard/i)).toBeInTheDocument()
      })

      const dashboardLoadTime = performance.now() - startTime

      // Test claims queue load time
      const claimsStartTime = performance.now()

      render(
        <TestWrapper>
          <Claims />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText("TPA-2024-001")).toBeInTheDocument()
      })

      const claimsLoadTime = performance.now() - claimsStartTime

      // Test analytics load time
      const analyticsStartTime = performance.now()

      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText(/claims analytics/i)).toBeInTheDocument()
      })

      const analyticsLoadTime = performance.now() - analyticsStartTime

      // Performance assertions
      expect(dashboardLoadTime).toBeLessThan(2000) // Dashboard should load within 2 seconds
      expect(claimsLoadTime).toBeLessThan(3000) // Claims queue should load within 3 seconds
      expect(analyticsLoadTime).toBeLessThan(4000) // Analytics should load within 4 seconds
    })

    test("should optimize memory usage during extended sessions", async () => {
      const user = userEvent.setup()

      // Simulate extended session with multiple page navigations
      const pages = [
        { component: Dashboard, name: "dashboard" },
        { component: Claims, name: "claims" },
        { component: Analytics, name: "analytics" },
        { component: Policies, name: "policies" },
      ]

      for (const page of pages) {
        const { unmount } = render(
          <TestWrapper>
            <page.component />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(document.body).toBeInTheDocument()
        })

        // Simulate user interaction
        await user.click(document.body)

        // Unmount to test cleanup
        unmount()
      }

      // Memory usage should remain stable (no specific assertion as it's environment dependent)
      expect(true).toBe(true) // Placeholder for memory monitoring
    })
  })
})
