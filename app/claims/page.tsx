"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, Eye, DollarSign, Calendar, User, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface Claim {
  id: string
  claimNumber: string
  diagnosis: string
  treatmentDetails: string
  claimAmount: number
  approvedAmount?: number
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid"
  submissionDate: string
  processedDate?: string
  provider: string
}

const mockClaims: Claim[] = [
  {
    id: "1",
    claimNumber: "CLM-2024-001",
    diagnosis: "Annual Physical Examination",
    treatmentDetails: "Routine checkup and blood work",
    claimAmount: 350,
    approvedAmount: 315,
    status: "approved",
    submissionDate: "2024-01-15",
    processedDate: "2024-01-18",
    provider: "Dr. Sarah Johnson",
  },
  {
    id: "2",
    claimNumber: "CLM-2024-002",
    diagnosis: "Acute Bronchitis",
    treatmentDetails: "Consultation and prescription medication",
    claimAmount: 180,
    status: "under_review",
    submissionDate: "2024-01-20",
    provider: "City General Hospital",
  },
  {
    id: "3",
    claimNumber: "CLM-2024-003",
    diagnosis: "Dental Cleaning",
    treatmentDetails: "Routine dental cleaning and examination",
    claimAmount: 120,
    approvedAmount: 120,
    status: "paid",
    submissionDate: "2024-01-10",
    processedDate: "2024-01-12",
    provider: "Bright Smile Dental",
  },
]

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-purple-100 text-purple-800",
}

const statusIcons = {
  submitted: Clock,
  under_review: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  paid: CheckCircle,
}

export default function ClaimsPage() {
  const { user } = useAuth()
  const [claims] = useState<Claim[]>(mockClaims)
  const [showNewClaimForm, setShowNewClaimForm] = useState(false)
  const [newClaim, setNewClaim] = useState({
    diagnosis: "",
    treatmentDetails: "",
    claimAmount: "",
    provider: "",
  })

  if (!user) return null

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    console.log("Submitting claim:", newClaim)
    setShowNewClaimForm(false)
    setNewClaim({ diagnosis: "", treatmentDetails: "", claimAmount: "", provider: "" })
  }

  const getPageTitle = () => {
    switch (user.role) {
      case "customer":
        return "My Claims"
      case "hospital":
        return "Submit Claims"
      case "tpa":
        return "Process Claims"
      case "insurer":
        return "Claims Overview"
      default:
        return "Claims"
    }
  }

  const canSubmitClaims = user.role === "hospital"

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
            <p className="text-muted-foreground">
              {user.role === "customer" && "Track your insurance claims and their status"}
              {user.role === "hospital" && "Submit and manage insurance claims for patients"}
              {user.role === "tpa" && "Review and process insurance claims"}
              {user.role === "insurer" && "Monitor all claims across your network"}
            </p>
          </div>
          {canSubmitClaims && (
            <Button onClick={() => setShowNewClaimForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          )}
        </div>

        {/* Claims Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.filter((c) => c.status === "under_review").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.filter((c) => c.status === "approved").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${claims.reduce((sum, claim) => sum + claim.claimAmount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Claim Form */}
        {showNewClaimForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Claim</CardTitle>
              <CardDescription>Submit a new insurance claim for patient treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      value={newClaim.diagnosis}
                      onChange={(e) => setNewClaim({ ...newClaim, diagnosis: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={newClaim.provider}
                      onChange={(e) => setNewClaim({ ...newClaim, provider: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="treatmentDetails">Treatment Details</Label>
                  <Input
                    id="treatmentDetails"
                    value={newClaim.treatmentDetails}
                    onChange={(e) => setNewClaim({ ...newClaim, treatmentDetails: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="claimAmount">Claim Amount</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    step="0.01"
                    value={newClaim.claimAmount}
                    onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Submit Claim</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewClaimForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Claims List</CardTitle>
            <CardDescription>
              {claims.length === 0 ? "No claims found" : `${claims.length} claims found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.map((claim) => {
                const StatusIcon = statusIcons[claim.status]
                return (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{claim.claimNumber}</h4>
                          <p className="text-sm text-muted-foreground">{claim.diagnosis}</p>
                          <p className="text-xs text-muted-foreground">{claim.provider}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${claim.claimAmount.toLocaleString()}</p>
                        {claim.approvedAmount && (
                          <p className="text-sm text-green-600">Approved: ${claim.approvedAmount.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(claim.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={statusColors[claim.status]}>{claim.status.replace("_", " ")}</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {claims.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No claims found.{" "}
              {canSubmitClaims
                ? "Click 'New Claim' to submit your first claim."
                : "Claims will appear here once submitted."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}
