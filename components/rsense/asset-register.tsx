"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const assets = [
  {
    name: "Environmental Data",
    responsible: "Olivier Martin",
    priority: "high",
    assetType: "Information",
    controlsImplemented: "60.0%",
    actionsImplemented: "55.0%",
  },
  {
    name: "Client Data",
    responsible: "Sophie Dubois",
    priority: "medium",
    assetType: "Information",
    controlsImplemented: "80.0%",
    actionsImplemented: "75.0%",
  },
  {
    name: "Trading System",
    responsible: "Jean Dupont",
    priority: "high",
    assetType: "System",
    controlsImplemented: "100.0%",
    actionsImplemented: "100.0%",
  },
]

const priorityColors = {
  high: "destructive",
  medium: "warning",
  low: "success",
} as const

export function AssetRegister() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Responsible</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Asset Type</TableHead>
          <TableHead>Controls Implemented</TableHead>
          <TableHead>Actions Implemented (%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.name}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>{asset.responsible}</TableCell>
            <TableCell>
              <Badge variant={priorityColors[asset.priority as keyof typeof priorityColors]}>{asset.priority}</Badge>
            </TableCell>
            <TableCell>{asset.assetType}</TableCell>
            <TableCell>{asset.controlsImplemented}</TableCell>
            <TableCell>{asset.actionsImplemented}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
