import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seleto - Catálogo de Produtos Afiliados",
  description:
    "Encontre as melhores ofertas em tecnologia, casa, beleza e viagens. Produtos selecionados com os melhores preços.",
}

export const viewport: Viewport = {
  themeColor: "#0d9668",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
