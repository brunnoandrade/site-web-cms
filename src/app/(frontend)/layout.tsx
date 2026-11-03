import { cn } from '@/utilities/ui'
import localFont from 'next/font/local'
import React from 'react'

import './globals.css'

// Digio's typeface (same as the current site), self-hosted: no request to Google at build or runtime.
// Files in public/fonts/montserrat (latin subset, weights 300 to 700).
const montserrat = localFont({
  src: [
    {
      path: '../../../public/fonts/montserrat/Montserrat-300.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/montserrat/Montserrat-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/montserrat/Montserrat-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/montserrat/Montserrat-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/montserrat/Montserrat-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
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
