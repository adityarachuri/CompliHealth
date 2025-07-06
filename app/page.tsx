"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText, BarChart3, Heart, CheckCircle } from "lucide-react"
import Link from "next/link"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">HealthCare Insurance Portal</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Comprehensive Healthcare Insurance Management</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your healthcare insurance experience with our all-in-one platform. Manage claims, find providers,
            track policies, and get predictive insights.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Sign In to Dashboard
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h3>
            <p className="text-lg text-gray-600">Everything you need to manage your healthcare insurance</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Claims Management</CardTitle>
                <CardDescription>
                  Submit, track, and manage insurance claims with real-time status updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Provider Directory</CardTitle>
                <CardDescription>Find healthcare providers, check availability, and book appointments</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Get predictive analytics and insights about your healthcare costs and trends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Policy Management</CardTitle>
                <CardDescription>View coverage details, benefits, and manage your insurance policies</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>Monitor your health metrics and get personalized recommendations</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>HIPAA compliant platform with enterprise-grade security</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Try Our Demo</h3>
          <p className="text-lg text-gray-600 mb-8">
            Experience the platform with our demo accounts. No registration required.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <CardContent className="p-0">
                <h4 className="font-semibold mb-2">Customer Demo</h4>
                <p className="text-sm text-gray-600 mb-3">demo@healthinsurance.com</p>
                <Link href="/login">
                  <Button size="sm" className="w-full">
                    Try Customer View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <h4 className="font-semibold mb-2">Hospital Demo</h4>
                <p className="text-sm text-gray-600 mb-3">hospital@demo.com</p>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Try Hospital View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <h4 className="font-semibold mb-2">TPA Demo</h4>
                <p className="text-sm text-gray-600 mb-3">tpa@demo.com</p>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Try TPA View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <h4 className="font-semibold mb-2">Insurer Demo</h4>
                <p className="text-sm text-gray-600 mb-3">insurer@demo.com</p>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Try Insurer View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">HealthCare Insurance Portal</span>
            </div>
            <p className="text-gray-400">© 2024 Healthcare Insurance Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
