"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Eye, Download, MoreHorizontal, Edit, Trash2, Search, ArrowUpDown,
  FileText, Clock, Shield, LogOut, BarChart3, Users, Database,
  AlertTriangle, CheckCircle, Upload, Package, Trash, CheckSquare,
  Square, FolderOpen
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminImportDialog } from "./admin-import-dialog"

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

interface AdminUser {
  username: string;
  role: string;
}

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "upload_date">("upload_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("documents")
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set())
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)
  const { toast } = useToast()

  // Load documents from API
  useEffect(() => {
    loadDocuments()
    loadStatistics()
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

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/docsecure/documents?action=stats')
      const result = await response.json()
      
      if (result.success) {
        setStatistics(result.statistics)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('docsecure-admin-session');
      localStorage.removeItem('docsecure-admin-user');

      // Try API logout
      try {
        await fetch('/api/docsecure/auth/logout', { method: 'POST' })
      } catch (apiError) {
        console.warn('API logout failed:', apiError);
      }

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      })
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      onLogout() // Force logout even if everything fails
    }
  }

  const handleDownload = async (id: number) => {
    try {
      const response = await fetch(`/api/docsecure/download/${id}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `document_${id}`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1])
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Téléchargement démarré",
          description: "Le document est en cours de téléchargement.",
        })
      } else {
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible de télécharger le document.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.")) {
      return
    }

    try {
      const response = await fetch(`/api/docsecure/documents?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Document supprimé",
          description: result.message,
        })
        // Reload documents and statistics
        loadDocuments()
        loadStatistics()
      } else {
        toast({
          title: "Erreur de suppression",
          description: result.error || "Impossible de supprimer le document.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Erreur de suppression",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      })
    }
  }

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

  // Bulk operations functions
  const toggleDocumentSelection = (docId: number) => {
    const newSelection = new Set(selectedDocuments)
    if (newSelection.has(docId)) {
      newSelection.delete(docId)
    } else {
      newSelection.add(docId)
    }
    setSelectedDocuments(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)))
    }
  }

  const handleBulkDownload = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document à télécharger.",
        variant: "destructive",
      })
      return
    }

    setBulkOperationLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const docId of selectedDocuments) {
      try {
        await handleDownload(docId)
        successCount++
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        errorCount++
        console.error(`Failed to download document ${docId}:`, error)
      }
    }

    setBulkOperationLoading(false)
    setSelectedDocuments(new Set())

    toast({
      title: "Téléchargement en lot terminé",
      description: `${successCount} document(s) téléchargé(s), ${errorCount} erreur(s)`,
      variant: errorCount > 0 ? "destructive" : "default",
    })
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document à supprimer.",
        variant: "destructive",
      })
      return
    }

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedDocuments.size} document(s) ? Cette action est irréversible.`
    if (!confirm(confirmMessage)) {
      return
    }

    setBulkOperationLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const docId of selectedDocuments) {
      try {
        const response = await fetch(`/api/docsecure/documents?id=${docId}`, {
          method: 'DELETE'
        })
        const result = await response.json()

        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
        console.error(`Failed to delete document ${docId}:`, error)
      }
    }

    setBulkOperationLoading(false)
    setSelectedDocuments(new Set())

    // Reload documents and statistics
    loadDocuments()
    loadStatistics()

    toast({
      title: "Suppression en lot terminée",
      description: `${successCount} document(s) supprimé(s), ${errorCount} erreur(s)`,
      variant: errorCount > 0 ? "destructive" : "default",
    })
  }

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = activeTab === "documents" || doc.category === activeTab
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

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
    }}>
      {/* Admin Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DOC SECURE ADMIN</h1>
                <p className="text-sm text-white/80">Administration système</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white font-medium">{user.username}</p>
                <p className="text-xs text-white/70">{user.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{statistics.total_documents}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Stockage Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{statistics.total_size_mb} MB</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Catégories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{statistics.categories.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Statut Système
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Opérationnel
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Gestion des Documents
                </CardTitle>
                <div className="flex items-center gap-4">
                  {/* Import Button */}
                  <Button
                    onClick={() => setShowImportDialog(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>

                  {/* Search */}
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un document..."
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white rounded-xl font-medium transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Operations Bar */}
              {selectedDocuments.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {selectedDocuments.size} document(s) sélectionné(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleBulkDownload}
                      disabled={bulkOperationLoading}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Télécharger tout
                    </Button>
                    <Button
                      onClick={handleBulkDelete}
                      disabled={bulkOperationLoading}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Supprimer tout
                    </Button>
                    <Button
                      onClick={() => setSelectedDocuments(new Set())}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Désélectionner
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 p-1 rounded-xl bg-gray-100">
                  <TabsTrigger value="documents" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Tous
                  </TabsTrigger>
                  {documentTypes.map((type) => (
                    <TabsTrigger 
                      key={type} 
                      value={type}
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as "title" | "upload_date")}>
                      <SelectTrigger className="w-[200px]">
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
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    <span className="font-bold text-orange-600">{filteredDocuments.length}</span> document(s)
                  </div>
                </div>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                              onCheckedChange={toggleSelectAll}
                              className="border-gray-400"
                            />
                          </TableHead>
                          <TableHead className="font-bold text-gray-800">
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("title")}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Titre
                              {sortBy === "title" && <ArrowUpDown className="h-3 w-3" />}
                            </Button>
                          </TableHead>
                          <TableHead className="font-bold text-gray-800">Type</TableHead>
                          <TableHead className="font-bold text-gray-800">
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("upload_date")}
                              className="flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              Mise à jour
                              {sortBy === "upload_date" && <ArrowUpDown className="h-3 w-3" />}
                            </Button>
                          </TableHead>
                          <TableHead className="text-right font-bold text-gray-800">Actions Admin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                                <p>Chargement des documents...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="flex flex-col items-center gap-3 text-gray-500">
                                <FileText className="h-12 w-12 text-gray-300" />
                                <p className="text-lg font-medium">Aucun document trouvé</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocuments.map((doc) => {
                            const typeColors = {
                              "Procédures": "bg-blue-100 text-blue-700 border-blue-200",
                              "Modes d'emploi": "bg-purple-100 text-purple-700 border-purple-200",
                              "Notes internes": "bg-green-100 text-green-700 border-green-200",
                              "Politiques": "bg-red-100 text-red-700 border-red-200"
                            }
                            return (
                              <TableRow key={doc.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedDocuments.has(doc.id)}
                                    onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                    className="border-gray-400"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-semibold">{doc.title}</div>
                                    <div className="text-sm text-gray-500">{doc.original_filename}</div>
                                    <div className="text-xs text-gray-400">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
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
                                          title="Aperçu"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl">
                                        <DialogHeader>
                                          <DialogTitle>{previewDocument?.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 p-6 border rounded-lg bg-gray-50 min-h-[400px]">
                                          <div className="text-center space-y-3">
                                            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                                            <p className="text-gray-600">Aperçu du document</p>
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                                              <p><strong>Titre:</strong> {previewDocument?.title}</p>
                                              <p><strong>Catégorie:</strong> {previewDocument?.category}</p>
                                              <p><strong>Taille:</strong> {previewDocument ? (previewDocument.file_size / 1024 / 1024).toFixed(2) : 0} MB</p>
                                              <p><strong>Date:</strong> {previewDocument ? formatDate(previewDocument.upload_date) : ''}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDownload(doc.id)}
                                      className="hover:bg-green-50 hover:text-green-600"
                                      title="Télécharger"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="hover:bg-gray-50"
                                          title="Plus d'actions"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => alert("Fonction d'édition à implémenter")}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDelete(doc.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Supprimer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Import Dialog */}
      <AdminImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportSuccess={() => {
          loadDocuments()
          loadStatistics()
        }}
      />
    </div>
  )
}
