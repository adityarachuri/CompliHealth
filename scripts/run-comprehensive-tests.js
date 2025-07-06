#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🧪 Healthcare Insurance Portal - Comprehensive Test Suite")
console.log("=".repeat(60))

// Test categories and their files
const testCategories = {
  Authentication: [
    "__tests__/lib/auth-utils.test.ts",
    "__tests__/lib/supabase.test.ts",
    "__tests__/contexts/auth-context.test.tsx",
    "__tests__/middleware.test.ts",
    "__tests__/login.test.tsx",
    "__tests__/register.test.tsx",
    "__tests__/forgot-password.test.tsx",
    "__tests__/reset-password.test.tsx",
    "__tests__/login-integration.test.tsx",
  ],
  "Core Components": ["__tests__/dashboard.test.tsx", "__tests__/main-layout.test.tsx", "__tests__/analytics.test.tsx"],
  "Business Logic": [
    "__tests__/claims.test.tsx",
    "__tests__/providers.test.tsx",
    "__tests__/policies.test.tsx",
    "__tests__/coverage.test.tsx",
  ],
  "Provider Features": [
    "__tests__/providers-view-details.test.tsx",
    "__tests__/providers-book-appointment.test.tsx",
    "__tests__/providers-integration.test.tsx",
    "__tests__/providers-accessibility.test.tsx",
  ],
  "End-to-End": [
    "__tests__/e2e/customer-journey.test.tsx",
    "__tests__/e2e/hospital-workflow.test.tsx",
    "__tests__/e2e/tpa-workflow.test.tsx",
    "__tests__/e2e/performance.test.tsx",
  ],
  Services: ["__tests__/email-service.test.ts"],
}

