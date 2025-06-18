"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingDown, TrendingUp, Wallet } from "lucide-react"

const metrics = [
  {
    title: "Position Totale",
    value: "4,460,184 KMAD",
    description: "Compte propre",
    icon: Wallet,
    trend: "up",
  },
  {
    title: "Résultat de Gestion",
    value: "3,038 KMAD",
    description: "Fin de mois",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "VaR (1j, 99%)",
    value: "2,145 KMAD",
    description: "Moyenne mensuelle",
    icon: Activity,
    trend: "down",
  },
  {
    title: "Fonds Propres",
    value: "373,112 KMAD",
    description: "Réglementaires",
    icon: TrendingDown,
    trend: "neutral",
  },
]

export function MarketRiskOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon
              className={`h-4 w-4 ${
                metric.trend === "up"
                  ? "text-primary"
                  : metric.trend === "down"
                    ? "text-destructive"
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

