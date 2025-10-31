import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

const protectedRoutes = ["/dashboard", "/alumni", "/mahasiswa"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    await verifyToken(token)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
