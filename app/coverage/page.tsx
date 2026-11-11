"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  DollarSign,
  Heart,
  Stethoscope,
  Brain,
  Eye,
  Pill,
  Activity,
  AlertTriangle,
  Download,
  Info,
} from "lucide-react"

// Sample coverage data
const planInfo = {
  planName: "Comprehensive Health Plus",
  planType: "PPO",
  memberId: "MEM123456789",
  groupNumber: "GRP987654321",
  effectiveDate: "January 1, 2024",
  renewalDate: "December 31, 2024",
  policyHolder: "John Doe",
}

const deductibleInfo = {
  medical: {
    individual: { total: 1500, used: 850, remaining: 650 },
    family: { total: 3000, used: 1200, remaining: 1800 },
  },
  prescription: {
    individual: { total: 500, used: 180, remaining: 320 },
    family: { total: 1000, used: 280, remaining: 720 },
  },
}

const outOfPocketMax = {
  inNetwork: {
    individual: { total: 6000, used: 2100, remaining: 3900 },
    family: { total: 12000, used: 3200, remaining: 8800 },
  },
  outOfNetwork: {
    individual: { total: 12000, used: 450, remaining: 11550 },
    family: { total: 24000, used: 450, remaining: 23550 },
  },
}

const coverageDetails = [
  {
    category: "Preventive Care",
    icon: Heart,
    services: [
      {
        name: "Annual Physical Exam",
        inNetwork: "100% covered",
        outOfNetwork: "80% after deductible",
        priorAuth: false,
        annualLimit: "1 per year",
        notes: "No copay required",
      },
      {
        name: "Routine Screenings",
        inNetwork: "100% covered",
        outOfNetwork: "80% after deductible",
        priorAuth: false,
        annualLimit: "As recommended",
        notes: "Includes mammograms, colonoscopies",
      },
      {
        name: "Vaccinations",
        inNetwork: "100% covered",
        outOfNetwork: "80% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "CDC recommended vaccines",
      },
    ],
  },
  {
    category: "Primary Care",
    icon: Stethoscope,
    services: [
      {
        name: "Primary Care Visit",
        inNetwork: "$25 copay",
        outOfNetwork: "70% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "No referral required",
      },
      {
        name: "Urgent Care Visit",
        inNetwork: "$50 copay",
        outOfNetwork: "70% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "For non-emergency care",
      },
    ],
  },
  {
    category: "Specialty Care",
    icon: Brain,
    services: [
      {
        name: "Specialist Visit",
        inNetwork: "$40 copay",
        outOfNetwork: "70% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "Referral may be required",
      },
      {
        name: "Mental Health Therapy",
        inNetwork: "$30 copay",
        outOfNetwork: "70% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "Individual and group therapy",
      },
    ],
  },
  {
    category: "Emergency Care",
    icon: AlertTriangle,
    services: [
      {
        name: "Emergency Room Visit",
        inNetwork: "$200 copay",
        outOfNetwork: "$200 copay",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "Copay waived if admitted",
      },
      {
        name: "Ambulance Service",
        inNetwork: "$100 copay",
        outOfNetwork: "$100 copay",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "Ground and air transport",
      },
    ],
  },
  {
    category: "Hospital Care",
    icon: Activity,
    services: [
      {
        name: "Inpatient Hospital Stay",
        inNetwork: "90% after deductible",
        outOfNetwork: "70% after deductible",
        priorAuth: true,
        annualLimit: "Unlimited",
        notes: "Pre-authorization required",
      },
      {
        name: "Outpatient Surgery",
        inNetwork: "90% after deductible",
        outOfNetwork: "70% after deductible",
        priorAuth: true,
        annualLimit: "Unlimited",
        notes: "Facility and professional fees",
      },
    ],
  },
  {
    category: "Diagnostic Imaging",
    icon: Eye,
    services: [
      {
        name: "MRI/CT Scan",
        inNetwork: "90% after deductible",
        outOfNetwork: "70% after deductible",
        priorAuth: true,
        annualLimit: "Unlimited",
        notes: "Prior authorization required",
      },
      {
        name: "X-rays",
        inNetwork: "90% after deductible",
        outOfNetwork: "70% after deductible",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "No prior authorization needed",
      },
    ],
  },
  {
    category: "Prescription Drugs",
    icon: Pill,
    services: [
      {
        name: "Generic Drugs",
        inNetwork: "$10 copay",
        outOfNetwork: "Not covered",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "30-day supply",
      },
      {
        name: "Brand Name Drugs",
        inNetwork: "$35 copay",
        outOfNetwork: "Not covered",
        priorAuth: false,
        annualLimit: "Unlimited",
        notes: "30-day supply",
      },
      {
        name: "Specialty Drugs",
        inNetwork: "20% coinsurance",
        outOfNetwork: "Not covered",
        priorAuth: true,
        annualLimit: "Unlimited",
        notes: "Prior authorization required",
      },
    ],
  },
]

