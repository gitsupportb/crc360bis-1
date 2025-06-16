"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  {
    marche: 24,
    liquidite: 132,
    contrepartie: 45,
    operationnel: 12,
  },
  {
    marche: 28,
    liquidite: 134,
    contrepartie: 42,
    operationnel: 14,
  },
  {
    marche: 26,
    liquidite: 129,
    contrepartie: 44,
    operationnel: 10,
  },
  {
    marche: 22,
    liquidite: 135,
    contrepartie: 46,
    operationnel: 11,
  },
  {
    marche: 25,
    liquidite: 130,
    contrepartie: 43,
    operationnel: 13,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <Tooltip />
        <Line type="monotone" dataKey="marche" stroke="#FF6600" strokeWidth={2} name="Risque de Marché" />
        <Line type="monotone" dataKey="liquidite" stroke="#ff8533" strokeWidth={2} name="Risque de Liquidité" />
        <Line type="monotone" dataKey="contrepartie" stroke="#ffa366" strokeWidth={2} name="Risque de Contrepartie" />
        <Line type="monotone" dataKey="operationnel" stroke="#ffc199" strokeWidth={2} name="Risque Opérationnel" />
      </LineChart>
    </ResponsiveContainer>
  )
}

