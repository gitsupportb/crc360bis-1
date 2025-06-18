"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, TrendingDown, AlertTriangle, Building2, Wallet, LineChart, Globe } from "lucide-react"

const metrics = [
  {
    title: "Ratio de Solvabilité",
    value: "20.09%",
    description: "Après chocs",
    icon: Shield,
    trend: "neutral",
  },
  {
    title: "Impact Marché",
    value: "-89,042 KDH",
    description: "Dépréciation portefeuille",
    icon: TrendingDown,
    trend: "down",
  },
  {
    title: "Besoin Liquidité",
    value: "445 MDH",
    description: "Scénario sévère",
    icon: Wallet,
    trend: "warning",
  },
  {
    title: "Ratio Tier 1",
    value: "14.85%",
    description: "Post stress macro",
    icon: LineChart,
    trend: "down",
  },
  {
    title: "Risque Pays",
    value: "0 KDH",
    description: "Pas d'exposition",
    icon: Globe,
    trend: "neutral",
  },
  {
    title: "Grands Risques",
    value: "0 KDH",
    description: "Pas de crédit",
    icon: AlertTriangle,
    trend: "neutral",
  },
  {
    title: "Risque Immobilier",
    value: "0 KDH",
    description: "Pas d'exposition",
    icon: Building2,
    trend: "neutral",
  },
]

export function StressTestOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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

