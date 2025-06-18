import { Inter } from "next/font/google"
import { MainNav } from "../components/main-nav"
import { NotificationBell } from "../components/notification-bell"
import { NotificationsProvider } from "../contexts/notifications-context"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/ui/toaster"
import "./globals.css"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NotificationsProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b">
                <div className="flex h-16 items-center px-4">
                  <MainNav />
                  <div className="ml-auto flex items-center space-x-4">
                    <NotificationBell />
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </NotificationsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
