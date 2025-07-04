"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
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

// Demo users for testing
const demoUsers: Record<string, User> = {
  "customer@demo.com": {
    id: "customer-1",
    email: "customer@demo.com",
    name: "John Doe",
    role: "customer",
  },
  "hospital@demo.com": {
    id: "hospital-1",
    email: "hospital@demo.com",
    name: "Dr. Sarah Johnson",
    role: "hospital",
    organization: "City General Hospital",
  },
  "tpa@demo.com": {
    id: "tpa-1",
    email: "tpa@demo.com",
    name: "Michael Chen",
    role: "tpa",
    organization: "Healthcare TPA Services",
  },
  "insurer@demo.com": {
    id: "insurer-1",
    email: "insurer@demo.com",
    name: "Lisa Wang",
    role: "insurer",
    organization: "HealthFirst Insurance",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("healthcare-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("healthcare-user")
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Demo authentication - in production, this would be a real API call
      const demoUser = demoUsers[email.toLowerCase()]
      if (demoUser && password === "demo123") {
        setUser(demoUser)
        localStorage.setItem("healthcare-user", JSON.stringify(demoUser))
        router.push("/dashboard")
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      setUser(null)
      localStorage.removeItem("healthcare-user")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
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
