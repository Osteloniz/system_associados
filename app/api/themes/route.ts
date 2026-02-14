import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const themes = await sql`
      SELECT theme, COUNT(*) as count 
      FROM products 
      WHERE active = true 
      GROUP BY theme 
      ORDER BY theme ASC
    `
    return NextResponse.json(themes)
  } catch {
    return NextResponse.json({ error: "Falha ao buscar temas." }, { status: 500 })
  }
}
