"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stressTests = [
  {
    scenario: "Hausse de 100 bp de la courbe des taux (BDT)",
    impact: -111797,
    impactFP: -74904.02,
  },
  {
    scenario: "Hausse de 50 pb de la courbe des taux (BDT)",
    impact: -56892,
    impactFP: -38117.45,
  },
  {
    scenario: "Hausse de 100 pb de la courbe des taux (OBL priv)",
    impact: -11052,
    impactFP: -7404.65,
  },
  {
    scenario: "Hausse de 200 bp de la courbe des taux (OBL priv)",
    impact: -20620,
    impactFP: -13815.65,
  },
]

export function StressTestResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats des Stress Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scénario</TableHead>
              <TableHead className="text-right">Impact P&L (KMAD)</TableHead>
              <TableHead className="text-right">Impact FP (KMAD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stressTests.map((test) => (
              <TableRow key={test.scenario}>
                <TableCell className="font-medium">{test.scenario}</TableCell>
                <TableCell className="text-right text-destructive">{test.impact.toLocaleString()}</TableCell>
                <TableCell className="text-right text-destructive">{test.impactFP.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

