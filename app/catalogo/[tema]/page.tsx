import { sql } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/lib/db"
import type { Metadata } from "next"
import { formatThemeLabel } from "@/lib/theme"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tema: string }>
}): Promise<Metadata> {
  const { tema } = await params
  const theme = decodeURIComponent(tema)
  const formattedTheme = formatThemeLabel(theme)
  return {
    title: `${formattedTheme} - Seleto`,
    description: `Confira os melhores produtos de ${formattedTheme} com preços exclusivos.`,
  }
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ tema: string }>
}) {
  const { tema } = await params
  const theme = decodeURIComponent(tema)
  const formattedTheme = formatThemeLabel(theme)

  const products = (await sql`
    SELECT * FROM products WHERE theme = ${theme} AND active = true ORDER BY created_at DESC
  `) as Product[]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            {formattedTheme}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
              <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
              <Link href="/" className="mt-4 text-sm font-medium text-primary hover:underline">
                Voltar ao início
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
