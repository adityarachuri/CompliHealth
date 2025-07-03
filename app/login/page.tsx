"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Building2, Users, FileText } from "lucide-react"

const demoAccounts = [
  { email: "customer@example.com", role: "Customer", icon: Users, color: "text-blue-600" },
  { email: "hospital@example.com", role: "Hospital", icon: Building2, color: "text-green-600" },
  { email: "tpa@example.com", role: "TPA", icon: FileText, color: "text-orange-600" },
  { email: "insurer@example.com", role: "Insurer", icon: Shield, color: "text-purple-600" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Healthcare Insurance Portal</CardTitle>
            <CardDescription>Sign in to access your healthcare insurance dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>
              Click on any role below to auto-fill login credentials and explore the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts.map((account) => {
              const IconComponent = account.icon
              return (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-transparent"
                  onClick={() => handleDemoLogin(account.email)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-6 h-6 ${account.color}`} />
                    <div className="text-left">
                      <div className="font-medium">{account.role}</div>
                      <div className="text-sm text-muted-foreground">{account.email}</div>
                    </div>
                  </div>
                </Button>
              )
            })}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Password for all demo accounts:</strong> demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
