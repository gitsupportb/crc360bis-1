"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Percent, AlertTriangle, TrendingUp } from "lucide-react"

const metrics = [
  {
    title: "Exposition Totale",
    value: "5,951,504 KDH",
    description: "Risque brut total",
    icon: Users,
    trend: "neutral",
  },
  {
    title: "Plus Grande Exposition",
    value: "262,600 KDH",
    description: "BCP",
    icon: TrendingUp,
    trend: "warning",
  },
  {
    title: "Ratio Maximum",
    value: "17.85%",
    description: "% des fonds propres",
    icon: Percent,
    trend: "up",
  },
  {
    title: "Dépassements",
    value: "2",
    description: "Seuil de 15%",
    icon: AlertTriangle,
    trend: "warning",
  },
]

export function CounterpartyOverview() {
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

