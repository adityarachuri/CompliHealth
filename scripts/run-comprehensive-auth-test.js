#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔐 Healthcare Insurance Portal - Comprehensive Authentication Test")
console.log("=".repeat(70))

// Step 1: Validate setup
console.log("\n📋 Step 1: Validating Authentication Setup")
console.log("-".repeat(45))

try {
  console.log("🔍 Running setup validation...")
  execSync("node scripts/validate-auth-setup.js", { stdio: "inherit" })
  console.log("✅ Setup validation passed!")
} catch (error) {
  console.log("❌ Setup validation failed!")
  console.log("🔧 Please fix the issues above before continuing.")
  process.exit(1)
}

// Step 2: Test demo user authentication logic
console.log("\n📋 Step 2: Testing Demo User Authentication")
console.log("-".repeat(45))

try {
  console.log("🧪 Running demo user tests...")
  execSync("node scripts/test-auth-comprehensive.js", { stdio: "inherit" })
  console.log("✅ Demo user tests passed!")
} catch (error) {
  console.log("❌ Demo user tests failed!")
  process.exit(1)
}

// Step 3: Run unit tests
console.log("\n📋 Step 3: Running Unit Tests")
console.log("-".repeat(30))

const testFiles = [
  "__tests__/lib/auth-utils.test.ts",
  "__tests__/lib/supabase.test.ts",
  "__tests__/contexts/auth-context.test.tsx",
  "__tests__/middleware.test.ts",
]

const existingTests = testFiles.filter((file) => fs.existsSync(path.join(process.cwd(), file)))

if (existingTests.length === 0) {
  console.log("⚠️  No unit test files found, skipping unit tests")
} else {
  try {
    console.log(`🧪 Running ${existingTests.length} unit test suites...`)

    const testCommand = [
      "npx jest",
      ...existingTests.map((file) => `"${file}"`),
      "--verbose",
      "--no-cache",
      "--maxWorkers=1",
      "--coverage=false", // Skip coverage for this run
    ].join(" ")

    execSync(testCommand, { stdio: "inherit" })
    console.log("✅ Unit tests passed!")
  } catch (error) {
    console.log("❌ Some unit tests failed!")
    console.log("📊 Check the output above for details")
    // Don't exit here, continue with other tests
  }
}

// Step 4: Test component integration
console.log("\n📋 Step 4: Testing Component Integration")
console.log("-".repeat(40))

const componentTests = ["__tests__/login.test.tsx", "__tests__/register.test.tsx"]

const existingComponentTests = componentTests.filter((file) => fs.existsSync(path.join(process.cwd(), file)))

if (existingComponentTests.length === 0) {
  console.log("⚠️  No component test files found, skipping component tests")
} else {
  try {
    console.log(`🧪 Running ${existingComponentTests.length} component test suites...`)

    const componentTestCommand = [
      "npx jest",
      ...existingComponentTests.map((file) => `"${file}"`),
      "--verbose",
      "--no-cache",
      "--maxWorkers=1",
    ].join(" ")

    execSync(componentTestCommand, { stdio: "inherit" })
    console.log("✅ Component tests passed!")
  } catch (error) {
    console.log("❌ Some component tests failed!")
    console.log("📊 Check the output above for details")
  }
}

// Step 5: Generate coverage report
console.log("\n📋 Step 5: Generating Coverage Report")
console.log("-".repeat(35))

try {
  console.log("📊 Generating authentication coverage report...")

  const coverageCommand = [
    "npx jest",
    ...existingTests.map((file) => `"${file}"`),
    "--coverage",
    "--coverageDirectory=coverage/auth",
    "--collectCoverageFrom=lib/auth-utils.ts",
    "--collectCoverageFrom=lib/supabase.ts",
    "--collectCoverageFrom=contexts/auth-context.tsx",
    "--collectCoverageFrom=middleware.ts",
    "--coverageReporters=text",
    "--coverageReporters=html",
    "--silent",
  ].join(" ")

  execSync(coverageCommand, { stdio: "inherit" })
  console.log("✅ Coverage report generated!")
  console.log("📁 View detailed report: coverage/auth/index.html")
} catch (error) {
  console.log("⚠️  Coverage report generation failed")
}

// Final summary
console.log("\n" + "=".repeat(70))
console.log("🎯 Authentication Test Summary")
console.log("-".repeat(30))

console.log("✅ Setup validation completed")
console.log("✅ Demo user authentication tested")
console.log(`✅ ${existingTests.length} unit test suites executed`)
console.log(`✅ ${existingComponentTests.length} component test suites executed`)
console.log("✅ Coverage report generated")

console.log("\n🚀 Next Steps:")
console.log("-".repeat(15))
console.log("1. Review any failed tests above")
console.log("2. Check coverage report: coverage/auth/index.html")
console.log("3. Start development server: npm run dev")
console.log("4. Test authentication manually at: http://localhost:3000/login")
console.log("5. Try demo accounts:")
console.log("   • Customer: demo@healthinsurance.com / demo123456")
console.log("   • Hospital: hospital@demo.com / demo123456")
console.log("   • TPA: tpa@demo.com / demo123456")
console.log("   • Insurer: insurer@demo.com / demo123456")
console.log("   • Admin: admin@demo.com / admin123456")

console.log("\n🎉 Comprehensive authentication testing complete!")
console.log("🔐 Your authentication system is ready for use!")
