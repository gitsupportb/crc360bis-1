import notificationService from './notification-service'

export interface DeadlineEvent {
  id: string
  code: string
  name: string
  description: string
  deadline: Date
  dateArrete?: Date
  frequency: string
  regulator: 'BAM' | 'AMMC' | 'DGI'
  category: string
  categoryKey: string
  completed: boolean
  rule?: string
  daysRemaining: number
  urgencyLevel: 'urgent' | 'warning' | 'normal' // Match RepWatch exactly (no 'info')
  url?: string
}

export interface NotificationSchedule {
  days: number
  title: string
  message: string
  urgency: 'urgent' | 'warning' | 'normal' | 'info'
}

class DeadlineNotificationService {
  private static instance: DeadlineNotificationService
  private notificationSchedules: NotificationSchedule[] = [
    { days: 30, title: 'Deadline Reminder - 30 days', message: '', urgency: 'info' },
    { days: 14, title: 'Deadline Reminder - 14 days', message: '', urgency: 'normal' },
    { days: 7, title: 'Deadline Reminder - 7 days', message: '', urgency: 'warning' },
    { days: 3, title: 'Deadline Alert - 3 days', message: '', urgency: 'urgent' },
    { days: 2, title: 'Urgent Deadline Alert - 2 days', message: '', urgency: 'urgent' },
    { days: 1, title: 'Final Notice - Tomorrow', message: '', urgency: 'urgent' },
    { days: 0, title: 'Deadline Today', message: '', urgency: 'urgent' }
  ]

  private sentNotifications: Set<string> = new Set()
  private notificationSettings: {
    enabled: boolean
    schedules: { [key: number]: boolean }
    regulators: { [key: string]: boolean }
    categories: { [key: string]: boolean }
    dailyFromDay7: boolean
  } = {
    enabled: true,
    schedules: {
      30: true,
      14: true,
      7: true,
      3: true,
      2: true,
      1: true,
      0: true
    },
    regulators: {
      'BAM': true,
      'AMMC': true,
      'DGI': true
    },
    categories: {
      'I': true,
      'II': true,
      'III': true,
      'AMMC_BCP': true,
      'AMMC_BCP2S': true,
      'AMMC_BANK_AL_YOUSR': true,
      'DGI': true
    },
    dailyFromDay7: true
  }

  public static getInstance(): DeadlineNotificationService {
    if (!DeadlineNotificationService.instance) {
      DeadlineNotificationService.instance = new DeadlineNotificationService()
    }
    return DeadlineNotificationService.instance
  }

  private constructor() {
    this.loadSettings()
    this.loadSentNotifications()
  }

