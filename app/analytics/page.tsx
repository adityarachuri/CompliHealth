"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  Download,
  Star,
  Brain,
  Target,
  AlertTriangle,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for analytics
const claimsVolumeData = [
  { month: "Jan", actual: 245, predicted: 250, upperBound: 275, lowerBound: 225 },
  { month: "Feb", actual: 289, predicted: 285, upperBound: 310, lowerBound: 260 },
  { month: "Mar", actual: 312, predicted: 315, upperBound: 340, lowerBound: 290 },
  { month: "Apr", actual: 298, predicted: 295, upperBound: 320, lowerBound: 270 },
  { month: "May", actual: 334, predicted: 330, upperBound: 355, lowerBound: 305 },
  { month: "Jun", actual: 356, predicted: 360, upperBound: 385, lowerBound: 335 },
  { month: "Jul", predicted: 342, upperBound: 386, lowerBound: 298 },
  { month: "Aug", predicted: 368, upperBound: 412, lowerBound: 324 },
  { month: "Sep", predicted: 385, upperBound: 429, lowerBound: 341 },
  { month: "Oct", predicted: 412, upperBound: 456, lowerBound: 368 },
  { month: "Nov", predicted: 398, upperBound: 442, lowerBound: 354 },
  { month: "Dec", predicted: 425, upperBound: 469, lowerBound: 381 },
]

const claimsValueData = [
  { month: "Jan", actual: 850000, predicted: 860000, upperBound: 920000, lowerBound: 800000 },
  { month: "Feb", actual: 920000, predicted: 915000, upperBound: 980000, lowerBound: 850000 },
  { month: "Mar", actual: 1050000, predicted: 1040000, upperBound: 1110000, lowerBound: 970000 },
  { month: "Apr", actual: 980000, predicted: 985000, upperBound: 1050000, lowerBound: 920000 },
  { month: "May", actual: 1120000, predicted: 1115000, upperBound: 1180000, lowerBound: 1050000 },
  { month: "Jun", actual: 1180000, predicted: 1175000, upperBound: 1240000, lowerBound: 1110000 },
  { month: "Jul", predicted: 1210000, upperBound: 1275000, lowerBound: 1145000 },
  { month: "Aug", predicted: 1245000, upperBound: 1310000, lowerBound: 1180000 },
  { month: "Sep", predicted: 1280000, upperBound: 1345000, lowerBound: 1215000 },
  { month: "Oct", predicted: 1315000, upperBound: 1380000, lowerBound: 1250000 },
  { month: "Nov", predicted: 1290000, upperBound: 1355000, lowerBound: 1225000 },
  { month: "Dec", predicted: 1350000, upperBound: 1415000, lowerBound: 1285000 },
]

const approvalData = [
  { month: "Jan", approved: 223, denied: 22 },
  { month: "Feb", approved: 264, denied: 25 },
  { month: "Mar", approved: 285, denied: 27 },
  { month: "Apr", approved: 272, denied: 26 },
  { month: "May", approved: 305, denied: 29 },
  { month: "Jun", approved: 325, denied: 31 },
]

const membershipData = [
  { month: "Jan", total: 12450, new: 234, churned: 89 },
  { month: "Feb", total: 12595, new: 198, churned: 53 },
  { month: "Mar", total: 12740, new: 267, churned: 122 },
  { month: "Apr", total: 12885, new: 189, churned: 44 },
  { month: "May", total: 13030, new: 223, churned: 78 },
  { month: "Jun", total: 13298, new: 312, churned: 44 },
]

const costBreakdownData = [
  { name: "Hospital Care", value: 35, amount: 364000, color: "#0088FE" },
  { name: "Prescription Drugs", value: 22, amount: 228800, color: "#00C49F" },
  { name: "Specialist Care", value: 15, amount: 156000, color: "#FFBB28" },
  { name: "Emergency Care", value: 12, amount: 124800, color: "#FF8042" },
  { name: "Diagnostic Tests", value: 8, amount: 83200, color: "#8884D8" },
  { name: "Mental Health", value: 5, amount: 52000, color: "#82CA9D" },
  { name: "Preventive Care", value: 3, amount: 31200, color: "#FFC658" },
]

const providerData = [
  { name: "City General Hospital", claims: 1245, avgCost: 3200, satisfaction: 4.8, network: "In-Network" },
  { name: "Metro Cardiology Center", claims: 892, avgCost: 1850, satisfaction: 4.6, network: "In-Network" },
  { name: "Downtown Urgent Care", claims: 756, avgCost: 450, satisfaction: 4.4, network: "In-Network" },
  { name: "Regional Medical Center", claims: 634, avgCost: 2800, satisfaction: 4.7, network: "In-Network" },
  { name: "Family Health Clinic", claims: 523, avgCost: 280, satisfaction: 4.5, network: "In-Network" },
]

const utilizationData = [
  { service: "Primary Care", q1: 2340, q2: 2456, q3: 2589, q4: 2712, trend: "up" },
  { service: "Specialist Visits", q1: 1890, q2: 1945, q3: 2012, q4: 2089, trend: "up" },
  { service: "Emergency Care", q1: 456, q2: 423, q3: 398, q4: 367, trend: "down" },
  { service: "Preventive Care", q1: 3456, q2: 3678, q3: 3892, q4: 4123, trend: "up" },
  { service: "Mental Health", q1: 234, q2: 267, q3: 298, q4: 334, trend: "up" },
]

