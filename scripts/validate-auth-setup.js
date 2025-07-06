#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Healthcare Insurance Portal - Authentication Setup Validation")
console.log("=".repeat(65))

const validationErrors = []
const validationWarnings = []

// Check if required files exist
console.log("\n📁 Checking Required Files:")
console.log("-".repeat(30))

const requiredFiles = [
  { path: "lib/auth-utils.ts", description: "Core authentication logic" },
  { path: "lib/supabase.ts", description: "Supabase client configuration" },
  { path: "contexts/auth-context.tsx", description: "React authentication context" },
  { path: "app/login/page.tsx", description: "Login page component" },
  { path: "app/register/page.tsx", description: "Registration page component" },
  { path: "middleware.ts", description: "Route protection middleware" },
]

requiredFiles.forEach((file, index) => {
  const fullPath = path.join(process.cwd(), file.path)
  const exists = fs.existsSync(fullPath)

  console.log(`${index + 1}. ${file.path}`)
  console.log(`   ${exists ? "✅" : "❌"} ${file.description}`)

  if (!exists) {
    validationErrors.push(`Missing required file: ${file.path}`)
  }
})

// Check demo users configuration
console.log("\n👥 Checking Demo Users Configuration:")
console.log("-".repeat(35))

try {
  const authUtilsPath = path.join(process.cwd(), "lib", "auth-utils.ts")
  const authUtilsContent = fs.readFileSync(authUtilsPath, "utf8")

  const expectedDemoUsers = [
    { email: "demo@healthinsurance.com", role: "customer" },
    { email: "hospital@demo.com", role: "hospital" },
    { email: "tpa@demo.com", role: "tpa" },
    { email: "insurer@demo.com", role: "insurer" },
    { email: "admin@demo.com", role: "admin" },
  ]

  expectedDemoUsers.forEach((user, index) => {
    const emailFound = authUtilsContent.includes(user.email)
    const roleFound = authUtilsContent.includes(`role: "${user.role}"`)

    console.log(`${index + 1}. ${user.email} (${user.role})`)
    console.log(`   📧 Email: ${emailFound ? "✅" : "❌"}`)
    console.log(`   👤 Role: ${roleFound ? "✅" : "❌"}`)

    if (!emailFound) {
      validationErrors.push(`Demo user email not found: ${user.email}`)
    }
    if (!roleFound) {
      validationWarnings.push(`Demo user role not found: ${user.role}`)
    }
  })
} catch (error) {
  validationErrors.push("Could not read auth-utils.ts file")
}

// Check Supabase configuration
console.log("\n🔧 Checking Supabase Configuration:")
console.log("-".repeat(35))

try {
  const supabasePath = path.join(process.cwd(), "lib", "supabase.ts")
  const supabaseContent = fs.readFileSync(supabasePath, "utf8")

  const checks = [
    { pattern: "createClient", description: "Supabase client creation" },
    { pattern: "isSupabaseConfigured", description: "Configuration check function" },
    { pattern: "globalThis.__supabase__", description: "Singleton pattern" },
    { pattern: "demo.supabase.co", description: "Demo mode handling" },
  ]

  checks.forEach((check, index) => {
    const found = supabaseContent.includes(check.pattern)
    console.log(`${index + 1}. ${check.description}: ${found ? "✅" : "❌"}`)

    if (!found) {
      validationWarnings.push(`Supabase check failed: ${check.description}`)
    }
  })
} catch (error) {
  validationErrors.push("Could not read supabase.ts file")
}

// Check environment variables
console.log("\n🌍 Checking Environment Variables:")
console.log("-".repeat(35))

const envVars = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: false },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: false },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: false },
]

envVars.forEach((envVar, index) => {
  const value = process.env[envVar.name]
  const isSet = !!value
  const isDemo = value === "demo-key" || value === "https://demo.supabase.co"

  console.log(`${index + 1}. ${envVar.name}`)
  console.log(`   Set: ${isSet ? "✅" : "❌"}`)
  console.log(`   Value: ${isSet ? (isDemo ? "Demo Mode" : "Configured") : "Not Set"}`)

  if (envVar.required && !isSet) {
    validationErrors.push(`Required environment variable not set: ${envVar.name}`)
  }
})

// Check test files
console.log("\n🧪 Checking Test Files:")
console.log("-".repeat(25))

const testFiles = [
  "__tests__/lib/auth-utils.test.ts",
  "__tests__/contexts/auth-context.test.tsx",
  "__tests__/login.test.tsx",
  "__tests__/register.test.tsx",
]

testFiles.forEach((testFile, index) => {
  const fullPath = path.join(process.cwd(), testFile)
  const exists = fs.existsSync(fullPath)

  console.log(`${index + 1}. ${testFile}: ${exists ? "✅" : "❌"}`)

  if (!exists) {
    validationWarnings.push(`Test file missing: ${testFile}`)
  }
})

// Check package.json dependencies
console.log("\n📦 Checking Dependencies:")
console.log("-".repeat(25))

try {
  const packagePath = path.join(process.cwd(), "package.json")
  const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"))

  const requiredDeps = ["@supabase/supabase-js", "next", "react", "@testing-library/react", "jest"]

  const allDeps = {
    ...packageContent.dependencies,
    ...packageContent.devDependencies,
  }

  requiredDeps.forEach((dep, index) => {
    const installed = !!allDeps[dep]
    console.log(`${index + 1}. ${dep}: ${installed ? "✅" : "❌"}`)

    if (!installed) {
      validationWarnings.push(`Dependency not found: ${dep}`)
    }
  })
} catch (error) {
  validationWarnings.push("Could not read package.json")
}

// Summary
console.log("\n" + "=".repeat(65))
console.log("📊 Validation Summary:")
console.log("-".repeat(20))

if (validationErrors.length === 0) {
  console.log("✅ No critical errors found!")
} else {
  console.log(`❌ ${validationErrors.length} critical error(s) found:`)
  validationErrors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`)
  })
}

if (validationWarnings.length === 0) {
  console.log("✅ No warnings!")
} else {
  console.log(`⚠️  ${validationWarnings.length} warning(s) found:`)
  validationWarnings.forEach((warning, index) => {
    console.log(`   ${index + 1}. ${warning}`)
  })
}

console.log("\n🎯 Recommendations:")
console.log("-".repeat(20))

if (validationErrors.length === 0 && validationWarnings.length === 0) {
  console.log("🎉 Your authentication setup looks great!")
  console.log("✨ Ready to run tests and start development")
} else {
  console.log("🔧 Fix the issues above before running tests")
  console.log("📚 Check the documentation for setup instructions")
}

console.log("\n🚀 Next Steps:")
console.log("-".repeat(15))
console.log("1. Fix any critical errors listed above")
console.log("2. Run: node scripts/test-auth-comprehensive.js")
console.log("3. Run: node scripts/run-auth-tests.js")
console.log("4. Start development: npm run dev")

// Exit with appropriate code
if (validationErrors.length > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
