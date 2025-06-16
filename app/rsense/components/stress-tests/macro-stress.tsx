"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MacroStressTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Test Macro-économique</CardTitle>
      </CardHeader>
      <CardContent>
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
              <TableCell className="font-medium">Bons du Trésor et titres de dette</TableCell>
              <TableCell className="text-right">3,476,387.60</TableCell>
              <TableCell className="text-right">3,387,345.34</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pertes subies</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">89,042.26</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ratio Tier 1</TableCell>
              <TableCell className="text-right">20.09%</TableCell>
              <TableCell className="text-right">14.85%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

