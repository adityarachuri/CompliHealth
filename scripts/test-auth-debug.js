// Debug authentication system
console.log("🔍 Authentication Debug Script")
console.log("===============================\n")

// Test the exact demo users that should work
const demoUsers = [
  { email: "demo@healthinsurance.com", password: "demo123456", role: "customer" },
  { email: "hospital@demo.com", password: "demo123456", role: "hospital" },
  { email: "tpa@demo.com", password: "demo123456", role: "tpa" },
  { email: "insurer@demo.com", password: "demo123456", role: "insurer" },
  { email: "admin@demo.com", password: "admin123456", role: "admin" },
]

console.log("🧪 Testing Demo User Authentication")
console.log("-----------------------------------")

// Simulate the exact logic from auth-utils.ts
function testDemoAuth(email, password) {
  const demoUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

  if (demoUser) {
    console.log(`✅ ${email} - Authentication SUCCESS`)
    console.log(`   Role: ${demoUser.role}`)
    return true
  } else {
    console.log(`❌ ${email} - Authentication FAILED`)
    return false
  }
}

// Test each demo user
demoUsers.forEach((user) => {
  testDemoAuth(user.email, user.password)
})

console.log("\n🌐 Environment Check:")
console.log("---------------------")
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set")
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set")

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://demo.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "demo-key"

console.log("Supabase configured:", isSupabaseConfigured ? "✅ YES" : "❌ NO (using demo mode)")

console.log("\n📝 Instructions:")
console.log("----------------")
console.log("1. Start the development server: npm run dev")
console.log("2. Open http://localhost:3000/login")
console.log("3. Try any of these demo accounts:")
console.log("")
demoUsers.forEach((user) => {
  console.log(`   📧 ${user.email}`)
  console.log(`   🔑 ${user.password}`)
  console.log(`   👤 Role: ${user.role}`)
  console.log("")
})

console.log("🔧 If login still fails, check the browser console for detailed error messages.")
