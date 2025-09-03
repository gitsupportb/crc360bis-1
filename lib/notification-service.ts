'use client'

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported')
      return false
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', this.registration)
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready
      
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return
    }

    if (!this.registration) {
      console.warn('Service worker not registered')
      return
    }

    const notificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image,
      tag: payload.tag || 'crc360-notification',
      requireInteraction: payload.requireInteraction || false,
      data: {
        url: payload.url || '/',
        timestamp: Date.now()
      },
      actions: payload.actions || []
    }

    await this.registration.showNotification(payload.title, notificationOptions)
  }

  // Subscribe to push notifications (requires VAPID keys from server)
  async subscribeToPush(vapidPublicKey?: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('Service worker not registered')
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey ? this.urlBase64ToUint8Array(vapidPublicKey) : undefined
      })

      console.log('Push subscription:', subscription)
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        console.log('Unsubscribed from push notifications')
        return true
      }
      return false
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  // Get current push subscription
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) return null

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  // Helper to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Predefined notification types for the app
  async showDocumentNotification(title: string, documentName: string, url?: string) {
    await this.showNotification({
      title: `📄 ${title}`,
      body: `Document: ${documentName}`,
      icon: '/icons/icon-192x192.png',
      url: url || '/docsecure/documents',
      tag: 'document-notification',
      actions: [
        { action: 'view', title: 'View Document' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  async showAMLNotification(title: string, message: string, url?: string) {
    await this.showNotification({
      title: `🚨 AML Alert: ${title}`,
      body: message,
      icon: '/icons/icon-192x192.png',
      url: url || '/amlcenter',
      tag: 'aml-notification',
      requireInteraction: true,
      actions: [
        { action: 'investigate', title: 'Investigate' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  async showReportNotification(title: string, reportName: string, url?: string) {
    await this.showNotification({
      title: `📊 ${title}`,
      body: `Report: ${reportName}`,
      icon: '/icons/icon-192x192.png',
      url: url || '/repwatch',
      tag: 'report-notification',
      actions: [
        { action: 'view', title: 'View Report' },
        { action: 'download', title: 'Download' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  async showSystemNotification(title: string, message: string, url?: string) {
    await this.showNotification({
      title: `⚙️ System: ${title}`,
      body: message,
      icon: '/icons/icon-192x192.png',
      url: url || '/',
      tag: 'system-notification'
    })
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService
export { type NotificationPayload }