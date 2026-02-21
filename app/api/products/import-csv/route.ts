import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { parseCsv } from "@/lib/csv"
import { getFirstZodErrorMessage, importProductSchema } from "@/lib/validation/product"

const EXPECTED_HEADERS = [
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
] as const

type HeaderName = (typeof EXPECTED_HEADERS)[number]

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized === "") return true
  if (["true", "1", "sim", "yes"].includes(normalized)) return true
  if (["false", "0", "nao", "não", "no"].includes(normalized)) return false
  return null
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo CSV não enviado." }, { status: 400 })
    }

    const csvText = await file.text()
    const rows = parseCsv(csvText)

    if (rows.length < 2) {
      return NextResponse.json({ error: "CSV vazio ou sem linhas de dados." }, { status: 400 })
    }

    const headers = rows[0].map((header) => header.trim().toLowerCase())

    const missingHeaders = EXPECTED_HEADERS.filter((header) => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const headerIndex = new Map<HeaderName, number>()
    for (const header of EXPECTED_HEADERS) {
      headerIndex.set(header, headers.indexOf(header))
    }

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 1; i < rows.length; i += 1) {
      const lineNumber = i + 1
      const row = rows[i]

      if (!row || row.every((value) => value.trim() === "")) {
        skipped += 1
        continue
      }

      const getValue = (header: HeaderName) => {
        const index = headerIndex.get(header) ?? -1
        return index >= 0 ? (row[index] ?? "").trim() : ""
      }

      const active = parseBoolean(getValue("active"))
      if (active === null) {
        errors.push(`Linha ${lineNumber}: valor inválido para "active". Use true/false.`)
        continue
      }

      const parsed = importProductSchema.safeParse({
        title: getValue("title"),
        slug: getValue("slug"),
        description: getValue("description"),
        comment: getValue("comment"),
        image_url: getValue("image_url"),
        price_from: getValue("price_from"),
        price_to: getValue("price_to"),
        affiliate_link: getValue("affiliate_link"),
        theme: getValue("theme"),
        active,
      })

      if (!parsed.success) {
        errors.push(`Linha ${lineNumber}: ${getFirstZodErrorMessage(parsed.error)}`)
        continue
      }

      const product = parsed.data

      try {
        await sql`
          INSERT INTO products (
            title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme, active
          )
          VALUES (
            ${product.title},
            ${product.slug},
            ${product.description},
            ${product.comment ?? null},
            ${product.image_url},
            ${product.price_from},
            ${product.price_to},
            ${product.affiliate_link},
            ${product.theme},
            ${product.active ?? true}
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            comment = EXCLUDED.comment,
            image_url = EXCLUDED.image_url,
            price_from = EXCLUDED.price_from,
            price_to = EXCLUDED.price_to,
            affiliate_link = EXCLUDED.affiliate_link,
            theme = EXCLUDED.theme,
            active = EXCLUDED.active
        `
        imported += 1
      } catch {
        errors.push(`Linha ${lineNumber}: erro ao inserir/atualizar no banco.`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errorCount: errors.length,
      errors,
    })
  } catch {
    return NextResponse.json({ error: "Falha ao importar CSV." }, { status: 500 })
  }
}
