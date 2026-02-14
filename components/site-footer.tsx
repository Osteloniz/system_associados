import { ShoppingBag } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="flex items-center gap-2 text-foreground">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="font-semibold">Seleto</span>
        </div>
        <p className="text-sm text-muted-foreground">
          As melhores ofertas selecionadas para você.
        </p>
        <p className="text-xs text-muted-foreground">
          {"Links de afiliado: ao comprar através dos nossos links, você apoia o projeto."}
        </p>
      </div>
    </footer>
  )
}
