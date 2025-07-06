#!/usr/bin/env node

const { spawn } = require("child_process")
const path = require("path")

console.log("🚀 Starting Healthcare Insurance Portal Demo")
console.log("============================================\n")

console.log("📋 Demo Accounts Available:")
console.log("---------------------------")
console.log("Customer Account:")
console.log("  📧 demo@healthinsurance.com")
console.log("  🔑 demo123456")
console.log("")
console.log("Hospital Account:")
console.log("  📧 hospital@demo.com")
console.log("  🔑 demo123456")
console.log("")
console.log("Admin Account:")
console.log("  📧 admin@demo.com")
console.log("  🔑 admin123456")
console.log("")

console.log("🔧 Configuration:")
console.log("------------------")
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://demo.supabase.co") {
  console.log("✅ Supabase configured - Full features available")
} else {
  console.log("🔧 Demo mode - Using localStorage for authentication")
}

console.log("\n🌐 Starting development server...")
console.log("Open http://localhost:3000 when ready\n")

// Start the Next.js development server
const nextDev = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
})

nextDev.on("error", (error) => {
  console.error("❌ Failed to start development server:", error)
  process.exit(1)
})

nextDev.on("close", (code) => {
  console.log(`\n👋 Development server stopped with code ${code}`)
  process.exit(code)
})

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development server...")
  nextDev.kill("SIGINT")
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down development server...")
  nextDev.kill("SIGTERM")
})
