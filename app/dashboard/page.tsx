"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Users, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"

const dashboardData = {
  customer: {
    title: "Customer Dashboard",
    stats: [
      { label: "Active Policies", value: "2", icon: FileText, color: "text-blue-600" },
      { label: "Pending Claims", value: "1", icon: Clock, color: "text-orange-600" },
      { label: "Approved Claims", value: "3", icon: CheckCircle, color: "text-green-600" },
      { label: "Total Coverage", value: "$200K", icon: DollarSign, color: "text-purple-600" },
    ],
    recentActivity: [
      { type: "claim", description: "Claim CLM-2024-001 approved", amount: "$2,500", status: "approved" },
      { type: "policy", description: "Policy renewal reminder", amount: "$500", status: "pending" },
      { type: "payment", description: "Premium payment processed", amount: "$250", status: "completed" },
    ],
  },
  hospital: {
    title: "Hospital Dashboard",
    stats: [
      { label: "Claims Submitted", value: "45", icon: FileText, color: "text-blue-600" },
      { label: "Pre-Authorizations", value: "12", icon: Clock, color: "text-orange-600" },
      { label: "Patients Treated", value: "128", icon: Users, color: "text-green-600" },
      { label: "Revenue This Month", value: "$125K", icon: DollarSign, color: "text-purple-600" },
    ],
    recentActivity: [
      { type: "claim", description: "Emergency surgery claim submitted", amount: "$15,000", status: "submitted" },
      {
        type: "preauth",
        description: "Pre-auth approved for cardiac procedure",
        amount: "$25,000",
        status: "approved",
      },
      { type: "payment", description: "Claim payment received", amount: "$8,500", status: "completed" },
    ],
  },
  tpa: {
    title: "TPA Dashboard",
    stats: [
      { label: "Claims to Review", value: "23", icon: FileText, color: "text-blue-600" },
      { label: "Processed Today", value: "15", icon: CheckCircle, color: "text-green-600" },
      { label: "Active Policies", value: "1,250", icon: Users, color: "text-orange-600" },
      { label: "Processing Time", value: "2.3 days", icon: Clock, color: "text-purple-600" },
    ],
    recentActivity: [
      { type: "claim", description: "High-value claim requires review", amount: "$45,000", status: "review" },
      { type: "approval", description: "Batch of 12 claims approved", amount: "$28,500", status: "approved" },
      { type: "policy", description: "New policy activated", amount: "$750", status: "active" },
    ],
  },
  insurer: {
    title: "Insurer Dashboard",
    stats: [
      { label: "Total Policies", value: "5,420", icon: Users, color: "text-blue-600" },
      { label: "Claims This Month", value: "342", icon: FileText, color: "text-orange-600" },
      { label: "Revenue", value: "$2.1M", icon: DollarSign, color: "text-green-600" },
      { label: "Loss Ratio", value: "68%", icon: TrendingUp, color: "text-purple-600" },
    ],
    recentActivity: [
      { type: "analytics", description: "Monthly claims report generated", amount: "$450K", status: "completed" },
      { type: "policy", description: "Bulk policy renewal processed", amount: "$125K", status: "completed" },
      { type: "alert", description: "High-risk claim flagged for review", amount: "$75K", status: "alert" },
    ],
  },
}

const statusColors = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  submitted: "bg-gray-100 text-gray-800",
  review: "bg-orange-100 text-orange-800",
  active: "bg-green-100 text-green-800",
  alert: "bg-red-100 text-red-800",
}

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const data = dashboardData[user.role]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.name}. Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {index % 2 === 0 ? "+12% from last month" : "Updated 2 hours ago"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{activity.amount}</p>
                </div>
                <Badge className={statusColors[activity.status as keyof typeof statusColors]}>{activity.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Claims Processing</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Network Utilization</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
