import type { Metadata } from 'next'
import { Anton, Geist, Geist_Mono } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const anton = Anton({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Recepten',
  description: 'Onze recepten-collectie.',
}

// SiteHeader leest categorieën uit de DB — geen static prerender.
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Toaster richColors />
      </body>
    </html>
  )
}
