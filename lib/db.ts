import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Product = {
  id: string
  title: string
  slug: string
  description: string
  comment: string | null
  image_url: string
  price_from: number
  price_to: number
  affiliate_link: string
  theme: string
  active: boolean
  created_at: string
}
