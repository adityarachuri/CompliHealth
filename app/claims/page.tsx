"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Claim } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, Eye, DollarSign, Calendar, User } from "lucide-react"

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-purple-100 text-purple-800",
}

export default function ClaimsPage() {
  const { user } = useAuth()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [showNewClaimDialog, setShowNewClaimDialog] = useState(false)

  useEffect(() => {
    fetchClaims()
  }, [user])

  const fetchClaims = async () => {
    if (!user) return

    try {
      let query = supabase.from("claims").select("*")

      // Filter based on user role
      if (user.role === "customer") {
        query = query.eq("customer_id", user.id)
      } else if (user.role === "hospital") {
        // Hospital sees claims they submitted
        query = query.eq("provider_id", user.id)
      } else if (user.role === "tpa") {
        query = query.eq("tpa_id", user.id)
      }
      // Insurers see all claims

      const { data, error } = await query.order("submission_date", { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error("Error fetching claims:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (claimId: string, newStatus: string, approvedAmount?: number) => {
    try {
      const updateData: any = { status: newStatus }
      if (approvedAmount !== undefined) {
        updateData.approved_amount = approvedAmount
      }
      if (newStatus === "approved" || newStatus === "rejected") {
        updateData.processed_date = new Date().toISOString()
      }

      const { error } = await supabase.from("claims").update(updateData).eq("id", claimId)

      if (error) throw error

      fetchClaims()
      setSelectedClaim(null)
    } catch (error) {
      console.error("Error updating claim:", error)
    }
  }

  const getPageTitle = () => {
    switch (user?.role) {
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

  const canSubmitClaims = user?.role === "hospital"
  const canProcessClaims = user?.role === "tpa" || user?.role === "insurer"

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading claims...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {user?.role === "customer" && "Track your insurance claims and their status"}
            {user?.role === "hospital" && "Submit and manage insurance claims for patients"}
            {user?.role === "tpa" && "Review and process insurance claims"}
            {user?.role === "insurer" && "Monitor all claims across your network"}
          </p>
        </div>
        {canSubmitClaims && (
          <Dialog open={showNewClaimDialog} onOpenChange={setShowNewClaimDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit New Claim</DialogTitle>
                <DialogDescription>Submit a new insurance claim for patient treatment</DialogDescription>
              </DialogHeader>
              <NewClaimForm
                onSuccess={() => {
                  setShowNewClaimDialog(false)
                  fetchClaims()
                }}
              />
            </DialogContent>
          </Dialog>
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
              ${claims.reduce((sum, claim) => sum + claim.claim_amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
          <CardDescription>{claims.length === 0 ? "No claims found" : `${claims.length} claims found`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.claim_number}</TableCell>
                  <TableCell>{claim.diagnosis}</TableCell>
                  <TableCell>${claim.claim_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[claim.status as keyof typeof statusColors]}>
                      {claim.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(claim.submission_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedClaim(claim)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canProcessClaims && claim.status === "under_review" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(claim.id, "approved", claim.claim_amount)}
                          >
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(claim.id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      {selectedClaim && (
        <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Claim Details - {selectedClaim.claim_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Diagnosis</Label>
                  <p className="text-sm text-muted-foreground">{selectedClaim.diagnosis}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selectedClaim.status as keyof typeof statusColors]}>
                    {selectedClaim.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label>Claim Amount</Label>
                  <p className="text-sm text-muted-foreground">${selectedClaim.claim_amount.toLocaleString()}</p>
                </div>
                {selectedClaim.approved_amount && (
                  <div>
                    <Label>Approved Amount</Label>
                    <p className="text-sm text-muted-foreground">${selectedClaim.approved_amount.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <Label>Treatment Details</Label>
                <p className="text-sm text-muted-foreground">{selectedClaim.treatment_details}</p>
              </div>
              {selectedClaim.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedClaim.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function NewClaimForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment_details: "",
    claim_amount: "",
    policy_id: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const claimNumber = `CLM-${Date.now()}`

      const { error } = await supabase.from("claims").insert({
        claim_number: claimNumber,
        ...formData,
        claim_amount: Number.parseFloat(formData.claim_amount),
        status: "submitted",
      })

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("Error submitting claim:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="treatment_details">Treatment Details</Label>
        <Textarea
          id="treatment_details"
          value={formData.treatment_details}
          onChange={(e) => setFormData({ ...formData, treatment_details: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="claim_amount">Claim Amount</Label>
        <Input
          id="claim_amount"
          type="number"
          step="0.01"
          value={formData.claim_amount}
          onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
          required
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit Claim"}
      </Button>
    </form>
  )
}
