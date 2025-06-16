import { DocSecureDashboardLayout } from "@/components/docsecure/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, TrendingUp, Shield, Users, Activity } from "lucide-react"

export default function DocSecureDashboardPage() {
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
              <div className="text-3xl font-bold text-gray-900">142</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-2 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+6 depuis le mois dernier</span>
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
              <div className="text-3xl font-bold text-gray-900">58</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>+2 depuis le mois dernier</span>
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
              <CardTitle className="text-sm font-semibold text-gray-700">Mises à jour récentes</CardTitle>
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
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="flex items-center gap-1 text-xs text-orange-600 mt-2 font-medium">
                <Clock className="h-3 w-3" />
                <span>Cette semaine</span>
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
              {[
                { title: "Procédure d'ouverture de compte", type: "Procédures", date: "12 avril 2025", color: "blue" },
                { title: "Note interne sur la conformité", type: "Notes internes", date: "10 avril 2025", color: "green" },
                { title: "Mode d'emploi du logiciel de trading", type: "Modes d'emploi", date: "8 avril 2025", color: "purple" },
                { title: "Politique de sécurité des données", type: "Politiques", date: "5 avril 2025", color: "red" },
                { title: "Procédure de gestion des risques", type: "Procédures", date: "28 mars 2025", color: "blue" },
                { title: "Mode d'emploi du portail client", type: "Modes d'emploi", date: "25 mars 2025", color: "purple" },
              ].map((doc, i) => (
                <div
                  key={i}
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
                        background: doc.color === 'blue' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                   doc.color === 'green' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                   doc.color === 'purple' ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' :
                                   doc.color === 'red' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                   'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-800">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-3 py-1 text-xs font-semibold rounded-full"
                          style={{
                            background: doc.color === 'blue' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%)' :
                                       doc.color === 'green' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)' :
                                       doc.color === 'purple' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)' :
                                       doc.color === 'red' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)' :
                                       'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.15) 100%)',
                            color: doc.color === 'blue' ? '#1e40af' :
                                   doc.color === 'green' ? '#166534' :
                                   doc.color === 'purple' ? '#6b21a8' :
                                   doc.color === 'red' ? '#991b1b' : '#374151',
                            border: `1px solid ${doc.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                                                 doc.color === 'green' ? 'rgba(34, 197, 94, 0.2)' :
                                                 doc.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                                                 doc.color === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
                          }}
                        >
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">{doc.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DocSecureDashboardLayout>
  )
}
