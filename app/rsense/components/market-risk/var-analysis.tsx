"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const varData = [
  { date: "2024-01", value: 1890 },
  { date: "2024-02", value: 1950 },
  { date: "2024-03", value: 2100 },
  { date: "2024-04", value: 1980 },
  { date: "2024-05", value: 2145 },
  { date: "2024-06", value: 2050 },
  { date: "2024-07", value: 1920 },
  { date: "2024-08", value: 2010 },
  { date: "2024-09", value: 2180 },
  { date: "2024-10", value: 2090 },
  { date: "2024-11", value: 1970 },
  { date: "2024-12", value: 2145 },
]

export function VaRAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution de la VaR (1j, 99%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={varData}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.split("-")[1]}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}K`}
            />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#FF6600" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

