import { cn } from '@/utilities/ui'
import { Montserrat } from 'next/font/google'
import React from 'react'

import './globals.css'

// Digio's typeface (same as the current site).
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

/** Shared by every tenant; header, footer and metadata live in [tenant]/layout.tsx. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(montserrat.variable)} lang="pt-BR">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
