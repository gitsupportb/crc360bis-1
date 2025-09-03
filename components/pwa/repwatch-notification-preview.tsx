'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  TrendingUp,
  BarChart3,
  Bell,
  RefreshCw
} from 'lucide-react'

interface RepWatchEvent {
  id: string
  code: string
  name: string
  regulator: 'BAM' | 'AMMC' | 'DGI'
  category: string
  categoryKey: string
  deadline: Date
  frequency: string
  daysRemaining: number
  urgencyClass: 'urgent' | 'warning' | 'normal'
  completed: boolean
  rule?: string
  support?: string
}

export function RepWatchNotificationPreview() {
  const [events, setEvents] = useState<RepWatchEvent[]>([])
  const [selectedDays, setSelectedDays] = useState(30)
  const [selectedRegulator, setSelectedRegulator] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUpcomingEvents()
  }, [selectedDays, selectedRegulator, selectedCategory])

  const loadUpcomingEvents = async () => {
    setIsLoading(true)
    try {
      if (typeof window === 'undefined') return

      const { default: repwatchDataSync } = await import('@/lib/repwatch-data-sync')
      const deadlines = repwatchDataSync.getUpcomingDeadlines(selectedDays)
      
      // Convert to RepWatchEvent format and apply filters
      const convertedEvents = deadlines
        .filter(d => selectedRegulator === 'all' || d.regulator === selectedRegulator)
        .filter(d => selectedCategory === 'all' || d.categoryKey === selectedCategory)
        .map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          regulator: d.regulator,
          category: d.category,
          categoryKey: d.categoryKey,
          deadline: new Date(d.deadline),
          frequency: d.frequency,
          daysRemaining: Math.ceil((new Date(d.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          urgencyClass: d.daysRemaining <= 3 ? 'urgent' as const : (d.daysRemaining <= 7 ? 'warning' as const : 'normal' as const),
          completed: d.completed,
          rule: d.rule
        }))
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())

      setEvents(convertedEvents)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load RepWatch events:', error)
    }
    setIsLoading(false)
  }

  const getRegulatorIcon = (regulator: string) => {
    switch (regulator) {
      case 'BAM': return <Building2 className="w-4 h-4" />
      case 'AMMC': return <TrendingUp className="w-4 h-4" />
      case 'DGI': return <BarChart3 className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getUrgencyBadge = (urgencyClass: string, daysRemaining: number) => {
    const daysText = daysRemaining === 0 ? 'Today' : (daysRemaining === 1 ? 'Tomorrow' : `${daysRemaining} days`)
    
    if (urgencyClass === 'urgent') {
      return <Badge variant="destructive" className="bg-red-500">{daysText}</Badge>
    }
    if (urgencyClass === 'warning') {
      return <Badge variant="secondary" className="bg-amber-500 text-white">{daysText}</Badge>
    }
    return <Badge variant="outline" className="bg-orange-500 text-white">{daysText}</Badge>
  }

  const getUrgencyCardClass = (urgencyClass: string) => {
    if (urgencyClass === 'urgent') {
      return 'border-l-4 border-red-500 bg-red-50'
    }
    if (urgencyClass === 'warning') {
      return 'border-l-4 border-amber-500 bg-amber-50'
    }
    return 'border-l-4 border-orange-500 bg-orange-50'
  }

  const activeEvents = events.filter(e => !e.completed)
  const completedEvents = events.filter(e => e.completed)

  const groupEventsByRegulator = (eventList: RepWatchEvent[]) => {
    const grouped: { [key: string]: RepWatchEvent[] } = {}
    eventList.forEach(event => {
      if (!grouped[event.regulator]) {
        grouped[event.regulator] = []
      }
      grouped[event.regulator].push(event)
    })
    return grouped
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            🔔 Upcoming Events & Deadlines
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              RepWatch Integration
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters - Exact same as RepWatch dashboard */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Time Period:</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                >
                  <option value={7}>Next 7 days</option>
                  <option value={14}>Next 14 days</option>
                  <option value={30}>Next 30 days</option>
                  <option value={60}>Next 60 days</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Regulator:</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedRegulator}
                  onChange={(e) => setSelectedRegulator(e.target.value)}
                >
                  <option value="all">All Regulators</option>
                  <option value="BAM">🏦 BAM</option>
                  <option value="AMMC">📈 AMMC</option>
                  <option value="DGI">📊 DGI</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category:</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="I">🏦 BAM - I – Situation comptable</option>
                  <option value="II">🏦 BAM - II – Etats de synthèse</option>
                  <option value="III">🏦 BAM - III – Réglementation prudentielle</option>
                  <option value="AMMC_BCP">📈 AMMC - BCP</option>
                  <option value="AMMC_BCP2S">📈 AMMC - BCP2S</option>
                  <option value="AMMC_BANK_AL_YOUSR">📈 AMMC - BANK AL YOUSR</option>
                  <option value="DGI">📊 DGI - All Categories</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadUpcomingEvents}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Separator />

          {/* Event List - Exact same format as RepWatch */}
          {activeEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-muted-foreground">
                No upcoming deadlines{selectedRegulator !== 'all' ? ` for ${selectedRegulator}` : ''}
                {selectedCategory !== 'all' ? ` in category ${selectedCategory}` : ''} in the next {selectedDays} days!
              </p>
              <p className="text-sm text-muted-foreground mt-2">You're all caught up.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedRegulator === 'all' && selectedCategory === 'all' 
                ? Object.entries(groupEventsByRegulator(activeEvents)).map(([regulator, regulatorEvents]) => (
                    <div key={regulator} className="space-y-3">
                      <h3 className="font-medium text-orange-600 border-b border-orange-200 pb-2">
                        {regulator} Reportings
                      </h3>
                      {regulatorEvents.map((event) => (
                        <div key={event.id} className={`p-4 rounded-lg ${getUrgencyCardClass(event.urgencyClass)} hover:shadow-md transition-all`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {getRegulatorIcon(event.regulator)}
                              <span className="font-medium text-sm">{event.name}</span>
                            </div>
                            {getUrgencyBadge(event.urgencyClass, event.daysRemaining)}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div><strong>Regulator:</strong> {event.regulator}</div>
                            <div><strong>Category:</strong> {event.category}</div>
                            <div><strong>Code:</strong> {event.code}</div>
                            <div><strong>Deadline:</strong> {event.deadline.toLocaleDateString()}</div>
                            <div><strong>Frequency:</strong> {event.frequency}</div>
                            {event.rule && <div><strong>Rule:</strong> {event.rule}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                : activeEvents.map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg ${getUrgencyCardClass(event.urgencyClass)} hover:shadow-md transition-all`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getRegulatorIcon(event.regulator)}
                          <span className="font-medium text-sm">{event.name}</span>
                        </div>
                        {getUrgencyBadge(event.urgencyClass, event.daysRemaining)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div><strong>Regulator:</strong> {event.regulator}</div>
                        <div><strong>Category:</strong> {event.category}</div>
                        <div><strong>Code:</strong> {event.code}</div>
                        <div><strong>Deadline:</strong> {event.deadline.toLocaleDateString()}</div>
                        <div><strong>Frequency:</strong> {event.frequency}</div>
                        {event.rule && <div><strong>Rule:</strong> {event.rule}</div>}
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {/* Summary Stats */}
          <Separator />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-bold text-red-500">
                  {activeEvents.filter(e => e.urgencyClass === 'urgent').length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Urgent (≤3 days)</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-amber-500">
                  {activeEvents.filter(e => e.urgencyClass === 'warning').length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Warning (≤7 days)</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-bold text-green-500">{completedEvents.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}