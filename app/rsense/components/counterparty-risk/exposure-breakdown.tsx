"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const exposureData = [
  { name: "OCP", direct: 19998, indirect: 46592 },
  { name: "SNI", direct: 0, indirect: 47518 },
  { name: "ONCF", direct: 23456, indirect: 28744 },
  { name: "CIH", direct: 32365, indirect: 132375 },
  { name: "ATW", direct: 48000, indirect: 105527 },
  { name: "BCP", direct: 35100, indirect: 227500 },
]

export function ExposureBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Expositions par Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={exposureData}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Tooltip />
            <Bar dataKey="direct" name="Risques Directs" fill="#FF6600" stackId="a" />
            <Bar dataKey="indirect" name="Risques Indirects" fill="#ffa366" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

