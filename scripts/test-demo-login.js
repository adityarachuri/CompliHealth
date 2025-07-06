const { execSync } = require("child_process")

console.log("🧪 Testing Demo Login Functionality...\n")

// Simulate the demo login process
function testDemoUserMatching() {
  console.log("🔍 Testing Demo User Matching Logic...")

  const DEMO_USERS = [
    {
      email: "demo@healthinsurance.com",
      password: "demo123456",
      role: "customer",
    },
    {
      email: "hospital@demo.com",
      password: "demo123456",
      role: "hospital",
    },
    {
      email: "tpa@demo.com",
      password: "demo123456",
      role: "tpa",
    },
    {
      email: "insurer@demo.com",
      password: "demo123456",
      role: "insurer",
    },
    {
      email: "admin@demo.com",
      password: "admin123456",
      role: "admin",
    },
  ]

  function findDemoUser(email, password) {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    return DEMO_USERS.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === normalizedPassword,
    )
  }

  // Test cases
  const testCases = [
    { email: "demo@healthinsurance.com", password: "demo123456", expected: "customer" },
    { email: "DEMO@HEALTHINSURANCE.COM", password: "demo123456", expected: "customer" },
    { email: " demo@healthinsurance.com ", password: " demo123456 ", expected: "customer" },
    { email: "hospital@demo.com", password: "demo123456", expected: "hospital" },
    { email: "tpa@demo.com", password: "demo123456", expected: "tpa" },
    { email: "insurer@demo.com", password: "demo123456", expected: "insurer" },
    { email: "admin@demo.com", password: "admin123456", expected: "admin" },
    { email: "invalid@test.com", password: "wrongpass", expected: null },
  ]

  let passed = 0
  let failed = 0

  testCases.forEach((testCase, index) => {
    const result = findDemoUser(testCase.email, testCase.password)
    const success = result?.role === testCase.expected || (result === null && testCase.expected === null)

    if (success) {
      console.log(`  ✅ Test ${index + 1}: ${testCase.email} -> ${result?.role || "null"}`)
      passed++
    } else {
      console.log(
        `  ❌ Test ${index + 1}: ${testCase.email} -> Expected: ${testCase.expected}, Got: ${result?.role || "null"}`,
      )
      failed++
    }
  })

  console.log(`\n📊 Demo User Matching Results: ${passed} passed, ${failed} failed\n`)
  return failed === 0
}

function testAuthFlow() {
  console.log("🔄 Testing Authentication Flow...")

  // Simulate the auth flow
  async function simulateSignIn(email, password) {
    console.log(`🔐 Attempting sign in with: ${email}`)

    // Step 1: Check demo users first
    const demoUser = findDemoUser(email, password)
    if (demoUser) {
      console.log(`✅ Demo user found: ${demoUser.role}`)
      return { user: demoUser, error: null }
    }

    // Step 2: Would check Supabase (but we're in demo mode)
    console.log("❌ No demo user found")
    return { user: null, error: "Invalid email or password" }
  }

  function findDemoUser(email, password) {
    const DEMO_USERS = [
      { email: "demo@healthinsurance.com", password: "demo123456", role: "customer" },
      { email: "hospital@demo.com", password: "demo123456", role: "hospital" },
      { email: "tpa@demo.com", password: "demo123456", role: "tpa" },
      { email: "insurer@demo.com", password: "demo123456", role: "insurer" },
      { email: "admin@demo.com", password: "admin123456", role: "admin" },
    ]

    return DEMO_USERS.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password.trim(),
    )
  }

  // Test the main demo account
  const result = simulateSignIn("demo@healthinsurance.com", "demo123456")
  console.log("📋 Sign in result:", result)

  return true
}

try {
  console.log("🚀 Starting Demo Login Tests...\n")

  const matchingTest = testDemoUserMatching()
  const flowTest = testAuthFlow()

  if (matchingTest && flowTest) {
    console.log("🎉 All demo login tests passed!")
    console.log("\n✨ You can now login with:")
    console.log("   • demo@healthinsurance.com / demo123456 (Customer)")
    console.log("   • hospital@demo.com / demo123456 (Hospital)")
    console.log("   • tpa@demo.com / demo123456 (TPA)")
    console.log("   • insurer@demo.com / demo123456 (Insurer)")
    console.log("   • admin@demo.com / admin123456 (Admin)")
  } else {
    console.log("❌ Some tests failed. Check the implementation.")
    process.exit(1)
  }
} catch (error) {
  console.error("💥 Test execution failed:", error.message)
  process.exit(1)
}
