"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload } from "lucide-react"

const reglementaireData = [
  {
    id: "331",
    name: "État LCR",
    frequency: "Mensuelle",
    format: "Excel",
    deadline: "15 jours après la date d'arrêté",
  },
  {
    id: "159",
    name: "Reporting réglementaire IRRBB",
    frequency: "Trimestrielle",
    format: "Télétransmission et Excel",
    deadline: "Un mois après la date l'arrêté",
  },
  // Add more regulatory reports...
]

const stressTestData = [
  {
    id: "ST1",
    name: "Stress tests au titre du risque de liquidité",
    frequency: "Mensuelle",
    format: "Sur fichier",
    deadline: "Fin du mois suivant",
  },
  {
    id: "ST2",
    name: "Stress tests au titre du risque de crédit",
    frequency: "Semestrielle",
    format: "Sur fichier",
    deadline: "Fin mars pour l'état arrêté à fin décembre",
  },
  // Add more stress tests...
]

interface ReportingTableProps {
  type?: "reglementaire" | "stress-tests"
}

export function ReportingTable({ type = "reglementaire" }: ReportingTableProps) {
  const data = type === "reglementaire" ? reglementaireData : stressTestData

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Périodicité</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Échéance</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.frequency}</TableCell>
              <TableCell>{item.format}</TableCell>
              <TableCell>{item.deadline}</TableCell>
              <TableCell>
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

