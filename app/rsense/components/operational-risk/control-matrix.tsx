"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const controls = [
  {
    id: "CTL-001",
    process: "Trading",
    control: "Validation des opérations",
    frequency: "Quotidien",
    lastExecution: "2024-02-05",
    status: "Conforme",
  },
  {
    id: "CTL-002",
    process: "Back Office",
    control: "Réconciliation des positions",
    frequency: "Quotidien",
    lastExecution: "2024-02-05",
    status: "Conforme",
  },
  {
    id: "CTL-003",
    process: "Risques",
    control: "Contrôle des limites",
    frequency: "Hebdomadaire",
    lastExecution: "2024-02-01",
    status: "En retard",
  },
]

const statusColors = {
  Conforme: "success",
  "Non conforme": "destructive",
  "En retard": "warning",
} as const

export function ControlMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matrice des Contrôles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Processus</TableHead>
              <TableHead>Contrôle</TableHead>
              <TableHead>Fréquence</TableHead>
              <TableHead>Dernière exécution</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controls.map((control) => (
              <TableRow key={control.id}>
                <TableCell>{control.id}</TableCell>
                <TableCell>{control.process}</TableCell>
                <TableCell>{control.control}</TableCell>
                <TableCell>{control.frequency}</TableCell>
                <TableCell>{control.lastExecution}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[control.status as keyof typeof statusColors]}>{control.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

