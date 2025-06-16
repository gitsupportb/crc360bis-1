"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          toast({
            title: "Fichier téléchargé",
            description: `${file.name} a été téléchargé avec succès.`,
          })
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Téléchargement de Fichiers</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Télécharger un Rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
              />
              <Button asChild>
                <label htmlFor="file-upload">Sélectionner un fichier</label>
              </Button>
            </div>
            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">{progress}% téléchargé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
