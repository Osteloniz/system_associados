import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import {
  getFirstZodErrorMessage,
  patchProductSchema,
  updateProductSchema,
} from "@/lib/validation/product"

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

    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: getFirstZodErrorMessage(parsed.error) },
        { status: 400 }
      )
    }

    const product = parsed.data

    const result = await sql`
      UPDATE products
      SET
        title = ${product.title},
        slug = ${product.slug},
        description = ${product.description},
        comment = ${product.comment ?? null},
        image_url = ${product.image_url},
        price_from = ${product.price_from},
        price_to = ${product.price_to},
        affiliate_link = ${product.affiliate_link},
        theme = ${product.theme},
        active = ${product.active}
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
    const parsed = patchProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: getFirstZodErrorMessage(parsed.error) },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE products
      SET active = ${parsed.data.active}
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
