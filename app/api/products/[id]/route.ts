import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme, active } = body

    const result = await sql`
      UPDATE products
      SET title = ${title}, slug = ${slug}, description = ${description}, comment = ${comment || null},
          image_url = ${image_url}, price_from = ${price_from}, price_to = ${price_to},
          affiliate_link = ${affiliate_link}, theme = ${theme}, active = ${active}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch {
    return NextResponse.json({ error: "Falha ao atualizar produto." }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params
    const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Falha ao excluir produto." }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (typeof body.active === "boolean") {
      const result = await sql`
        UPDATE products SET active = ${body.active} WHERE id = ${id} RETURNING *
      `
      if (result.length === 0) {
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
      }
      return NextResponse.json(result[0])
    }

    return NextResponse.json({ error: "Dados de atualização inválidos." }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Falha ao atualizar produto." }, { status: 500 })
  }
}
