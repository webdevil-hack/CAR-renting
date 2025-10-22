import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vercel Project',
  description: 'A Next.js project deployed on Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
