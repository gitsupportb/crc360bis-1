'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Activity, Bell, Calendar, Settings, Smartphone, Download, Wifi, WifiOff, Zap, Building2, TrendingUp, BarChart3, AlertTriangle, CheckCircle, XCircle, RefreshCw, TestTube } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SimplePWASettings() {
  const [pwaState, setPwaState] = useState({
    isOnline: true,
    isInstallable: false,
    isInstalled: false,
    canNotify: false
  })
  const [notificationSettings, setNotificationSettings] = useState({
    documents: true,
    amlAlerts: true,
    reports: true,
    system: true,
    all: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [repwatchSettings, setRepwatchSettings] = useState({
    enabled: true,
    schedules: { 30: true, 14: true, 7: true, 3: true, 2: true, 1: true, 0: true },
    regulators: { 'BAM': true, 'AMMC': true, 'DGI': true },
    categories: { 
      'I': true, 'II': true, 'III': true, 
      'AMMC_BCP': true, 'AMMC_BCP2S': true, 'AMMC_BANK_AL_YOUSR': true, 
      'DGI': true 
    },
    dailyFromDay7: true
  })
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [notificationCounts, setNotificationCounts] = useState({ total: 0, urgent: 0 })
  
  const { toast } = useToast()

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize PWA state
      const isOnline = navigator.onLine
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true
      const canNotify = 'Notification' in window && Notification.permission === 'granted'
      
      setPwaState({
        isOnline,
        isInstallable: false,
        isInstalled,
        canNotify
      })

      // Load notification settings
      try {
        const saved = localStorage.getItem('notification-settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          setNotificationSettings(prev => ({ ...prev, ...parsed }))
        }
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }

      // Load RepWatch settings from the real service
      try {
        const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
        const settings = deadlineNotificationService.getSettings()
        setRepwatchSettings(settings)
      } catch (error) {
        console.warn('Failed to load RepWatch settings:', error)
      }

      // Load real RepWatch deadline data
      await loadRepWatchDeadlines()

      // Initialize notification service for PWA notifications
      try {
        const { default: notificationService } = await import('@/lib/notification-service')
        await notificationService.initialize()
        console.log('✅ Notification service initialized')
      } catch (error) {
        console.warn('Failed to initialize notification service:', error)
      }

      // Initialize background notification service for real-time counts
      try {
        const { default: notificationBackgroundService } = await import('@/lib/notification-background-service')
        
        // Load saved counts first
        notificationBackgroundService.loadSavedCounts()
        
        // Add listener for real-time updates
        const countUpdateListener = (total: number, urgent: number) => {
          setNotificationCounts({ total, urgent })
          console.log(`🔔 Real-time count update: ${total} total, ${urgent} urgent`)
        }
        
        notificationBackgroundService.addListener(countUpdateListener)
        
        // Initialize background service
        notificationBackgroundService.initialize()
        console.log('✅ Background notification service initialized')
        
        // Store listener cleanup function
        ;(window as any).notificationCountListener = countUpdateListener
      } catch (error) {
        console.warn('Failed to initialize background notification service:', error)
      }
    }

    initializeApp()

    // Event listeners
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }))
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPwaState(prev => ({ ...prev, isInstallable: true }))
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      
      // Cleanup notification background service listener
      const listener = (window as any).notificationCountListener
      if (listener) {
        try {
          import('@/lib/notification-background-service').then(({ default: service }) => {
            service.removeListener(listener)
            console.log('✅ Background notification service listener cleaned up')
          })
        } catch (error) {
          console.warn('Failed to cleanup background service listener:', error)
        }
      }
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return
    
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
        setDeferredPrompt(null)
        toast({
          title: "Application installée!",
          description: "CRC360 est maintenant disponible comme application."
        })
      }
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    setIsLoading(true)
    
    try {
      if (enabled && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          toast({
            title: "Permission refusée",
            description: "Les notifications ont été refusées.",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
      }
      
      const newSettings = {
        documents: enabled,
        amlAlerts: enabled,
        reports: enabled,
        system: enabled,
        all: enabled
      }
      
      setNotificationSettings(newSettings)
      localStorage.setItem('notification-settings', JSON.stringify(newSettings))
      setPwaState(prev => ({ ...prev, canNotify: enabled }))
      
      toast({
        title: enabled ? "Notifications activées" : "Notifications désactivées",
        description: enabled ? "Vous recevrez des notifications." : "Les notifications sont désactivées."
      })
      
      if (enabled) {
        setTimeout(() => {
          new Notification("CRC360 Notifications", {
            body: "Les notifications sont maintenant activées!",
            icon: '/icons/icon-192x192.png'
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRepWatchDeadlines = async () => {
    setIsLoading(true)
    try {
      // Trigger background service sync first for real-time count updates
      try {
        const { default: notificationBackgroundService } = await import('@/lib/notification-background-service')
        await notificationBackgroundService.forceSync()
        console.log('🔔 Background service sync triggered')
      } catch (bgError) {
        console.warn('Background service sync failed:', bgError)
      }
      
      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      // Sync data first to get latest deadlines (this will fallback to ALL_REPORTINGS.json if needed)
      console.log('📅 Starting RepWatch data sync with regulators:', repwatchSettings.regulators)
      const syncedDeadlines = await repwatchDataSync.syncRepWatchData(repwatchSettings.regulators)
      console.log(`📅 Synced ${syncedDeadlines.length} deadlines`)
      
      // Get upcoming deadlines for the next 30 days
      const deadlines = repwatchDataSync.getUpcomingDeadlines(30)
      setUpcomingDeadlines(deadlines)
      console.log(`📅 Loaded ${deadlines.length} upcoming RepWatch deadlines (next 30 days)`)
      
      // Also check for notifications and schedule them
      await repwatchDataSync.checkAndNotifyUpcomingDeadlines()
      
      toast({
        title: "Données actualisées",
        description: `${syncedDeadlines.length} échéances synchronisées, ${deadlines.length} à venir`
      })
    } catch (error) {
      console.warn('Failed to load RepWatch deadlines:', error)
      setUpcomingDeadlines([])
      toast({
        title: "Erreur",
        description: "Impossible de charger les échéances RepWatch",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepwatchToggle = async (setting: string, value: any) => {
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      
      // Update the real service settings
      deadlineNotificationService.updateSettings({ [setting]: value })
      
      // Update local state
      setRepwatchSettings(prev => ({ ...prev, [setting]: value }))
      
      // If RepWatch is being enabled, start the scheduling
      if (setting === 'enabled' && value === true) {
        const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
        
        // Start periodic sync and check for notifications
        repwatchDataSync.schedulePeriodicSync()
        deadlineNotificationService.schedulePeriodicChecks()
        
        // Check for immediate notifications
        await repwatchDataSync.checkAndNotifyUpcomingDeadlines()
        
        // Reload deadlines
        await loadRepWatchDeadlines()
        
        toast({
          title: "RepWatch activé",
          description: "Les notifications de délais sont maintenant programmées."
        })
      } else if (setting === 'regulators') {
        // If regulator settings changed, trigger background service sync immediately
        console.log('📅 Regulator settings changed, triggering background sync...')
        
        try {
          const { default: notificationBackgroundService } = await import('@/lib/notification-background-service')
          await notificationBackgroundService.forceSync()
        } catch (bgError) {
          console.warn('Background sync failed after regulator change:', bgError)
        }
        
        // Also reload data for UI
        await loadRepWatchDeadlines()
        
        const enabledCount = Object.values(value).filter(Boolean).length
        const totalCount = Object.keys(value).length
        toast({
          title: "Régulateurs mis à jour",
          description: `${enabledCount}/${totalCount} régulateurs activés. Compteurs mis à jour en temps réel.`
        })
      } else {
        toast({
          title: "Paramètres RepWatch mis à jour",
          description: `${setting} ${value ? 'activé' : 'désactivé'}`
        })
      }
    } catch (error) {
      console.error('Failed to update RepWatch settings:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres RepWatch",
        variant: "destructive"
      })
    }
  }

  const handleTestRepwatchNotification = async () => {
    setIsLoading(true)
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      
      // First ensure we have synced data with current regulator settings
      console.log('📅 Syncing data for RepWatch test with regulators:', repwatchSettings.regulators)
      await repwatchDataSync.syncRepWatchData(repwatchSettings.regulators)
      
      // Test the full RepWatch notification system with a test notification
      await deadlineNotificationService.testNotification()
      
      // Also test with real deadlines if available
      const upcomingTest = repwatchDataSync.getUpcomingDeadlines(30) // Check 30 days instead of 7 for more data
      console.log(`📅 Found ${upcomingTest.length} upcoming deadlines for test`)
      
      if (upcomingTest.length > 0) {
        // Get a few urgent ones for testing
        const urgentDeadlines = upcomingTest.filter(d => d.daysRemaining <= 7 && !d.completed).slice(0, 3)
        if (urgentDeadlines.length > 0) {
          await deadlineNotificationService.checkAndSendNotifications(urgentDeadlines)
          toast({
            title: "✅ Test RepWatch complet effectué!",
            description: `Notification test envoyée + ${urgentDeadlines.length} échéances urgentes notifiées (${upcomingTest.length} total trouvées)`
          })
        } else {
          toast({
            title: "✅ Test RepWatch effectué!",
            description: `Notification test envoyée. ${upcomingTest.length} échéances trouvées mais aucune urgente.`
          })
        }
      } else {
        toast({
          title: "⚠️ Test RepWatch effectué!",
          description: "Notification test envoyée mais aucune échéance réelle trouvée. Vérifiez la synchronisation des données."
        })
      }
    } catch (error) {
      console.error('Failed to send test notification:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification test",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRegulatorIcon = (regulator: string) => {
    switch (regulator) {
      case 'BAM': return <Building2 className="w-4 h-4 text-blue-600" />
      case 'AMMC': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'DGI': return <BarChart3 className="w-4 h-4 text-purple-600" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getUrgencyBadge = (deadline: any) => {
    const daysRemaining = deadline.daysRemaining
    const urgency = deadline.urgencyLevel
    
    if (daysRemaining <= 0) return <Badge variant="destructive">Aujourd'hui</Badge>
    if (daysRemaining === 1) return <Badge variant="destructive">Demain</Badge>
    if (urgency === 'urgent' || daysRemaining <= 3) return <Badge variant="destructive">{daysRemaining}j</Badge>
    if (urgency === 'warning' || daysRemaining <= 7) return <Badge variant="secondary">{daysRemaining}j</Badge>
    return <Badge variant="outline">{daysRemaining}j</Badge>
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg text-white">
            <Shield className="w-6 h-6" />
            <h1 className="text-2xl font-bold">CRC360 PWA Settings</h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Gérez les paramètres de l'application web progressive (PWA) et configurez les notifications RepWatch
          </p>
        </div>

        {/* PWA Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                État de l'Application PWA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {pwaState.isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Connexion</p>
                    <Badge variant={pwaState.isOnline ? "default" : "destructive"}>
                      {pwaState.isOnline ? 'En ligne' : 'Hors ligne'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Download className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Installation</p>
                    <Badge variant={pwaState.isInstalled ? "default" : "secondary"}>
                      {pwaState.isInstalled ? 'Installée' : 'Navigateur'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Notifications</p>
                    <Badge variant={pwaState.canNotify ? "default" : "secondary"}>
                      {pwaState.canNotify ? 'Activées' : 'Désactivées'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Installation</p>
                    {pwaState.isInstallable ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleInstallApp}
                        disabled={isLoading}
                      >
                        Installer
                      </Button>
                    ) : (
                      <Badge variant="outline">Non disponible</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => handleNotificationToggle(!pwaState.canNotify)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  {pwaState.canNotify ? 'Désactiver' : 'Activer'} Notifications
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    new Notification("Test CRC360", {
                      body: "Notification de test envoyée!",
                      icon: '/icons/icon-192x192.png'
                    })
                  }}
                  disabled={!pwaState.canNotify}
                  className="w-full flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Paramètres de Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Notifications système</h3>
                <p className="text-sm text-muted-foreground">
                  Activer toutes les notifications push
                </p>
              </div>
              <Switch
                checked={notificationSettings.all}
                onCheckedChange={(checked) => handleNotificationToggle(checked)}
                disabled={isLoading}
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Types de notifications</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Documents</p>
                      <p className="text-xs text-muted-foreground">DocSecure uploads</p>
                    </div>
                    <Switch
                      checked={notificationSettings.documents}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...notificationSettings, documents: checked }
                        setNotificationSettings(newSettings)
                        localStorage.setItem('notification-settings', JSON.stringify(newSettings))
                      }}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Alertes AML</p>
                      <p className="text-xs text-muted-foreground">AML Center alerts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.amlAlerts}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...notificationSettings, amlAlerts: checked }
                        setNotificationSettings(newSettings)
                        localStorage.setItem('notification-settings', JSON.stringify(newSettings))
                      }}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Rapports</p>
                      <p className="text-xs text-muted-foreground">Reporting deadlines</p>
                    </div>
                    <Switch
                      checked={notificationSettings.reports}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...notificationSettings, reports: checked }
                        setNotificationSettings(newSettings)
                        localStorage.setItem('notification-settings', JSON.stringify(newSettings))
                      }}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Système</p>
                      <p className="text-xs text-muted-foreground">System updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.system}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...notificationSettings, system: checked }
                        setNotificationSettings(newSettings)
                        localStorage.setItem('notification-settings', JSON.stringify(newSettings))
                      }}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Test des notifications</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Testez les différents types de notifications
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          new Notification("Test Document", {
                            body: "Nouveau document disponible",
                            icon: '/icons/icon-192x192.png'
                          })
                        }}
                        disabled={!pwaState.canNotify}
                      >
                        Test Document
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          new Notification("Test AML Alert", {
                            body: "Nouvelle alerte AML détectée",
                            icon: '/icons/icon-192x192.png'
                          })
                        }}
                        disabled={!pwaState.canNotify}
                      >
                        Test AML Alert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          new Notification("Test Rapport", {
                            body: "Échéance de rapport dans 7 jours",
                            icon: '/icons/icon-192x192.png'
                          })
                        }}
                        disabled={!pwaState.canNotify}
                      >
                        Test Rapport
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RepWatch Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Configuration RepWatch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Activer RepWatch</h3>
                <p className="text-sm text-muted-foreground">
                  Notifications automatiques des échéances
                </p>
              </div>
              <Switch
                checked={repwatchSettings.enabled}
                onCheckedChange={(checked) => handleRepwatchToggle('enabled', checked)}
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Calendrier des notifications</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { days: 30, label: '30 jours', color: 'bg-blue-50 text-blue-600' },
                  { days: 14, label: '14 jours', color: 'bg-green-50 text-green-600' },
                  { days: 7, label: '7 jours', color: 'bg-orange-50 text-orange-600' },
                  { days: 0, label: 'Aujourd\'hui', color: 'bg-red-50 text-red-600' }
                ].map(({ days, label, color }) => (
                  <div key={days} className={`flex items-center justify-between p-3 ${color} rounded-lg`}>
                    <span className="text-sm font-medium">{label}</span>
                    <Switch
                      checked={repwatchSettings.schedules[days]}
                      onCheckedChange={(checked) => {
                        const newSchedules = { ...repwatchSettings.schedules, [days]: checked }
                        handleRepwatchToggle('schedules', newSchedules)
                      }}
                      size="sm"
                      disabled={!repwatchSettings.enabled}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="text-sm font-medium">Rappels quotidiens</span>
                    <p className="text-xs text-muted-foreground">Dès 7 jours restants</p>
                  </div>
                </div>
                <Switch
                  checked={repwatchSettings.dailyFromDay7}
                  onCheckedChange={(checked) => handleRepwatchToggle('dailyFromDay7', checked)}
                  disabled={!repwatchSettings.enabled}
                />
              </div>

              <h4 className="font-medium mb-4">Régulateurs</h4>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { key: 'BAM', name: 'BAM', icon: Building2, color: 'text-blue-600' },
                  { key: 'AMMC', name: 'AMMC', icon: TrendingUp, color: 'text-green-600' },
                  { key: 'DGI', name: 'DGI', icon: BarChart3, color: 'text-purple-600' }
                ].map(({ key, name, icon: Icon, color }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <Switch
                      checked={repwatchSettings.regulators[key]}
                      onCheckedChange={(checked) => {
                        const newRegulators = { ...repwatchSettings.regulators, [key]: checked }
                        handleRepwatchToggle('regulators', newRegulators)
                      }}
                      size="sm"
                      disabled={!repwatchSettings.enabled}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleTestRepwatchNotification}
                  disabled={!repwatchSettings.enabled || !pwaState.canNotify}
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test RepWatch
                </Button>
                
                <Button
                  variant="outline"
                  onClick={loadRepWatchDeadlines}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </Button>
                
                <Button
                  variant="outline"
                  onClick={async () => {
                    // Force clear localStorage to test fallback
                    localStorage.removeItem('eventsCat1')
                    localStorage.removeItem('eventsCat2')
                    localStorage.removeItem('eventsCat3')
                    localStorage.removeItem('ammcBcpData')
                    localStorage.removeItem('ammcBcp2sData')
                    localStorage.removeItem('ammcBankAlYousrData')
                    localStorage.removeItem('dgiData')
                    console.log('🧹 Cleared localStorage for fallback test')
                    await loadRepWatchDeadlines()
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Fallback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Échéances à venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">
                    {notificationCounts.total > 0 ? notificationCounts.total : upcomingDeadlines.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Échéances actives {notificationCounts.total > 0 && '(temps réel)'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-xl font-bold">
                    {notificationCounts.urgent > 0 ? notificationCounts.urgent : upcomingDeadlines.filter(d => d.urgencyLevel === 'urgent' || d.daysRemaining <= 7).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Urgentes (≤7j) {notificationCounts.urgent > 0 && '(temps réel)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Bell className={`w-6 h-6 ${repwatchSettings.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-xl font-bold">
                    {repwatchSettings.enabled ? 'ON' : 'OFF'}
                  </p>
                  <p className="text-xs text-muted-foreground">Alertes</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune échéance ou données RepWatch non synchronisées</p>
                  <p className="text-xs">Cliquez sur "Actualiser" pour synchroniser les données RepWatch</p>
                </div>
              ) : (
                upcomingDeadlines.slice(0, 10).map((deadline, index) => (
                  <div key={deadline.id || `deadline-${index}`} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRegulatorIcon(deadline.regulator)}
                        <div>
                          <p className="font-medium text-sm">{deadline.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {deadline.regulator} - {deadline.category} - {new Date(deadline.deadline).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Code: {deadline.code} | Fréquence: {deadline.frequency}
                          </p>
                        </div>
                      </div>
                      {getUrgencyBadge(deadline)}
                    </div>
                  </div>
                ))
              )}
              {upcomingDeadlines.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{upcomingDeadlines.length - 10} autres échéances...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres Avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Réinitialiser historique</h3>
                <p className="text-sm text-muted-foreground">
                  Effacer l'historique des notifications
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
                    deadlineNotificationService.clearNotificationHistory()
                    localStorage.removeItem('notification-settings')
                    toast({
                      title: "Historique effacé",
                      description: "L'historique des notifications RepWatch a été réinitialisé."
                    })
                  } catch (error) {
                    console.error('Failed to clear notification history:', error)
                    toast({
                      title: "Erreur",
                      description: "Impossible d'effacer l'historique",
                      variant: "destructive"
                    })
                  }
                }}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Export des paramètres</h3>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder la configuration actuelle
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
                    const realRepwatchSettings = deadlineNotificationService.getSettings()
                    
                    const settings = {
                      pwaState,
                      notificationSettings,
                      repwatchSettings: realRepwatchSettings,
                      upcomingDeadlines: upcomingDeadlines.slice(0, 5), // Include first 5 deadlines as sample
                      version: "1.0",
                      timestamp: new Date().toISOString()
                    }
                    
                    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `crc360-pwa-settings-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    
                    toast({
                      title: "Paramètres exportés",
                      description: "Configuration PWA et RepWatch sauvegardée."
                    })
                  } catch (error) {
                    console.error('Failed to export settings:', error)
                    toast({
                      title: "Erreur d'export",
                      description: "Impossible d'exporter les paramètres",
                      variant: "destructive"
                    })
                  }
                }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="px-8"
          >
            Retour à l'application
          </Button>
        </div>
      </div>
    </div>
  )
}