"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { Product } from "@/lib/db"
import { formatThemeLabel } from "@/lib/theme"

type ProductFormData = {
  title: string
  slug: string
  description: string
  comment: string
  image_url: string
  price_from: string
  price_to: string
  affiliate_link: string
  theme: string
  active: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

const defaultThemes = [
  "Tecnologia",
  "Casa e Escritório",
  "Beleza e Saúde",
  "Viagem",
  "Esportes",
  "Moda",
]

export function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}) {
  const isEditing = !!product

  const [form, setForm] = useState<ProductFormData>({
    title: product?.title || "",
    slug: product?.slug || "",
    description: product?.description || "",
    comment: product?.comment || "",
    image_url: product?.image_url || "",
    price_from: product ? String(product.price_from) : "",
    price_to: product ? String(product.price_to) : "",
    affiliate_link: product?.affiliate_link || "",
    theme: formatThemeLabel(product?.theme || defaultThemes[0]),
    active: product?.active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
      // Auto-generate slug from title
      if (name === "title" && !isEditing) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        ...form,
        price_from: parseFloat(form.price_from),
        price_to: parseFloat(form.price_to),
        comment: form.comment || null,
      }

      const url = isEditing ? `/api/products/${product.id}` : "/api/products"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Não foi possível salvar o produto.")
        return
      }

      onSuccess()
    } catch {
      setError("Ocorreu um erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Título *
          </label>
          <input
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="Nome do produto"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-foreground">
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={form.slug}
            onChange={handleChange}
            className={inputClass}
            placeholder="nome-do-produto"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Descrição *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Descrição detalhada do produto"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="text-sm font-medium text-foreground">
          Comentário (opcional)
        </label>
        <input
          id="comment"
          name="comment"
          value={form.comment}
          onChange={handleChange}
          className={inputClass}
          placeholder="Comentário sobre o produto"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="image_url" className="text-sm font-medium text-foreground">
          URL da Imagem *
        </label>
        <input
          id="image_url"
          name="image_url"
          required
          value={form.image_url}
          onChange={handleChange}
          className={inputClass}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price_from" className="text-sm font-medium text-foreground">
            Preço de (R$) *
          </label>
          <input
            id="price_from"
            name="price_from"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.price_from}
            onChange={handleChange}
            className={inputClass}
            placeholder="299.90"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="price_to" className="text-sm font-medium text-foreground">
            Preço por (R$) *
          </label>
          <input
            id="price_to"
            name="price_to"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.price_to}
            onChange={handleChange}
            className={inputClass}
            placeholder="149.90"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="affiliate_link" className="text-sm font-medium text-foreground">
          Link de Afiliado *
        </label>
        <input
          id="affiliate_link"
          name="affiliate_link"
          type="url"
          required
          value={form.affiliate_link}
          onChange={handleChange}
          className={inputClass}
          placeholder="https://exemplo.com/afiliado/produto"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="theme" className="text-sm font-medium text-foreground">
            Tema/Categoria *
          </label>
          <select
            id="theme"
            name="theme"
            required
            value={form.theme}
            onChange={handleChange}
            className={inputClass}
          >
            {defaultThemes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-3 pb-0.5">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 rounded accent-primary"
            />
            Produto ativo
          </label>
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isEditing ? (
            "Salvar alterações"
          ) : (
            "Criar produto"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
