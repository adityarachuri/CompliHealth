"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Calendar, DollarSign, FileText, Eye, Download, AlertCircle } from "lucide-react"

interface Policy {
  id: string
  policy_number: string
  policy_type: string
  premium_amount: number
  coverage_amount: number
  start_date: string
  end_date: string
  status: string
  deductible: number
  copay: number
  out_of_pocket_max: number
  network_type: string
}

interface Coverage {
  category: string
  covered: boolean
  coverage_percentage: number
  annual_limit?: number
  notes?: string
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
}

export default function PoliciesPage() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPolicies = useCallback(async () => {
    if (!user) return

    try {
      // Demo policies data
      const demoPolicies: Policy[] = [
        {
          id: "policy-1",
          policy_number: "POL-2024-001",
          policy_type: "Comprehensive Health Insurance",
          premium_amount: 450,
          coverage_amount: 100000,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          status: "active",
          deductible: 1500,
          copay: 25,
          out_of_pocket_max: 6000,
          network_type: "PPO",
        },
        {
          id: "policy-2",
          policy_number: "POL-2024-002",
          policy_type: "Dental Coverage",
          premium_amount: 85,
          coverage_amount: 2500,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          status: "active",
          deductible: 100,
          copay: 0,
          out_of_pocket_max: 1500,
          network_type: "HMO",
        },
      ]

      // Filter based on user role
      let filteredPolicies = demoPolicies
      if (user.role === "customer") {
        filteredPolicies = demoPolicies // Customer sees their own policies
      } else if (user.role === "tpa") {
        filteredPolicies = demoPolicies // TPA manages these policies
      } else if (user.role === "insurer") {
        filteredPolicies = demoPolicies // Insurer sees all policies they underwrite
      }

      setPolicies(filteredPolicies)
    } catch (error) {
      console.error("Error fetching policies:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  const getCoverageDetails = (policyType: string): Coverage[] => {
    if (policyType.includes("Comprehensive")) {
      return [
        {
          category: "Emergency Services",
          covered: true,
          coverage_percentage: 100,
          notes: "No prior authorization required",
        },
        { category: "Hospitalization", covered: true, coverage_percentage: 90, annual_limit: 50000 },
        { category: "Outpatient Care", covered: true, coverage_percentage: 80, annual_limit: 10000 },
        { category: "Prescription Drugs", covered: true, coverage_percentage: 75, annual_limit: 5000 },
        { category: "Mental Health", covered: true, coverage_percentage: 80, annual_limit: 8000 },
        { category: "Preventive Care", covered: true, coverage_percentage: 100, notes: "Annual checkups included" },
        { category: "Specialist Visits", covered: true, coverage_percentage: 70, notes: "Referral required" },
        { category: "Physical Therapy", covered: true, coverage_percentage: 60, annual_limit: 3000 },
      ]
    } else if (policyType.includes("Dental")) {
      return [
        { category: "Preventive Care", covered: true, coverage_percentage: 100, notes: "2 cleanings per year" },
        { category: "Basic Procedures", covered: true, coverage_percentage: 80, annual_limit: 1500 },
        { category: "Major Procedures", covered: true, coverage_percentage: 50, annual_limit: 1000 },
        { category: "Orthodontics", covered: false, coverage_percentage: 0, notes: "Not covered under this plan" },
      ]
    }
    return []
  }

  const getPageTitle = () => {
    switch (user?.role) {
      case "customer":
        return "My Policies"
      case "tpa":
        return "Manage Policies"
      case "insurer":
        return "All Policies"
      default:
        return "Policies"
    }
  }

  const getDaysUntilRenewal = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading policies...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {user?.role === "customer" && "View your insurance policies and coverage details"}
            {user?.role === "tpa" && "Manage and process insurance policies"}
            {user?.role === "insurer" && "Monitor all policies across your network"}
          </p>
        </div>
      </div>

      {/* Policy Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.filter((p) => p.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${policies.reduce((sum, policy) => sum + policy.premium_amount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total monthly cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${policies.reduce((sum, policy) => sum + policy.coverage_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Maximum coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Alert</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(...policies.map((p) => getDaysUntilRenewal(p.end_date)))}
            </div>
            <p className="text-xs text-muted-foreground">Days until renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <div className="grid gap-6">
        {policies.map((policy) => {
          const daysUntilRenewal = getDaysUntilRenewal(policy.end_date)
          const renewalProgress = Math.max(0, Math.min(100, ((365 - daysUntilRenewal) / 365) * 100))

          return (
            <Card key={policy.id} className="relative">
              {daysUntilRenewal <= 30 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Renewal Due
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{policy.policy_type}</CardTitle>
                    <CardDescription>Policy #{policy.policy_number}</CardDescription>
                  </div>
                  <Badge className={statusColors[policy.status as keyof typeof statusColors]}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Policy Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Premium</p>
                    <p className="text-lg font-semibold">${policy.premium_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deductible</p>
                    <p className="text-lg font-semibold">${policy.deductible.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Copay</p>
                    <p className="text-lg font-semibold">${policy.copay}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network</p>
                    <p className="text-lg font-semibold">{policy.network_type}</p>
                  </div>
                </div>

                {/* Policy Period Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Policy Period</span>
                    <span>{daysUntilRenewal} days remaining</span>
                  </div>
                  <Progress value={renewalProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{new Date(policy.start_date).toLocaleDateString()}</span>
                    <span>{new Date(policy.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{policy.policy_type} - Coverage Details</DialogTitle>
                        <DialogDescription>Policy #{policy.policy_number}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Policy Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Coverage Amount</p>
                            <p className="text-lg font-semibold">${policy.coverage_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Out-of-Pocket Max</p>
                            <p className="text-lg font-semibold">${policy.out_of_pocket_max.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Network Type</p>
                            <p className="text-lg font-semibold">{policy.network_type}</p>
                          </div>
                        </div>

                        {/* Coverage Breakdown */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Coverage Breakdown</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Service Category</TableHead>
                                <TableHead>Coverage</TableHead>
                                <TableHead>Annual Limit</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getCoverageDetails(policy.policy_type).map((coverage, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{coverage.category}</TableCell>
                                  <TableCell>
                                    {coverage.covered ? (
                                      <div className="flex items-center">
                                        <Badge
                                          variant="outline"
                                          className="bg-green-50 text-green-700 border-green-200"
                                        >
                                          {coverage.coverage_percentage}% Covered
                                        </Badge>
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Not Covered
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {coverage.annual_limit ? `$${coverage.annual_limit.toLocaleString()}` : "No limit"}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {coverage.notes || "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Policy
                  </Button>

                  {user?.role === "customer" && (
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      File Claim
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {policies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Policies Found</h3>
            <p className="text-muted-foreground">
              {user?.role === "customer"
                ? "You don't have any active insurance policies."
                : "No policies available to display."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
