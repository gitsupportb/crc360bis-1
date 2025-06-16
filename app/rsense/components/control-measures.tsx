"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jul", value: 0.08 },
  { month: "Aug", value: 0.09 },
  { month: "Sep", value: 0.12 },
  { month: "Oct", value: 0.12 },
  { month: "Nov", value: 0.12 },
  { month: "Dec", value: 0.12 },
  { month: "Jan", value: 0.15 },
  { month: "Feb", value: 0.21 },
  { month: "Mar", value: 0.27 },
  { month: "Apr", value: 0.34 },
  { month: "May", value: 0.34 },
  { month: "Jun", value: 0.34 },
]

export function ControlMeasures() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value * 100}%`}
        />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#FF6600" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

