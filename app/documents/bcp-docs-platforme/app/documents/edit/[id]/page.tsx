"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { File, FileUp, X, Check, ArrowLeft } from "lucide-react"

// Types de documents
const documentTypes = ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]

// Données fictives pour les documents
const mockDocuments = [
  {
    id: 1,
    titre: "Procédure d'ouverture de compte",
    type: "Procédures",
    dateMiseAJour: "2025-04-12",
    description: "Cette procédure détaille les étapes nécessaires pour l'ouverture d'un nouveau compte client.",
  },
  {
    id: 2,
    titre: "Mode d'emploi du logiciel de trading",
    type: "Modes d'emploi",
    dateMiseAJour: "2025-04-08",
    description: "Guide complet pour l'utilisation du logiciel de trading interne.",
  },
  {
    id: 3,
    titre: "Note interne sur la conformité",
    type: "Notes internes",
    dateMiseAJour: "2025-04-10",
    description: "Note concernant les nouvelles exigences de conformité réglementaire.",
  },
  {
    id: 4,
    titre: "Politique de sécurité des données",
    type: "Politiques",
    dateMiseAJour: "2025-04-05",
    description: "Politique définissant les règles de sécurité pour la gestion des données clients.",
  },
]

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const documentId = Number(params.id)

  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [currentFileName, setCurrentFileName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données du document
    setTimeout(() => {
      const document = mockDocuments.find((doc) => doc.id === documentId)

      if (document) {
        setTitle(document.titre)
        setType(document.type)
        setDescription(document.description || "")
        setCurrentFileName(`document-${documentId}.pdf`)
      } else {
        toast({
          title: "Document introuvable",
          description: "Le document demandé n'existe pas.",
          variant: "destructive",
        })
        router.push("/documents")
      }

      setIsLoading(false)
    }, 500)
  }, [documentId, router, toast])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !type) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Document mis à jour",
        description: "Le document a été mis à jour avec succès.",
      })

      router.push("/documents")
    }, 1500)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement du document...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/documents")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Modifier le document</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titre du document <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre du document"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Type de document <span className="text-red-500">*</span>
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType} value={docType}>
                        {docType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Entrez une description du document"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Fichier actuel</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{currentFileName}</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Label>Remplacer le fichier</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                } ${file ? "bg-gray-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <FileUp className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium">Glissez-déposez votre fichier ici</p>
                      <p className="text-sm text-muted-foreground mt-1">ou cliquez pour sélectionner un fichier</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formats acceptés: PDF, DOCX, XLSX, PPTX (max 10MB)
                      </p>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.xlsx,.pptx"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Sélectionner un fichier
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Informations importantes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      La mise à jour d'un document conserve l'historique des versions
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      Tous les utilisateurs seront notifiés de cette mise à jour
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/documents")}>
              Annuler
            </Button>
            <Button type="submit" className="bg-[#E67E22] hover:bg-[#D35400]" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour le document"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
