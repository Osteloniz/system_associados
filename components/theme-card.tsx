import Link from "next/link"
import { Monitor, Armchair, Heart, Plane, Tag } from "lucide-react"
import { formatThemeLabel } from "@/lib/theme"

const themeIcons: Record<string, React.ReactNode> = {
  "Tecnologia": <Monitor className="h-8 w-8" />,
  "Casa e Escritório": <Armchair className="h-8 w-8" />,
  "Beleza e Saúde": <Heart className="h-8 w-8" />,
  "Viagem": <Plane className="h-8 w-8" />,
}

function getThemeIcon(theme: string) {
  return themeIcons[formatThemeLabel(theme)] || <Tag className="h-8 w-8" />
}

export function ThemeCard({ theme, count }: { theme: string; count: number }) {
  const formattedTheme = formatThemeLabel(theme)

  return (
    <Link
      href={`/catalogo/${encodeURIComponent(theme)}`}
      className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {getThemeIcon(theme)}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{formattedTheme}</h3>
      <p className="text-xs text-muted-foreground">
        {count} {Number(count) === 1 ? "produto" : "produtos"}
      </p>
    </Link>
  )
}
