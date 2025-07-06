import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  role: "customer" | "hospital" | "tpa" | "insurer" | "admin"
  organization?: string
  avatarUrl?: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  preferences?: any
  createdAt: string
  updatedAt: string
}

// Demo users for testing - these work even without Supabase
const DEMO_USERS: Array<{
  email: string
  password: string
  user: User
}> = [
  {
    email: "demo@healthinsurance.com",
    password: "demo123456",
    user: {
      id: "demo-customer-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      phone: "+1-555-0123",
      dateOfBirth: "1990-01-01",
      role: "customer",
      organization: "Demo Health Insurance",
      avatarUrl: "/placeholder-user.jpg",
      isActive: true,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
      preferences: { theme: "light", notifications: true },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: "hospital@demo.com",
    password: "demo123456",
    user: {
      id: "demo-hospital-1",
      email: "hospital@demo.com",
      firstName: "Hospital",
      lastName: "Admin",
      phone: "+1-555-0124",
      role: "hospital",
      organization: "Demo General Hospital",
      avatarUrl: "/placeholder-user.jpg",
      isActive: true,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
      preferences: { theme: "light", notifications: true },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: "tpa@demo.com",
    password: "demo123456",
    user: {
      id: "demo-tpa-1",
      email: "tpa@demo.com",
      firstName: "TPA",
      lastName: "Administrator",
      phone: "+1-555-0125",
      role: "tpa",
      organization: "Demo Third Party Administrator",
      avatarUrl: "/placeholder-user.jpg",
      isActive: true,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
      preferences: { theme: "light", notifications: true },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: "insurer@demo.com",
    password: "demo123456",
    user: {
      id: "demo-insurer-1",
      email: "insurer@demo.com",
      firstName: "Insurance",
      lastName: "Company",
      phone: "+1-555-0126",
      role: "insurer",
      organization: "Demo Insurance Company",
      avatarUrl: "/placeholder-user.jpg",
      isActive: true,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
      preferences: { theme: "light", notifications: true },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
  {
    email: "admin@demo.com",
    password: "admin123456",
    user: {
      id: "demo-admin-1",
      email: "admin@demo.com",
      firstName: "System",
      lastName: "Administrator",
      phone: "+1-555-0127",
      role: "admin",
      organization: "Healthcare Insurance Portal",
      avatarUrl: "/placeholder-user.jpg",
      isActive: true,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
      preferences: { theme: "dark", notifications: true },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
]

// Helper function to find demo user
function findDemoUser(email: string, password: string): User | null {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  console.log("🔍 Looking for demo user:", normalizedEmail)

  const demoUser = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === normalizedPassword,
  )

  if (demoUser) {
    console.log("✅ Demo user found:", demoUser.user.role)
    return {
      ...demoUser.user,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  console.log("❌ No demo user found for:", normalizedEmail)
  return null
}

export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    console.log("🔐 signIn called with:", email)

    // ALWAYS check demo users first, regardless of Supabase configuration
    const demoUser = findDemoUser(email, password)
    if (demoUser) {
      console.log("✅ Demo user login successful:", demoUser.email)
      return { user: demoUser }
    }

    // Only try Supabase if it's properly configured
    if (isSupabaseConfigured()) {
      console.log("🔧 Attempting Supabase authentication...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        console.error("❌ Supabase auth error:", error.message)
        return { error: error.message }
      }

      if (data.user) {
        console.log("✅ Supabase user authenticated:", data.user.email)

        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("❌ Error fetching user profile:", profileError.message)
          return { error: "Failed to load user profile" }
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          phone: profile.phone || undefined,
          dateOfBirth: profile.date_of_birth || undefined,
          role: profile.role,
          organization: profile.organization || undefined,
          avatarUrl: profile.avatar_url || undefined,
          isActive: profile.is_active,
          emailVerified: profile.email_verified,
          lastLogin: profile.last_login || undefined,
          preferences: profile.preferences,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }

        // Update last login
        await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)

        return { user }
      }
    }

    console.log("❌ Authentication failed - no demo user and no Supabase match")
    return { error: "Invalid email or password" }
  } catch (error) {
    console.error("💥 Unexpected error in signIn:", error)
    return { error: "An unexpected error occurred during sign in" }
  }
}

export async function signUp(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  role: "customer" | "hospital" | "tpa" | "insurer"
  organization?: string
}): Promise<{ user?: User; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { error: "Registration is not available in demo mode" }
    }

    const { data, error } = await supabase.auth.signUp({
      email: userData.email.trim(),
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          date_of_birth: userData.dateOfBirth,
          role: userData.role,
          organization: userData.organization,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: data.user.id,
        email: userData.email.trim(),
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        date_of_birth: userData.dateOfBirth,
        role: userData.role,
        organization: userData.organization,
        is_active: true,
        email_verified: false,
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return { error: "Failed to create user profile" }
      }

      return { user: undefined } // User needs to verify email
    }

    return { error: "Registration failed" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred during registration" }
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
    }
    return {}
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: "An unexpected error occurred during sign out" }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      phone: profile.phone || undefined,
      dateOfBirth: profile.date_of_birth || undefined,
      role: profile.role,
      organization: profile.organization || undefined,
      avatarUrl: profile.avatar_url || undefined,
      isActive: profile.is_active,
      emailVerified: profile.email_verified,
      lastLogin: profile.last_login || undefined,
      preferences: profile.preferences,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<{ error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { error: "Profile updates are not available in demo mode" }
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        date_of_birth: updates.dateOfBirth,
        organization: updates.organization,
        avatar_url: updates.avatarUrl,
        preferences: updates.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { error: "An unexpected error occurred while updating profile" }
  }
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      // In demo mode, simulate sending an email
      await sendEmail({
        to: email,
        subject: "Password Reset Request (Demo)",
        html: `
          <h2>Password Reset Request</h2>
          <p>This is a demo email. In a real application, you would receive a password reset link.</p>
          <p>For demo purposes, you can continue using the existing demo credentials.</p>
        `,
      })
      return {}
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { error: "An unexpected error occurred while requesting password reset" }
  }
}

export async function resetPassword(newPassword: string): Promise<{ error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { error: "Password reset is not available in demo mode" }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error("Error resetting password:", error)
    return { error: "An unexpected error occurred while resetting password" }
  }
}
