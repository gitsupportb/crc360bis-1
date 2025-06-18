"use client"

import { useState } from "react"
import { DashboardLayout } from "../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, MoreHorizontal, Edit, Trash2, Search, ArrowUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Types de documents
const documentTypes = ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]

// Données fictives pour les documents
const mockDocuments = [
  { id: 1, titre: "Procédure d'ouverture de compte", type: "Procédures", dateMiseAJour: "2025-04-12" },
  { id: 2, titre: "Mode d'emploi du logiciel de trading", type: "Modes d'emploi", dateMiseAJour: "2025-04-08" },
  { id: 3, titre: "Note interne sur la conformité", type: "Notes internes", dateMiseAJour: "2025-04-10" },
  { id: 4, titre: "Politique de sécurité des données", type: "Politiques", dateMiseAJour: "2025-04-05" },
  { id: 5, titre: "Procédure de gestion des risques", type: "Procédures", dateMiseAJour: "2025-03-28" },
  { id: 6, titre: "Mode d'emploi du portail client", type: "Modes d'emploi", dateMiseAJour: "2025-03-25" },
  { id: 7, titre: "Note sur les nouvelles réglementations", type: "Notes internes", dateMiseAJour: "2025-03-20" },
  { id: 8, titre: "Politique de confidentialité", type: "Politiques", dateMiseAJour: "2025-03-15" },
  { id: 9, titre: "Procédure de clôture de compte", type: "Procédures", dateMiseAJour: "2025-03-10" },
  { id: 10, titre: "Mode d'emploi du système de reporting", type: "Modes d'emploi", dateMiseAJour: "2025-03-05" },
  { id: 11, titre: "Note interne sur les audits", type: "Notes internes", dateMiseAJour: "2025-02-28" },
  { id: 12, titre: "Politique de gestion des conflits d'intérêts", type: "Politiques", dateMiseAJour: "2025-02-25" },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"titre" | "dateMiseAJour">("dateMiseAJour")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("all")
  const [previewDocument, setPreviewDocument] = useState<any | null>(null)
  const { toast } = useToast()

  // Filtrer et trier les documents
  const filteredDocuments = mockDocuments
    .filter((doc) => {
      const matchesSearch = doc.titre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = activeTab === "all" || doc.type === activeTab
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "titre") {
        return sortOrder === "asc" ? a.titre.localeCompare(b.titre) : b.titre.localeCompare(a.titre)
      } else {
        return sortOrder === "asc"
          ? new Date(a.dateMiseAJour).getTime() - new Date(b.dateMiseAJour).getTime()
          : new Date(b.dateMiseAJour).getTime() - new Date(a.dateMiseAJour).getTime()
      }
    })

  const toggleSort = (field: "titre" | "dateMiseAJour") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleDownload = (id: number) => {
    toast({
      title: "Téléchargement démarré",
      description: "Le document est en cours de téléchargement.",
    })
  }

  const handleDelete = (id: number) => {
    toast({
      title: "Document supprimé",
      description: "Le document a été supprimé avec succès.",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Documents</h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto overflow-auto">
            <TabsTrigger value="all">Tous</TabsTrigger>
            {documentTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "titre" | "dateMiseAJour")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="titre">Titre</SelectItem>
                  <SelectItem value="dateMiseAJour">Date de mise à jour</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">{filteredDocuments.length} document(s)</div>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">
                      <Button variant="ghost" onClick={() => toggleSort("titre")} className="flex items-center gap-1">
                        Titre
                        {sortBy === "titre" && <ArrowUpDown className="h-3 w-3" />}
                      </Button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("dateMiseAJour")}
                        className="flex items-center gap-1"
                      >
                        Mise à jour
                        {sortBy === "dateMiseAJour" && <ArrowUpDown className="h-3 w-3" />}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        Aucun document trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.titre}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{formatDate(doc.dateMiseAJour)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setPreviewDocument(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{previewDocument?.titre}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 p-4 border rounded-md bg-gray-50 min-h-[400px] flex items-center justify-center">
                                  <p className="text-muted-foreground">Aperçu du document</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                      window.location.href = `/documents/edit/${doc.id}`
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive"
                                    onClick={() => handleDelete(doc.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </Button>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
