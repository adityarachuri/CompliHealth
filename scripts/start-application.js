import { spawn } from "child_process"
import { existsSync } from "fs"

console.log("🚀 Starting Healthcare Insurance Portal...\n")

// Check if required files exist
const requiredFiles = ["package.json", "next.config.mjs", "tailwind.config.ts", "app/layout.tsx", "app/page.tsx"]

console.log("📋 Checking required files...")
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file} - Found`)
  } else {
    console.log(`❌ ${file} - Missing`)
    process.exit(1)
  }
}

// Check environment variables
console.log("\n🔧 Checking environment variables...")
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

const envMissing = false
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Set`)
  } else {
    console.log(`⚠️  ${envVar} - Not set (using default)`)
  }
}

// Start the development server
console.log("\n🏗️  Starting Next.js development server...")
console.log("📍 Application will be available at: http://localhost:3000")
console.log("⏱️  This may take a few moments...\n")

const nextDev = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
})

nextDev.on("error", (error) => {
  console.error("❌ Failed to start application:", error)
  process.exit(1)
})

nextDev.on("close", (code) => {
  if (code !== 0) {
    console.error(`❌ Application exited with code ${code}`)
    process.exit(code)
  }
})

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down application...")
  nextDev.kill("SIGINT")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down application...")
  nextDev.kill("SIGTERM")
  process.exit(0)
})
