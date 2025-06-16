"use client"

import type React from "react"

import { useState } from "react"
import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { FileUp, X, File, Check, Upload } from "lucide-react"

// Types de documents
const documentTypes = ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]

export default function DocSecureImportPage() {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !type || !file) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: `Le fichier dépasse la taille maximale autorisée de 50MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('category', type)
      formData.append('description', description)

      // Upload file
      const response = await fetch('/api/docsecure/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Document importé",
          description: `Le document a été importé avec succès. ID: ${result.documentId}`,
        })

        // Réinitialiser le formulaire
        setTitle("")
        setType("")
        setDescription("")
        setFile(null)
      } else {
        toast({
          title: "Erreur d'importation",
          description: result.error || "Une erreur est survenue lors de l'importation.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation du document.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DocSecureDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}
          >
            <Upload className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              Importer un document
            </h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Ajoutez de nouveaux documents à votre bibliothèque sécurisée
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8 border-0 space-y-8"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(255, 107, 53, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Titre du document <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entrez le titre du document"
                    className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Type de document <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger
                      id="type"
                      className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300"
                      style={{
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                      }}
                    >
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
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Entrez une description du document"
                    rows={4}
                    className="border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl font-medium transition-all duration-300 resize-none"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
            </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Fichier <span className="text-red-500">*</span>
                </Label>
                <div
                  className="border-2 border-dashed rounded-2xl p-8 transition-all duration-300"
                  style={{
                    borderColor: isDragging ? '#ff6b35' : file ? '#22c55e' : '#d1d5db',
                    background: isDragging ? 'rgba(255, 107, 53, 0.05)' : file ? 'rgba(34, 197, 94, 0.05)' : 'rgba(249, 250, 251, 0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!file ? (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                      <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-orange-200' : 'bg-gray-100'}`}>
                        <FileUp className={`h-12 w-12 transition-colors ${isDragging ? 'text-orange-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-lg font-semibold text-gray-700">
                          {isDragging ? "Déposez votre fichier ici" : "Glissez-déposez votre fichier ici"}
                        </p>
                        <p className="text-sm text-gray-500">ou cliquez pour sélectionner un fichier</p>
                        <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full inline-block">
                          Formats acceptés: PDF, DOCX, XLSX, PPTX (max 50MB)
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
                        className="border-2 border-orange-400 text-orange-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        style={{
                          background: 'transparent',
                          boxShadow: '0 4px 15px rgba(255, 107, 53, 0.2)'
                        }}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Sélectionner un fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <File className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Fichier prêt à être importé</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Card className="mt-6 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900">Informations importantes</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-blue-800">
                          <strong>Taille maximale:</strong> 50MB par fichier
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-blue-800">
                          <strong>Formats acceptés:</strong> PDF, DOCX, XLSX, PPTX
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-blue-800">
                          <strong>Sécurité:</strong> Les documents sont chiffrés et accessibles uniquement aux utilisateurs autorisés
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="text-white px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importation en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Importer le document
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DocSecureDashboardLayout>
  )
}
