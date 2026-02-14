import { sql } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCard } from "@/components/theme-card"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const themes = await sql`
    SELECT theme, COUNT(*) as count 
    FROM products 
    WHERE active = true 
    GROUP BY theme 
    ORDER BY theme ASC
  `

  const featured = (await sql`
    SELECT * FROM products WHERE active = true ORDER BY created_at DESC LIMIT 6
  `) as Product[]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-card px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              As melhores ofertas, selecionadas para você
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground leading-relaxed md:text-lg">
              Descubra produtos incríveis com preços exclusivos. Navegue por categorias e encontre exatamente o que você precisa.
            </p>
          </div>
        </section>

        {/* Themes */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-xl font-bold text-foreground md:text-2xl">
              Categorias
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {themes.map((t) => (
                <ThemeCard
                  key={t.theme}
                  theme={t.theme as string}
                  count={Number(t.count)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="border-t border-border bg-card px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-xl font-bold text-foreground md:text-2xl">
              Destaques
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
