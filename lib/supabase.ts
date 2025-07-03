import { createClient } from "@supabase/supabase-js"

/**
 * NOTE:
 * In production you MUST set these two environment variables.
 * The fall-back values below are only for local/preview usage.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = "customer" | "hospital" | "tpa" | "insurer"

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
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
  status: string
  submission_date: string
  processed_date?: string
  notes?: string
}

export interface Provider {
  id: string
  name: string
  type: string
  address: string
  phone?: string
  email?: string
  network_status: string
}
