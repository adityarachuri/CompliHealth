"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Heart, Users, BarChart3 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health Insurance
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your health insurance, track claims, find providers, and access your health data all in one secure
            platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/register")}>
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Secure Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your health data is protected with enterprise-grade security and encryption.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Health Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your health metrics and get insights into your wellness journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Provider Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find and book appointments with healthcare providers in your network.</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get predictive insights and analytics about your health and costs.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Everything you need to manage your health insurance</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4">Claims Management</h3>
              <p className="text-gray-600">
                Submit, track, and manage your insurance claims with real-time updates and notifications.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Policy Overview</h3>
              <p className="text-gray-600">
                View your coverage details, deductibles, and benefits in an easy-to-understand format.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Predictive Analytics</h3>
              <p className="text-gray-600">
                Get AI-powered insights about your health trends and potential future costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
