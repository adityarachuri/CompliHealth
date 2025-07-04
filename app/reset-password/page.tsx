"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    // Validate reset token on component mount
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false)
        setError("Invalid or missing reset token")
        return
      }

      try {
        // Simulate token validation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // In a real app, you would validate the token with your API
        // const response = await fetch('/api/auth/validate-reset-token', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ token, email })
        // })

        // For demo purposes, we'll accept any token that looks like a valid format
        const tokenRegex = /^[a-zA-Z0-9]{32,}$/
        if (tokenRegex.test(token)) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setError("Invalid reset token")
        }
      } catch (error) {
        setTokenValid(false)
        setError("Failed to validate reset token")
      }
    }

    validateToken()
  }, [token, email])

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push("at least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter")
    if (!/\d/.test(password)) errors.push("one number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("one special character")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Validate password strength
      const passwordErrors = validatePassword(password)
      if (passwordErrors.length > 0) {
        throw new Error(`Password must contain ${passwordErrors.join(", ")}`)
      }

      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would call your password reset API here
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, email, password })
      // })

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Validating reset token...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">This password reset link is invalid or has expired</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Password reset links expire after 15 minutes for security reasons.
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => router.push("/forgot-password")} className="w-full">
                      Request New Reset Link
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Password Reset Successful</h2>
            <p className="mt-2 text-sm text-gray-600">Your password has been updated successfully</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">All Set!</h3>
                  <p className="mt-2 text-sm text-gray-600">You can now sign in with your new password.</p>
                </div>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Sign In Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const passwordErrors = validatePassword(password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password for <strong>{email}</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>Choose a strong password to secure your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {password && passwordErrors.length > 0 && (
                  <div className="text-xs text-red-600">Password must contain {passwordErrors.join(", ")}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-xs text-red-600">Passwords do not match</div>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• One uppercase letter</li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>• One lowercase letter</li>
                  <li className={/\d/.test(password) ? "text-green-600" : ""}>• One number</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : ""}>
                    • One special character
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !password.trim() ||
                  !confirmPassword.trim() ||
                  password !== confirmPassword ||
                  passwordErrors.length > 0
                }
              >
                {loading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
