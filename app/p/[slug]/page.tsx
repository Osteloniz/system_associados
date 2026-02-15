import { redirect } from "next/navigation"

export default async function ShortProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/produto/${encodeURIComponent(slug)}`)
}
