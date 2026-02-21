import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Product } from "@/lib/db"
import { formatThemeLabel } from "@/lib/theme"
import { getSession } from "@/lib/auth"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const products = (await sql`SELECT * FROM products WHERE active = true ORDER BY theme ASC, title ASC`) as Product[]

    // Group by theme
    const grouped: Record<string, Product[]> = {}
    for (const product of products) {
      if (!grouped[product.theme]) grouped[product.theme] = []
      grouped[product.theme].push(product)
    }

    const now = new Date().toLocaleDateString("pt-BR")

    let productRows = ""
    for (const [theme, themeProducts] of Object.entries(grouped)) {
      productRows += `
        <tr>
          <td colspan="4" style="background:#0d9668;color:#fff;padding:10px 14px;font-size:14px;font-weight:bold;border:none;">
            ${escapeHtml(formatThemeLabel(theme))} (${themeProducts.length})
          </td>
        </tr>
      `
      for (const p of themeProducts) {
        productRows += `
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;">
              <strong>${escapeHtml(p.title)}</strong><br/>
              <span style="color:#666;font-size:11px;">${escapeHtml(p.description.substring(0, 80))}${p.description.length > 80 ? "..." : ""}</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;text-decoration:line-through;color:#999;">
              ${formatCurrency(Number(p.price_from))}
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:bold;color:#0d9668;">
              ${formatCurrency(Number(p.price_to))}
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:11px;">
              <a href="${escapeHtml(p.affiliate_link)}" style="color:#0d9668;">${escapeHtml(p.affiliate_link.substring(0, 40))}...</a>
            </td>
          </tr>
        `
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Catálogo de Produtos - Seleto</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 13px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 2px solid #1a1a1a; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <h1>Catálogo de Produtos</h1>
        <p class="subtitle">Seleto - Gerado em ${now} - ${products.length} produtos ativos</p>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>De</th>
              <th>Por</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p class="footer">Documento gerado automaticamente por Seleto</p>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="catalogo-seleto-${now.replace(/\//g, "-")}.html"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Falha ao gerar catálogo em PDF." }, { status: 500 })
  }
}
