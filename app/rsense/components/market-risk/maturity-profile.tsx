"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const maturityData = [
  { bucket: "0-3m", position: 333517, pv01: 143.13, duration: 0.14 },
  { bucket: "3-6m", position: 0, pv01: 0, duration: 0 },
  { bucket: "6-9m", position: 420342, pv01: 80.8, duration: 0.57 },
  { bucket: "9-12m", position: 296483, pv01: 223.32, duration: 0.83 },
  { bucket: "1-2a", position: 3308235, pv01: 721.24, duration: 1.6 },
  { bucket: "2-3a", position: 37732, pv01: 31.38, duration: 2.82 },
  { bucket: "3-4a", position: 21217, pv01: 17.34, duration: 3.43 },
  { bucket: "4-5a", position: 0, pv01: 0, duration: 0 },
  { bucket: "5-7a", position: 20943, pv01: 24.24, duration: 5.61 },
  { bucket: "7-10a", position: 0, pv01: 0, duration: 0 },
  { bucket: "10-15a", position: 0, pv01: 0, duration: 0 },
  { bucket: "15-20a", position: 0, pv01: 0, duration: 0 },
  { bucket: "20-30a", position: 21714, pv01: 36.12, duration: 26.34 },
]

export function MaturityProfile() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={maturityData}>
        <XAxis dataKey="bucket" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}M`}
        />
        <Tooltip formatter={(value: number) => new Intl.NumberFormat("fr-FR").format(value)} />
        <Bar dataKey="position" fill="#FF6600" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

