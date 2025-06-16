import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentReports = [
  {
    name: "État LCR",
    date: "2024-02-01",
    status: "Complété",
    type: "Mensuel",
  },
  {
    name: "Reporting IRRBB",
    date: "2024-01-15",
    status: "En attente",
    type: "Trimestriel",
  },
  {
    name: "Stress Test Liquidité",
    date: "2024-01-31",
    status: "En cours",
    type: "Mensuel",
  },
  {
    name: "Risques Grands Bénéficiaires",
    date: "2024-01-21",
    status: "Complété",
    type: "Trimestriel",
  },
]

export function RecentReports() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentReports.map((report) => (
          <TableRow key={report.name}>
            <TableCell className="font-medium">{report.name}</TableCell>
            <TableCell>{report.date}</TableCell>
            <TableCell>{report.type}</TableCell>
            <TableCell>{report.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

