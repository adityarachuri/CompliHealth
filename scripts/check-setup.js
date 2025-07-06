import { existsSync, readFileSync } from "fs"

console.log("🔍 Healthcare Insurance Portal - Setup Check\n")

// Check package.json
console.log("📦 Checking package.json...")
if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"))
  console.log(`✅ Project: ${pkg.name} v${pkg.version}`)
  console.log(`✅ Next.js: ${pkg.dependencies.next}`)
  console.log(`✅ React: ${pkg.dependencies.react}`)
} else {
  console.log("❌ package.json not found")
}

// Check configuration files
const configFiles = ["next.config.mjs", "tailwind.config.ts", "tsconfig.json", "components.json"]

console.log("\n⚙️  Checking configuration files...")
configFiles.forEach((file) => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Missing`)
  }
})

// Check key application files
const appFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/login/page.tsx",
  "app/dashboard/page.tsx",
  "lib/supabase.ts",
  "lib/auth-utils.ts",
  "contexts/auth-context.tsx",
]

console.log("\n🏗️  Checking application files...")
appFiles.forEach((file) => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Missing`)
  }
})

// Check environment variables
console.log("\n🔐 Checking environment variables...")
const envVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
]

envVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Set`)
  } else {
    console.log(`⚠️  ${envVar} - Not set (will use defaults)`)
  }
})

console.log("\n🎯 Demo Accounts Available:")
console.log("📧 member@demo.com (password: demo123) - Member Role")
console.log("📧 provider@demo.com (password: demo123) - Provider Role")
console.log("📧 admin@demo.com (password: demo123) - Admin Role")

console.log("\n✅ Setup check complete!")
console.log('🚀 Run "npm run dev" to start the application')
