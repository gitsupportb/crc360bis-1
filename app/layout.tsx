import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { InstallPrompt, OfflineIndicator } from "@/components/pwa/install-prompt"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRC360 - Comprehensive Risk & Compliance Dashboard",
  description: "Integrated platform for risk management, AML compliance, document security, and reporting for BCP Securities Services.",
  generator: 'CRC360',
  manifest: '/manifest.json',
  keywords: ['risk-management', 'compliance', 'dashboard', 'bcp2s', 'aml', 'document-management', 'pwa'],
  authors: [{ name: 'BCP Securities Services', url: 'https://bcp.ma' }],
  creator: 'BCP Securities Services',
  publisher: 'BCP Securities Services',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CRC360',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'CRC360',
    'msapplication-TileColor': '#ff6b35',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff6b35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CRC360" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PWAProvider>
          {children}
          <InstallPrompt />
          <OfflineIndicator />
          <Toaster />
        </PWAProvider>
      </body>
    </html>
  )
}