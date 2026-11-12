import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AnalyticsPage from "@/app/analytics/page"
import { AuthProvider } from "@/contexts/auth-context"

// Mock recharts. Where the real chart library would invoke a render-prop callback
// (axis tick formatters, tooltip formatters, pie slice labels) with live data, these
// stubs invoke it too with representative sample data, so the formatting logic itself
// gets exercised instead of silently discarded like a no-op prop.
jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, label, data }: any) => (
    <div data-testid="pie">
      {typeof label === "function" && data?.[0] && <div data-testid="pie-label">{label(data[0])}</div>}
      {children}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ tickFormatter }: any) => (
    <div data-testid="y-axis">{typeof tickFormatter === "function" ? tickFormatter(2000000) : null}</div>
  ),
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }: any) => {
    const formatter = content?.props?.formatter
    if (typeof formatter === "function") {
      const formatted = formatter(1000)
      return <div data-testid="tooltip">{Array.isArray(formatted) ? formatted[0] : formatted}</div>
    }
    return <div data-testid="tooltip" />
  },
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

  it("should switch the selected forecasting model", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByText("Select").length).toBeGreaterThan(0)
    })

    const selectButtons = screen.getAllByText("Select")
    await user.click(selectButtons[0])

    await waitFor(() => {
      expect(screen.getAllByText("Selected").length).toBeGreaterThan(0)
    })
  })

  it("should format the cost forecast axis and tooltip values", async () => {
    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    // YAxis tickFormatter: $2,000,000 -> "$2.0M"
    await waitFor(() => {
      expect(screen.getByText("$2.0M")).toBeInTheDocument()
    })
    // Tooltip formatter: 1000 -> "$1K"
    expect(screen.getByText("$1K")).toBeInTheDocument()
  })

  it("should format the cost breakdown pie slice labels", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AnalyticsPage />
      </AuthProvider>,
    )

    await user.click(screen.getByText("Costs"))

    await waitFor(() => {
      expect(screen.getByText("Hospital Care: 35%")).toBeInTheDocument()
    })
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
