const { execSync } = require("child_process")
const path = require("path")

console.log("🧪 Starting Healthcare Insurance Portal Unit Tests...\n")

try {
  // Run Jest tests with coverage
  console.log("Running Jest test suite...\n")

  const result = execSync("npx jest --coverage --verbose --detectOpenHandles", {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf8",
  })

  console.log(result)

  console.log("\n🎉 All tests completed successfully!")
  console.log("✨ Healthcare Insurance Portal is ready for production.")
} catch (error) {
  console.error("❌ Test execution failed:")
  console.error(error.stdout || error.message)

  // Show detailed error information
  if (error.stderr) {
    console.error("\nError details:")
    console.error(error.stderr)
  }

  process.exit(1)
}
