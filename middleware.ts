import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

    // Check if we're in demo mode
    const isDemo = supabaseUrl === "https://demo.supabase.co" || supabaseAnonKey === "demo-key"

    // Skip middleware for static files and API routes that don't need auth
    const { pathname } = request.nextUrl

    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/health") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/static")
    ) {
      return response
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy"]

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

    // If it's a public route, allow access
    if (isPublicRoute) {
      return response
    }

    // For demo mode, allow access to all routes (authentication is handled client-side)
    if (isDemo) {
      return response
    }

    // Create Supabase server client for authentication check
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    })

    // Check if user is authenticated
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If there's an auth error or no user, redirect to login
    if (error || !user) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // User is authenticated, allow access
    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // On error, redirect to login for protected routes
    const { pathname } = request.nextUrl
    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy"]
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

    if (!isPublicRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
