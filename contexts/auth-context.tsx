"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import {
  type User,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getCurrentUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
} from "@/lib/auth-utils"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth?: string
    role: "customer" | "hospital" | "tpa" | "insurer"
    organization?: string
  }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>
  requestPasswordReset: (email: string) => Promise<{ error?: string }>
  resetPassword: (newPassword: string) => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if Supabase is properly configured
// function isSupabaseConfigured(): boolean {
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL
//   const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   return !!(url && key && url !== "https://demo.supabase.co" && key !== "demo-key")
// }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing auth...")

        if (isSupabaseConfigured()) {
          console.log("🔧 Supabase configured, checking session...")
          // Real Supabase authentication
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session?.user) {
            console.log("✅ Session found, getting user profile...")
            const currentUser = await getCurrentUser()
            setUser(currentUser)
          } else {
            console.log("ℹ️ No active session found")
          }

          // Listen for auth changes
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("🔄 Auth state changed:", event, session?.user?.id)

            if (event === "SIGNED_IN" && session?.user) {
              const currentUser = await getCurrentUser()
              setUser(currentUser)
            } else if (event === "SIGNED_OUT") {
              setUser(null)
            } else if (event === "TOKEN_REFRESHED" && session?.user) {
              const currentUser = await getCurrentUser()
              setUser(currentUser)
            }
          })

          return () => subscription.unsubscribe()
        } else {
          console.log("🎭 Demo mode - checking localStorage...")
          // Demo mode - check localStorage for demo user
          const storedUser = localStorage.getItem("demo-user")
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              console.log("✅ Demo user found in localStorage:", parsedUser.email)
              setUser(parsedUser)
            } catch (error) {
              console.error("❌ Error parsing stored demo user:", error)
              localStorage.removeItem("demo-user")
            }
          } else {
            console.log("ℹ️ No demo user in localStorage")
          }
        }
      } catch (error) {
        console.error("💥 Error initializing auth:", error)
      } finally {
        setLoading(false)
        console.log("✅ Auth initialization complete")
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("🔐 AuthContext signIn called with:", email)
    setLoading(true)
    try {
      const result = await authSignIn(email, password)
      console.log("📋 AuthContext signIn result:", result)

      if (result.error) {
        console.error("❌ SignIn error:", result.error)
        return { error: result.error }
      }

      if (result.user) {
        console.log("✅ User signed in successfully:", result.user.email, "Role:", result.user.role)
        setUser(result.user)

        // Store demo user in localStorage if not using Supabase
        if (!isSupabaseConfigured()) {
          localStorage.setItem("demo-user", JSON.stringify(result.user))
          console.log("💾 Demo user stored in localStorage")
        }
      }

      return {}
    } catch (error) {
      console.error("💥 Sign in error:", error)
      return { error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth?: string
    role: "customer" | "hospital" | "tpa" | "insurer"
    organization?: string
  }) => {
    setLoading(true)
    try {
      const result = await authSignUp(userData)

      if (result.error) {
        return { error: result.error }
      }

      return {}
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: "Registration failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log("🚪 Signing out...")
    setLoading(true)
    try {
      await authSignOut()
      setUser(null)

      // Clear demo user from localStorage
      if (!isSupabaseConfigured()) {
        localStorage.removeItem("demo-user")
        console.log("🗑️ Demo user removed from localStorage")
      }

      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: "No user logged in" }

    try {
      if (isSupabaseConfigured()) {
        const result = await updateUserProfile(user.id, updates)

        if (result.error) {
          return { error: result.error }
        }

        // Refresh user data
        await refreshUser()
      } else {
        // Demo mode - update local user
        const updatedUser = { ...user, ...updates }
        setUser(updatedUser)
        localStorage.setItem("demo-user", JSON.stringify(updatedUser))
      }

      return {}
    } catch (error) {
      return { error: "Failed to update profile" }
    }
  }

  const handlePasswordReset = async (email: string) => {
    try {
      const result = await requestPasswordReset(email)
      return { error: result.error }
    } catch (error) {
      return { error: "Failed to send password reset email" }
    }
  }

  const handleResetPassword = async (newPassword: string) => {
    try {
      const result = await resetPassword(newPassword)
      return { error: result.error }
    } catch (error) {
      return { error: "Failed to reset password" }
    }
  }

  const refreshUser = async () => {
    try {
      if (isSupabaseConfigured()) {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    requestPasswordReset: handlePasswordReset,
    resetPassword: handleResetPassword,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
