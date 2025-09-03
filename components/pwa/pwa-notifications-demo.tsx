'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, FileText, AlertTriangle, BarChart3, Settings } from 'lucide-react'
import { usePWA } from './pwa-provider'
import notificationService from '@/lib/notification-service'

export function PWANotificationsDemo() {
  const { canNotify, showNotification } = usePWA()
  const [isLoading, setIsLoading] = useState(false)

  const demoNotifications = [
    {
      id: 'document',
      title: 'Nouveau document ajouté',
      body: 'Un nouveau document "Procédure de conformité" a été ajouté au système DocSecure',
      icon: FileText,
      color: 'blue',
      action: () => notificationService.showDocumentNotification(
        'Nouveau document',
        'Procédure de conformité mise à jour',
        '/docsecure/documents'
      )
    },
    {
      id: 'aml',
      title: 'Alerte AML critique',
      body: 'Transaction suspecte détectée - Investigation requise immédiatement',
      icon: AlertTriangle,
      color: 'red',
      action: () => notificationService.showAMLNotification(
        'Transaction suspecte',
        'Montant élevé détecté sur le compte 12345 - Investigation requise',
        '/amlcenter'
      )
    },
    {
      id: 'report',
      title: 'Rapport généré',
      body: 'Votre rapport mensuel de conformité est maintenant disponible',
      icon: BarChart3,
      color: 'green',
      action: () => notificationService.showReportNotification(
        'Rapport disponible',
        'Rapport mensuel de conformité - Décembre 2024',
        '/repwatch'
      )
    },
    {
      id: 'system',
      title: 'Mise à jour système',
      body: 'Le système CRC360 a été mis à jour avec de nouvelles fonctionnalités',
      icon: Settings,
      color: 'purple',
      action: () => notificationService.showSystemNotification(
        'Mise à jour',
        'Version 1.2.0 installée avec succès - Nouvelles fonctionnalités disponibles',
        '/'
      )
    }
  ]

  const handleSendNotification = async (notification: typeof demoNotifications[0]) => {
    if (!canNotify) {
      alert('Les notifications ne sont pas activées. Veuillez les activer dans les paramètres.')
      return
    }

    setIsLoading(true)
    try {
      await notification.action()
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('Erreur lors de l\'envoi de la notification')
    } finally {
      setIsLoading(false)
    }
  }

  const sendAllNotifications = async () => {
    if (!canNotify) {
      alert('Les notifications ne sont pas activées.')
      return
    }

    setIsLoading(true)
    try {
      for (let i = 0; i < demoNotifications.length; i++) {
        setTimeout(() => {
          demoNotifications[i].action()
        }, i * 1000) // Stagger notifications by 1 second
      }
    } catch (error) {
      console.error('Failed to send notifications:', error)
    } finally {
      setTimeout(() => setIsLoading(false), demoNotifications.length * 1000)
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'red':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'green':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'purple':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Démo des Notifications PWA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Testez les différents types de notifications push dans l'application CRC360
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canNotify && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              Notifications désactivées
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Activez les notifications dans les paramètres pour tester cette fonctionnalité.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {demoNotifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div key={notification.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-lg ${getColorClasses(notification.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600">{notification.body}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendNotification(notification)}
                  disabled={!canNotify || isLoading}
                >
                  Envoyer
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={sendAllNotifications}
            disabled={!canNotify || isLoading}
            className="flex-1"
          >
            Envoyer toutes les notifications
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/settings#notifications', '_blank')}
          >
            Paramètres
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> Ces notifications sont des exemples pour démontrer les capacités PWA. 
          Dans un environnement de production, elles seraient déclenchées automatiquement par le système 
          lors d'événements réels (nouveaux documents, alertes de conformité, etc.).
        </div>
      </CardContent>
    </Card>
  )
}