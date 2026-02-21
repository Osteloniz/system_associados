import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createToken } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown"
    const rateLimit = checkRateLimit(`admin-login:${ip}`, {
      max: 10,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSec) },
        }
      )
    }

    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json(
        { error: "Credenciais de administrador não configuradas." },
        { status: 500 }
      )
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, adminPasswordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    const token = await createToken(email)

    const response = NextResponse.json({ success: true })
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
