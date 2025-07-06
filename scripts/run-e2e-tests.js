const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting End-to-End Test Suite...\n")

// Test configuration
const testConfig = {
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "contexts/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// Test suites to run
const testSuites = [
  {
    name: "Customer Journey Tests",
    pattern: "__tests__/e2e/customer-journey.test.tsx",
    description: "Complete customer user flows and interactions",
  },
  {
    name: "Hospital Workflow Tests",
    pattern: "__tests__/e2e/hospital-workflow.test.tsx",
    description: "Hospital user workflows and claim submissions",
  },
  {
    name: "TPA Workflow Tests",
    pattern: "__tests__/e2e/tpa-workflow.test.tsx",
    description: "TPA claim processing and policy management",
  },
  {
    name: "Performance Tests",
    pattern: "__tests__/e2e/performance.test.tsx",
    description: "Performance benchmarks and optimization tests",
  },
]

// Function to run individual test suite
function runTestSuite(suite) {
  console.log(`\n📋 Running ${suite.name}...`)
  console.log(`   ${suite.description}`)
  console.log(`   Pattern: ${suite.pattern}\n`)

  try {
    const startTime = Date.now()

    // Run the test suite
    execSync(`npx jest ${suite.pattern} --verbose --coverage=false`, {
      stdio: "inherit",
      cwd: process.cwd(),
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ ${suite.name} completed in ${duration}s\n`)
    return { success: true, duration: Number.parseFloat(duration), suite: suite.name }
  } catch (error) {
    console.log(`\n❌ ${suite.name} failed\n`)
    return { success: false, error: error.message, suite: suite.name }
  }
}

// Function to run all tests with coverage
function runAllTestsWithCoverage() {
  console.log("\n📊 Running all E2E tests with coverage...\n")

  try {
    const startTime = Date.now()

    execSync("npx jest __tests__/e2e/ --coverage --coverageDirectory=coverage/e2e", {
      stdio: "inherit",
      cwd: process.cwd(),
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ All E2E tests completed with coverage in ${duration}s\n`)
    return { success: true, duration: Number.parseFloat(duration) }
  } catch (error) {
    console.log("\n❌ E2E tests with coverage failed\n")
    return { success: false, error: error.message }
  }
}

// Function to generate test report
function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalSuites: results.length,
    passedSuites: results.filter((r) => r.success).length,
    failedSuites: results.filter((r) => !r.success).length,
    totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
    results: results,
  }

  const reportPath = path.join(process.cwd(), "test-reports", "e2e-report.json")

  // Ensure directory exists
  const reportDir = path.dirname(reportPath)
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`\n📄 Test report saved to: ${reportPath}`)
  return report
}

// Function to display summary
function displaySummary(report) {
  console.log("\n" + "=".repeat(60))
  console.log("📈 END-TO-END TEST SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total Test Suites: ${report.totalSuites}`)
  console.log(`Passed: ${report.passedSuites} ✅`)
  console.log(`Failed: ${report.failedSuites} ${report.failedSuites >
