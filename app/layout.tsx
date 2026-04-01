import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seazone Kanban',
  description: 'Gestão operacional de imóveis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
