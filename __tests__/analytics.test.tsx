import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import AnalyticsPage from "@/app/analytics/page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Declare the jest variable

// Mock recharts
jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock the auth context with insurer role
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: () => ({
    user: {
      id: "123",
      email: "insurer@example.com",
      user_metadata: { role: "insurer", name: "Insurance Admin" },
    },
    loading: false,
  }),
}))

describe("Analytics Page", () => {
  it("should render analytics dashboard for insurer", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument()
    })

    // Check for tabs
    expect(screen.getByText("Forecasting")).toBeInTheDocument()
    expect(screen.getByText("Claims Analysis")).toBeInTheDocument()
    expect(screen.getByText("Member Analytics")).toBeInTheDocument()
  })

  it("should display forecasting charts", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument()
    })

    // Check for forecast data
    expect(screen.getByText("Claims Volume Forecast")).toBeInTheDocument()
    expect(screen.getByText("Cost Predictions")).toBeInTheDocument()
  })

  it("should handle time range changes", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    const timeRangeSelect = screen.getByRole("combobox")
    fireEvent.click(timeRangeSelect)

    await waitFor(() => {
      const sixMonthOption = screen.getByText("6 months")
      fireEvent.click(sixMonthOption)
    })

    // Verify chart updates (this would depend on your implementation)
    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
  })

  it("should show predictive insights", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("AI-Powered Insights")).toBeInTheDocument()
    })

    // Check for insight cards
    expect(screen.getByText("Next Month Prediction")).toBeInTheDocument()
    expect(screen.getByText("Risk Assessment")).toBeInTheDocument()
  })
})
