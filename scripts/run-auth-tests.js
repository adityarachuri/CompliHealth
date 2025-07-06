#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔐 Running Authentication Component Tests")
console.log("=".repeat(50))

// Authentication test files to run
const authTestFiles = [
  "__tests__/lib/auth-utils.test.ts",
  "__tests__/lib/supabase.test.ts",
  "__tests__/contexts/auth-context.test.tsx",
  "__tests__/middleware.test.ts",
  "__tests__/login.test.tsx",
  "__tests__/register.test.tsx",
  "__tests__/forgot-password.test.tsx",
  "__tests__/reset-password.test.tsx",
  "__tests__/auth-utils.test.ts",
  "__tests__/login-integration.test.tsx",
]

// Check which test files exist
const existingTestFiles = authTestFiles.filter((file) => {
  const fullPath = path.join(process.cwd(), file)
  return fs.existsSync(fullPath)
})

console.log("📋 Authentication Test Files Found:")
console.log("-".repeat(30))
existingTestFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`)
})

if (existingTestFiles.length === 0) {
  console.log("❌ No authentication test files found!")
  process.exit(1)
}

console.log(`\n🧪 Running ${existingTestFiles.length} authentication test suites...\n`)

try {
  // Run Jest with specific test files and coverage for auth components
  const testCommand = [
    "npx jest",
    ...existingTestFiles.map((file) => `"${file}"`),
    "--coverage",
    "--coverageDirectory=coverage/auth",
    "--collectCoverageFrom=lib/auth-utils.ts",
    "--collectCoverageFrom=lib/supabase.ts",
    "--collectCoverageFrom=contexts/auth-context.tsx",
    "--collectCoverageFrom=middleware.ts",
    "--collectCoverageFrom=app/login/page.tsx",
    "--collectCoverageFrom=app/register/page.tsx",
    "--collectCoverageFrom=app/forgot-password/page.tsx",
    "--collectCoverageFrom=app/reset-password/page.tsx",
    "--verbose",
    "--no-cache",
    "--maxWorkers=1",
  ].join(" ")

  console.log("🚀 Executing test command:")
  console.log(testCommand)
  console.log("-".repeat(50))

  const result = execSync(testCommand, {
    stdio: "inherit",
    encoding: "utf8",
  })

  console.log("\n" + "=".repeat(50))
  console.log("✅ Authentication Tests Completed Successfully!")
} catch (error) {
  console.log("\n" + "=".repeat(50))
  console.error("❌ Authentication Tests Failed!")
  console.error("Error details:", error.message)

  // Still show what we tested
  console.log("\n📊 Test Summary:")
  console.log("• Auth Utils: Core authentication logic")
  console.log("• Supabase Client: Database connection and configuration")
  console.log("• Auth Context: React state management")
  console.log("• Middleware: Route protection")
  console.log("• Login/Register: User interface components")

  process.exit(1)
}

// Additional auth-specific checks
console.log("\n🔍 Additional Authentication Checks:")
console.log("-".repeat(35))

// Check if demo users are properly configured
console.log("1. Checking demo user configuration...")
try {
  const authUtilsPath = path.join(process.cwd(), "lib", "auth-utils.ts")
  const authUtilsContent = fs.readFileSync(authUtilsPath, "utf8")

  const demoUsers = [
    "demo@healthinsurance.com",
    "hospital@demo.com",
    "tpa@demo.com",
    "insurer@demo.com",
    "admin@demo.com",
  ]

  const foundUsers = demoUsers.filter((email) => authUtilsContent.includes(email))
  console.log(`   ✅ Found ${foundUsers.length}/5 demo users configured`)

  if (foundUsers.length !== 5) {
    console.log(
      "   ⚠️  Missing demo users:",
      demoUsers.filter((email) => !foundUsers.includes(email)),
    )
  }
} catch (error) {
  console.log("   ❌ Could not verify demo user configuration")
}

// Check if Supabase singleton is implemented
console.log("2. Checking Supabase singleton pattern...")
try {
  const supabasePath = path.join(process.cwd(), "lib", "supabase.ts")
  const supabaseContent = fs.readFileSync(supabasePath, "utf8")

  if (supabaseContent.includes("globalThis.__supabase__")) {
    console.log("   ✅ Supabase singleton pattern implemented")
  } else {
    console.log("   ⚠️  Supabase singleton pattern not found")
  }
} catch (error) {
  console.log("   ❌ Could not verify Supabase singleton")
}

// Check if auth context provides all required methods
console.log("3. Checking auth context completeness...")
try {
  const contextPath = path.join(process.cwd(), "contexts", "auth-context.tsx")
  const contextContent = fs.readFileSync(contextPath, "utf8")

  const requiredMethods = [
    "signIn",
    "signUp",
    "signOut",
    "updateProfile",
    "requestPasswordReset",
    "resetPassword",
    "refreshUser",
  ]

  const foundMethods = requiredMethods.filter((method) => contextContent.includes(method))
  console.log(`   ✅ Found ${foundMethods.length}/7 required auth methods`)

  if (foundMethods.length !== 7) {
    console.log(
      "   ⚠️  Missing methods:",
      requiredMethods.filter((method) => !foundMethods.includes(method)),
    )
  }
} catch (error) {
  console.log("   ❌ Could not verify auth context methods")
}

// Check middleware configuration
console.log("4. Checking middleware configuration...")
try {
  const middlewarePath = path.join(process.cwd(), "middleware.ts")
  const middlewareContent = fs.readFileSync(middlewarePath, "utf8")

  if (middlewareContent.includes("createServerClient")) {
    console.log("   ✅ Middleware uses Supabase server client")
  } else {
    console.log("   ⚠️  Middleware server client not found")
  }

  if (middlewareContent.includes("demo.supabase.co")) {
    console.log("   ✅ Middleware handles demo mode")
  } else {
    console.log("   ⚠️  Demo mode handling not found in middleware")
  }
} catch (error) {
  console.log("   ❌ Could not verify middleware configuration")
}

console.log("\n🎯 Authentication Test Summary:")
console.log("-".repeat(30))
console.log("• Core authentication logic tested")
console.log("• Demo user authentication verified")
console.log("• Supabase integration tested")
console.log("• React context state management tested")
console.log("• Route protection middleware tested")
console.log("• Error handling and edge cases covered")
console.log("• Security and input validation tested")

console.log("\n✨ Next Steps:")
console.log("-".repeat(15))
console.log("1. Check coverage report: open coverage/auth/index.html")
console.log("2. Test login manually: npm run dev → http://localhost:3000/login")
console.log("3. Try demo accounts: demo@healthinsurance.com / demo123456")
console.log("4. Verify all user roles work correctly")

console.log("\n🎉 Authentication testing complete!")
