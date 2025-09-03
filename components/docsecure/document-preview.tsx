"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Download, X, Loader2 } from "lucide-react"
import { SecurePDFViewer } from "./secure-pdf-viewer"

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

interface PreviewData {
  type: 'pdf' | 'pdf-secure' | 'text' | 'binary';
  content: string;
}

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  showAdminFeatures?: boolean; // New prop to control admin features like download
}

export function DocumentPreview({ document: documentData, isOpen, onClose, showAdminFeatures = false }: DocumentPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && documentData) {
      loadPreview();
    } else {
      setPreviewData(null);
      setError(null);
    }
  }, [isOpen, documentData]);

  // Block right-click for entire popup when open and not admin
  useEffect(() => {
    if (isOpen && !showAdminFeatures && typeof window !== 'undefined') {
      const blockContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      window.document.addEventListener('contextmenu', blockContextMenu, true);

      return () => {
        window.document.removeEventListener('contextmenu', blockContextMenu, true);
      };
    }
  }, [isOpen, showAdminFeatures]);

  const loadPreview = async () => {
    if (!documentData) return;

    setLoading(true);
    setError(null);

    try {
      const adminParam = showAdminFeatures ? '?admin=true' : '';
      const response = await fetch(`/api/docsecure/preview/${documentData.id}${adminParam}`);
      const result = await response.json();

      if (result.success && result.preview) {
        setPreviewData(result.preview);
      } else {
        setError(result.error || 'Failed to load document preview');
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentData) return;

    try {
      const response = await fetch(`/api/docsecure/download/${documentData.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = documentData.original_filename;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }
        
        a.download = filename;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        
        toast({
          title: "Téléchargement démarré",
          description: "Le document est en cours de téléchargement.",
        });
      } else {
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible de télécharger le document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-gray-600">Chargement de l'aperçu...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-red-400 mx-auto" />
            <p className="text-red-600">Erreur lors du chargement</p>
            <p className="text-sm text-gray-500">{error}</p>
            <Button onClick={loadPreview} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      );
    }

    if (!previewData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
            <p className="text-gray-600">Aucun aperçu disponible</p>
          </div>
        </div>
      );
    }

    switch (previewData.type) {
      case 'pdf':
        // For PDF files with admin access
        return (
          <SecurePDFViewer
            base64Content={previewData.content}
            isAdmin={true}
            documentTitle={documentData?.title || 'Document'}
          />
        );
      
      case 'pdf-secure':
        // For PDF files with regular user access (secure mode)
        return (
          <SecurePDFViewer
            base64Content={previewData.content}
            isAdmin={false}
            documentTitle={documentData?.title || 'Document'}
          />
        );
      
      case 'text':
        // For text content, display in a scrollable area
        return (
          <div className="w-full h-96 border rounded-lg bg-gray-50 p-4 overflow-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {previewData.content}
            </pre>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">Aperçu non disponible pour ce type de fichier</p>
              <p className="text-sm text-gray-500">Utilisez le bouton de téléchargement pour ouvrir le document</p>
            </div>
          </div>
        );
    }
  };

  if (!documentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl w-[90vw] max-h-[95vh] overflow-hidden" 
        style={{ aspectRatio: 'auto' }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-800 pr-4">
              {documentData.title}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">{documentData.original_filename}</p>
          </div>
          {showAdminFeatures && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {documentData.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">Description</p>
              <p className="text-sm text-gray-700">{documentData.description}</p>
            </div>
          )}

          {/* Preview content */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-700">Aperçu du document</p>
            </div>
            <div className="p-4">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}