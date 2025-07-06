import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AnalyticsPage from "@/app/analytics/page"
import jest from "jest" // Import jest to declare the variable

// Mock recharts components
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

// Mock ChartContainer
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}))

describe("Analytics Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders analytics dashboard correctly", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument()
    expect(
      screen.getByText("Comprehensive insights and predictive analytics for healthcare operations"),
    ).toBeInTheDocument()
  })

  it("displays key metrics cards", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Total Claims")).toBeInTheDocument()
    expect(screen.getByText("Claims Value")).toBeInTheDocument()
    expect(screen.getByText("Active Members")).toBeInTheDocument()
    expect(screen.getByText("Approval Rate")).toBeInTheDocument()
  })

  it("shows metric values and trends", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("2,847")).toBeInTheDocument()
    expect(screen.getByText("$1.04M")).toBeInTheDocument()
    expect(screen.getByText("13,298")).toBeInTheDocument()
    expect(screen.getByText("91.2%")).toBeInTheDocument()
  })

  it("displays trend indicators", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("+12.5% from last month")).toBeInTheDocument()
    expect(screen.getByText("+8.2% from last month")).toBeInTheDocument()
    expect(screen.getByText("+6.8% from last month")).toBeInTheDocument()
    expect(screen.getByText("-2.1% from last month")).toBeInTheDocument()
  })

  it("renders tab navigation", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Forecasting")).toBeInTheDocument()
    expect(screen.getByText("Claims")).toBeInTheDocument()
    expect(screen.getByText("Members")).toBeInTheDocument()
    expect(screen.getByText("Costs")).toBeInTheDocument()
    expect(screen.getByText("Providers")).toBeInTheDocument()
    expect(screen.getByText("Utilization")).toBeInTheDocument()
  })

  it("displays forecasting models", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Linear Model")).toBeInTheDocument()
    expect(screen.getByText("Seasonal Model")).toBeInTheDocument()
    expect(screen.getByText("ARIMA Model")).toBeInTheDocument()
    expect(screen.getByText("ML Model")).toBeInTheDocument()
  })

  it("shows model accuracy percentages", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("82.4%")).toBeInTheDocument()
    expect(screen.getByText("87.3%")).toBeInTheDocument()
    expect(screen.getByText("89.1%")).toBeInTheDocument()
    expect(screen.getByText("91.7%")).toBeInTheDocument()
  })

  it("displays forecasting charts", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Claims Volume Forecast")).toBeInTheDocument()
    expect(screen.getByText("Cost Forecast")).toBeInTheDocument()
    expect(screen.getByText("Predicted claims volume with confidence intervals using ML Model")).toBeInTheDocument()
  })

  it("shows next month prediction", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Next Month Prediction")).toBeInTheDocument()
    expect(screen.getByText("342 claims")).toBeInTheDocument()
    expect(screen.getByText("85% confidence (298-386 range)")).toBeInTheDocument()
  })

  it("displays 6-month forecast", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("6-Month Forecast")).toBeInTheDocument()
    expect(screen.getByText("$1.21M total")).toBeInTheDocument()
    expect(screen.getByText("Average monthly: $201K")).toBeInTheDocument()
  })

  it("shows AI-powered insights", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("AI-Powered Insights")).toBeInTheDocument()
    expect(screen.getByText("High Claims Volume Expected")).toBeInTheDocument()
    expect(screen.getByText("Cost Optimization Potential")).toBeInTheDocument()
    expect(screen.getByText("Provider Network Strain")).toBeInTheDocument()
  })

  it("displays insight confidence levels", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("85%")).toBeInTheDocument()
    expect(screen.getByText("78%")).toBeInTheDocument()
    expect(screen.getByText("72%")).toBeInTheDocument()
  })

  it("shows impact badges for insights", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("High")).toBeInTheDocument()
    expect(screen.getAllByText("Medium")).toHaveLength(2)
  })

  it("handles time range selection", async () => {
    render(<AnalyticsPage />)

    const timeRangeSelect = screen.getByDisplayValue("6 Months")
    fireEvent.click(timeRangeSelect)

    await waitFor(() => {
      expect(screen.getByText("1 Month")).toBeInTheDocument()
      expect(screen.getByText("3 Months")).toBeInTheDocument()
      expect(screen.getByText("1 Year")).toBeInTheDocument()
    })
  })

  it("handles model selection", async () => {
    render(<AnalyticsPage />)

    const modelButtons = screen.getAllByText("Select")
    fireEvent.click(modelButtons[0])

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeInTheDocument()
    })
  })

  it("displays export button", () => {
    render(<AnalyticsPage />)

    expect(screen.getByText("Export")).toBeInTheDocument()
  })

  describe("Claims Tab", () => {
    it("switches to claims tab and shows claims analytics", async () => {
      render(<AnalyticsPage />)

      const claimsTab = screen.getByText("Claims")
      fireEvent.click(claimsTab)

      await waitFor(() => {
        expect(screen.getByText("Claims Volume Trend")).toBeInTheDocument()
        expect(screen.getByText("Approval vs Denial Rate")).toBeInTheDocument()
      })
    })
  })

  describe("Members Tab", () => {
    it("switches to members tab and shows membership analytics", async () => {
      render(<AnalyticsPage />)

      const membersTab = screen.getByText("Members")
      fireEvent.click(membersTab)

      await waitFor(() => {
        expect(screen.getByText("Membership Growth")).toBeInTheDocument()
        expect(screen.getByText("Member Acquisition vs Churn")).toBeInTheDocument()
      })
    })
  })

  describe("Costs Tab", () => {
    it("switches to costs tab and shows cost analytics", async () => {
      render(<AnalyticsPage />)

      const costsTab = screen.getByText("Costs")
      fireEvent.click(costsTab)

      await waitFor(() => {
        expect(screen.getByText("Cost Breakdown")).toBeInTheDocument()
        expect(screen.getByText("Cost Details")).toBeInTheDocument()
      })
    })

    it("displays cost categories", async () => {
      render(<AnalyticsPage />)

      const costsTab = screen.getByText("Costs")
      fireEvent.click(costsTab)

      await waitFor(() => {
        expect(screen.getByText("Hospital Care")).toBeInTheDocument()
        expect(screen.getByText("Prescription Drugs")).toBeInTheDocument()
        expect(screen.getByText("Specialist Care")).toBeInTheDocument()
        expect(screen.getByText("Emergency Care")).toBeInTheDocument()
      })
    })
  })

  describe("Providers Tab", () => {
    it("switches to providers tab and shows provider analytics", async () => {
      render(<AnalyticsPage />)

      const providersTab = screen.getByText("Providers")
      fireEvent.click(providersTab)

      await waitFor(() => {
        expect(screen.getByText("Top Providers")).toBeInTheDocument()
        expect(screen.getByText("Provider performance metrics")).toBeInTheDocument()
      })
    })

    it("displays provider information", async () => {
      render(<AnalyticsPage />)

      const providersTab = screen.getByText("Providers")
      fireEvent.click(providersTab)

      await waitFor(() => {
        expect(screen.getByText("City General Hospital")).toBeInTheDocument()
        expect(screen.getByText("Metro Cardiology Center")).toBeInTheDocument()
        expect(screen.getByText("Downtown Urgent Care")).toBeInTheDocument()
      })
    })
  })

  describe("Utilization Tab", () => {
    it("switches to utilization tab and shows utilization analytics", async () => {
      render(<AnalyticsPage />)

      const utilizationTab = screen.getByText("Utilization")
      fireEvent.click(utilizationTab)

      await waitFor(() => {
        expect(screen.getByText("Service Utilization Trends")).toBeInTheDocument()
        expect(screen.getByText("Quarterly utilization by service type")).toBeInTheDocument()
      })
    })

    it("displays service utilization data", async () => {
      render(<AnalyticsPage />)

      const utilizationTab = screen.getByText("Utilization")
      fireEvent.click(utilizationTab)

      await waitFor(() => {
        expect(screen.getByText("Primary Care")).toBeInTheDocument()
        expect(screen.getByText("Specialist Visits")).toBeInTheDocument()
        expect(screen.getByText("Emergency Care")).toBeInTheDocument()
        expect(screen.getByText("Preventive Care")).toBeInTheDocument()
        expect(screen.getByText("Mental Health")).toBeInTheDocument()
      })
    })

    it("shows trend indicators for services", async () => {
      render(<AnalyticsPage />)

      const utilizationTab = screen.getByText("Utilization")
      fireEvent.click(utilizationTab)

      await waitFor(() => {
        expect(screen.getByText("Increasing")).toBeInTheDocument()
        expect(screen.getByText("Decreasing")).toBeInTheDocument()
      })
    })
  })
})
