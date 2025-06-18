"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MarketRiskStressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Test du Risque de Marché</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portefeuille</TableHead>
                <TableHead className="text-right">Avant le choc</TableHead>
                <TableHead className="text-right">Après le choc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Bons du Trésor</TableCell>
                <TableCell className="text-right">3,313,279.22</TableCell>
                <TableCell className="text-right">3,233,867.56</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Produit net bancaire</TableCell>
                <TableCell className="text-right">83,424.44</TableCell>
                <TableCell className="text-right">4,012.78</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Ratio de solvabilité</TableCell>
                <TableCell className="text-right">20.09%</TableCell>
                <TableCell className="text-right">14.85%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="text-sm text-muted-foreground">
            Impact principal sur le portefeuille des Bons du Trésor avec une baisse significative du ratio de
            solvabilité.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

