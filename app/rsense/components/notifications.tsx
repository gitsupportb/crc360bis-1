"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

const notifications = [
  {
    id: 1,
    title: "Reporting LCR à soumettre",
    description: "Échéance dans 3 jours",
    type: "warning",
  },
  {
    id: 2,
    title: "Nouveau stress test disponible",
    description: "Stress test de liquidité T1 2024",
    type: "info",
  },
]

export function Notifications() {
  const { toast } = useToast()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex flex-col items-start p-4"
            onClick={() => {
              toast({
                title: notification.title,
                description: notification.description,
              })
            }}
          >
            <div className="font-medium">{notification.title}</div>
            <div className="text-sm text-muted-foreground">{notification.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

