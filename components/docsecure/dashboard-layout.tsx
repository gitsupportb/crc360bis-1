import type React from "react"
import { DocSecureMainNav } from "@/components/docsecure/main-nav"

interface DocSecureDashboardLayoutProps {
  children: React.ReactNode
}

export function DocSecureDashboardLayout({ children }: DocSecureDashboardLayoutProps) {
  return (
    <div className="min-h-screen" style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #FFF8F5 0%, #FFF0E6 50%, #FFB366 100%)',
      margin: 0,
      padding: '20px',
      color: '#2C1810',
      position: 'relative'
    }}>
      {/* Background pattern overlay */}
      <div style={{
        content: '',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23FFE4D6" stroke-width="0.5" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>\')',
        zIndex: -1,
        opacity: 0.4
      }} />

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden" style={{
        boxShadow: '0 10px 15px -3px rgba(255, 107, 53, 0.1), 0 4px 6px -2px rgba(255, 107, 53, 0.05)'
      }}>
        {/* Header styling matching RepWatch exactly */}
        <header className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB366 100%)',
          color: 'white',
          padding: '25px 35px',
          boxShadow: '0 20px 25px -5px rgba(255, 107, 53, 0.1), 0 10px 10px -5px rgba(255, 107, 53, 0.04)'
        }}>
          {/* Header background pattern */}
          <div style={{
            content: '',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="15" cy="15" r="2" fill="white" opacity="0.15"/><circle cx="85" cy="35" r="1.5" fill="white" opacity="0.12"/><circle cx="45" cy="75" r="1" fill="white" opacity="0.08"/><rect x="20" y="25" width="8" height="2" fill="white" opacity="0.1"/><rect x="30" y="23" width="8" height="4" fill="white" opacity="0.08"/><rect x="40" y="20" width="8" height="7" fill="white" opacity="0.1"/><rect x="50" y="18" width="8" height="9" fill="white" opacity="0.08"/><path d="M65,30 L70,25 L75,28 L80,22 L85,26" stroke="white" stroke-width="1" fill="none" opacity="0.12"/></svg>\')',
            zIndex: 0
          }} />

          <div className="relative z-10">
            <DocSecureMainNav />
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>

        <footer className="border-t py-4" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-gray-600 md:flex-row">
            <p>© {new Date().getFullYear()} BCP Securities Services. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
