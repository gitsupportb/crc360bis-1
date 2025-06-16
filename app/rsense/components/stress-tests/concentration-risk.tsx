"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ConcentrationRiskStressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Test du Risque de Concentration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Portefeuille des grands groupes d'intérêt</h3>
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
                  <TableCell className="font-medium">Encours sain</TableCell>
                  <TableCell className="text-right">0.00</TableCell>
                  <TableCell className="text-right">0.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Fonds propres</TableCell>
                  <TableCell className="text-right">373,112.30</TableCell>
                  <TableCell className="text-right">373,112.30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ratio Tier 1</TableCell>
                  <TableCell className="text-right">20.09%</TableCell>
                  <TableCell className="text-right">20.09%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground">
            Commentaire: Aucune incidence - BCP2S ne distribue pas de crédit.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

