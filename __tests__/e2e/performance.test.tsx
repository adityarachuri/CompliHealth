import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/app/dashboard/page"
import Claims from "@/app/claims/page"
import Providers from "@/app/providers/page"
import Analytics from "@/app/analytics/page"
import jest from "jest" // Import jest to declare it

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase with performance simulation
jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      then: jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ data: mockPerformanceData, error: null }), 100)),
        ),
    })),
  }),
}))

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "customer",
}

// Generate large mock datasets for performance testing
const mockPerformanceData = {
  claims: Array.from({ length: 5000 }, (_, i) => ({
    id: `claim-${i}`,
    claimNumber: `CLM-${String(i).padStart(6, "0")}`,
    status: ["approved", "pending", "rejected"][i % 3],
    amount: Math.random() * 10000,
    submittedDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
    provider: `Provider ${i % 100}`,
    description: `Medical service ${i}`,
  })),
  providers: Array.from({ length: 2000 }, (_, i) => ({
    id: `provider-${i}`,
    name: `Dr. Provider ${i}`,
    specialty: ["Cardiology", "Orthopedics", "Dermatology", "Neurology"][i % 4],
    hospital: `Hospital ${i % 50}`,
    rating: 3.5 + Math.random() * 1.5,
    distance: `${(Math.random() * 20).toFixed(1)} miles`,
    inNetwork: Math.random() > 0.3,
  })),
  analytics: {
    chartData: Array.from({ length: 365 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split("T")[0],
      claims: Math.floor(Math.random() * 100),
      amount: Math.random() * 50000,
      approvals: Math.floor(Math.random() * 80),
    })),
  },
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
)

