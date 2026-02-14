import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me")

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip login page
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("admin_token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
