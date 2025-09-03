'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  X, 
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  TestTube,
  Trash2,
  CheckCircle,
  Building2,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { usePWA } from './pwa-provider'
import { useToast } from '@/components/ui/use-toast'

interface NotificationSettings {
  documents: boolean
  amlAlerts: boolean
  reports: boolean
  system: boolean
  all: boolean
}

interface DeadlineEvent {
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
  urgencyLevel: 'urgent' | 'warning' | 'normal' | 'info'
  url?: string
}

export function NotificationCenter() {
  const { canNotify, subscribeToNotifications, unsubscribeFromNotifications, showNotification } = usePWA()
  const [settings, setSettings] = useState<NotificationSettings>({
    documents: true,
    amlAlerts: true,
    reports: true,
    system: true,
    all: true
  })
  const [deadlineSettings, setDeadlineSettings] = useState<any>(null)
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineEvent[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Set mounted first
    setMounted(true)
    
    // Only run on client side
    if (typeof window === 'undefined') return

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.warn('Failed to parse notification settings:', error)
      }
    }

    // Load deadline notification service
    loadDeadlineSettings()
    loadUpcomingDeadlines()
    const interval = setInterval(loadUpcomingDeadlines, 5 * 60 * 1000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const saveSettings = (newSettings: NotificationSettings) => {
    if (typeof window === 'undefined') return
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))
  }

  const handleToggleAll = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      if (enabled) {
        const success = await subscribeToNotifications()
        if (success) {
          const newSettings = {
            documents: true,
            amlAlerts: true,
            reports: true,
            system: true,
            all: true
          }
          saveSettings(newSettings)
          
          toast({
            title: "Notifications activées",
            description: "Vous recevrez maintenant des notifications push.",
          })

          // Show welcome notification
          setTimeout(() => {
            showNotification(
              "CRC360 Notifications", 
              "Les notifications sont maintenant activées!",
              { tag: 'welcome-notification' }
            )
          }, 1000)
        } else {
          toast({
            title: "Erreur d'activation",
            description: "Impossible d'activer les notifications. Vérifiez vos paramètres de navigateur.",
            variant: "destructive"
          })
        }
      } else {
        const success = await unsubscribeFromNotifications()
        if (success) {
          const newSettings = {
            documents: false,
            amlAlerts: false,
            reports: false,
            system: false,
            all: false
          }
          saveSettings(newSettings)
          
          toast({
            title: "Notifications désactivées",
            description: "Vous ne recevrez plus de notifications push.",
          })
        }
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des paramètres.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeadlineSettings = async () => {
    try {
      if (typeof window === 'undefined') return
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      const settings = deadlineNotificationService.getSettings()
      console.log('Loaded deadline settings:', settings)
      setDeadlineSettings(settings)
    } catch (error) {
      console.error('Failed to load deadline settings:', error)
      // Set default settings if loading fails
      setDeadlineSettings({
        enabled: true,
        schedules: { 30: true, 14: true, 7: true, 3: true, 2: true, 1: true, 0: true },
        regulators: { 'BAM': true, 'AMMC': true, 'DGI': true },
        categories: { 'I': true, 'II': true, 'III': true, 'AMMC_BCP': true, 'AMMC_BCP2S': true, 'AMMC_BANK_AL_YOUSR': true, 'DGI': true },
        dailyFromDay7: true
      })
    }
  }

  const loadUpcomingDeadlines = async () => {
    try {
      if (typeof window === 'undefined') return
      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      
      // Sync data first (will fallback to ALL_REPORTINGS.json if needed)
      await repwatchDataSync.syncRepWatchData()
      
      // Then get the upcoming deadlines
      const deadlines = repwatchDataSync.getUpcomingDeadlines(30)
      setUpcomingDeadlines(deadlines)
      setLastUpdated(new Date())
      console.log(`📅 Loaded ${deadlines.length} upcoming deadlines`)
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error)
    }
  }

  const updateDeadlineSetting = async (key: string, value: any) => {
    try {
      if (typeof window === 'undefined') return
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      deadlineNotificationService.updateSettings({ [key]: value })
      const newSettings = deadlineNotificationService.getSettings()
      setDeadlineSettings(newSettings)
      
      // If enabled, immediately check for notifications to schedule
      if (key === 'enabled' && value === true) {
        const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
        await repwatchDataSync.checkAndNotifyUpcomingDeadlines()
        console.log('✅ RepWatch deadline notifications enabled and scheduled!')
        
        toast({
          title: "RepWatch Notifications Enabled",
          description: "You will now receive deadline notifications as scheduled."
        })
      }
    } catch (error) {
      console.error('Failed to update deadline settings:', error)
      toast({
        title: "Settings Update Failed",
        description: "Could not update RepWatch notification settings.",
        variant: "destructive"
      })
    }
  }

  const handleTestDeadlineNotification = async () => {
    try {
      if (typeof window === 'undefined') return
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      await deadlineNotificationService.testNotification()
      toast({
        title: "Test notification sent!",
        description: "Check your notifications."
      })
    } catch (error) {
      console.error('Failed to send test notification:', error)
      toast({
        title: "Test failed",
        description: "Please check your notification permissions.",
        variant: "destructive"
      })
    }
  }

  const getRegulatorIcon = (regulator: string) => {
    switch (regulator) {
      case 'BAM': return <Building2 className="w-4 h-4" />
      case 'AMMC': return <TrendingUp className="w-4 h-4" />
      case 'DGI': return <BarChart3 className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getUrgencyBadge = (urgency: string, daysRemaining: number) => {
    if (daysRemaining <= 0) return <Badge variant="destructive">Today</Badge>
    if (daysRemaining === 1) return <Badge variant="destructive">Tomorrow</Badge>
    if (urgency === 'urgent') return <Badge variant="destructive">{daysRemaining} days</Badge>
    if (urgency === 'warning') return <Badge variant="secondary">{daysRemaining} days</Badge>
    return <Badge variant="outline">{daysRemaining} days</Badge>
  }

  const handleToggleCategory = (category: keyof Omit<NotificationSettings, 'all'>, enabled: boolean) => {
    const newSettings = { ...settings, [category]: enabled }
    
    // Update 'all' based on individual settings
    newSettings.all = newSettings.documents && newSettings.amlAlerts && newSettings.reports && newSettings.system
    
    saveSettings(newSettings)
    
    toast({
      title: enabled ? "Catégorie activée" : "Catégorie désactivée",
      description: `Les notifications ${getCategoryName(category)} sont maintenant ${enabled ? 'activées' : 'désactivées'}.`,
    })
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'documents': return 'de documents'
      case 'amlAlerts': return 'AML'
      case 'reports': return 'de rapports'
      case 'system': return 'système'
      default: return category
    }
  }

  const testNotification = async (type: string) => {
    const notifications = {
      documents: {
        title: "Nouveau document",
        body: "Un nouveau document a été ajouté au système DocSecure"
      },
      amlAlerts: {
        title: "Alerte AML",
        body: "Transaction suspecte détectée - Investigation requise"
      },
      reports: {
        title: "Rapport généré",
        body: "Votre rapport mensuel est maintenant disponible"
      },
      system: {
        title: "Mise à jour système",
        body: "Le système CRC360 a été mis à jour avec succès"
      }
    }

    const notification = notifications[type as keyof typeof notifications]
    if (notification && canNotify) {
      await showNotification(notification.title, notification.body, {
        tag: `test-${type}`,
        requireInteraction: type === 'amlAlerts'
      })
    }
  }

  const activeDeadlines = upcomingDeadlines.filter(d => !d.completed)
  const completedDeadlines = upcomingDeadlines.filter(d => d.completed)

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Centre de notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Notifications RepWatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Centre de notifications
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        {!canNotify && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <BellOff className="w-4 h-4" />
              <span className="font-medium">Notifications désactivées</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Les notifications push ne sont pas activées. Activez-les pour recevoir des alertes importantes.
            </p>
            <Button
              onClick={() => handleToggleAll(true)}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Activer les notifications
            </Button>
          </div>
        )}

        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Toutes les notifications</label>
            <p className="text-sm text-gray-600">Activer/désactiver toutes les notifications</p>
          </div>
          <Switch
            checked={settings.all && canNotify}
            onCheckedChange={handleToggleAll}
            disabled={isLoading}
          />
        </div>

        {canNotify && (
          <>
            <hr />
            
            {/* Category toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Documents</label>
                  <p className="text-sm text-gray-600">Nouveaux documents, mises à jour</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testNotification('documents')}
                    disabled={!settings.documents}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.documents}
                    onCheckedChange={(checked) => handleToggleCategory('documents', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Alertes AML</label>
                  <p className="text-sm text-gray-600">Transactions suspectes, violations</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testNotification('amlAlerts')}
                    disabled={!settings.amlAlerts}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.amlAlerts}
                    onCheckedChange={(checked) => handleToggleCategory('amlAlerts', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Rapports</label>
                  <p className="text-sm text-gray-600">Rapports générés, analyses</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testNotification('reports')}
                    disabled={!settings.reports}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.reports}
                    onCheckedChange={(checked) => handleToggleCategory('reports', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Système</label>
                  <p className="text-sm text-gray-600">Mises à jour, maintenance</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testNotification('system')}
                    disabled={!settings.system}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.system}
                    onCheckedChange={(checked) => handleToggleCategory('system', checked)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>

    {/* RepWatch Deadline Notifications */}
    {(
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Notifications RepWatch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{activeDeadlines.length}</p>
                <p className="text-xs text-muted-foreground">Active Deadlines</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-lg font-bold">
                  {activeDeadlines.filter(d => d.daysRemaining <= 7).length}
                </p>
                <p className="text-xs text-muted-foreground">Urgent (≤7 days)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-lg font-bold">{completedDeadlines.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {deadlineSettings?.enabled ? (
                <Bell className="w-6 h-6 text-green-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="text-lg font-bold">
                  {deadlineSettings?.enabled ? 'ON' : 'OFF'}
                </p>
                <p className="text-xs text-muted-foreground">RepWatch Alerts</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Global Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable RepWatch Deadline Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {deadlineSettings ? 'Receive notifications for upcoming RepWatch deadlines' : 'Loading RepWatch settings...'}
              </p>
            </div>
            <Switch
              checked={deadlineSettings?.enabled || false}
              onCheckedChange={(checked) => updateDeadlineSetting('enabled', checked)}
              disabled={!deadlineSettings}
            />
          </div>

          {/* Test Notification */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Test Deadline Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Send a test RepWatch deadline notification
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestDeadlineNotification}
              disabled={!deadlineSettings?.enabled}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>

          <Separator />

          {/* Upcoming Deadlines Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming Deadlines (Next 30 days)</h3>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {activeDeadlines.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming deadlines in the next 30 days</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeDeadlines.slice(0, 5).map((deadline, index) => (
                  <div key={`${deadline.id}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      {getRegulatorIcon(deadline.regulator)}
                      <div>
                        <p className="font-medium text-xs">{deadline.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.regulator} - Due: {deadline.deadline.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getUrgencyBadge(deadline.urgencyLevel, deadline.daysRemaining)}
                  </div>
                ))}
                {activeDeadlines.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    And {activeDeadlines.length - 5} more deadlines...
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}
    </div>
  )
}