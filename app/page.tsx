"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Dashboard() {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const initializeNotifications = async () => {
      try {
        if (typeof window === 'undefined') return
        
        // Initialize and use background notification service for real-time counts
        try {
          const { default: notificationBackgroundService } = await import('@/lib/notification-background-service')
          
          // Load saved counts first
          notificationBackgroundService.loadSavedCounts()
          const currentCounts = notificationBackgroundService.getCurrentCounts()
          setNotificationCount(currentCounts.total)
          
          // Add listener for real-time updates
          const countUpdateListener = (total: number, urgent: number) => {
            setNotificationCount(total)
            console.log(`🔔 Dashboard real-time count update: ${total}`)
          }
          
          notificationBackgroundService.addListener(countUpdateListener)
          
          // Initialize background service (this will start syncing)
          notificationBackgroundService.initialize()
          console.log('✅ Dashboard background notification service initialized')
          
          // Store cleanup reference
          ;(window as any).dashboardNotificationListener = countUpdateListener
          
        } catch (bgError) {
          console.warn('Background service failed, falling back to regular sync:', bgError)
          
          // Fallback to regular sync if background service fails
          try {
            const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
            await repwatchDataSync.syncRepWatchData()
            
            const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
            const count = deadlineNotificationService.getNotificationBadgeCount()
            setNotificationCount(count)
            console.log(`📅 Dashboard fallback notification count: ${count}`)
          } catch (fallbackError) {
            console.error('Fallback notification count also failed:', fallbackError)
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize dashboard notifications:', error)
      }
    }
    
    initializeNotifications()
    
    // Cleanup function
    return () => {
      const listener = (window as any).dashboardNotificationListener
      if (listener) {
        try {
          import('@/lib/notification-background-service').then(({ default: service }) => {
            service.removeListener(listener)
            console.log('✅ Dashboard notification listener cleaned up')
          })
        } catch (error) {
          console.warn('Failed to cleanup dashboard listener:', error)
        }
      }
    }
  }, [])

  const handleCardClick = (cardId: string) => {
    setActiveCard(cardId)
    setTimeout(() => setActiveCard(null), 600)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative h-24 w-72">
              <Image src="/logo.png" alt="BCP Securities Services" fill className="object-contain" priority />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/rep-watch"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2 relative"
            >
              <span>📊</span>
              Rep Watch
              {mounted && notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {notificationCount}
                </span>
              )}
            </Link>
            <Link
              href="/amlcenter"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>🛡️</span>
              AML Center
            </Link>
            <Link
              href="/docsecure"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📄</span>
              Doc Secure
            </Link>
            <Link
              href="/rsense"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              R-Sense
            </Link>
            <Link
              href="/pwa-settings"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2"
            >
              <span>📱</span>
              PWA Settings
            </Link>
          </nav>
        </div>
      </header>

      <div className="bg-orange-500 h-0.5"></div>

      {/* Hero Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">CRC-360°</h1>
          <div className="mt-6 border-t border-orange-500 w-24 mx-auto"></div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* REP WATCH */}
          <Link
            href="/rep-watch"
            onClick={() => handleCardClick("risk")}
            className={`relative h-auto md:h-48 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200 text-left transform bg-transparent ${
              activeCard === "risk" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full md:w-2/5 h-24 md:h-full">
                <Image
                  src="/Image1.png"
                  alt="Rep Watch"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900 opacity-60"></div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 md:p-4 flex flex-col justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white">
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">Rep watch</h3>
                <p className="mb-2 md:mb-3 text-xs md:text-sm text-gray-200 leading-relaxed">Comprehensive risk monitoring and analysis tools for your portfolio.</p>
                <div className="flex items-center text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "risk" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* AML CENTER */}
          <Link
            href="/amlcenter"
            onClick={() => handleCardClick("aml")}
            className={`relative h-auto md:h-48 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200 text-left transform bg-transparent ${
              activeCard === "aml" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full md:w-2/5 h-24 md:h-full">
                <Image
                  src="/Image2.png"
                  alt="AML Center"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900 opacity-60"></div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 md:p-4 flex flex-col justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white">
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">AML CENTER</h3>
                <p className="mb-2 md:mb-3 text-xs md:text-sm text-gray-200 leading-relaxed">Anti-Money Laundering compliance and monitoring system.</p>
                <div className="flex items-center text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "aml" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* DOC SECURE */}
          <Link
            href="/docsecure"
            onClick={() => handleCardClick("doc")}
            className={`relative h-auto md:h-48 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200 text-left transform bg-transparent ${
              activeCard === "doc" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full md:w-2/5 h-24 md:h-full">
                <Image
                  src="/Image4.png"
                  alt="Doc Secure"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900 opacity-60"></div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 md:p-4 flex flex-col justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white">
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">DOC SECURE</h3>
                <p className="mb-2 md:mb-3 text-xs md:text-sm text-gray-200 leading-relaxed">Secure document management and storage solution.</p>
                <div className="flex items-center text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "doc" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* R-SENSE */}
          <Link
            href="/rsense"
            onClick={() => handleCardClick("rsense")}
            className={`relative h-auto md:h-48 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200 text-left transform bg-transparent ${
              activeCard === "rsense" ? "scale-95 ring-4 ring-orange-300" : "hover:scale-[1.02]"
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full md:w-2/5 h-24 md:h-full">
                <Image
                  src="/Image3.png"
                  alt="R-Sense"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900 opacity-60"></div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 md:p-4 flex flex-col justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white">
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">R-SENSE</h3>
                <p className="mb-2 md:mb-3 text-xs md:text-sm text-gray-200 leading-relaxed">Advanced risk calculation and modeling tools.</p>
                <div className="flex items-center text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                  Voir plus
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      activeCard === "rsense" ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">&copy; 2025 BCP Securities Services. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Terms
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Privacy
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
