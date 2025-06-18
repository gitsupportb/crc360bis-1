"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const largeExposures = [
  {
    name: "OCP",
    type: "I",
    grossRisk: 66590,
    directRisks: {
      loans: 19998,
      equity: 0,
      other: 46592,
    },
    netRisk: 66590,
    capitalRatio: 17.85,
  },
  {
    name: "SNI",
    type: "G",
    grossRisk: 47518,
    directRisks: {
      loans: 0,
      equity: 0,
      other: 47518,
    },
    netRisk: 47518,
    capitalRatio: 12.74,
  },
  {
    name: "ONCF",
    type: "",
    grossRisk: 52200,
    directRisks: {
      loans: 23456,
      equity: 0,
      other: 28744,
    },
    netRisk: 52200,
    capitalRatio: 13.99,
  },
  {
    name: "BCP",
    type: "G",
    code: "32404",
    grossRisk: 262600,
    directRisks: {
      loans: 35100,
      equity: 0,
      other: 227500,
    },
    netRisk: 52520,
    capitalRatio: 14.08,
  },
]

export function LargeExposures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grands Risques</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrepartie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Risque Brut</TableHead>
              <TableHead className="text-right">Prêts</TableHead>
              <TableHead className="text-right">Titres</TableHead>
              <TableHead className="text-right">Autres</TableHead>
              <TableHead className="text-right">Risque Net</TableHead>
              <TableHead className="text-right">% FP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {largeExposures.map((exposure) => (
              <TableRow key={exposure.name}>
                <TableCell className="font-medium">{exposure.name}</TableCell>
                <TableCell>{exposure.type}</TableCell>
                <TableCell className="text-right">{exposure.grossRisk.toLocaleString()}</TableCell>
                <TableCell className="text-right">{exposure.directRisks.loans.toLocaleString()}</TableCell>
                <TableCell className="text-right">{exposure.directRisks.equity.toLocaleString()}</TableCell>
                <TableCell className="text-right">{exposure.directRisks.other.toLocaleString()}</TableCell>
                <TableCell className="text-right">{exposure.netRisk.toLocaleString()}</TableCell>
                <TableCell
                  className={`text-right ${
                    exposure.capitalRatio > 15
                      ? "text-red-500"
                      : exposure.capitalRatio > 10
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {exposure.capitalRatio.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

