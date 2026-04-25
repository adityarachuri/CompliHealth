import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in demo mode (no Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Create Supabase client only if credentials are available
export const supabase = isDemoMode ? null : createClient(supabaseUrl!, supabaseAnonKey!)

// CompliHealth database types
export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "hospital" | "tpa" | "insurer"
  organization?: string
  created_at: string
  updated_at: string
}

export interface Policy {
  id: string
  user_id: string
  policy_number: string
  policy_type: string
  coverage_amount: number
  premium_amount: number
  deductible: number
  start_date: string
  end_date: string
  status: "active" | "inactive" | "cancelled"
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  user_id: string
  policy_id: string
  claim_number: string
  claim_type: string
  amount: number
  description: string
  status: "pending" | "approved" | "rejected" | "processing"
  submitted_date: string
  processed_date?: string
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  name: string
  type: "hospital" | "clinic" | "specialist" | "pharmacy"
  specialty?: string
  address: string
  phone: string
  email: string
  network_status: "in-network" | "out-of-network"
  accepting_patients: boolean
  rating: number
  created_at: string
  updated_at: string
}

export interface Coverage {
  id: string
  policy_id: string
  coverage_type: string
  coverage_limit: number
  used_amount: number
  remaining_amount: number
  year: number
  created_at: string
  updated_at: string
}

// Demo data for development
export const demoUsers: User[] = [
  {
    id: "1",
    email: "customer@demo.com",
    name: "John Smith",
    role: "customer",
    organization: "Personal Account",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "hospital@demo.com",
    name: "Dr. Sarah Johnson",
    role: "hospital",
    organization: "City General Hospital",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "tpa@demo.com",
    name: "Michael Chen",
    role: "tpa",
    organization: "HealthCare TPA Services",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "insurer@demo.com",
    name: "Lisa Rodriguez",
    role: "insurer",
    organization: "CompliHealth Insurance",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const demoPolicies: Policy[] = [
  {
    id: "1",
    user_id: "1",
    policy_number: "CH12345678",
    policy_type: "Health Insurance",
    coverage_amount: 500000,
    premium_amount: 245,
    deductible: 2000,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "1",
    policy_number: "CH87654321",
    policy_type: "Dental Insurance",
    coverage_amount: 50000,
    premium_amount: 45,
    deductible: 500,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const demoClaims: Claim[] = [
  {
    id: "1",
    user_id: "1",
    policy_id: "1",
    claim_number: "CL2024001",
    claim_type: "Medical",
    amount: 1500,
    description: "Annual physical examination",
    status: "approved",
    submitted_date: "2024-01-15",
    processed_date: "2024-01-17",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-17T00:00:00Z",
  },
  {
    id: "2",
    user_id: "1",
    policy_id: "2",
    claim_number: "CL2024002",
    claim_type: "Dental",
    amount: 450,
    description: "Dental cleaning and checkup",
    status: "pending",
    submitted_date: "2024-01-20",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
]

export const demoProviders: Provider[] = [
  {
    id: "1",
    name: "City General Hospital",
    type: "hospital",
    specialty: "General Practice",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    email: "info@citygeneral.com",
    network_status: "in-network",
    accepting_patients: true,
    rating: 4.8,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Metro Cardiology Center",
    type: "specialist",
    specialty: "Cardiology",
    address: "456 Heart Ave, Medical District",
    phone: "(555) 234-5678",
    email: "contact@metrocardio.com",
    network_status: "in-network",
    accepting_patients: true,
    rating: 4.9,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Family Health Clinic",
    type: "clinic",
    specialty: "Family Medicine",
    address: "789 Family Way, Suburbs",
    phone: "(555) 345-6789",
    email: "info@familyhealth.com",
    network_status: "in-network",
    accepting_patients: false,
    rating: 4.6,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

// Utility functions for demo mode
export function getDemoUser(email: string): User | undefined {
  return demoUsers.find((user) => user.email === email)
}

export function getDemoUserPolicies(userId: string): Policy[] {
  return demoPolicies.filter((policy) => policy.user_id === userId)
}

export function getDemoUserClaims(userId: string): Claim[] {
  return demoClaims.filter((claim) => claim.user_id === userId)
}

export function getDemoProviders(): Provider[] {
  return demoProviders
}

// Supabase helper functions (for production)
export async function signInWithEmail(email: string, password: string) {
  if (isDemoMode) {
    throw new Error("Demo mode: Use demo credentials")
  }

  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  if (isDemoMode) {
    return { error: null }
  }

  const { error } = await supabase!.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  if (isDemoMode) {
    return { user: null, error: null }
  }

  const {
    data: { user },
    error,
  } = await supabase!.auth.getUser()
  return { user, error }
}

export async function getUserPolicies(userId: string) {
  if (isDemoMode) {
    return { data: getDemoUserPolicies(userId), error: null }
  }

  const { data, error } = await supabase!.from("policies").select("*").eq("user_id", userId)

  return { data, error }
}

export async function getUserClaims(userId: string) {
  if (isDemoMode) {
    return { data: getDemoUserClaims(userId), error: null }
  }

  const { data, error } = await supabase!.from("claims").select("*").eq("user_id", userId)

  return { data, error }
}

export async function getProviders() {
  if (isDemoMode) {
    return { data: getDemoProviders(), error: null }
  }

  const { data, error } = await supabase!.from("providers").select("*")

  return { data, error }
}