// Performance measurement utilities
const measurePerformance = async (testName: string, testFunction: () => Promise<void>) => {
  const startTime = performance.now()
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0

  await testFunction()

  const endTime = performance.now()
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0
  const duration = endTime - startTime
  const memoryDelta = endMemory - startMemory

  console.log(`Performance Test: ${testName}`)
  console.log(`Duration: ${duration.toFixed(2)}ms`)
  console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`)

  return { duration, memoryDelta }
}

describe("Performance E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock performance.now for consistent timing
    global.performance.now = jest.fn(() => Date.now())
  })

  describe("Page Load Performance", () => {
    test("dashboard should load within performance threshold", async () => {
      const { duration } = await measurePerformance("Dashboard Load", async () => {
        render(
          <TestWrapper>
            <Dashboard />
          </TestWrapper>,
        )

        await waitFor(
          () => {
            expect(screen.getByText(/welcome/i)).toBeInTheDocument()
          },
          { timeout: 5000 },
        )
      })

      expect(duration).toBeLessThan(2000) // Should load within 2 seconds
    })

    test("claims page should handle large datasets efficiently", async () => {
      const { duration } = await measurePerformance("Claims Page Load", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(
          () => {
            expect(screen.getByText(/claims/i)).toBeInTheDocument()
          },
          { timeout: 10000 },
        )
      })

      expect(duration).toBeLessThan(3000) // Should load within 3 seconds even with large dataset
    })

    test("providers search should be responsive", async () => {
      const { duration } = await measurePerformance("Providers Page Load", async () => {
        render(
          <TestWrapper>
            <Providers />
          </TestWrapper>,
        )

        await waitFor(
          () => {
            expect(screen.getByText(/providers/i)).toBeInTheDocument()
          },
          { timeout: 8000 },
        )
      })

      expect(duration).toBeLessThan(2500) // Should load within 2.5 seconds
    })

    test("analytics dashboard should render charts efficiently", async () => {
      const { duration } = await measurePerformance("Analytics Page Load", async () => {
        render(
          <TestWrapper>
            <Analytics />
          </TestWrapper>,
        )

        await waitFor(
          () => {
            expect(screen.getByText(/analytics/i)).toBeInTheDocument()
          },
          { timeout: 12000 },
        )
      })

      expect(duration).toBeLessThan(4000) // Should load within 4 seconds including chart rendering
    })
  })

  describe("User Interaction Performance", () => {
    test("form input should be responsive", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Form Input Response", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByRole("button", { name: /file new claim/i })).toBeInTheDocument()
        })

        await user.click(screen.getByRole("button", { name: /file new claim/i }))

        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument()
        })

        // Test rapid typing
        const input = screen.getByLabelText(/provider name/i)
        await user.type(input, "Test Provider Name with Long Description")
      })

      expect(duration).toBeLessThan(1000) // Form interactions should be under 1 second
    })

    test("search and filter operations should be fast", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Search and Filter", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
        })

        // Test search
        const searchInput = screen.getByPlaceholderText(/search/i)
        await user.type(searchInput, "emergency")

        // Test filter
        const statusFilter = screen.getByRole("combobox", { name: /status/i })
        await user.click(statusFilter)
        await user.click(screen.getByText(/approved/i))
      })

      expect(duration).toBeLessThan(1500) // Search and filter should be under 1.5 seconds
    })

    test("modal and dialog performance", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Modal Operations", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        // Open and close multiple modals rapidly
        for (let i = 0; i < 5; i++) {
          await user.click(screen.getByRole("button", { name: /file new claim/i }))

          await waitFor(() => {
            expect(screen.getByRole("dialog")).toBeInTheDocument()
          })

          await user.click(screen.getByRole("button", { name: /cancel/i }))

          await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
          })
        }
      })

      expect(duration).toBeLessThan(2000) // Multiple modal operations should be under 2 seconds
    })

    test("navigation between pages should be smooth", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Page Navigation", async () => {
        const { rerender } = render(
          <TestWrapper>
            <Dashboard />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        })

        // Navigate to different pages
        rerender(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        rerender(
          <TestWrapper>
            <Providers />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/providers/i)).toBeInTheDocument()
        })

        rerender(
          <TestWrapper>
            <Analytics />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/analytics/i)).toBeInTheDocument()
        })
      })

      expect(duration).toBeLessThan(3000) // Page navigation should be under 3 seconds
    })
  })

  describe("Data Processing Performance", () => {
    test("large dataset rendering should be optimized", async () => {
      const { duration } = await measurePerformance("Large Dataset Rendering", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        // Wait for large dataset to render
        await waitFor(
          () => {
            expect(screen.getByText(/claims/i)).toBeInTheDocument()
            // Check that pagination or virtualization is working
            const rows = screen.getAllByRole("row")
            expect(rows.length).toBeLessThan(100) // Should not render all 5000 items at once
          },
          { timeout: 15000 },
        )
      })

      expect(duration).toBeLessThan(5000) // Large dataset should render within 5 seconds
    })

    test("sorting operations should be efficient", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Sorting Operations", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        // Test multiple sorting operations
        const sortButtons = screen.getAllByRole("button", { name: /sort/i })

        for (const button of sortButtons.slice(0, 3)) {
          await user.click(button)
          await waitFor(() => {
            // Wait for sort to complete
            expect(button).toBeInTheDocument()
          })
        }
      })

      expect(duration).toBeLessThan(2000) // Sorting should be under 2 seconds
    })

    test("pagination should be responsive", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Pagination Performance", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        // Test pagination navigation
        const nextButton = screen.getByRole("button", { name: /next/i })

        // Navigate through multiple pages
        for (let i = 0; i < 5; i++) {
          if (nextButton && !nextButton.disabled) {
            await user.click(nextButton)
            await waitFor(() => {
              expect(screen.getByText(/claims/i)).toBeInTheDocument()
            })
          }
        }
      })

      expect(duration).toBeLessThan(1500) // Pagination should be under 1.5 seconds
    })
  })

  describe("Memory Usage and Resource Management", () => {
    test("should not have memory leaks during component mounting/unmounting", async () => {
      const { memoryDelta } = await measurePerformance("Memory Leak Test", async () => {
        // Mount and unmount components multiple times
        for (let i = 0; i < 10; i++) {
          const { unmount } = render(
            <TestWrapper>
              <Dashboard />
            </TestWrapper>,
          )

          await waitFor(() => {
            expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
          })

          unmount()
        }
      })

      // Memory delta should be reasonable (less than 10MB for 10 mount/unmount cycles)
      expect(memoryDelta).toBeLessThan(10 * 1024 * 1024)
    })

    test("should handle concurrent operations efficiently", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("Concurrent Operations", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        // Simulate concurrent user actions
        const promises = [
          user.type(screen.getByPlaceholderText(/search/i), "test"),
          user.click(screen.getByRole("combobox", { name: /status/i })),
          user.click(screen.getByRole("button", { name: /file new claim/i })),
        ]

        await Promise.all(promises)
      })

      expect(duration).toBeLessThan(2000) // Concurrent operations should be under 2 seconds
    })
  })

  describe("Network Performance Simulation", () => {
    test("should handle slow network conditions gracefully", async () => {
      // Mock slow network response
      const mockSupabase = require("@/lib/supabase").createClient()
      mockSupabase
        .from()
        .then.mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: mockPerformanceData.claims.slice(0, 10), error: null }), 3000),
            ),
        )

      const { duration } = await measurePerformance("Slow Network Simulation", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        // Should show loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument()

        await waitFor(
          () => {
            expect(screen.getByText(/claims/i)).toBeInTheDocument()
          },
          { timeout: 10000 },
        )
      })

      expect(duration).toBeLessThan(8000) // Should handle slow network within 8 seconds
    })

    test("should implement proper retry logic for failed requests", async () => {
      let attemptCount = 0
      const mockSupabase = require("@/lib/supabase").createClient()

      mockSupabase.from().then.mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error("Network error"))
        }
        return Promise.resolve({ data: mockPerformanceData.claims.slice(0, 10), error: null })
      })

      const { duration } = await measurePerformance("Retry Logic Test", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(
          () => {
            expect(screen.getByText(/claims/i)).toBeInTheDocument()
          },
          { timeout: 15000 },
        )
      })

      expect(attemptCount).toBe(3) // Should retry failed requests
      expect(duration).toBeLessThan(10000) // Should complete with retries within 10 seconds
    })
  })

  describe("Browser Resource Optimization", () => {
    test("should optimize DOM manipulation", async () => {
      const user = userEvent.setup()

      const { duration } = await measurePerformance("DOM Manipulation", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        // Perform multiple DOM-heavy operations
        const searchInput = screen.getByPlaceholderText(/search/i)

        // Rapid typing to test DOM updates
        await user.type(searchInput, "a")
        await user.clear(searchInput)
        await user.type(searchInput, "emergency")
        await user.clear(searchInput)
        await user.type(searchInput, "routine")
      })

      expect(duration).toBeLessThan(1500) // DOM operations should be under 1.5 seconds
    })

    test("should handle scroll performance with large lists", async () => {
      const { duration } = await measurePerformance("Scroll Performance", async () => {
        render(
          <TestWrapper>
            <Claims />
          </TestWrapper>,
        )

        await waitFor(() => {
          expect(screen.getByText(/claims/i)).toBeInTheDocument()
        })

        // Simulate scrolling
        const scrollContainer = screen.getByRole("main")

        for (let i = 0; i < 10; i++) {
          fireEvent.scroll(scrollContainer, { target: { scrollY: i * 100 } })
        }
      })

      expect(duration).toBeLessThan(1000) // Scroll operations should be under 1 second
    })
  })

  describe("Performance Regression Detection", () => {
    test("should maintain baseline performance metrics", async () => {
      const baselineMetrics = {
        dashboardLoad: 2000,
        claimsLoad: 3000,
        providersLoad: 2500,
        analyticsLoad: 4000,
        formInteraction: 1000,
        searchFilter: 1500,
      }

      const actualMetrics: Record<string, number> = {}

      // Test dashboard load
      actualMetrics.dashboardLoad = (
        await measurePerformance("Dashboard Baseline", async () => {
          render(
            <TestWrapper>
              <Dashboard />
            </TestWrapper>,
          )
          await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument())
        })
      ).duration

      // Test claims load
      actualMetrics.claimsLoad = (
        await measurePerformance("Claims Baseline", async () => {
          render(
            <TestWrapper>
              <Claims />
            </TestWrapper>,
          )
          await waitFor(() => expect(screen.getByText(/claims/i)).toBeInTheDocument())
        })
      ).duration

      // Test providers load
      actualMetrics.providersLoad = (
        await measurePerformance("Providers Baseline", async () => {
          render(
            <TestWrapper>
              <Providers />
            </TestWrapper>,
          )
          await waitFor(() => expect(screen.getByText(/providers/i)).toBeInTheDocument())
        })
      ).duration

      // Test analytics load
      actualMetrics.analyticsLoad = (
        await measurePerformance("Analytics Baseline", async () => {
          render(
            <TestWrapper>
              <Analytics />
            </TestWrapper>,
          )
          await waitFor(() => expect(screen.getByText(/analytics/i)).toBeInTheDocument())
        })
      ).duration

      // Check all metrics are within baseline thresholds
      Object.entries(baselineMetrics).forEach(([metric, threshold]) => {
        expect(actualMetrics[metric]).toBeLessThan(threshold)
      })
    })

    test("should detect performance degradation", async () => {
      const performanceHistory: number[] = []

      // Simulate multiple test runs
      for (let i = 0; i < 5; i++) {
        const { duration } = await measurePerformance(`Performance Run ${i + 1}`, async () => {
          render(
            <TestWrapper>
              <Dashboard />
            </TestWrapper>,
          )
          await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument())
        })
        performanceHistory.push(duration)
      }

      // Calculate average and check for consistency
      const average = performanceHistory.reduce((sum, time) => sum + time, 0) / performanceHistory.length
      const maxDeviation = Math.max(...performanceHistory.map((time) => Math.abs(time - average)))

      // Performance should be consistent (deviation less than 50% of average)
      expect(maxDeviation).toBeLessThan(average * 0.5)
    })
  })
})
