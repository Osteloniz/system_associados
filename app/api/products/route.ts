import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme")
    const all = searchParams.get("all") // for admin - include inactive

    let products
    if (theme) {
      products = await sql`SELECT * FROM products WHERE theme = ${theme} AND active = true ORDER BY created_at DESC`
    } else if (all === "true") {
      products = await sql`SELECT * FROM products ORDER BY created_at DESC`
    } else {
      products = await sql`SELECT * FROM products WHERE active = true ORDER BY created_at DESC`
    }

    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: "Falha ao buscar produtos." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme } = body

    if (!title || !slug || !description || !image_url || !price_from || !price_to || !affiliate_link || !theme) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos." }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme)
      VALUES (${title}, ${slug}, ${description}, ${comment || null}, ${image_url}, ${price_from}, ${price_to}, ${affiliate_link}, ${theme})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Falha ao criar produto."
    if (message.includes("unique")) {
      return NextResponse.json({ error: "Já existe um produto com este slug." }, { status: 409 })
    }
    return NextResponse.json({ error: "Falha ao criar produto." }, { status: 500 })
  }
}
