import { MainNav } from "@/app/rsense/components/main-nav"
import { NotificationBell } from "@/app/rsense/components/notification-bell"
import { NotificationsProvider } from "@/app/rsense/contexts/notifications-context"
import { ThemeProvider } from "@/app/rsense/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import type React from "react"
import "./styles/repwatch-theme.css"

// Utility function to get current date
const getCurrentDate = () => {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

export default function RSenseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NotificationsProvider>
        <div style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          background: 'linear-gradient(135deg, #FFF8F5 0%, #FFF0E6 50%, #FFB366 100%)',
          margin: 0,
          padding: '20px',
          minHeight: '100vh',
          color: '#2C1810',
          position: 'relative'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(255, 107, 53, 0.1), 0 4px 6px -2px rgba(255, 107, 53, 0.05)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* RepWatch Style Header - Exact Match */}
            <header style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB366 100%)',
              color: 'white',
              padding: '25px 35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 20px 25px -5px rgba(255, 107, 53, 0.1), 0 10px 10px -5px rgba(255, 107, 53, 0.04)',
              zIndex: 1000
            }}>
              {/* Background Pattern */}
              <div style={{
                content: '',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="15" cy="15" r="2" fill="white" opacity="0.15"/><circle cx="85" cy="35" r="1.5" fill="white" opacity="0.12"/><circle cx="45" cy="75" r="1" fill="white" opacity="0.08"/><rect x="20" y="25" width="8" height="2" fill="white" opacity="0.1"/><rect x="30" y="23" width="8" height="4" fill="white" opacity="0.08"/><rect x="40" y="20" width="8" height="7" fill="white" opacity="0.1"/><rect x="50" y="18" width="8" height="9" fill="white" opacity="0.08"/><path d="M65,30 L70,25 L75,28 L80,22 L85,26" stroke="white" stroke-width="1" fill="none" opacity="0.12"/></svg>')`,
                zIndex: 0
              }} />

              {/* Header Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'white',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#FF6B35',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>🔧</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{
                      margin: 0,
                      fontSize: '2.2rem',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>R-Sense</h1>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.9,
                      marginTop: '5px',
                      fontWeight: 300,
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>Enterprise Risk Management</div>
                  </div>
                </div>
                <MainNav />
              </div>

              {/* Header Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>{getCurrentDate()}</div>
                <Link href="/" style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>← Back to Main Dashboard</Link>
              </div>
            </header>
            <main style={{
              padding: '30px',
              minHeight: 'calc(100vh - 200px)',
              background: '#FFF8F5',
              position: 'relative',
              overflow: 'auto'
            }}>{children}</main>
          </div>
        </div>
        <Toaster />
      </NotificationsProvider>
    </ThemeProvider>
  )
}
