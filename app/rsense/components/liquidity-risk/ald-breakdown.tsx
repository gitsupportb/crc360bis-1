"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const aldComponents = [
  { name: "Valeurs en caisse", value: 0.88, amount: 882.0 },
  { name: "Bank Al-Maghrib", value: 33920.6, amount: 33920595.58 },
  { name: "Comptes ordinaires des banques", value: 4004.71, amount: 4004708.08 },
  { name: "Bons de trésor", value: 4546176.95, amount: 4546176950.74 },
  { name: "REV Repo sur Bons de Trésor", value: 1315067.99, amount: 1315067993.46 },
  { name: "Emprunt de titres", value: 863892.07, amount: 863892070.8 },
  { name: "Prêts de trésorerie à terme (DAT)", value: 60000.0, amount: 60000000.0 },
]

export function ALDBreakdown() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Composition des Actifs Liquides Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aldComponents}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#FF6600" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Détail des Composantes ALD</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Composante</TableHead>
                <TableHead className="text-right">Montant (KDH)</TableHead>
                <TableHead className="text-right">Montant Détaillé (DH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aldComponents.map((component) => (
                <TableRow key={component.name}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell className="text-right">{component.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{component.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{(1792221.56).toLocaleString()}</TableCell>
                <TableCell className="text-right">{(1792221557.53).toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

