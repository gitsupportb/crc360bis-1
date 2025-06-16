"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const sensitivities = {
  pv01: {
    value: 1278,
    change: "+12.5%",
    limit: 1500,
  },
  duration: {
    value: 1.5,
    change: "+0.2",
    limit: 2.0,
  },
  cso1: {
    value: null,
    change: null,
    limit: null,
  },
}

export function RiskSensitivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicateurs de Sensibilité</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicateur</TableHead>
              <TableHead className="text-right">Valeur</TableHead>
              <TableHead className="text-right">Variation</TableHead>
              <TableHead className="text-right">Limite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">PV01 (compte propre)</TableCell>
              <TableCell className="text-right">{sensitivities.pv01.value}</TableCell>
              <TableCell className="text-right">{sensitivities.pv01.change}</TableCell>
              <TableCell className="text-right">{sensitivities.pv01.limit}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Duration (compte propre)</TableCell>
              <TableCell className="text-right">{sensitivities.duration.value}</TableCell>
              <TableCell className="text-right">{sensitivities.duration.change}</TableCell>
              <TableCell className="text-right">{sensitivities.duration.limit}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CSO1 (compte propre)</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

