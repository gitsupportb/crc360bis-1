'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  Download, 
  Bell, 
  Wifi, 
  WifiOff, 
  Shield, 
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  BarChart3,
  TestTube,
  RefreshCw,
  Settings,
  Activity,
  Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Interfaces
interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  canNotify: boolean
}

interface NotificationSettings {
  documents: boolean
  amlAlerts: boolean
  reports: boolean
  system: boolean
  all: boolean
}

interface DeadlineSettings {
  enabled: boolean
  schedules: { [key: number]: boolean }
  regulators: { [key: string]: boolean }
  categories: { [key: string]: boolean }
  dailyFromDay7: boolean
}

interface DeadlineEvent {
  id: string
  code: string
  name: string
  deadline: Date
  regulator: 'BAM' | 'AMMC' | 'DGI'
  category: string
  categoryKey: string
  completed: boolean
  daysRemaining: number
  urgencyLevel: 'urgent' | 'warning' | 'normal' | 'info'
}

export function PWASettingsClientPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // PWA states
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: true,
    isInstallable: false,
    isInstalled: false,
    canNotify: false
  })
  
  // Notification states
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    documents: true,
    amlAlerts: true,
    reports: true,
    system: true,
    all: true
  })
  
  // RepWatch states with safe defaults
  const [deadlineSettings, setDeadlineSettings] = useState<DeadlineSettings>({
    enabled: true,
    schedules: { 30: true, 14: true, 7: true, 3: true, 2: true, 1: true, 0: true },
    regulators: { 'BAM': true, 'AMMC': true, 'DGI': true },
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
  })
  
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineEvent[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  
  const { toast } = useToast()

  // Safe client-side initialization
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
      
      // Load settings
      loadNotificationSettings()
      await loadRepWatchSettings()
      await loadUpcomingDeadlines()
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
    }
  }, [])

  const loadNotificationSettings = () => {
    
    try {
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotificationSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error)
    }
  }

  const loadRepWatchSettings = async () => {
    
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      const settings = deadlineNotificationService.getSettings()
      setDeadlineSettings(prev => ({ ...prev, ...settings }))
    } catch (error) {
      console.warn('Failed to load RepWatch settings:', error)
    }
  }

  const loadUpcomingDeadlines = async () => {
    
    try {
      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      repwatchDataSync.syncRepWatchData()
      const deadlines = repwatchDataSync.getUpcomingDeadlines(30)
      setUpcomingDeadlines(deadlines)
      setLastUpdated(new Date())
    } catch (error) {
      console.warn('Failed to load upcoming deadlines:', error)
      setUpcomingDeadlines([])
      setLastUpdated(new Date())
    }
  }

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

  const handleRepWatchSettingUpdate = async (key: keyof DeadlineSettings, value: any) => {
    
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      deadlineNotificationService.updateSettings({ [key]: value })
      
      const newSettings = { ...deadlineSettings, [key]: value }
      setDeadlineSettings(newSettings)
      
      if (key === 'enabled' && value === true) {
        const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
        
        repwatchDataSync.schedulePeriodicSync()
        deadlineNotificationService.schedulePeriodicChecks()
        
        await repwatchDataSync.checkAndNotifyUpcomingDeadlines()
        loadUpcomingDeadlines()
        
        toast({
          title: "Notifications RepWatch activées",
          description: "Les notifications de délais sont maintenant programmées."
        })
      }
    } catch (error) {
      console.error('Failed to update RepWatch settings:', error)
    }
  }

  const handleTestNotification = async () => {
    
    try {
      const { default: deadlineNotificationService } = await import('@/lib/deadline-notification-service')
      await deadlineNotificationService.testNotification()
      toast({
        title: "Notification test envoyée!",
        description: "Vérifiez vos notifications."
      })
    } catch (error) {
      console.error('Failed to send test notification:', error)
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
    if (daysRemaining <= 0) return <Badge variant="destructive">Aujourd'hui</Badge>
    if (daysRemaining === 1) return <Badge variant="destructive">Demain</Badge>
    if (urgency === 'urgent') return <Badge variant="destructive">{daysRemaining}j</Badge>
    if (urgency === 'warning') return <Badge variant="secondary">{daysRemaining}j</Badge>
    return <Badge variant="outline">{daysRemaining}j</Badge>
  }

  // Calculate stats
  const activeDeadlines = upcomingDeadlines.filter(d => !d.completed)
  const completedDeadlines = upcomingDeadlines.filter(d => d.completed)
  const urgentDeadlines = activeDeadlines.filter(d => d.daysRemaining <= 7)

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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="repwatch" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">RepWatch</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PWA Status Card */}
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

              {/* RepWatch Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Statistiques RepWatch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="text-xl font-bold">{activeDeadlines.length}</p>
                        <p className="text-xs text-muted-foreground">Échéances actives</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <div>
                        <p className="text-xl font-bold">{urgentDeadlines.length}</p>
                        <p className="text-xs text-muted-foreground">Urgentes (≤7j)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="text-xl font-bold">{completedDeadlines.length}</p>
                        <p className="text-xs text-muted-foreground">Terminées</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Bell className={`w-6 h-6 ${deadlineSettings.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-xl font-bold">
                          {deadlineSettings.enabled ? 'ON' : 'OFF'}
                        </p>
                        <p className="text-xs text-muted-foreground">Alertes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleNotificationToggle(!pwaState.canNotify)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    {pwaState.canNotify ? 'Désactiver' : 'Activer'} Notifications
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleTestNotification}
                    disabled={!deadlineSettings.enabled}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Test RepWatch
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={loadUpcomingDeadlines}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Notifications</CardTitle>
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

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Types de notifications</h4>
                    
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
                        Testez les différents types de notifications pour vérifier leur fonctionnement.
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* RepWatch Tab */}
          <TabsContent value="repwatch" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* RepWatch Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Configuration RepWatch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Global Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Activer RepWatch</h3>
                        <p className="text-sm text-muted-foreground">
                          Notifications automatiques des échéances
                        </p>
                      </div>
                      <Switch
                        checked={deadlineSettings.enabled}
                        onCheckedChange={(checked) => handleRepWatchSettingUpdate('enabled', checked)}
                      />
                    </div>

                    <Separator />

                    {/* Notification Schedules */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Calendrier des notifications</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { days: 30, bgColor: 'bg-blue-50', textColor: 'text-blue-500', label: '30 jours', icon: Info },
                          { days: 14, bgColor: 'bg-green-50', textColor: 'text-green-500', label: '14 jours', icon: Clock },
                          { days: 7, bgColor: 'bg-orange-50', textColor: 'text-orange-500', label: '7 jours', icon: AlertTriangle },
                          { days: 0, bgColor: 'bg-red-50', textColor: 'text-red-500', label: 'Aujourd\'hui', icon: XCircle }
                        ].map(({ days, bgColor, textColor, label, icon: Icon }) => (
                          <div key={days} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${textColor}`} />
                              <span className="text-sm">{label}</span>
                            </div>
                            <Switch
                              checked={deadlineSettings.schedules[days] || false}
                              onCheckedChange={(checked) => {
                                const newSchedules = { ...deadlineSettings.schedules, [days]: checked }
                                handleRepWatchSettingUpdate('schedules', newSchedules)
                              }}
                              size="sm"
                              disabled={!deadlineSettings.enabled}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                          <div>
                            <span className="text-sm font-medium">Rappels quotidiens</span>
                            <p className="text-xs text-muted-foreground">Dès 7 jours restants</p>
                          </div>
                        </div>
                        <Switch
                          checked={deadlineSettings.dailyFromDay7}
                          onCheckedChange={(checked) => handleRepWatchSettingUpdate('dailyFromDay7', checked)}
                          disabled={!deadlineSettings.enabled}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Regulators */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Régulateurs</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'BAM', name: 'BAM', icon: Building2, textColor: 'text-blue-600' },
                          { key: 'AMMC', name: 'AMMC', icon: TrendingUp, textColor: 'text-green-600' },
                          { key: 'DGI', name: 'DGI', icon: BarChart3, textColor: 'text-purple-600' }
                        ].map(({ key, name, icon: Icon, textColor }) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${textColor}`} />
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                            <Switch
                              checked={deadlineSettings.regulators[key] || false}
                              onCheckedChange={(checked) => {
                                const newRegulators = { ...deadlineSettings.regulators, [key]: checked }
                                handleRepWatchSettingUpdate('regulators', newRegulators)
                              }}
                              size="sm"
                              disabled={!deadlineSettings.enabled}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Categories */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Catégories</h3>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">BAM Categories</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {['I', 'II', 'III'].map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm">Cat. {cat}</span>
                              <Switch
                                checked={deadlineSettings.categories[cat] || false}
                                onCheckedChange={(checked) => {
                                  const newCategories = { ...deadlineSettings.categories, [cat]: checked }
                                  handleRepWatchSettingUpdate('categories', newCategories)
                                }}
                                size="sm"
                                disabled={!deadlineSettings.enabled}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">AMMC Categories</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'AMMC_BCP', name: 'BCP' },
                            { key: 'AMMC_BCP2S', name: 'BCP2S' },
                            { key: 'AMMC_BANK_AL_YOUSR', name: 'Bank Al Yousr' }
                          ].map(({ key, name }) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                              <span className="text-sm">{name}</span>
                              <Switch
                                checked={deadlineSettings.categories[key] || false}
                                onCheckedChange={(checked) => {
                                  const newCategories = { ...deadlineSettings.categories, [key]: checked }
                                  handleRepWatchSettingUpdate('categories', newCategories)
                                }}
                                size="sm"
                                disabled={!deadlineSettings.enabled}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Échéances
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadUpcomingDeadlines}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Mise à jour: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                  
                  {activeDeadlines.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune échéance</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activeDeadlines.slice(0, 10).map((deadline, index) => (
                        <div key={`${deadline.id}-${index}`} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              {getRegulatorIcon(deadline.regulator)}
                              <div className="min-w-0">
                                <p className="font-medium text-xs truncate">{deadline.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {deadline.regulator} - {deadline.deadline.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {getUrgencyBadge(deadline.urgencyLevel, deadline.daysRemaining)}
                          </div>
                        </div>
                      ))}
                      {activeDeadlines.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{activeDeadlines.length - 10} autres...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Avancés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Test RepWatch</h3>
                    <p className="text-sm text-muted-foreground">
                      Envoyer une notification de test
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTestNotification}
                    disabled={!deadlineSettings.enabled}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Test
                  </Button>
                </div>

                <Separator />

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
                        toast({
                          title: "Historique effacé",
                          description: "L'historique des notifications a été réinitialisé."
                        })
                      } catch (error) {
                        console.error('Failed to clear history:', error)
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Actualiser données</h3>
                    <p className="text-sm text-muted-foreground">
                      Synchroniser les données RepWatch
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadUpcomingDeadlines}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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