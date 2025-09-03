'use client'

import repwatchDataSync from './repwatch-data-sync'
import deadlineNotificationService, { type DeadlineEvent } from './deadline-notification-service'

class NotificationBackgroundService {
  private static instance: NotificationBackgroundService
  private isInitialized = false
  private syncInterval: NodeJS.Timeout | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private notificationCount = 0
  private urgentCount = 0
  private listeners: Array<(count: number, urgent: number) => void> = []

  public static getInstance(): NotificationBackgroundService {
    if (!NotificationBackgroundService.instance) {
      NotificationBackgroundService.instance = new NotificationBackgroundService()
    }
    return NotificationBackgroundService.instance
  }

  private constructor() {}

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    console.log('🔔 Initializing notification background service...')
    
    this.isInitialized = true
    this.startBackgroundSync()
    
    // Immediate sync on initialization
    this.performSync()
  }

  private startBackgroundSync(): void {
    // Clear existing intervals
    if (this.syncInterval) clearInterval(this.syncInterval)
    if (this.updateInterval) clearInterval(this.updateInterval)

    // Sync data every 5 minutes
    this.syncInterval = setInterval(() => {
      this.performSync()
    }, 5 * 60 * 1000)

    // Update counts every 30 seconds (faster for real-time feel)
    this.updateInterval = setInterval(() => {
      this.updateNotificationCounts()
    }, 30 * 1000)

    console.log('🔔 Background sync intervals started: data sync every 5min, count updates every 30sec')
  }

  private async performSync(): Promise<void> {
    try {
      console.log('🔔 Background sync: fetching latest RepWatch data...')
      
      // Get current regulator settings from deadline notification service
      const settings = deadlineNotificationService.getSettings()
      const enabledRegulators = settings.regulators || { BAM: true, AMMC: true, DGI: true }
      
      // Sync with current regulator settings
      await repwatchDataSync.syncRepWatchData(enabledRegulators)
      
      // Update notification counts after sync
      await this.updateNotificationCounts()
      
      console.log('🔔 Background sync completed successfully')
    } catch (error) {
      console.error('🔔 Background sync failed:', error)
    }
  }

  private async updateNotificationCounts(): Promise<void> {
    try {
      // Get upcoming deadlines for the next 30 days (same as RepWatch dashboard)
      const upcomingEvents = repwatchDataSync.getUpcomingDeadlines(30)
      
      console.log(`🔔 DEBUG: Found ${upcomingEvents.length} total upcoming events`)
      
      // Debug: Log events by regulator
      const bamEvents = upcomingEvents.filter(e => e.regulator === 'BAM')
      const ammcEvents = upcomingEvents.filter(e => e.regulator === 'AMMC')
      const dgiEvents = upcomingEvents.filter(e => e.regulator === 'DGI')
      
      console.log(`🔔 DEBUG: BAM events: ${bamEvents.length}`)
      console.log(`🔔 DEBUG: AMMC events: ${ammcEvents.length}`)
      console.log(`🔔 DEBUG: DGI events: ${dgiEvents.length}`)
      
      // Count only incomplete events (same logic as RepWatch)
      const incompleteEvents = upcomingEvents.filter(event => !event.completed)
      const newCount = incompleteEvents.length
      
      console.log(`🔔 DEBUG: ${incompleteEvents.length} incomplete events out of ${upcomingEvents.length} total`)
      
      // Count urgent events (same logic as RepWatch: daysRemaining <= 7)
      const urgentEvents = incompleteEvents.filter(event => 
        event.daysRemaining <= 7 || event.urgencyLevel === 'urgent'
      )
      const newUrgentCount = urgentEvents.length
      
      console.log(`🔔 DEBUG: ${newUrgentCount} urgent events`)
      
      // Debug: Check what's stored in localStorage from RepWatch
      const repWatchStoredData = localStorage.getItem('rep-watch-deadlines')
      if (repWatchStoredData) {
        const storedEvents = JSON.parse(repWatchStoredData)
        console.log(`🔔 DEBUG: localStorage has ${storedEvents.length} stored RepWatch events`)
      }
      
      // Only notify listeners if counts changed
      if (newCount !== this.notificationCount || newUrgentCount !== this.urgentCount) {
        this.notificationCount = newCount
        this.urgentCount = newUrgentCount
        
        console.log(`🔔 Notification counts updated: ${newCount} total, ${newUrgentCount} urgent`)
        
        // Store in localStorage for persistence
        localStorage.setItem('notification-counts', JSON.stringify({
          total: newCount,
          urgent: newUrgentCount,
          lastUpdate: Date.now()
        }))
        
        // Notify all listeners
        this.notifyListeners()
      }
    } catch (error) {
      console.error('🔔 Failed to update notification counts:', error)
    }
  }

  public addListener(callback: (count: number, urgent: number) => void): void {
    this.listeners.push(callback)
    
    // Immediately call with current counts
    callback(this.notificationCount, this.urgentCount)
  }

  public removeListener(callback: (count: number, urgent: number) => void): void {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.notificationCount, this.urgentCount)
      } catch (error) {
        console.error('🔔 Listener callback failed:', error)
      }
    })
  }

  public getCurrentCounts(): { total: number, urgent: number } {
    return {
      total: this.notificationCount,
      urgent: this.urgentCount
    }
  }

  public async forceSync(): Promise<void> {
    console.log('🔔 Force sync requested...')
    await this.performSync()
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    
    this.listeners = []
    this.isInitialized = false
    
    console.log('🔔 Notification background service destroyed')
  }

  // Load counts from localStorage on startup
  public loadSavedCounts(): void {
    try {
      const saved = localStorage.getItem('notification-counts')
      if (saved) {
        const counts = JSON.parse(saved)
        this.notificationCount = counts.total || 0
        this.urgentCount = counts.urgent || 0
        
        console.log(`🔔 Loaded saved counts: ${this.notificationCount} total, ${this.urgentCount} urgent`)
        
        // Notify listeners with saved counts
        this.notifyListeners()
      }
    } catch (error) {
      console.error('🔔 Failed to load saved counts:', error)
    }
  }
}

// Create and export singleton instance
const notificationBackgroundService = NotificationBackgroundService.getInstance()

export default notificationBackgroundService
export { type DeadlineEvent }