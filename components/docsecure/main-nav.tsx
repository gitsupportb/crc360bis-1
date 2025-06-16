"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, Home, FileText, Upload, BarChart3, FolderOpen, Settings, Shield } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function DocSecureMainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      setCurrentDate(now.toLocaleDateString('fr-FR', options))
    }

    updateDate()
    const interval = setInterval(updateDate, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const routes = [
    {
      href: "/docsecure/dashboard",
      label: "Tableau de bord",
      icon: BarChart3,
      active: pathname === "/docsecure/dashboard",
    },
    {
      href: "/docsecure/documents",
      label: "Documents",
      icon: FileText,
      active: pathname === "/docsecure/documents",
    },
    {
      href: "/docsecure/import",
      label: "Importer",
      icon: Upload,
      active: pathname === "/docsecure/import",
    },
    {
      href: "/docsecure/analytics",
      label: "Analytiques",
      icon: BarChart3,
      active: pathname === "/docsecure/analytics",
    },
    {
      href: "/docsecure/settings",
      label: "Paramètres",
      icon: Settings,
      active: pathname === "/docsecure/settings",
    },
  ]

  return (
    <div className="flex items-center justify-between flex-wrap gap-5 w-full">
      {/* Header Left */}
      <div className="flex items-center gap-6">
        {/* Logo Container */}
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center w-18 h-18 bg-white rounded-2xl shadow-lg border-3 border-white/20 overflow-hidden" style={{
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            width: '70px',
            height: '70px'
          }}>
            <Shield className="w-10 h-10 text-orange-500" />
          </div>

          {/* Header Title */}
          <div className="flex flex-col">
            <h1 className="text-2.2rem font-bold m-0" style={{
              fontSize: '2.2rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              DOC SECURE
            </h1>
            <div className="text-sm opacity-90 mt-1 font-light" style={{
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontWeight: 300
            }}>
              Plateforme de gestion documentaire sécurisée
            </div>
          </div>
        </div>

        {/* Navigation buttons section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Dashboard Button */}
          <Link
            href="/docsecure/dashboard"
            className="flex items-center justify-center bg-white rounded-lg shadow-md border-2 border-white/20 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              width: '50px',
              height: '50px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            title="Tableau de bord DOC Secure"
          >
            <BarChart3 className="w-6 h-6 text-orange-500" />
          </Link>

          {/* Documents Button */}
          <Link
            href="/docsecure/documents"
            className="flex items-center justify-center bg-white rounded-lg shadow-md border-2 border-white/20 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              width: '50px',
              height: '50px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            title="Documents"
          >
            <FileText className="w-6 h-6 text-orange-500" />
          </Link>

          {/* Import Button */}
          <Link
            href="/docsecure/import"
            className="flex items-center justify-center bg-white rounded-lg shadow-md border-2 border-white/20 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              width: '50px',
              height: '50px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            title="Importer"
          >
            <Upload className="w-6 h-6 text-orange-500" />
          </Link>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-4">
        {/* Current Date */}
        <div className="px-4 py-2 rounded-full text-sm font-medium" style={{
          background: 'rgba(255,255,255,0.2)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {currentDate}
        </div>

        {/* Status Indicator */}
        <div className="w-3 h-3 rounded-full animate-pulse-custom" style={{
          background: '#10b981'
        }} />

        {/* Back to Dashboard Button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:transform hover:-translate-y-1"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Home className="h-4 w-4" />
          Retour au Dashboard
        </Link>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80" style={{
              background: 'linear-gradient(135deg, #FFF8F5 0%, #FFF0E6 100%)'
            }}>
              <div className="flex items-center mb-8">
                <div className="relative h-12 w-12 mr-3 rounded-lg flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                  boxShadow: '0 4px 8px rgba(255, 107, 53, 0.3)'
                }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-orange-600">DOC SECURE</span>
                  <span className="text-xs text-gray-500">Gestion documentaire</span>
                </div>
              </div>
              <nav className="flex flex-col space-y-2">
                {routes.map((route) => {
                  const IconComponent = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        route.active
                          ? "text-white shadow-sm"
                          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600",
                      )}
                      style={route.active ? {
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                        boxShadow: '0 4px 8px rgba(255, 107, 53, 0.3)'
                      } : {}}
                    >
                      <IconComponent className="h-5 w-5" />
                      {route.label}
                    </Link>
                  )
                })}
                <div className="border-t border-orange-200 my-4"></div>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                >
                  <Home className="h-5 w-5" />
                  Retour au Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
