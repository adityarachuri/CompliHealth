import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks for demo mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Check if Supabase is properly configured (not using demo values)
export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://demo.supabase.co" &&
    supabaseAnonKey !== "demo-key"
  )
}

// Create Supabase client with singleton pattern to prevent multiple instances
function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Singleton pattern to ensure only one Supabase client instance
declare global {
  var __supabase__: ReturnType<typeof createSupabaseClient> | undefined
}

export const supabase = globalThis.__supabase__ ?? createSupabaseClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__supabase__ = supabase
}

// Log configuration status for debugging
if (typeof window !== "undefined") {
  console.log("🔧 Supabase Configuration:")
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseAnonKey.substring(0, 8)}...`)
  console.log(`   Configured: ${isSupabaseConfigured()}`)
  console.log(`   Mode: ${isSupabaseConfigured() ? "Production" : "Demo"}`)
}
