"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

interface AdminUser {
  username: string;
  role: string;
}

export default function UnifiedAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on page load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check localStorage first (fallback authentication)
      const sessionData = localStorage.getItem('admin-session')
      const userData = localStorage.getItem('admin-user')
      
      if (sessionData === 'authenticated' && userData) {
        const user = JSON.parse(userData)
        setUser(user)
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // Try API verification
      try {
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.authenticated) {
            setUser(result.user)
            setIsAuthenticated(true)
          }
        }
      } catch (apiError) {
        console.warn('API verification failed, using localStorage fallback:', apiError);
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (user: AdminUser) => {
    setUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('admin-session')
      localStorage.removeItem('admin-user')
      
      // Try API logout
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })
      } catch (apiError) {
        console.warn('API logout failed:', apiError);
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
      }}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Admin Portal</h2>
          <p className="opacity-90">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />
}
