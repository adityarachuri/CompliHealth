import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

export const supabase = createSupabaseClient()

export function isSupabaseConfigured(): boolean {
  const hasValidUrl = supabaseUrl && supabaseUrl !== "https://demo.supabase.co" && supabaseUrl.includes("supabase.co")
  const hasValidKey = supabaseAnonKey && supabaseAnonKey !== "demo-key" && supabaseAnonKey.length > 20

  return hasValidUrl && hasValidKey
}
