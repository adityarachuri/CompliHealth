"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Users, Shield, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Active Claims",
      value: "3",
      description: "Claims in progress",
      icon: FileText,
      trend: "+2 from last month",
    },
    {
      title: "Total Coverage",
      value: "$50,000",
      description: "Annual coverage limit",
      icon: Shield,
      trend: "Renewed this year",
    },
    {
      title: "Claims Paid",
      value: "$12,450",
      description: "This year",
      icon: DollarSign,
      trend: "+15% from last year",
    },
    {
      title: "Network Providers",
      value: "2,847",
      description: "In your area",
      icon: Users,
      trend: "+127 new providers",
    },
  ]

  const recentClaims = [
    {
      id: "CLM-001",
      type: "Medical Consultation",
      date: "2024-01-15",
      amount: "$150",
      status: "approved",
      provider: "Dr. Smith Medical Center",
    },
    {
      id: "CLM-002",
      type: "Prescription",
      date: "2024-01-12",
      amount: "$85",
      status: "processing",
      provider: "City Pharmacy",
    },
    {
      id: "CLM-003",
      type: "Lab Tests",
      date: "2024-01-10",
      amount: "$220",
      status: "pending",
      provider: "HealthLab Diagnostics",
    },
  ]

  const upcomingAppointments = [
    {
      id: 1,
      provider: "Dr. Johnson",
      specialty: "Cardiology",
      date: "2024-01-25",
      time: "10:00 AM",
      type: "Follow-up",
    },
    {
      id: 2,
      provider: "Dr. Williams",
      specialty: "Dermatology",
      date: "2024-01-28",
      time: "2:30 PM",
      type: "Consultation",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your health insurance activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Your latest insurance claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{claim.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.provider} • {claim.date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{claim.amount}</span>
                    <Badge className={getStatusColor(claim.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(claim.status)}
                        <span className="capitalize">{claim.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Claims
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled healthcare visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{appointment.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.specialty} • {appointment.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Overview</CardTitle>
          <CardDescription>Your current insurance coverage status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deductible</span>
                <span>$1,200 / $2,500</span>
              </div>
              <Progress value={48} className="h-2" />
              <p className="text-xs text-muted-foreground">$1,300 remaining</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Out-of-Pocket Max</span>
                <span>$3,200 / $8,000</span>
              </div>
              <Progress value={40} className="h-2" />
              <p className="text-xs text-muted-foreground">$4,800 remaining</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Annual Coverage</span>
                <span>$12,450 / $50,000</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground">$37,550 remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
