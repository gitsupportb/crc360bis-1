"use client"

import { useState, useEffect } from "react"
import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, TrendingUp, Shield, Users, Activity, Loader2 } from "lucide-react"

interface DashboardStats {
  totalDocuments: number;
  procedures: number;
  modesEmploi: number;
  notesInternes: number;
  politiques: number;
  recentUpdates: number;
}

interface Document {
  id: number;
  title: string;
  original_filename: string;
  category: string;
  upload_date: string;
  last_modified: string;
}

export default function DocSecureDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats
      const statsResponse = await fetch('/api/docsecure/documents?action=stats')
      const statsResult = await statsResponse.json()
      
      // Load documents
      const docsResponse = await fetch('/api/docsecure/documents')
      const docsResult = await docsResponse.json()

      if (docsResult.success) {
        // Calculate stats from documents data
        const documents = docsResult.documents || []
        const calculatedStats: DashboardStats = {
          totalDocuments: documents.length,
          procedures: documents.filter((doc: Document) => doc.category === 'Procédures').length,
          modesEmploi: documents.filter((doc: Document) => doc.category === 'Modes d\'emploi').length,
          notesInternes: documents.filter((doc: Document) => doc.category === 'Notes internes').length,
          politiques: documents.filter((doc: Document) => doc.category === 'Politiques').length,
          recentUpdates: documents.filter((doc: Document) => {
            const lastWeek = new Date()
            lastWeek.setDate(lastWeek.getDate() - 7)
            return new Date(doc.last_modified) >= lastWeek
          }).length
        }
        
        // Use API stats if available, otherwise use calculated stats
        if (statsResult.success && statsResult.statistics) {
          setStats(statsResult.statistics)
        } else {
          setStats(calculatedStats)
        }
        
        // Get recent documents (last 6, sorted by last_modified)
        const sortedDocs = documents
          .sort((a: Document, b: Document) => 
            new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
          )
          .slice(0, 6)
        setRecentDocuments(sortedDocs)
      } else {
        setError('Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError('Erreur lors du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Procédures': return 'blue'
      case 'Modes d\'emploi': return 'purple'  
      case 'Notes internes': return 'green'
      case 'Politiques': return 'red'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <DocSecureDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </DocSecureDashboardLayout>
    )
  }

  if (error) {
    return (
      <DocSecureDashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Erreur de chargement</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DocSecureDashboardLayout>
    )
  }
  return (
    <DocSecureDashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}
          >
            <Shield className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              DOC SECURE
            </h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Plateforme de gestion de procédures et de documentation sécurisée
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card
            className="rounded-2xl border-0 transition-all duration-400 hover:transform hover:-translate-y-2 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Documents</CardTitle>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalDocuments || 0}</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-2 font-medium">
                <FileText className="h-3 w-3" />
                <span>Documents disponibles</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-0 transition-all duration-400 hover:transform hover:-translate-y-2 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(34, 197, 94, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Procédures</CardTitle>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.procedures || 0}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
                <Shield className="h-3 w-3" />
                <span>Procédures actives</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-0 transition-all duration-400 hover:transform hover:-translate-y-2 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(255, 107, 53, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Documents récents</CardTitle>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                }}
              >
                <Activity className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{recentDocuments.length}</div>
              <div className="flex items-center gap-1 text-xs text-orange-600 mt-2 font-medium">
                <Clock className="h-3 w-3" />
                <span>Dernière semaine</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card
          className="rounded-2xl border-0 transition-all duration-400"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(255, 107, 53, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                }}
              >
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Documents récemment mis à jour</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun document récent disponible</p>
                </div>
              ) : (
                recentDocuments.map((doc, i) => {
                  const color = getCategoryColor(doc.category)
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-white/90 hover:shadow-lg"
                      style={{
                        background: 'rgba(248, 250, 252, 0.8)',
                        border: '1px solid rgba(226, 232, 240, 0.5)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-1 h-10 rounded-full"
                          style={{
                            background: color === 'blue' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                       color === 'green' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                       color === 'purple' ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' :
                                       color === 'red' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                       'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                          }}
                        ></div>
                        <div>
                          <p className="font-semibold text-gray-800">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="px-3 py-1 text-xs font-semibold rounded-full"
                              style={{
                                background: color === 'blue' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%)' :
                                           color === 'green' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)' :
                                           color === 'purple' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)' :
                                           color === 'red' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)' :
                                           'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.15) 100%)',
                                color: color === 'blue' ? '#1e40af' :
                                       color === 'green' ? '#166534' :
                                       color === 'purple' ? '#6b21a8' :
                                       color === 'red' ? '#991b1b' : '#374151',
                                border: `1px solid ${color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                                                     color === 'green' ? 'rgba(34, 197, 94, 0.2)' :
                                                     color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                                                     color === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
                              }}
                            >
                              {doc.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">{formatDate(doc.last_modified)}</div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DocSecureDashboardLayout>
  )
}
