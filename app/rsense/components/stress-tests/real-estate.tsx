"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RealEstateStressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Test du Secteur Immobilier</CardTitle>
      </CardHeader>
      <CardContent>
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
              <TableCell className="font-medium">Ratio de solvabilité</TableCell>
              <TableCell className="text-right">20.09%</TableCell>
              <TableCell className="text-right">20.09%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-4 text-sm text-muted-foreground">Pas d'exposition au secteur immobilier.</div>
      </CardContent>
    </Card>
  )
}

