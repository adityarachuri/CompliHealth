import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AnalyticsPage from "@/app/analytics/page"
import { AuthProvider } from "@/contexts/auth-context"

// Mock recharts
jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
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
      name: "Insurance Admin",
      role: "insurer",
      organization: "CompliHealth Insurance",
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
    expect(screen.getByText("Claims")).toBeInTheDocument()
    expect(screen.getByText("Members")).toBeInTheDocument()
  })

  it("should display forecasting charts", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByTestId("area-chart").length).toBeGreaterThan(0)
    })

    // Check for forecast data
    expect(screen.getByText("Claims Volume Forecast")).toBeInTheDocument()
    expect(screen.getByText("Cost Forecast")).toBeInTheDocument()
  })

  it("should handle time range changes", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    const timeRangeSelect = screen.getByRole("combobox")
    await user.click(timeRangeSelect)

    const listbox = await screen.findByRole("listbox")
    await user.click(within(listbox).getByText("1 Year"))

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveTextContent("1 Year")
    })
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThan(0)
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
    expect(screen.getByText("High Claims Volume Expected")).toBeInTheDocument()
  })
})
