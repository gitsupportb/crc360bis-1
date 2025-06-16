"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stressTests = [
  {
    scenario: "Scénario 1: Retrait des dépôts",
    hypotheses: [
      {
        name: "Hypothèse 1",
        description: "Retrait de 10% des DAV et non renouvellement de 50% des DAT",
        impact: 0,
        liquidityBuffer: 1792222,
      },
      {
        name: "Hypothèse 2",
        description: "Retrait de 20% des DAV et non renouvellement de 50% des DAT",
        impact: 0,
        liquidityBuffer: 1792222,
      },
    ],
  },
  {
    scenario: "Scénario 2: Retrait des grands déposants",
    hypotheses: [
      {
        name: "Hypothèse 1",
        description: "Retrait des 5 plus grands déposants",
        impact: 0,
        liquidityBuffer: 1792222,
      },
      {
        name: "Hypothèse 2",
        description: "Retrait des 10 plus grands déposants",
        impact: 0,
        liquidityBuffer: 1792222,
      },
    ],
  },
  {
    scenario: "Scénario 3: Non renouvellement des ressources",
    hypotheses: [
      {
        name: "Hypothèse 1",
        description: "Non renouvellement de 25% des ressources",
        impact: 470000,
        liquidityBuffer: 1792222,
      },
      {
        name: "Hypothèse 2",
        description: "Non renouvellement de 50% des ressources",
        impact: 940000,
        liquidityBuffer: 1792222,
      },
    ],
  },
]

export function StressTestAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats des Stress Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stressTests.map((test) => (
            <div key={test.scenario} className="space-y-2">
              <h3 className="font-semibold">{test.scenario}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hypothèse</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Impact (KDH)</TableHead>
                    <TableHead className="text-right">Buffer (KDH)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {test.hypotheses.map((hypothesis) => (
                    <TableRow key={hypothesis.name}>
                      <TableCell>{hypothesis.name}</TableCell>
                      <TableCell>{hypothesis.description}</TableCell>
                      <TableCell className={`text-right ${hypothesis.impact > 0 ? "text-red-500" : "text-green-500"}`}>
                        {hypothesis.impact.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{hypothesis.liquidityBuffer.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