const forecastingModels = [
  { name: "Linear Model", accuracy: 82.4, description: "Basic trend-based predictions" },
  { name: "Seasonal Model", accuracy: 87.3, description: "Accounts for seasonal patterns" },
  { name: "ARIMA Model", accuracy: 89.1, description: "Advanced time series forecasting" },
  { name: "ML Model", accuracy: 91.7, description: "Machine learning-based predictions" },
]

const predictiveInsights = [
  {
    title: "High Claims Volume Expected",
    description: "27% increase in claims volume predicted for Q4 based on seasonal trends",
    confidence: 85,
    impact: "High",
    icon: TrendingUp,
    color: "text-red-600",
  },
  {
    title: "Cost Optimization Potential",
    description: "15% reduction in emergency costs possible through preventive care programs",
    confidence: 78,
    impact: "Medium",
    icon: Target,
    color: "text-green-600",
  },
  {
    title: "Provider Network Strain",
    description: "Capacity concerns for top 3 providers based on predicted demand",
    confidence: 72,
    impact: "Medium",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedModel, setSelectedModel] = useState("ML Model")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and predictive analytics for healthcare operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.04M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13,298</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +6.8% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.2%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecasting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {forecastingModels.map((model) => (
              <Card key={model.name} className={selectedModel === model.name ? "ring-2 ring-blue-500" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{model.accuracy}%</div>
                  <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                  <Button
                    variant={selectedModel === model.name ? "default" : "outline"}
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setSelectedModel(model.name)}
                  >
                    {selectedModel === model.name ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Claims Volume Forecast</CardTitle>
                <CardDescription>
                  Predicted claims volume with confidence intervals using {selectedModel}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Actual", color: "hsl(var(--chart-1))" },
                    predicted: { label: "Predicted", color: "hsl(var(--chart-2))" },
                    upperBound: { label: "Upper Bound", color: "hsl(var(--chart-3))" },
                    lowerBound: { label: "Lower Bound", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={claimsVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stackId="1"
                        stroke="none"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stackId="1"
                        stroke="none"
                        fill="white"
                        fillOpacity={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-actual)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-predicted)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Next Month Prediction</p>
                  <p className="text-lg font-bold text-blue-900">342 claims</p>
                  <p className="text-xs text-blue-700">85% confidence (298-386 range)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Forecast</CardTitle>
                <CardDescription>Predicted costs with confidence bands for the next 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Actual", color: "hsl(var(--chart-1))" },
                    predicted: { label: "Predicted", color: "hsl(var(--chart-2))" },
                    upperBound: { label: "Upper Bound", color: "hsl(var(--chart-3))" },
                    lowerBound: { label: "Lower Bound", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={claimsValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, ""]} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stackId="1"
                        stroke="none"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stackId="1"
                        stroke="none"
                        fill="white"
                        fillOpacity={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-actual)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-predicted)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">6-Month Forecast</p>
                  <p className="text-lg font-bold text-green-900">$1.21M total</p>
                  <p className="text-xs text-green-700">Average monthly: $201K</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Predictive insights based on current trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {predictiveInsights.map((insight, index) => {
                  const IconComponent = insight.icon
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <IconComponent className={`w-5 h-5 ${insight.color}`} />
                        <Badge
                          variant={
                            insight.impact === "High"
                              ? "destructive"
                              : insight.impact === "Medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <span className="text-sm font-medium">{insight.confidence}%</span>
                      </div>
                      <Progress value={insight.confidence} className="mt-1" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Claims Volume Trend</CardTitle>
                <CardDescription>Monthly claims volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Claims", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={claimsVolumeData.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-actual)"
                        fill="var(--color-actual)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval vs Denial Rate</CardTitle>
                <CardDescription>Claims approval and denial trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    approved: { label: "Approved", color: "hsl(var(--chart-2))" },
                    denied: { label: "Denied", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={approvalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="approved" fill="var(--color-approved)" />
                      <Bar dataKey="denied" fill="var(--color-denied)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Membership Growth</CardTitle>
                <CardDescription>Total active members over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    total: { label: "Total Members", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={membershipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-total)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Acquisition vs Churn</CardTitle>
                <CardDescription>New members vs churned members</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    new: { label: "New Members", color: "hsl(var(--chart-2))" },
                    churned: { label: "Churned", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membershipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="new" fill="var(--color-new)" />
                      <Bar dataKey="churned" fill="var(--color-churned)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Distribution of costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Cost", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costBreakdownData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">${item.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      ${costBreakdownData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Providers</CardTitle>
              <CardDescription>Provider performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerData.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{provider.claims} claims</span>
                        <span>Avg: ${provider.avgCost}</span>
                        <Badge variant={provider.network === "In-Network" ? "default" : "secondary"}>
                          {provider.network}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.satisfaction) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{provider.satisfaction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Utilization Trends</CardTitle>
              <CardDescription>Quarterly utilization by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {utilizationData.map((service, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{service.service}</h4>
                      <div className="flex items-center space-x-2">
                        {service.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {service.trend === "up" ? "Increasing" : "Decreasing"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{service.q1.toLocaleString()}</div>
                        <div className="text-muted-foreground">Q1</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{service.q2.toLocaleString()}</div>
                        <div className="text-muted-foreground">Q2</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{service.q3.toLocaleString()}</div>
                        <div className="text-muted-foreground">Q3</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{service.q4.toLocaleString()}</div>
                        <div className="text-muted-foreground">Q4</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
