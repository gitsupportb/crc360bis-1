"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, X } from "lucide-react"

interface AdminImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
}

const documentTypes = ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]

export function AdminImportDialog({ open, onOpenChange, onImportSuccess }: AdminImportDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setDescription("")
    setFiles(null)
    setIsUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner au moins un fichier à importer.",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Catégorie requise",
        description: "Veuillez sélectionner une catégorie pour le(s) document(s).",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        
        // Use individual file name as title if multiple files, otherwise use provided title
        const fileTitle = files.length > 1 ? file.name.replace(/\.[^/.]+$/, "") : (title || file.name.replace(/\.[^/.]+$/, ""))
        
        formData.append('file', file)
        formData.append('title', fileTitle)
        formData.append('category', category)
        formData.append('description', description)

        try {
          const response = await fetch('/api/docsecure/upload', {
            method: 'POST',
            body: formData,
          })

          const result = await response.json()

          if (result.success) {
            successCount++
          } else {
            errorCount++
            console.error(`Upload failed for ${file.name}:`, result.error)
          }
        } catch (error) {
          errorCount++
          console.error(`Upload error for ${file.name}:`, error)
        }
      }

      if (successCount > 0) {
        toast({
          title: "Import terminé",
          description: `${successCount} document(s) importé(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
          variant: errorCount > 0 ? "destructive" : "default",
        })
        
        resetForm()
        onImportSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "Échec de l'import",
          description: "Aucun document n'a pu être importé. Vérifiez les fichiers et réessayez.",
          variant: "destructive",
        })
      }

    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import des documents.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer()
      for (let i = 0; i < files.length; i++) {
        if (i !== index) {
          dt.items.add(files[i])
        }
      }
      setFiles(dt.files)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-500" />
            Import de Documents - Admin
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium text-gray-700">
              Fichiers à importer
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour sélectionner (50MB max par fichier)
              </p>
              <Input
                id="file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                Sélectionner des fichiers
              </Button>
            </div>
          </div>

          {/* Selected Files Display */}
          {files && files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Fichiers sélectionnés ({files.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre {files && files.length > 1 ? "(optionnel pour import multiple)" : ""}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={files && files.length > 1 ? "Laissez vide pour utiliser les noms de fichiers" : "Titre du document"}
                className="border-2 border-gray-200 focus:border-orange-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Catégorie *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-orange-400">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (optionnelle)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du/des document(s)"
              className="border-2 border-gray-200 focus:border-orange-400"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !files || files.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Import en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importer {files && files.length > 1 ? `${files.length} documents` : 'le document'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
