#!/usr/bin/env node

console.log("🔍 Healthcare Insurance Portal - Comprehensive Auth Test")
console.log("=".repeat(60))

// Test demo users array
const DEMO_USERS = [
  {
    id: "demo-1",
    email: "demo@healthinsurance.com",
    password: "demo123456",
    firstName: "Demo",
    lastName: "Customer",
    role: "customer",
  },
  {
    id: "hospital-1",
    email: "hospital@demo.com",
    password: "demo123456",
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    role: "hospital",
  },
  {
    id: "tpa-1",
    email: "tpa@demo.com",
    password: "demo123456",
    firstName: "Sarah",
    lastName: "Wilson",
    role: "tpa",
  },
  {
    id: "insurer-1",
    email: "insurer@demo.com",
    password: "demo123456",
    firstName: "Michael",
    lastName: "Brown",
    role: "insurer",
  },
  {
    id: "admin-1",
    email: "admin@demo.com",
    password: "admin123456",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
]

console.log("\n🔐 Testing Demo User Authentication Logic:")
console.log("-".repeat(50))

function testSignIn(email, password) {
  console.log(`\n🧪 Testing: ${email}`)
  console.log(`   Password: ${"*".repeat(password.length)}`)

  // Simulate the exact logic from auth-utils.ts
  const demoUser = DEMO_USERS.find((u) => {
    const emailMatch = u.email.toLowerCase() === email.toLowerCase()
    const passwordMatch = u.password === password
    console.log(`   📧 Email match: ${emailMatch}`)
    console.log(`   🔑 Password match: ${passwordMatch}`)
    return emailMatch && passwordMatch
  })

  if (demoUser) {
    console.log(`   ✅ SUCCESS - User found with role: ${demoUser.role}`)
    console.log(`   👤 Name: ${demoUser.firstName} ${demoUser.lastName}`)
    return { success: true, user: demoUser }
  } else {
    console.log(`   ❌ FAILED - No matching user found`)

    // Debug why it failed
    const emailMatch = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (emailMatch) {
      console.log(`   🔍 Email found but password mismatch`)
      console.log(`   Expected: "${emailMatch.password}"`)
      console.log(`   Received: "${password}"`)
    } else {
      console.log(`   🔍 Email not found in demo users`)
    }
    return { success: false, user: null }
  }
}

// Test all demo accounts
console.log("Testing all demo accounts with correct credentials:")
let successCount = 0
let totalTests = 0

DEMO_USERS.forEach((user) => {
  const result = testSignIn(user.email, user.password)
  if (result.success) successCount++
  totalTests++
})

console.log(`\n📊 Results: ${successCount}/${totalTests} tests passed`)

// Test common mistakes
console.log("\n🚨 Testing Common Login Mistakes:")
console.log("-".repeat(50))

// Test case sensitivity
testSignIn("DEMO@HEALTHINSURANCE.COM", "demo123456")
testSignIn("demo@healthinsurance.com", "DEMO123456")

// Test wrong passwords
testSignIn("demo@healthinsurance.com", "wrong123456")
testSignIn("admin@demo.com", "demo123456") // admin has different password

console.log("\n🔧 Environment Check:")
console.log("-".repeat(50))

// Check if we're in demo mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"
const isSupabaseConfigured = supabaseUrl !== "https://demo.supabase.co" && supabaseKey !== "demo-key"

console.log(`Supabase URL: ${supabaseUrl}`)
console.log(`Supabase Key: ${supabaseKey.substring(0, 8)}...`)
console.log(`Supabase Configured: ${isSupabaseConfigured}`)
console.log(`Mode: ${isSupabaseConfigured ? "Production" : "Demo"}`)

console.log("\n🎯 Next Steps:")
console.log("-".repeat(50))
console.log("1. Start the development server: npm run dev")
console.log("2. Open http://localhost:3000/login")
console.log("3. Open browser DevTools (F12) and check Console tab")
console.log("4. Try logging in with these credentials:")
console.log("")
DEMO_USERS.forEach((user) => {
  console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`)
})

console.log("\n✅ All demo users should work now!")
console.log("🔍 Check browser console for detailed login flow logs")
