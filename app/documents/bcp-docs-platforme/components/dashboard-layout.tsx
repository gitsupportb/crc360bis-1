import type React from "react"
import { MainNav } from "./main-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <MainNav />
        </div>
      </header>
      <main className="flex-1 container py-6 px-4 sm:px-6">{children}</main>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} BCP Securities Services. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
