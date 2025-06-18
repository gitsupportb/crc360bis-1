"use client"

import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Download, 
  Eye,
  Calendar,
  Activity,
  PieChart,
  Clock
} from "lucide-react"

export default function DocSecureAnalyticsPage() {
  const stats = {
    totalDocuments: 142,
    totalDownloads: 1247,
    totalViews: 3891,
    activeUsers: 28,
    documentsThisMonth: 15,
    downloadsThisMonth: 234,
    viewsThisMonth: 567,
    avgViewsPerDocument: 27.4
  }

  const topDocuments = [
    { name: "Guide d'utilisation CRM", views: 156, downloads: 89, category: "Guides" },
    { name: "Procédure ouverture compte", views: 134, downloads: 76, category: "Procédures" },
    { name: "Politique sécurité données", views: 98, downloads: 45, category: "Politiques" },
    { name: "Manuel trading platform", views: 87, downloads: 52, category: "Manuels" },
    { name: "Rapport conformité Q1", views: 76, downloads: 34, category: "Rapports" }
  ]

  const recentActivity = [
    { action: "Téléchargement", document: "Guide_CRM.pdf", user: "Marie Dubois", time: "Il y a 5 min" },
    { action: "Consultation", document: "Procédure_Compte.pdf", user: "Jean Martin", time: "Il y a 12 min" },
    { action: "Upload", document: "Nouveau_Manuel.docx", user: "Sophie Laurent", time: "Il y a 25 min" },
    { action: "Téléchargement", document: "Rapport_Q1.xlsx", user: "Pierre Durand", time: "Il y a 1h" },
    { action: "Consultation", document: "Politique_Sécurité.pdf", user: "Anne Moreau", time: "Il y a 2h" }
  ]

  const categoryStats = [
    { category: "Procédures", count: 45, percentage: 32, color: "bg-blue-500" },
    { category: "Guides", count: 28, percentage: 20, color: "bg-green-500" },
    { category: "Politiques", count: 25, percentage: 18, color: "bg-orange-500" },
    { category: "Rapports", count: 22, percentage: 15, color: "bg-purple-500" },
    { category: "Manuels", count: 22, percentage: 15, color: "bg-red-500" }
  ]

  return (
    <DocSecureDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}
          >
            <BarChart3 className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              Analytiques & Statistiques
            </h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Suivez l'utilisation et les performances de vos documents
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Documents</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalDocuments}</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{stats.documentsThisMonth} ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Téléchargements</CardTitle>
              <Download className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.totalDownloads.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{stats.downloadsThisMonth} ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Consultations</CardTitle>
              <Eye className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.totalViews.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{stats.viewsThisMonth} ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Utilisateurs Actifs</CardTitle>
              <Users className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.activeUsers}</div>
              <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                <Activity className="h-3 w-3" />
                <span>Cette semaine</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Documents */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Documents les plus consultés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{doc.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{doc.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Répartition par catégorie</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category.category}</span>
                      <span className="text-sm text-gray-500">{category.count} documents</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl">Activité récente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      activity.action === 'Téléchargement' ? 'bg-blue-100' :
                      activity.action === 'Consultation' ? 'bg-green-100' :
                      'bg-orange-100'
                    }`}>
                      {activity.action === 'Téléchargement' ? (
                        <Download className="h-4 w-4 text-blue-600" />
                      ) : activity.action === 'Consultation' ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.action} - {activity.document}
                      </p>
                      <p className="text-sm text-gray-500">par {activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DocSecureDashboardLayout>
  )
}
