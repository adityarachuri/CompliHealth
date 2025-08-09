"use client"

import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case "customer":
        return {
          title: "Customer Dashboard",
          subtitle: "Manage your healthcare insurance and claims",
          stats: [
            {
              title: "Active Policies",
              value: "2",
              description: "Health & Dental",
              icon: CreditCard,
              color: "text-blue-600",
              bgColor: "bg-blue-100",
            },
            {
              title: "Recent Claims",
              value: "3",
              description: "2 approved, 1 pending",
              icon: FileText,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
            {
              title: "Coverage Used",
              value: "65%",
              description: "Of annual limit",
              icon: TrendingUp,
              color: "text-orange-600",
              bgColor: "bg-orange-100",
            },
            {
              title: "Next Premium",
              value: "$245",
              description: "Due in 15 days",
              icon: DollarSign,
              color: "text-purple-600",
              bgColor: "bg-purple-100",
            },
          ],
          recentActivity: [
            { type: "claim", status: "approved", description: "Annual checkup claim approved", date: "2 days ago" },
            { type: "policy", status: "renewed", description: "Health insurance policy renewed", date: "1 week ago" },
            { type: "claim", status: "pending", description: "Dental cleaning claim submitted", date: "3 days ago" },
          ],
        }

      case "hospital":
        return {
          title: "Hospital Dashboard",
          subtitle: "Manage patient claims and provider network",
          stats: [
            {
              title: "Patients Today",
              value: "47",
              description: "Insured patients",
              icon: Users,
              color: "text-blue-600",
              bgColor: "bg-blue-100",
            },
            {
              title: "Claims Submitted",
              value: "23",
              description: "Today",
              icon: FileText,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
            {
              title: "Approval Rate",
              value: "94%",
              description: "This month",
              icon: CheckCircle,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
            {
              title: "Pending Reviews",
              value: "8",
              description: "Awaiting approval",
              icon: Clock,
              color: "text-orange-600",
              bgColor: "bg-orange-100",
            },
          ],
          recentActivity: [
            {
              type: "claim",
              status: "submitted",
              description: "Emergency surgery claim submitted",
              date: "1 hour ago",
            },
            {
              type: "patient",
              status: "verified",
              description: "Insurance verification completed",
              date: "2 hours ago",
            },
            { type: "claim", status: "approved", description: "Routine procedure claim approved", date: "4 hours ago" },
          ],
        }

      case "tpa":
        return {
          title: "TPA Dashboard",
          subtitle: "Third-party administration and claims processing",
          stats: [
            {
              title: "Claims Queue",
              value: "156",
              description: "Pending review",
              icon: FileText,
              color: "text-orange-600",
              bgColor: "bg-orange-100",
            },
            {
              title: "Processed Today",
              value: "89",
              description: "Claims completed",
              icon: CheckCircle,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
            {
              title: "Average Time",
              value: "2.3 days",
              description: "Processing time",
              icon: Clock,
              color: "text-blue-600",
              bgColor: "bg-blue-100",
            },
            {
              title: "Total Value",
              value: "$2.4M",
              description: "Claims processed",
              icon: DollarSign,
              color: "text-purple-600",
              bgColor: "bg-purple-100",
            },
          ],
          recentActivity: [
            {
              type: "claim",
              status: "approved",
              description: "High-value claim approved after review",
              date: "30 min ago",
            },
            { type: "audit", status: "completed", description: "Monthly audit completed", date: "2 hours ago" },
            {
              type: "claim",
              status: "rejected",
              description: "Claim rejected - insufficient documentation",
              date: "3 hours ago",
            },
          ],
        }

      case "insurer":
        return {
          title: "Insurer Dashboard",
          subtitle: "Insurance operations and risk management",
          stats: [
            {
              title: "Active Policies",
              value: "12,847",
              description: "Total policies",
              icon: CreditCard,
              color: "text-blue-600",
              bgColor: "bg-blue-100",
            },
            {
              title: "Claims Ratio",
              value: "78%",
              description: "This quarter",
              icon: TrendingUp,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
            {
              title: "Premium Revenue",
              value: "$45.2M",
              description: "This month",
              icon: DollarSign,
              color: "text-purple-600",
              bgColor: "bg-purple-100",
            },
            {
              title: "Risk Score",
              value: "Low",
              description: "Portfolio risk",
              icon: Shield,
              color: "text-green-600",
              bgColor: "bg-green-100",
            },
          ],
          recentActivity: [
            { type: "policy", status: "issued", description: "New corporate policy issued", date: "1 hour ago" },
            {
              type: "risk",
              status: "assessed",
              description: "Quarterly risk assessment completed",
              date: "3 hours ago",
            },
            { type: "claim", status: "flagged", description: "Large claim flagged for review", date: "5 hours ago" },
          ],
        }

      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to CompliHealth",
          stats: [],
          recentActivity: [],
        }
    }
  }

  const content = getRoleSpecificContent()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "issued":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
      case "submitted":
      case "assessed":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "rejected":
      case "flagged":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      issued: "bg-green-100 text-green-800",
      verified: "bg-green-100 text-green-800",
      renewed: "bg-blue-100 text-blue-800",
      pending: "bg-orange-100 text-orange-800",
      submitted: "bg-orange-100 text-orange-800",
      assessed: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800",
      flagged: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"} capitalize`}>
        {status}
      </Badge>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
            <p className="text-gray-600 mt-1">{content.subtitle}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                CompliHealth Platform
              </Badge>
              <Badge variant="outline">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            {user.organization && <p className="text-sm text-gray-600">{user.organization}</p>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and actions in your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.date}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.role === "customer" && (
                  <>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900">Submit New Claim</div>
                      <div className="text-sm text-blue-700">File a new insurance claim</div>
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900">View Coverage</div>
                      <div className="text-sm text-green-700">Check your policy details</div>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      <div className="font-medium text-purple-900">Find Providers</div>
                      <div className="text-sm text-purple-700">Search in-network providers</div>
                    </button>
                  </>
                )}

                {user.role === "hospital" && (
                  <>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900">Verify Insurance</div>
                      <div className="text-sm text-blue-700">Check patient coverage</div>
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900">Submit Claim</div>
                      <div className="text-sm text-green-700">File patient claim</div>
                    </button>
                    <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                      <div className="font-medium text-orange-900">View Pending</div>
                      <div className="text-sm text-orange-700">Check claim status</div>
                    </button>
                  </>
                )}

                {(user.role === "tpa" || user.role === "insurer") && (
                  <>
                    <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                      <div className="font-medium text-orange-900">Review Claims</div>
                      <div className="text-sm text-orange-700">Process pending claims</div>
                    </button>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900">Generate Reports</div>
                      <div className="text-sm text-blue-700">View analytics dashboard</div>
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900">Manage Policies</div>
                      <div className="text-sm text-green-700">Update policy information</div>
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Progress (Customer only) */}
        {user.role === "customer" && (
          <Card>
            <CardHeader>
              <CardTitle>Annual Coverage Usage</CardTitle>
              <CardDescription>Track your insurance benefits usage for the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Medical Coverage</span>
                    <span>$6,500 / $10,000</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Dental Coverage</span>
                    <span>$800 / $2,000</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Prescription Coverage</span>
                    <span>$450 / $1,500</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
