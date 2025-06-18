"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MaturityProfile } from "./maturity-profile"

const fixedIncomeData = [
  {
    type: "Emissions publiques",
    position: 113203,
    pv01: 1277.58,
    duration: 1.5,
    weight: "25.4%",
  },
  {
    type: "Emissions privées",
    position: 4346980,
    pv01: null,
    duration: null,
    weight: "74.6%",
  },
]

export function FixedIncomeAnalysis() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Portefeuille Obligataire</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Position (KMAD)</TableHead>
                <TableHead className="text-right">PV01</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Poids</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedIncomeData.map((row) => (
                <TableRow key={row.type}>
                  <TableCell className="font-medium">{row.type}</TableCell>
                  <TableCell className="text-right">{row.position.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.pv01?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-right">{row.duration ?? "-"}</TableCell>
                  <TableCell className="text-right">{row.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profil de Maturité</CardTitle>
        </CardHeader>
        <CardContent>
          <MaturityProfile />
        </CardContent>
      </Card>
    </div>
  )
}

