console.log("🔍 Debugging Authentication Flow...\n")

// Mock the exact logic from auth-utils.ts
const DEMO_USERS = [
  {
    email: "demo@healthinsurance.com",
    password: "demo123456",
    user: {
      id: "demo-customer-1",
      email: "demo@healthinsurance.com",
      firstName: "Demo",
      lastName: "Customer",
      role: "customer",
      organization: "Demo Health Insurance",
      isActive: true,
      emailVerified: true,
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
      role: "hospital",
      organization: "Demo General Hospital",
      isActive: true,
      emailVerified: true,
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
      role: "tpa",
      organization: "Demo Third Party Administrator",
      isActive: true,
      emailVerified: true,
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
      role: "insurer",
      organization: "Demo Insurance Company",
      isActive: true,
      emailVerified: true,
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
      role: "admin",
      organization: "Healthcare Insurance Portal",
      isActive: true,
      emailVerified: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  },
]

function findDemoUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  console.log("🔍 Looking for demo user:", normalizedEmail)
  console.log(
    "📋 Available demo users:",
    DEMO_USERS.map((u) => u.email),
  )

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

async function debugSignIn(email, password) {
  console.log(`\n🔐 Debug signIn called with: "${email}" / "${password}"`)
  console.log("=".repeat(60))

  try {
    // Step 1: Check demo users first
    console.log("Step 1: Checking demo users...")
    const demoUser = findDemoUser(email, password)

    if (demoUser) {
      console.log("✅ Demo user login successful!")
      console.log("👤 User details:", {
        id: demoUser.id,
        email: demoUser.email,
        name: `${demoUser.firstName} ${demoUser.lastName}`,
        role: demoUser.role,
        organization: demoUser.organization,
      })
      return { user: demoUser }
    }

    // Step 2: Would check Supabase (simulated)
    console.log("Step 2: Would check Supabase (demo mode - skipped)")
    console.log("❌ Authentication failed - no demo user match")

    return { error: "Invalid email or password" }
  } catch (error) {
    console.error("💥 Unexpected error:", error.message)
    return { error: "An unexpected error occurred during sign in" }
  }
}

// Test all demo accounts
async function runDebugTests() {
  const testCases = [
    { email: "demo@healthinsurance.com", password: "demo123456", description: "Customer Demo" },
    { email: "hospital@demo.com", password: "demo123456", description: "Hospital Demo" },
    { email: "tpa@demo.com", password: "demo123456", description: "TPA Demo" },
    { email: "insurer@demo.com", password: "demo123456", description: "Insurer Demo" },
    { email: "admin@demo.com", password: "admin123456", description: "Admin Demo" },
    { email: "invalid@test.com", password: "wrongpass", description: "Invalid Credentials" },
  ]

  console.log("🧪 Running Debug Tests for All Demo Accounts\n")

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.description}`)
    const result = await debugSignIn(testCase.email, testCase.password)

    if (result.user) {
      console.log(`✅ SUCCESS: ${testCase.description}`)
    } else {
      console.log(`❌ FAILED: ${testCase.description} - ${result.error}`)
    }

    console.log("-".repeat(60))
  }

  console.log("\n🎯 Debug Summary:")
  console.log("• Demo users are checked FIRST (before Supabase)")
  console.log("• Email matching is case-insensitive and trimmed")
  console.log("• Password matching is exact (after trimming)")
  console.log("• All 5 demo accounts should work in the browser")
}

// Run the debug tests
runDebugTests().catch(console.error)
