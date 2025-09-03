'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  Clock,
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw,
  TestTube,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import deadlineNotificationService, { type DeadlineEvent } from '@/lib/deadline-notification-service'
import repwatchDataSync from '@/lib/repwatch-data-sync'
import { RepWatchNotificationPreview } from './repwatch-notification-preview'

export function DeadlineNotificationCenter() {
  const [settings, setSettings] = useState(deadlineNotificationService.getSettings())
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadUpcomingDeadlines()
    const interval = setInterval(loadUpcomingDeadlines, 5 * 60 * 1000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const loadUpcomingDeadlines = () => {
    try {
      // Sync RepWatch data first
      const syncedDeadlines = repwatchDataSync.syncRepWatchData()
      
      // Get upcoming deadlines from the synced data
      const deadlines = repwatchDataSync.getUpcomingDeadlines(30)
      setUpcomingDeadlines(deadlines)
      setLastUpdated(new Date())
      
      console.log(`📅 Loaded ${deadlines.length} upcoming deadlines`)
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    deadlineNotificationService.updateSettings({ [key]: value })
  }

  const updateScheduleSetting = (days: number, enabled: boolean) => {
    const newSchedules = { ...settings.schedules, [days]: enabled }
    const newSettings = { ...settings, schedules: newSchedules }
    setSettings(newSettings)
    deadlineNotificationService.updateSettings({ schedules: newSchedules })
  }

  const updateRegulatorSetting = (regulator: string, enabled: boolean) => {
    const newRegulators = { ...settings.regulators, [regulator]: enabled }
    const newSettings = { ...settings, regulators: newRegulators }
    setSettings(newSettings)
    deadlineNotificationService.updateSettings({ regulators: newRegulators })
  }

  const updateCategorySetting = (category: string, enabled: boolean) => {
    const newCategories = { ...settings.categories, [category]: enabled }
    const newSettings = { ...settings, categories: newCategories }
    setSettings(newSettings)
    deadlineNotificationService.updateSettings({ categories: newCategories })
  }

  const handleTestNotification = async () => {
    setIsLoading(true)
    try {
      await deadlineNotificationService.testNotification()
      alert('Test notification sent! Check your notifications.')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      alert('Failed to send test notification. Please check your notification permissions.')
    }
    setIsLoading(false)
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all notification history? This will allow previously sent notifications to be sent again.')) {
      deadlineNotificationService.clearNotificationHistory()
      alert('Notification history cleared successfully.')
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all deadline notification settings to default?')) {
      deadlineNotificationService.resetSettings()
      setSettings(deadlineNotificationService.getSettings())
      alert('Settings reset to default values.')
    }
  }

  const handleRefreshDeadlines = async () => {
    setIsLoading(true)
    try {
      // Sync RepWatch data and check notifications
      await repwatchDataSync.checkAndNotifyUpcomingDeadlines()
      loadUpcomingDeadlines()
    } catch (error) {
      console.error('Failed to check notifications:', error)
    }
    setIsLoading(false)
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

  const activeDeadlines = upcomingDeadlines.filter(d => !d.completed)
  const completedDeadlines = upcomingDeadlines.filter(d => d.completed)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{activeDeadlines.length}</p>
                <p className="text-sm text-muted-foreground">Active Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {activeDeadlines.filter(d => d.daysRemaining <= 7).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgent (≤7 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedDeadlines.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Bell className="w-8 h-8 text-green-500" />
              ) : (
                <BellOff className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <p className="text-2xl font-bold">
                  {settings.enabled ? 'ON' : 'OFF'}
                </p>
                <p className="text-sm text-muted-foreground">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Deadline Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Deadline Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications for upcoming RepWatch deadlines
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          <Separator />

          {/* Notification Schedule */}
          <div>
            <h3 className="font-medium mb-4">Notification Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.schedules).map(([days, enabled]) => {
                const dayNum = parseInt(days)
                const label = dayNum === 0 ? 'Day of deadline' : 
                             dayNum === 1 ? '1 day before' : 
                             `${days} days before`
                return (
                  <div key={days} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{label}</span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateScheduleSetting(dayNum, checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Reminders (7 days and under)</h3>
              <p className="text-sm text-muted-foreground">
                Send daily reminders for deadlines within 7 days
              </p>
            </div>
            <Switch
              checked={settings.dailyFromDay7}
              onCheckedChange={(checked) => updateSetting('dailyFromDay7', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          {/* Regulator Filter */}
          <div>
            <h3 className="font-medium mb-4">Regulators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(settings.regulators).map(([regulator, enabled]) => (
                <div key={regulator} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getRegulatorIcon(regulator)}
                    <span className="text-sm font-medium">{regulator}</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateRegulatorSetting(regulator, checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Category Filter */}
          <div>
            <h3 className="font-medium mb-4">Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.categories).map(([category, enabled]) => {
                const categoryLabel = category === 'I' ? 'BAM Category I' :
                                    category === 'II' ? 'BAM Category II' :
                                    category === 'III' ? 'BAM Category III' :
                                    category.replace('_', ' ')
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{categoryLabel}</span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateCategorySetting(category, checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Deadlines (Next 30 days)
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshDeadlines}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeDeadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming deadlines in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeDeadlines.slice(0, 10).map((deadline, index) => (
                <div key={`${deadline.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRegulatorIcon(deadline.regulator)}
                    <div>
                      <p className="font-medium text-sm">{deadline.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.regulator} - {deadline.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {deadline.deadline.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getUrgencyBadge(deadline.urgencyLevel, deadline.daysRemaining)}
                </div>
              ))}
              {activeDeadlines.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  And {activeDeadlines.length - 10} more deadlines...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RepWatch Events Preview */}
      <RepWatchNotificationPreview />

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={isLoading || !settings.enabled}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClearHistory}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Notification History
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetSettings}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}