import { type NextRequest, NextResponse } from "next/server"

// Only protect /dashboard route
const protectedRoutes = ["/dashboard"]
const authRoutes = ["/"] // Login page

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`[Middleware] Request to: ${pathname}`)

  // Get token from cookies - we just check if it exists, not verify it
  // Token verification will be done in API routes and page components
  const token = request.cookies.get("auth_token")?.value
  const isAuthenticated = !!token
  
  console.log(`[Middleware] Token present: ${isAuthenticated}`)

  // If user has token and trying to access login page, redirect to dashboard
  if (isAuthenticated && authRoutes.includes(pathname)) {
    console.log(`[Middleware] Redirecting authenticated user to dashboard`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !isAuthenticated) {
    console.log(`[Middleware] Redirecting unauthenticated user to login`)
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log(`[Middleware] Allowing access to ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

