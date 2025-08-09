import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// CompliHealth Supabase client configuration
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Demo mode check for CompliHealth
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

console.log("CompliHealth - Supabase configuration:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDemoMode,
})

// Types for our application
export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "hospital" | "tpa" | "insurer"
  organization?: string
}

export interface Policy {
  id: string
  policy_number: string
  customer_id: string
  policy_type: string
  premium_amount: number
  coverage_amount: number
  start_date: string
  end_date: string
  status: string
  deductible: number
  copay: number
  out_of_pocket_max: number
  network_type: string
}

export interface Claim {
  id: string
  claim_number: string
  policy_id: string
  provider_id: string
  customer_id: string
  claim_amount: number
  approved_amount?: number
  diagnosis: string
  treatment_details: string
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid"
  submission_date: string
  processed_date?: string
  notes?: string
}

export interface Provider {
  id: string
  name: string
  type: string
  specialty?: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  email?: string
  website?: string
  network_status: "in-network" | "out-of-network"
  rating: number
  review_count: number
  accepting_patients: boolean
  languages: string[]
  services: string[]
}
