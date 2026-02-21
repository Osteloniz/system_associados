import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Product } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { stringifyCsv } from "@/lib/csv"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const products = (await sql`SELECT * FROM products ORDER BY created_at DESC`) as Product[]

    const rows: string[][] = [
      [
        "title",
        "slug",
        "description",
        "comment",
        "image_url",
        "price_from",
        "price_to",
        "affiliate_link",
        "theme",
        "active",
      ],
      ...products.map((product) => [
        product.title,
        product.slug,
        product.description,
        product.comment ?? "",
        product.image_url,
        String(product.price_from),
        String(product.price_to),
        product.affiliate_link,
        product.theme,
        String(product.active),
      ]),
    ]

    const csv = stringifyCsv(rows)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="produtos-seleto.csv"',
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ error: "Falha ao exportar produtos em CSV." }, { status: 500 })
  }
}
