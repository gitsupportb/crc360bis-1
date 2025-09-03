'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface PWAContextType {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  canNotify: boolean
  installApp: () => Promise<void>
  showNotification: (title: string, body: string, options?: any) => Promise<void>
  subscribeToNotifications: () => Promise<boolean>
  unsubscribeFromNotifications: () => Promise<boolean>
}

const PWAContext = createContext<PWAContextType | null>(null)

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canNotify, setCanNotify] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return

    // Initialize notification service
    initializeNotificationService()

    // Initialize deadline notification service
    initializeDeadlineNotifications()

    // Check online/offline status
    setIsOnline(navigator.onLine)
    
    // Check if app is installed
    checkIfInstalled()

    // Add event listeners
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstalled(false)
      setIsInstallable(true)
      console.log('PWA install prompt available')
    }

    // App installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const initializeNotificationService = async () => {
    if (typeof window === 'undefined') return
    
    const { default: notificationService } = await import('@/lib/notification-service')
    const initialized = await notificationService.initialize()
    if (initialized) {
      const permission = await notificationService.requestPermission()
      setCanNotify(permission === 'granted')
    }
  }

  const initializeDeadlineNotifications = async () => {
    if (typeof window === 'undefined') return
    
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      
      // Schedule periodic RepWatch data sync
      repwatchDataSync.schedulePeriodicSync()
      
      // Schedule periodic deadline checks
      deadlineNotificationService.schedulePeriodicChecks()
      
      // Initial sync and check for deadlines
      setTimeout(() => {
        repwatchDataSync.checkAndNotifyUpcomingDeadlines()
      }, 2000) // Wait 2 seconds for other services to initialize
      
      console.log('📅 Deadline notification service initialized')
    } catch (error) {
      console.error('Failed to initialize deadline notifications:', error)
    }
  }

  const checkIfInstalled = () => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
    const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
    
    // Check if launched from home screen (iOS)
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    setIsInstalled(isStandalone || isFullscreen || isMinimalUi || isIOSStandalone)
  }

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('No install prompt available')
      return
    }

    try {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstalled(true)
        setIsInstallable(false)
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install prompt failed:', error)
    }
  }

  const showNotification = async (title: string, body: string, options?: any) => {
    if (typeof window === 'undefined') return
    
    const { default: notificationService } = await import('@/lib/notification-service')
    await notificationService.showNotification({
      title,
      body,
      ...options
    })
  }

  const subscribeToNotifications = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      const { default: notificationService } = await import('@/lib/notification-service')
      const permission = await notificationService.requestPermission()
      if (permission !== 'granted') {
        setCanNotify(false)
        return false
      }

      // For now, subscribe without VAPID key (you should implement VAPID key generation on server)
      const subscription = await notificationService.subscribeToPush()
      
      if (subscription) {
        setCanNotify(true)
        // Send subscription to your server here
        console.log('Subscribed to push notifications:', subscription)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
      return false
    }
  }

  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      const { default: notificationService } = await import('@/lib/notification-service')
      const success = await notificationService.unsubscribeFromPush()
      if (success) {
        setCanNotify(false)
      }
      return success
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error)
      return false
    }
  }

  const contextValue: PWAContextType = {
    isOnline: mounted ? isOnline : true,
    isInstallable: mounted ? isInstallable : false,
    isInstalled: mounted ? isInstalled : false,
    canNotify: mounted ? canNotify : false,
    installApp,
    showNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}