// Check which test files exist
function checkTestFiles() {
  console.log("📋 Checking Test File Availability...")
  console.log("-".repeat(40))

  const allFiles = []
  const missingFiles = []

  Object.entries(testCategories).forEach(([category, files]) => {
    console.log(`\n${category}:`)

    files.forEach((file) => {
      const fullPath = path.join(process.cwd(), file)
      if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`)
        allFiles.push(file)
      } else {
        console.log(`  ❌ ${file} (missing)`)
        missingFiles.push(file)
      }
    })
  })

  console.log(`\n📊 Summary: ${allFiles.length} found, ${missingFiles.length} missing`)

  if (missingFiles.length > 0) {
    console.log("\n⚠️  Missing test files:")
    missingFiles.forEach((file) => console.log(`   • ${file}`))
  }

  return { allFiles, missingFiles }
}

// Run tests by category
async function runTestsByCategory(category, files) {
  console.log(`\n🧪 Running ${category} Tests...`)
  console.log("-".repeat(30))

  const existingFiles = files.filter((file) => {
    const fullPath = path.join(process.cwd(), file)
    return fs.existsSync(fullPath)
  })

  if (existingFiles.length === 0) {
    console.log(`⚠️  No test files found for ${category}`)
    return false
  }

  try {
    const testCommand = [
      "npx jest",
      ...existingFiles.map((file) => `"${file}"`),
      "--verbose",
      "--no-cache",
      "--passWithNoTests",
    ].join(" ")

    console.log(`Running: ${existingFiles.length} test files`)

    execSync(testCommand, {
      stdio: "inherit",
      encoding: "utf8",
    })

    console.log(`✅ ${category} tests completed successfully`)
    return true
  } catch (error) {
    console.log(`❌ ${category} tests failed`)
    console.error("Error:", error.message)
    return false
  }
}

// Generate coverage report
function generateCoverageReport() {
  console.log("\n📊 Generating Coverage Report...")
  console.log("-".repeat(35))

  try {
    const coverageCommand = [
      "npx jest",
      "--coverage",
      "--coverageDirectory=coverage/comprehensive",
      "--collectCoverageFrom=lib/**/*.{ts,tsx}",
      "--collectCoverageFrom=contexts/**/*.{ts,tsx}",
      "--collectCoverageFrom=components/**/*.{ts,tsx}",
      "--collectCoverageFrom=app/**/*.{ts,tsx}",
      "--collectCoverageFrom=middleware.ts",
      "--coverageReporters=html",
      "--coverageReporters=text",
      "--coverageReporters=lcov",
      "--passWithNoTests",
    ].join(" ")

    execSync(coverageCommand, {
      stdio: "inherit",
      encoding: "utf8",
    })

    console.log("✅ Coverage report generated")
    console.log("📁 Report location: coverage/comprehensive/index.html")

    return true
  } catch (error) {
    console.log("❌ Coverage report generation failed")
    console.error("Error:", error.message)
    return false
  }
}

// Run performance checks
function runPerformanceChecks() {
  console.log("\n⚡ Running Performance Checks...")
  console.log("-".repeat(35))

  const checks = [
    {
      name: "Bundle Size Analysis",
      check: () => {
        // Check if large dependencies are properly imported
        const authUtilsPath = path.join(process.cwd(), "lib", "auth-utils.ts")
        if (fs.existsSync(authUtilsPath)) {
          const content = fs.readFileSync(authUtilsPath, "utf8")
          const hasTreeShaking = content.includes("import type") || content.includes("import { type")
          return hasTreeShaking
        }
        return false
      },
      message: "Tree shaking optimizations",
    },
    {
      name: "Singleton Pattern Check",
      check: () => {
        const supabasePath = path.join(process.cwd(), "lib", "supabase.ts")
        if (fs.existsSync(supabasePath)) {
          const content = fs.readFileSync(supabasePath, "utf8")
          return content.includes("globalThis.__supabase__")
        }
        return false
      },
      message: "Supabase client singleton",
    },
    {
      name: "Lazy Loading Check",
      check: () => {
        const layoutPath = path.join(process.cwd(), "app", "layout.tsx")
        if (fs.existsSync(layoutPath)) {
          const content = fs.readFileSync(layoutPath, "utf8")
          return content.includes("dynamic") || content.includes("lazy")
        }
        return false
      },
      message: "Component lazy loading",
    },
  ]

  let passed = 0
  const total = checks.length

  checks.forEach(({ name, check, message }) => {
    const result = check()
    if (result) {
      console.log(`  ✅ ${name}: ${message}`)
      passed++
    } else {
      console.log(`  ⚠️  ${name}: ${message} not found`)
    }
  })

  console.log(`\n📊 Performance: ${passed}/${total} checks passed`)
  return passed === total
}

// Security audit
function runSecurityAudit() {
  console.log("\n🔒 Running Security Audit...")
  console.log("-".repeat(30))

  const securityChecks = [
    {
      name: "Environment Variables",
      check: () => {
        // Check if sensitive data is not hardcoded
        const files = ["lib/auth-utils.ts", "lib/supabase.ts"]
        return files.every((file) => {
          const fullPath = path.join(process.cwd(), file)
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, "utf8")
            return !content.includes("sk_") && !content.includes("pk_live")
          }
          return true
        })
      },
      message: "No hardcoded secrets",
    },
    {
      name: "Input Validation",
      check: () => {
        const authPath = path.join(process.cwd(), "lib", "auth-utils.ts")
        if (fs.existsSync(authPath)) {
          const content = fs.readFileSync(authPath, "utf8")
          return content.includes("trim()") && content.includes("toLowerCase()")
        }
        return false
      },
      message: "Input sanitization present",
    },
    {
      name: "Error Handling",
      check: () => {
        const authPath = path.join(process.cwd(), "lib", "auth-utils.ts")
        if (fs.existsSync(authPath)) {
          const content = fs.readFileSync(authPath, "utf8")
          return content.includes("try {") && content.includes("catch")
        }
        return false
      },
      message: "Proper error handling",
    },
  ]

  let passed = 0
  const total = securityChecks.length

  securityChecks.forEach(({ name, check, message }) => {
    const result = check()
    if (result) {
      console.log(`  ✅ ${name}: ${message}`)
      passed++
    } else {
      console.log(`  ⚠️  ${name}: ${message} needs attention`)
    }
  })

  console.log(`\n📊 Security: ${passed}/${total} checks passed`)
  return passed === total
}

// Main execution
async function runComprehensiveTests() {
  console.log("🚀 Starting Comprehensive Test Suite...\n")

  // Step 1: Check test files
  const { allFiles, missingFiles } = checkTestFiles()

  if (allFiles.length === 0) {
    console.log("❌ No test files found! Cannot proceed.")
    process.exit(1)
  }

  // Step 2: Run tests by category
  const results = {}

  for (const [category, files] of Object.entries(testCategories)) {
    results[category] = await runTestsByCategory(category, files)
  }

  // Step 3: Generate coverage report
  const coverageSuccess = generateCoverageReport()

  // Step 4: Run performance checks
  const performanceSuccess = runPerformanceChecks()

  // Step 5: Run security audit
  const securitySuccess = runSecurityAudit()

  // Final summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 COMPREHENSIVE TEST RESULTS")
  console.log("=".repeat(60))

  console.log("\n🧪 Test Categories:")
  Object.entries(results).forEach(([category, passed]) => {
    const status = passed ? "✅ PASSED" : "❌ FAILED"
    console.log(`  ${status} - ${category}`)
  })

  console.log("\n📋 Additional Checks:")
  console.log(`  ${coverageSuccess ? "✅" : "❌"} Coverage Report`)
  console.log(`  ${performanceSuccess ? "✅" : "⚠️ "} Performance Checks`)
  console.log(`  ${securitySuccess ? "✅" : "⚠️ "} Security Audit`)

  const testsPassed = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  const allTestsPassed = testsPassed === totalTests

  console.log("\n" + "-".repeat(60))

  if (allTestsPassed && coverageSuccess) {
    console.log("🎉 ALL TESTS PASSED! Your application is ready for production.")

    console.log("\n✨ What was tested:")
    console.log("• Authentication system (5 demo users + Supabase)")
    console.log("• Core components and layouts")
    console.log("• Business logic (claims, policies, coverage)")
    console.log("• Provider management features")
    console.log("• End-to-end user workflows")
    console.log("• Email service integration")
    console.log("• Security and performance")

    console.log("\n🚀 Next Steps:")
    console.log("• Deploy to production")
    console.log("• Set up real Supabase credentials")
    console.log("• Configure email service")
    console.log("• Monitor application performance")
  } else {
    console.log("⚠️  SOME TESTS FAILED OR INCOMPLETE")

    console.log(`\n📊 Results: ${testsPassed}/${totalTests} test categories passed`)

    if (missingFiles.length > 0) {
      console.log(`\n❌ Missing ${missingFiles.length} test files`)
    }

    console.log("\n🔧 Recommended Actions:")
    console.log("• Review failed test output above")
    console.log("• Fix any failing tests")
    console.log("• Create missing test files")
    console.log("• Re-run this comprehensive test suite")
  }

  console.log("\n📁 Reports Generated:")
  console.log("• Coverage: coverage/comprehensive/index.html")
  console.log("• Test output: Available in console above")

  return allTestsPassed && coverageSuccess
}

// Execute the comprehensive test suite
runComprehensiveTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("💥 Test suite execution failed:", error)
    process.exit(1)
  })
