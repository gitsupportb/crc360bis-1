import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Wallet, TrendingDown, AlertTriangle } from "lucide-react";

const metrics = [
  {
    title: "Ratio LCR",
    value: "%",
    description: "Minimum réglementaire: 100%",
    icon: Percent,
    trend: "up",
  },
  {
    title: "Actifs Liquides (ALD)",
    value: "1,792,222 KDH",
    description: "Total disponible",
    icon: Wallet,
    trend: "neutral",
  },
  {
    title: "Besoins de Liquidité",
    value: "2,756,539 KDH",
    description: "Sur un mois",
    icon: TrendingDown,
    trend: "down",
  },
  {
    title: "Impact Stress Test",
    value: "940,000 KDH",
    description: "Scénario le plus sévère",
    icon: AlertTriangle,
    trend: "warning",
  },
];

export function LiquidityOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.title} className="h-full">
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
  );
}