  private loadSettings(): void {
    try {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem('deadline-notification-settings')
      if (stored) {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load deadline notification settings:', error)
    }
  }

  private saveSettings(): void {
    try {
      if (typeof window === 'undefined') return
      
      localStorage.setItem('deadline-notification-settings', JSON.stringify(this.notificationSettings))
    } catch (error) {
      console.warn('Failed to save deadline notification settings:', error)
    }
  }

  private loadSentNotifications(): void {
    try {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem('sent-deadline-notifications')
      if (stored) {
        this.sentNotifications = new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.warn('Failed to load sent notifications:', error)
    }
  }

  private saveSentNotifications(): void {
    try {
      if (typeof window === 'undefined') return
      
      localStorage.setItem('sent-deadline-notifications', JSON.stringify([...this.sentNotifications]))
    } catch (error) {
      console.warn('Failed to save sent notifications:', error)
    }
  }

  public updateSettings(settings: Partial<typeof this.notificationSettings>): void {
    this.notificationSettings = { ...this.notificationSettings, ...settings }
    this.saveSettings()
  }

  public getSettings() {
    return { ...this.notificationSettings }
  }

  private calculateDaysRemaining(deadline: Date): number {
    // Use exact same logic as RepWatch dashboard
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  private getUrgencyLevel(daysRemaining: number): 'urgent' | 'warning' | 'normal' | 'info' {
    // Use EXACT same logic as RepWatch dashboard: daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
    if (daysRemaining <= 3) return 'urgent'
    if (daysRemaining <= 7) return 'warning'
    return 'normal' // RepWatch uses 'normal', not 'info'
  }

  private getNotificationKey(event: DeadlineEvent, days: number): string {
    return `${event.id}-${days}d-${event.deadline.toISOString().split('T')[0]}`
  }

  private getEventUrl(event: DeadlineEvent): string {
    const baseUrl = '/rep-watch'
    switch (event.regulator) {
      case 'BAM':
        return `${baseUrl}#bam-${event.categoryKey.toLowerCase()}`
      case 'AMMC':
        return `${baseUrl}#ammc-${event.categoryKey.toLowerCase().replace('_', '-')}`
      case 'DGI':
        return `${baseUrl}#dgi`
      default:
        return baseUrl
    }
  }

  private async sendDeadlineNotification(event: DeadlineEvent, schedule: NotificationSchedule): Promise<void> {
    console.log(`📅 Attempting to send deadline notification for: ${event.name}`)
    
    if (!this.notificationSettings.enabled) {
      console.log('❌ Notifications disabled in settings')
      return
    }
    if (typeof window === 'undefined') {
      console.log('❌ Window not available')
      return
    }

    const notificationKey = this.getNotificationKey(event, schedule.days)
    console.log(`📋 Notification key: ${notificationKey}`)
    
    if (this.sentNotifications.has(notificationKey)) {
      console.log('⏭️ Notification already sent for this key')
      return
    }

    if (!this.notificationSettings.schedules[schedule.days]) {
      console.log(`❌ Schedule for ${schedule.days} days is disabled`)
      return
    }
    if (!this.notificationSettings.regulators[event.regulator]) {
      console.log(`❌ Regulator ${event.regulator} is disabled`)
      return
    }
    if (!this.notificationSettings.categories[event.categoryKey]) {
      console.log(`❌ Category ${event.categoryKey} is disabled`)
      return
    }
    
    console.log('✅ All checks passed, proceeding with notification')

    // Use exact same urgency logic as RepWatch dashboard: daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
    const daysUntil = event.daysRemaining
    const urgencyClass = daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
    const daysText = daysUntil === 0 ? 'Today' : (daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`)
    
    const regulatorEmoji = event.regulator === 'BAM' ? '🏦' : event.regulator === 'AMMC' ? '📈' : '📊'
    const urgencyEmoji = urgencyClass === 'urgent' ? '🚨' : urgencyClass === 'warning' ? '⚠️' : '📅'
    
    const title = `${urgencyEmoji} RepWatch Deadline - ${daysText}`
    const message = `${regulatorEmoji} ${event.name}\nRegulator: ${event.regulator} - ${event.category}\nCode: ${event.code}\nDeadline: ${event.deadline.toLocaleDateString()}\nFrequency: ${event.frequency}`

    const url = this.getEventUrl(event)

    try {
      console.log(`📬 Importing notification service...`)
      const { default: notificationService } = await import('./notification-service')
      
      console.log(`📬 Sending notification: "${title}"`)
      console.log(`📬 Message: "${message}"`)
      
      await notificationService.showNotification({
        title,
        body: message,
        url,
        tag: notificationKey,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        requireInteraction: urgencyClass === 'urgent',
        actions: urgencyClass === 'urgent' ? [
          { action: 'view', title: 'View RepWatch' },
          { action: 'dismiss', title: 'Dismiss' }
        ] : undefined
      })

      this.sentNotifications.add(notificationKey)
      this.saveSentNotifications()
      
      console.log(`✅ Successfully sent RepWatch deadline notification: ${title} for ${event.name} (${urgencyClass})`)
    } catch (error) {
      console.error('❌ Failed to send deadline notification:', error)
    }
  }

  private async sendDailyReminder(events: DeadlineEvent[]): Promise<void> {
    if (!this.notificationSettings.enabled || !this.notificationSettings.dailyFromDay7) return

    // Use RepWatch logic: events with <= 7 days remaining (warning + urgent)
    const urgentEvents = events.filter(e => e.daysRemaining <= 7 && e.daysRemaining > 0 && !e.completed)
    
    if (urgentEvents.length === 0) return

    const notificationKey = `daily-reminder-${new Date().toISOString().split('T')[0]}`
    
    if (this.sentNotifications.has(notificationKey)) return

    const title = `📅 Daily Deadline Reminder`
    const message = urgentEvents.length === 1 
      ? `1 deadline approaching in the next 7 days`
      : `${urgentEvents.length} deadlines approaching in the next 7 days`

    try {
      await notificationService.showNotification({
        title,
        body: message,
        url: '/rep-watch',
        tag: notificationKey,
        icon: '/icons/icon-192x192.png'
      })

      this.sentNotifications.add(notificationKey)
      this.saveSentNotifications()
      
      console.log(`📅 Sent daily reminder: ${urgentEvents.length} upcoming deadlines`)
    } catch (error) {
      console.error('Failed to send daily reminder:', error)
    }
  }

  public async checkAndSendNotifications(events: DeadlineEvent[]): Promise<void> {
    if (!this.notificationSettings.enabled) return
    if (typeof window === 'undefined') return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeEvents = events.filter(e => !e.completed && new Date(e.deadline) >= today)

    for (const event of activeEvents) {
      event.daysRemaining = this.calculateDaysRemaining(event.deadline)
      event.urgencyLevel = this.getUrgencyLevel(event.daysRemaining)

      // Implement the exact schedule you requested:
      // 30 days, 14 days, 7 days notifications
      const keyNotificationDays = [30, 14, 7]
      for (const days of keyNotificationDays) {
        if (event.daysRemaining === days && this.notificationSettings.schedules[days]) {
          const schedule = this.notificationSchedules.find(s => s.days === days)
          if (schedule) {
            await this.sendDeadlineNotification(event, schedule)
          }
        }
      }

      // From 7 days: notify every day using RepWatch urgency logic
      if (this.notificationSettings.dailyFromDay7 && event.daysRemaining <= 7 && event.daysRemaining > 0) {
        const dailyKey = this.getNotificationKey(event, event.daysRemaining) + '-daily-' + new Date().toDateString()
        
        if (!this.sentNotifications.has(dailyKey)) {
          // Use exact RepWatch urgency logic: daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
          const urgencyClass = event.daysRemaining <= 3 ? 'urgent' : (event.daysRemaining <= 7 ? 'warning' : 'normal')
          
          await this.sendDeadlineNotification(event, {
            days: event.daysRemaining,
            title: event.daysRemaining <= 3 ? 'URGENT ALERT - Deadline approaching!' : `RepWatch Reminder - ${event.daysRemaining} days`,
            message: '',
            urgency: urgencyClass as any
          })
          
          this.sentNotifications.add(dailyKey)
          this.saveSentNotifications()
        }
      }

      // Day of deadline (0 days)
      if (event.daysRemaining === 0 && this.notificationSettings.schedules[0]) {
        const todayKey = this.getNotificationKey(event, 0) + '-today-' + new Date().toDateString()
        
        if (!this.sentNotifications.has(todayKey)) {
          await this.sendDeadlineNotification(event, {
            days: 0,
            title: 'DEADLINE TODAY!',
            message: '',
            urgency: 'urgent'
          })
          
          this.sentNotifications.add(todayKey)
          this.saveSentNotifications()
        }
      }
    }

    // Send summary daily reminder if there are multiple urgent events
    await this.sendDailyReminder(activeEvents)
  }

  public clearNotificationHistory(): void {
    this.sentNotifications.clear()
    this.saveSentNotifications()
    localStorage.removeItem('sent-deadline-notifications')
  }

  public resetSettings(): void {
    this.notificationSettings = {
      enabled: true,
      schedules: {
        30: true,
        14: true,
        7: true,
        3: true,
        2: true,
        1: true,
        0: true
      },
      regulators: {
        'BAM': true,
        'AMMC': true,
        'DGI': true
      },
      categories: {
        'I': true,
        'II': true,
        'III': true,
        'AMMC_BCP': true,
        'AMMC_BCP2S': true,
        'AMMC_BANK_AL_YOUSR': true,
        'DGI': true
      },
      dailyFromDay7: true
    }
    this.saveSettings()
  }

  public async testNotification(): Promise<void> {
    const now = Date.now()
    const testEvent: DeadlineEvent = {
      id: 'test-deadline-' + now,
      code: '001',
      name: 'Test RepWatch - Situation Comptable provisoire',
      description: 'Test de notification RepWatch pour échéance de reporting BAM',
      deadline: new Date(now + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      frequency: 'Mensuelle',
      regulator: 'BAM',
      category: 'I – Situation comptable et états annexes',
      categoryKey: 'I',
      completed: false,
      daysRemaining: 2,
      urgencyLevel: 'urgent',
      url: '/rep-watch#bam-i'
    }

    console.log('📅 Sending test RepWatch notification:', testEvent)
    
    await this.sendDeadlineNotification(testEvent, {
      days: 2,
      title: '🚨 Test RepWatch - 2 jours restants',
      message: '',
      urgency: 'urgent'
    })
    
    console.log('✅ Test RepWatch notification sent successfully')
  }

  public getUpcomingDeadlines(days: number = 30): DeadlineEvent[] {
    try {
      const events: DeadlineEvent[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

      if (typeof window !== 'undefined') {
        const repWatchData = this.getRepWatchData()
        
        repWatchData.forEach(event => {
          const eventDeadline = new Date(event.deadline)
          eventDeadline.setHours(0, 0, 0, 0)
          
          if (eventDeadline >= today && eventDeadline <= futureDate) {
            event.daysRemaining = this.calculateDaysRemaining(event.deadline)
            event.urgencyLevel = this.getUrgencyLevel(event.daysRemaining)
            events.push(event)
          }
        })
      }

      return events.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error)
      return []
    }
  }

  public getNotificationBadgeCount(): number {
    // Use exact same logic as RepWatch: getUpcomingEvents(30) filtered by !event.completed
    const upcomingEvents = this.getUpcomingDeadlines(30)
    const incompleteCount = upcomingEvents.filter(event => !event.completed).length
    console.log(`📅 Badge count calculation: ${incompleteCount} incomplete events from ${upcomingEvents.length} total`)
    return incompleteCount
  }

  private getRepWatchData(): DeadlineEvent[] {
    try {
      if (typeof window === 'undefined') return []
      
      const storedData = localStorage.getItem('rep-watch-deadlines')
      if (!storedData) return []

      const parsed = JSON.parse(storedData)
      return parsed.map((item: any) => ({
        ...item,
        deadline: new Date(item.deadline),
        dateArrete: item.dateArrete ? new Date(item.dateArrete) : undefined,
        daysRemaining: this.calculateDaysRemaining(new Date(item.deadline)),
        urgencyLevel: this.getUrgencyLevel(this.calculateDaysRemaining(new Date(item.deadline)))
      }))
    } catch (error) {
      console.error('Error parsing RepWatch data:', error)
      return []
    }
  }

  public schedulePeriodicChecks(): void {
    if (typeof window === 'undefined') return

    setInterval(() => {
      this.checkAndSendNotifications(this.getUpcomingDeadlines())
    }, 60 * 60 * 1000) // Check every hour

    const dailyCheck = () => {
      this.checkAndSendNotifications(this.getUpcomingDeadlines())
    }

    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) // 9 AM next day
    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    setTimeout(() => {
      dailyCheck()
      setInterval(dailyCheck, 24 * 60 * 60 * 1000) // Then every 24 hours
    }, msUntilTomorrow)

    console.log('📅 Scheduled periodic deadline checks')
  }
}

export default DeadlineNotificationService.getInstance()