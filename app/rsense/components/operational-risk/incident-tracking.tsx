"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const incidents = [
  {
    id: "INC-001",
    date: "2024-01-15",
    description: "Indisponibilité temporaire du système de trading",
    impact: "Moyen",
    status: "Résolu",
    resolution: "Basculement sur le site de secours",
  },
  {
    id: "INC-002",
    date: "2024-01-28",
    description: "Erreur de réconciliation des positions",
    impact: "Faible",
    status: "Résolu",
    resolution: "Correction manuelle effectuée",
  },
  {
    id: "INC-003",
    date: "2024-02-05",
    description: "Retard dans le reporting réglementaire",
    impact: "Faible",
    status: "En cours",
    resolution: "En attente de validation",
  },
]

const impactColors = {
  Élevé: "destructive",
  Moyen: "warning",
  Faible: "default",
} as const

const statusColors = {
  Résolu: "success",
  "En cours": "warning",
  Ouvert: "destructive",
} as const

export function IncidentTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi des Incidents Opérationnels</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Résolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.id}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.description}</TableCell>
                <TableCell>
                  <Badge variant={impactColors[incident.impact as keyof typeof impactColors]}>{incident.impact}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[incident.status as keyof typeof statusColors]}>{incident.status}</Badge>
                </TableCell>
                <TableCell>{incident.resolution}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

