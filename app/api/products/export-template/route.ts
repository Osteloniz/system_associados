import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { stringifyCsv } from "@/lib/csv"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const rows = [
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
    [
      "Exemplo de Produto",
      "exemplo-de-produto",
      "Descrição do produto para importação.",
      "Comentário opcional",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
      "199.90",
      "149.90",
      "https://example.com/affiliate/exemplo",
      "Tecnologia",
      "true",
    ],
  ]

  const csv = stringifyCsv(rows)

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-importacao-produtos.csv"',
      "Cache-Control": "no-store",
    },
  })
}