export default function CoveragePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredServices =
    selectedCategory === "all"
      ? coverageDetails
      : coverageDetails.filter((category) => category.category === selectedCategory)

  const calculateProgress = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coverage Details</h1>
          <p className="text-muted-foreground">View your insurance coverage, benefits, and out-of-pocket tracking</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Plan Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
              <p className="text-lg font-semibold">{planInfo.planName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
              <Badge variant="outline" className="mt-1">
                {planInfo.planType}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member ID</p>
              <p className="font-mono">{planInfo.memberId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Group Number</p>
              <p className="font-mono">{planInfo.groupNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
              <p>{planInfo.effectiveDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Renewal Date</p>
              <p>{planInfo.renewalDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Tracking */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Deductibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Deductible Progress
            </CardTitle>
            <CardDescription>Amount you pay before insurance coverage begins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Medical Deductible</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Individual</span>
                    <span className="text-sm font-medium">
                      ${deductibleInfo.medical.individual.used} / ${deductibleInfo.medical.individual.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      deductibleInfo.medical.individual.used,
                      deductibleInfo.medical.individual.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${deductibleInfo.medical.individual.remaining} remaining
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Family</span>
                    <span className="text-sm font-medium">
                      ${deductibleInfo.medical.family.used} / ${deductibleInfo.medical.family.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(deductibleInfo.medical.family.used, deductibleInfo.medical.family.total)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${deductibleInfo.medical.family.remaining} remaining
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Prescription Deductible</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Individual</span>
                    <span className="text-sm font-medium">
                      ${deductibleInfo.prescription.individual.used} / ${deductibleInfo.prescription.individual.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      deductibleInfo.prescription.individual.used,
                      deductibleInfo.prescription.individual.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${deductibleInfo.prescription.individual.remaining} remaining
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Family</span>
                    <span className="text-sm font-medium">
                      ${deductibleInfo.prescription.family.used} / ${deductibleInfo.prescription.family.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      deductibleInfo.prescription.family.used,
                      deductibleInfo.prescription.family.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${deductibleInfo.prescription.family.remaining} remaining
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Out-of-Pocket Maximum */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Out-of-Pocket Maximum
            </CardTitle>
            <CardDescription>Maximum amount you&apos;ll pay in a year for covered services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">In-Network</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Individual</span>
                    <span className="text-sm font-medium">
                      ${outOfPocketMax.inNetwork.individual.used} / ${outOfPocketMax.inNetwork.individual.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      outOfPocketMax.inNetwork.individual.used,
                      outOfPocketMax.inNetwork.individual.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${outOfPocketMax.inNetwork.individual.remaining} remaining
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Family</span>
                    <span className="text-sm font-medium">
                      ${outOfPocketMax.inNetwork.family.used} / ${outOfPocketMax.inNetwork.family.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      outOfPocketMax.inNetwork.family.used,
                      outOfPocketMax.inNetwork.family.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${outOfPocketMax.inNetwork.family.remaining} remaining
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Out-of-Network</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Individual</span>
                    <span className="text-sm font-medium">
                      ${outOfPocketMax.outOfNetwork.individual.used} / ${outOfPocketMax.outOfNetwork.individual.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      outOfPocketMax.outOfNetwork.individual.used,
                      outOfPocketMax.outOfNetwork.individual.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${outOfPocketMax.outOfNetwork.individual.remaining} remaining
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Family</span>
                    <span className="text-sm font-medium">
                      ${outOfPocketMax.outOfNetwork.family.used} / ${outOfPocketMax.outOfNetwork.family.total}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      outOfPocketMax.outOfNetwork.family.used,
                      outOfPocketMax.outOfNetwork.family.total,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${outOfPocketMax.outOfNetwork.family.remaining} remaining
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Details</CardTitle>
          <CardDescription>Detailed breakdown of your coverage by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all">All Services</TabsTrigger>
              <TabsTrigger value="Preventive Care">Preventive</TabsTrigger>
              <TabsTrigger value="Specialty Care">Specialty</TabsTrigger>
              <TabsTrigger value="Emergency Care">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4 mt-6">
              {filteredServices.map((category, categoryIndex) => {
                const IconComponent = category.icon

                return (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{category.category}</h3>
                    </div>

                    <div className="grid gap-3">
                      {category.services.map((service, serviceIndex) => (
                        <Card key={serviceIndex} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{service.name}</h4>
                                  {service.priorAuth && (
                                    <Badge variant="outline" className="text-xs">
                                      Prior Auth Required
                                    </Badge>
                                  )}
                                </div>
                                {service.notes && <p className="text-sm text-muted-foreground">{service.notes}</p>}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-2/3">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">In-Network</p>
                                  <p className="text-sm font-semibold text-green-600">{service.inNetwork}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Out-of-Network</p>
                                  <p className="text-sm font-semibold text-red-600">{service.outOfNetwork}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Annual Limit</p>
                                  <p className="text-sm">{service.annualLimit}</p>
                                </div>
                              </div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Info className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{service.name}</DialogTitle>
                                    <DialogDescription>
                                      Detailed coverage information for this service
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold text-green-600 mb-2">In-Network Coverage</h4>
                                        <p className="text-lg font-bold">{service.inNetwork}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-red-600 mb-2">Out-of-Network Coverage</h4>
                                        <p className="text-lg font-bold">{service.outOfNetwork}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Annual Limit:</span>
                                        <span>{service.annualLimit}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Prior Authorization:</span>
                                        <span>{service.priorAuth ? "Required" : "Not Required"}</span>
                                      </div>
                                    </div>

                                    {service.notes && (
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm">
                                          <strong>Important Notes:</strong> {service.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
