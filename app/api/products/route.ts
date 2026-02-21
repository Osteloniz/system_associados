import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createProductSchema, getFirstZodErrorMessage } from "@/lib/validation/product"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme")
    const all = searchParams.get("all")

    let products
    if (theme) {
      products = await sql`
        SELECT * FROM products
        WHERE theme = ${theme} AND active = true
        ORDER BY created_at DESC
      `
    } else if (all === "true") {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
      }
      products = await sql`SELECT * FROM products ORDER BY created_at DESC`
    } else {
      products = await sql`
        SELECT * FROM products
        WHERE active = true
        ORDER BY created_at DESC
      `
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
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: getFirstZodErrorMessage(parsed.error) },
        { status: 400 }
      )
    }

    const product = parsed.data

    const result = await sql`
      INSERT INTO products (title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme)
      VALUES (
        ${product.title},
        ${product.slug},
        ${product.description},
        ${product.comment ?? null},
        ${product.image_url},
        ${product.price_from},
        ${product.price_to},
        ${product.affiliate_link},
        ${product.theme}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("unique")) {
      return NextResponse.json({ error: "Já existe um produto com este slug." }, { status: 409 })
    }
    return NextResponse.json({ error: "Falha ao criar produto." }, { status: 500 })
  }
}
