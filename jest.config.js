const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/contexts/(.*)$": "<rootDir>/contexts/$1",
    "^@/test-utils/(.*)$": "<rootDir>/test-utils/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  testTimeout: 20000,
  maxWorkers: "50%",
  collectCoverageFrom: [
    "components/layout/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "contexts/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/layout.tsx",
    "!**/loading.tsx",
  ],
  // Branches sit below 100 because a handful of fallback/else paths are genuinely unreachable
  // given the fixed demo data (e.g. a badge-color default for a status string that never occurs,
  // a sort-switch default for a Select that only offers 3 options) -- see the coverage table
  // after `npm run test:coverage` for exact uncovered lines.
  coverageThreshold: {
    global: {
      statements: 99,
      branches: 93,
      functions: 100,
      lines: 99,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
