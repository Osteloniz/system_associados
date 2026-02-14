"use client"

import { useState } from "react"
import useSWR from "swr"
import { AdminHeader } from "@/components/admin-header"
import { ProductForm } from "@/components/product-form"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Package,
  FileDown,
} from "lucide-react"
import Image from "next/image"
import type { Product } from "@/lib/db"
import { formatThemeLabel } from "@/lib/theme"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function AdminDashboardPage() {
  const { data: products, mutate } = useSWR<Product[]>(
    "/api/products?all=true",
    fetcher
  )
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const searchTerm = search.toLowerCase()

  const filteredProducts = products?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm) ||
      formatThemeLabel(p.theme).toLowerCase().includes(searchTerm)
  )

  async function handleToggleActive(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      })
      if (res.ok) {
        mutate()
        toast.success(
          product.active ? "Produto desativado" : "Produto ativado"
        )
      }
    } catch {
      toast.error("Erro ao atualizar produto")
    }
  }

  async function handleDelete(id: string) {
    if (deletingId === id) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
        if (res.ok) {
          mutate()
          toast.success("Produto excluído")
        }
      } catch {
        toast.error("Erro ao excluir produto")
      }
      setDeletingId(null)
    } else {
      setDeletingId(id)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingProduct(undefined)
    mutate()
    toast.success(editingProduct ? "Produto atualizado" : "Produto criado")
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingProduct(undefined)
  }

  const activeCount = products?.filter((p) => p.active).length ?? 0
  const totalCount = products?.length ?? 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminHeader />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeCount} ativos de {totalCount} total
              </p>
            </div>
            {!showForm && (
              <div className="flex items-center gap-3">
                <a
                  href="/api/products/export-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FileDown className="h-4 w-4" />
                  Exportar
                </a>
                <button
                  onClick={() => {
                    setEditingProduct(undefined)
                    setShowForm(true)
                  }}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Novo produto
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                {editingProduct ? "Editar produto" : "Novo produto"}
              </h2>
              <ProductForm
                product={editingProduct}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* Search */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </div>

          {/* Products Table */}
          {!products ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredProducts && filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Tema
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Preço
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredProducts?.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground line-clamp-1">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                            {formatThemeLabel(product.theme)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(Number(product.price_from))}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(Number(product.price_to))}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              product.active
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(product)}
                              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title={product.active ? "Desativar" : "Ativar"}
                            >
                              {product.active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className={`rounded-md p-2 transition-colors ${
                                deletingId === product.id
                                  ? "bg-destructive text-destructive-foreground"
                                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              }`}
                              title={
                                deletingId === product.id
                                  ? "Clique novamente para confirmar"
                                  : "Excluir"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="flex flex-col divide-y divide-border md:hidden">
                {filteredProducts?.map((product) => (
                  <div key={product.id} className="flex flex-col gap-3 bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {product.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            {formatThemeLabel(product.theme)}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              product.active ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(Number(product.price_from))}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(Number(product.price_to))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                        >
                          {product.active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={`rounded-md p-2 ${
                            deletingId === product.id
                              ? "bg-destructive text-destructive-foreground"
                              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
