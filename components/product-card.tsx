import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/lib/db"
import { formatThemeLabel } from "@/lib/theme"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(
    ((Number(product.price_from) - Number(product.price_to)) / Number(product.price_from)) * 100
  )
  const formattedTheme = formatThemeLabel(product.theme)

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            {`-${discount}%`}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium text-primary">{formattedTheme}</span>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {product.title}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(Number(product.price_from))}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(Number(product.price_to))}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            Ver oferta
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
