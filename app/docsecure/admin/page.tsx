"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/docsecure/admin-login"
import { AdminDashboard } from "@/components/docsecure/admin-dashboard"

interface AdminUser {
  username: string;
  role: string;
}

export default function DocSecureAdminPage() {
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
      const localSession = localStorage.getItem('docsecure-admin-session');
      const localUser = localStorage.getItem('docsecure-admin-user');

      if (localSession === 'authenticated' && localUser) {
        try {
          const userData = JSON.parse(localUser);
          setIsAuthenticated(true);
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (parseError) {
          console.warn('Failed to parse local user data:', parseError);
        }
      }

      // Try API verification
      try {
        const response = await fetch('/api/docsecure/auth/verify')
        const result = await response.json()

        if (result.success && result.authenticated && result.user) {
          setIsAuthenticated(true)
          setUser(result.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (apiError) {
        console.warn('API auth check failed:', apiError);
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (userData: AdminUser) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('docsecure-admin-session');
    localStorage.removeItem('docsecure-admin-user');

    // Clear state
    setIsAuthenticated(false)
    setUser(null)
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
      }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  // Show admin dashboard if authenticated
  return <AdminDashboard user={user} onLogout={handleLogout} />
}
