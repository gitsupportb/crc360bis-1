"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export type Notification = {
  id: string
  title: string
  message: string
  type: "deadline" | "warning" | "info"
  date: string
  read: boolean
  dueDate?: string
  reportType?: string
}

type NotificationsContextType = {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "read">) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Échéance LCR",
      message: "Le reporting LCR doit être soumis dans 3 jours",
      type: "deadline",
      date: "2024-02-05T09:00:00",
      read: false,
      dueDate: "2024-02-08",
      reportType: "LCR",
    },
    {
      id: "2",
      title: "Stress Test de Liquidité",
      message: "Nouveau stress test à compléter pour fin février",
      type: "info",
      date: "2024-02-05T10:30:00",
      read: false,
      dueDate: "2024-02-29",
      reportType: "Stress Test",
    },
    {
      id: "3",
      title: "Alerte Risque de Marché",
      message: "Dépassement du seuil VaR détecté",
      type: "warning",
      date: "2024-02-05T11:15:00",
      read: false,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const addNotification = (notification: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
      },
      ...prev,
    ])
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

