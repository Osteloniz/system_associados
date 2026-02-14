import { sql } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/db"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { formatThemeLabel } from "@/lib/theme"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const products = (await sql`SELECT * FROM products WHERE slug = ${slug} AND active = true`) as Product[]
  const product = products[0]
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: `${product.title} - Seleto`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const products = (await sql`SELECT * FROM products WHERE slug = ${slug} AND active = true`) as Product[]
  const product = products[0]

  if (!product) {
    notFound()
  }

  const discount = Math.round(
    ((Number(product.price_from) - Number(product.price_to)) / Number(product.price_from)) * 100
  )
  const formattedTheme = formatThemeLabel(product.theme)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/catalogo/${encodeURIComponent(product.theme)}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para {formattedTheme}
          </Link>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
                  {`-${discount}%`}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              <span className="w-fit rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {formattedTheme}
              </span>

              <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
                {product.title}
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {product.comment && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    {product.comment}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="mt-2 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground line-through">
                  De: {formatCurrency(Number(product.price_from))}
                </span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(Number(product.price_to))}
                </span>
              </div>

              {/* CTA */}
              <a
                href={product.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Aproveitar oferta
                <ExternalLink className="h-4 w-4" />
              </a>

              <p className="text-center text-xs text-muted-foreground">
                {"Você será redirecionado para o site do vendedor."}
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
