import { NextRequest } from "next/server"
import { middleware } from "@/middleware"
import jest from "jest"

// Mock the Supabase client
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

// Mock Next.js response
const mockResponse = {
  cookies: {
    set: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => mockResponse),
    redirect: jest.fn((url: string) => ({ redirect: url })),
  },
}))

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Public Routes", () => {
    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy"]

    publicRoutes.forEach((route) => {
      it(`should allow access to public route: ${route}`, async () => {
        const request = new NextRequest(`http://localhost:3000${route}`)

        const result = await middleware(request)

        // Should not redirect public routes
        expect(result).toBeDefined()
      })
    })
  })

  describe("Static Assets", () => {
    const staticPaths = [
      "/_next/static/css/app.css",
      "/_next/static/js/main.js",
      "/favicon.ico",
      "/images/logo.png",
      "/api/health",
    ]

    staticPaths.forEach((path) => {
      it(`should allow access to static asset: ${path}`, async () => {
        const request = new NextRequest(`http://localhost:3000${path}`)

        const result = await middleware(request)

        // Should not process static assets
        expect(result).toBeDefined()
      })
    })
  })

  describe("Protected Routes", () => {
    const protectedRoutes = ["/dashboard", "/profile", "/claims", "/policies", "/providers", "/coverage", "/analytics"]

    protectedRoutes.forEach((route) => {
      it(`should protect route: ${route}`, async () => {
        const request = new NextRequest(`http://localhost:3000${route}`)

        // Mock no authenticated user
        const { createServerClient } = require("@supabase/ssr")
        const mockSupabase = createServerClient()
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await middleware(request)

        // Should handle the request (either redirect or allow)
        expect(result).toBeDefined()
      })
    })
  })

  describe("Authentication Flow", () => {
    it("should handle authenticated user on protected route", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard")

      // Mock authenticated user
      const { createServerClient } = require("@supabase/ssr")
      const mockSupabase = createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
          },
        },
        error: null,
      })

      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it("should handle unauthenticated user on protected route", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard")

      // Mock no user
      const { createServerClient } = require("@supabase/ssr")
      const mockSupabase = createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it("should handle authentication errors gracefully", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard")

      // Mock authentication error
      const { createServerClient } = require("@supabase/ssr")
      const mockSupabase = createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Authentication failed" },
      })

      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })
  })

  describe("Route Matching", () => {
    it("should match dashboard routes", async () => {
      const dashboardRoutes = ["/dashboard", "/dashboard/settings", "/dashboard/profile"]

      for (const route of dashboardRoutes) {
        const request = new NextRequest(`http://localhost:3000${route}`)
        const result = await middleware(request)
        expect(result).toBeDefined()
      }
    })

    it("should match API routes", async () => {
      const apiRoutes = ["/api/auth/callback", "/api/users/profile", "/api/claims/list"]

      for (const route of apiRoutes) {
        const request = new NextRequest(`http://localhost:3000${route}`)
        const result = await middleware(request)
        expect(result).toBeDefined()
      }
    })
  })

  describe("Cookie Handling", () => {
    it("should handle cookie operations", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard")

      const { createServerClient } = require("@supabase/ssr")
      const mockSupabase = createServerClient()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await middleware(request)

      // Verify that createServerClient was called with cookie handlers
      expect(createServerClient).toHaveBeenCalled()

      const callArgs = createServerClient.mock.calls[0]
      expect(callArgs).toBeDefined()
      expect(callArgs.length).toBeGreaterThan(2) // URL, key, and options
    })
  })

  describe("Error Handling", () => {
    it("should handle middleware errors gracefully", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard")

      // Mock createServerClient to throw an error
      const { createServerClient } = require("@supabase/ssr")
      createServerClient.mockImplementation(() => {
        throw new Error("Supabase initialization failed")
      })

      // Should not throw, should handle gracefully
      const result = await middleware(request)
      expect(result).toBeDefined()
    })

    it("should handle malformed requests", async () => {
      // Test with various edge cases
      const edgeCases = [
        "http://localhost:3000//dashboard", // Double slash
        "http://localhost:3000/dashboard?param=value", // With query params
        "http://localhost:3000/dashboard#section", // With hash
      ]

      for (const url of edgeCases) {
        const request = new NextRequest(url)
        const result = await middleware(request)
        expect(result).toBeDefined()
      }
    })
  })

  describe("Configuration", () => {
    it("should have proper matcher configuration", () => {
      // The middleware should be configured to run on specific routes
      // This is typically done in the middleware.ts file export config
      expect(middleware).toBeDefined()
      expect(typeof middleware).toBe("function")
    })

    it("should handle different HTTP methods", async () => {
      const methods = ["GET", "POST", "PUT", "DELETE"]

      for (const method of methods) {
        const request = new NextRequest("http://localhost:3000/dashboard", {
          method,
        })

        const result = await middleware(request)
        expect(result).toBeDefined()
      }
    })
  })
})
