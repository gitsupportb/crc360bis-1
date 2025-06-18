"use client"

import { useNotifications } from "@/app/rsense/contexts/notifications-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Bell, Calendar, Info, AlertTriangle } from "lucide-react"

const typeIcons = {
  deadline: Calendar,
  warning: AlertTriangle,
  info: Info,
}

export default function NotificationsPage() {
  const { notifications, markAllAsRead } = useNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Bell
          return (
            <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Icon className={`h-5 w-5 ${
                  notification.type === 'warning' ? 'text-yellow-500' :
                  notification.type === 'deadline' ? 'text-primary' :
                  'text-blue-500'
                }`} />
                <div className="grid gap-1">
                  <CardTitle>{notification.title}</CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(notification.date), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
                {notification.dueDate && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Date limite : {new Date(notification.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
