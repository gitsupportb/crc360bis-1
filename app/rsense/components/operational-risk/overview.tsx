"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Activity, FileCheck, AlertTriangle } from "lucide-react"

const metrics = [
  {
    title: "Taux de Réalisation PCA",
    value: "76%",
    description: "Objectif: 100%",
    icon: Activity,
    trend: "up",
  },
  {
    title: "Incidents Majeurs",
    value: "0",
    description: "Derniers 30 jours",
    icon: AlertTriangle,
    trend: "neutral",
  },
  {
    title: "Tests PCA Réalisés",
    value: "3/4",
    description: "Exercices planifiés",
    icon: FileCheck,
    trend: "up",
  },
  {
    title: "Contrôles en Retard",
    value: "2",
    description: "Sur 45 contrôles",
    icon: ShieldAlert,
    trend: "warning",
  },
]

export function OperationalRiskOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon
              className={`h-4 w-4 ${
                metric.trend === "up"
                  ? "text-green-500"
                  : metric.trend === "down"
                    ? "text-red-500"
                    : metric.trend === "warning"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

