"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LiquidityRiskStressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Test du Risque de Liquidité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicateur</TableHead>
                <TableHead className="text-right">Avant le choc</TableHead>
                <TableHead className="text-right">Après le choc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Actifs liquides disponibles</TableCell>
                <TableCell className="text-right">834,191</TableCell>
                <TableCell className="text-right">834,191</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bons du Trésor disponibles</TableCell>
                <TableCell className="text-right">543,962</TableCell>
                <TableCell className="text-right">543,962</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Besoins de liquidité</TableCell>
                <TableCell className="text-right">893,620</TableCell>
                <TableCell className="text-right">1,338,620</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="text-sm text-muted-foreground">
            BCP2S bénéficie d'une ligne de financement de 1.5 Mrd DH de la part de BCP.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

