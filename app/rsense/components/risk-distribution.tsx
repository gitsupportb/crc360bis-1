"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Marché",
    value: 35,
  },
  {
    name: "Liquidité",
    value: 25,
  },
  {
    name: "Contrepartie",
    value: 20,
  },
  {
    name: "Opérationnel",
    value: 20,
  },
]

const COLORS = ["#FF6600", "#ff8533", "#ffa366", "#ffc199"]

export function RiskDistribution() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

