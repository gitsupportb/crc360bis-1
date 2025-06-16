"use client"

import { useState, useEffect } from "react"
import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Search, ArrowUpDown, FileText, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Types de documents
const documentTypes = ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]

// Interface pour les documents
interface Document {
  id: number;
  title: string;
  original_filename: string;
  stored_filename: string;
  category: string;
  description: string;
  file_size: number;
  upload_date: string;
  last_modified: string;
  file_path: string;
  mime_type: string;
  metadata: any;
}

export default function DocSecureDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "upload_date">("upload_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("all")
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load documents from API
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/docsecure/documents')
      const result = await response.json()

      if (result.success) {
        setDocuments(result.documents || [])
      } else {
        toast({
          title: "Erreur de chargement",
          description: result.error || "Impossible de charger les documents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: "Erreur de chargement",
        description: "Une erreur est survenue lors du chargement des documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et trier les documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = activeTab === "all" || doc.category === activeTab
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else {
        return sortOrder === "asc"
          ? new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
          : new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
      }
    })

  const toggleSort = (field: "title" | "upload_date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
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
    <DocSecureDashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Documents
            </h1>
            <p className="text-gray-600 font-medium">Gérez et organisez vos documents en toute sécurité</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un document..."
              className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white rounded-xl font-medium transition-all duration-300"
              style={{
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div
          className="rounded-2xl p-6 shadow-lg border-0"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(255, 107, 53, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="grid w-full grid-cols-5 p-1 rounded-xl"
              style={{
                background: 'rgba(248, 250, 252, 0.8)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <TabsTrigger
                value="all"
                className="data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
                style={{
                  background: activeTab === "all" ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' : 'transparent'
                }}
              >
                Tous
              </TabsTrigger>
              {documentTypes.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === type ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' : 'transparent'
                  }}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "title" | "upload_date")}>
                  <SelectTrigger
                    className="w-[200px] h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="upload_date">Date de mise à jour</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-12 w-12 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
              <div
                className="flex items-center gap-2 text-sm text-gray-700 px-4 py-3 rounded-xl font-medium"
                style={{
                  background: 'rgba(248, 250, 252, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)'
                }}
              >
                <span className="font-bold text-orange-600">{filteredDocuments.length}</span>
                <span>document{filteredDocuments.length !== 1 ? 's' : ''} trouvé{filteredDocuments.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-8">
              <div
                className="rounded-2xl overflow-hidden border-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(255, 107, 53, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow
                      className="hover:bg-transparent border-b-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)'
                      }}
                    >
                      <TableHead className="w-[50%] font-bold text-gray-800 py-4">
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort("title")}
                          className="flex items-center gap-2 hover:bg-white/50 text-gray-800 font-bold rounded-lg transition-all duration-300"
                        >
                          <FileText className="h-4 w-4" />
                          Titre
                          {sortBy === "title" && <ArrowUpDown className="h-3 w-3" />}
                        </Button>
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-4">Type</TableHead>
                      <TableHead className="font-bold text-gray-800 py-4">
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort("upload_date")}
                          className="flex items-center gap-2 hover:bg-white/50 text-gray-800 font-bold rounded-lg transition-all duration-300"
                        >
                          <Clock className="h-4 w-4" />
                          Mise à jour
                          {sortBy === "upload_date" && <ArrowUpDown className="h-3 w-3" />}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-lg font-medium">Chargement des documents...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                          <FileText className="h-12 w-12 text-gray-300" />
                          <p className="text-lg font-medium">Aucun document trouvé</p>
                          <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc, index) => {
                      const typeColors = {
                        "Procédures": "bg-blue-100 text-blue-700 border-blue-200",
                        "Modes d'emploi": "bg-purple-100 text-purple-700 border-purple-200",
                        "Notes internes": "bg-green-100 text-green-700 border-green-200",
                        "Politiques": "bg-red-100 text-red-700 border-red-200"
                      }
                      return (
                        <TableRow
                          key={doc.id}
                          className="hover:bg-gray-50/70 transition-colors duration-200 group"
                        >
                          <TableCell className="font-medium text-gray-800 group-hover:text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-8 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div>
                                <div className="font-semibold">{doc.title}</div>
                                <div className="text-sm text-gray-500">{doc.original_filename}</div>
                                <div className="text-xs text-gray-400">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${typeColors[doc.category as keyof typeof typeColors] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {doc.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{formatDate(doc.upload_date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPreviewDocument(doc)}
                                    className="hover:bg-blue-50 hover:text-blue-600"
                                    title="Aperçu du document"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl">{previewDocument?.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 p-6 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 min-h-[500px] flex items-center justify-center">
                                    <div className="text-center space-y-3">
                                      <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                                      <p className="text-gray-600 text-lg">Aperçu du document</p>
                                      <p className="text-gray-500 text-sm">Le contenu du document s'afficherait ici</p>
                                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                          <strong>Titre:</strong> {previewDocument?.title}
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                          <strong>Catégorie:</strong> {previewDocument?.category}
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                          <strong>Taille:</strong> {previewDocument ? (previewDocument.file_size / 1024 / 1024).toFixed(2) : 0} MB
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                          <strong>Date d'upload:</strong> {previewDocument ? formatDate(previewDocument.upload_date) : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DocSecureDashboardLayout>
  )
}
