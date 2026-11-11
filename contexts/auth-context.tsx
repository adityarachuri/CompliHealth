"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: "customer" | "hospital" | "tpa" | "insurer"
  organization?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for CompliHealth
const DEMO_USERS: User[] = [
  {
    id: "1",
    email: "customer@demo.com",
    name: "John Smith",
    role: "customer",
    organization: "Personal Account",
  },
  {
    id: "2",
    email: "hospital@demo.com",
    name: "Dr. Sarah Johnson",
    role: "hospital",
    organization: "City General Hospital",
  },
  {
    id: "3",
    email: "tpa@demo.com",
    name: "Michael Chen",
    role: "tpa",
    organization: "HealthCare TPA Services",
  },
  {
    id: "4",
    email: "insurer@demo.com",
    name: "Lisa Rodriguez",
    role: "insurer",
    organization: "CompliHealth Insurance",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("complihealth-user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log("CompliHealth - Restored user session:", userData.email)
          setUser(userData)
        }
      } catch (error) {
        console.error("CompliHealth - Error restoring session:", error)
        localStorage.removeItem("complihealth-user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("CompliHealth - Sign in attempt:", email)

    // Demo authentication
    if (password !== "demo123") {
      throw new Error("Invalid password. Use 'demo123' for demo accounts.")
    }

    const demoUser = DEMO_USERS.find((u) => u.email === email)
    if (!demoUser) {
      throw new Error("User not found. Please use a valid demo email address.")
    }

    console.log("CompliHealth - Sign in successful:", demoUser.email)
    setUser(demoUser)
    localStorage.setItem("complihealth-user", JSON.stringify(demoUser))
  }

  const signOut = async () => {
    console.log("CompliHealth - Signing out user")
    setUser(null)
    localStorage.removeItem("complihealth-user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
