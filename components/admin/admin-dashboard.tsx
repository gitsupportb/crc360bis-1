"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  LogOut, 
  Mail, 
  FileText, 
  Shield, 
  ExternalLink,
  User,
  Clock,
  Activity
} from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  user: { username: string; role: string } | null
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const { toast } = useToast()

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    })
    onLogout()
  }

  const adminTools = [
    {
      title: "Email Admin",
      description: "Gestion des notifications email et des assignations de rapports",
      icon: Mail,
      href: "/email-admin.html",
      external: true,
      color: "from-blue-500 to-blue-600",
      features: [
        "Planification des notifications",
        "Gestion des assignations",
        "Historique des emails",
        "Configuration SMTP"
      ]
    },
    {
      title: "DOC Secure Admin",
      description: "Administration complète du système de gestion documentaire",
      icon: FileText,
      href: "/docsecure/admin",
      external: false,
      color: "from-green-500 to-green-600",
      features: [
        "Gestion des documents",
        "Téléchargement et suppression",
        "Statistiques système",
        "Configuration sécurité"
      ]
    }
  ]

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #FFF8F5 0%, #FFF0E6 50%, #FFB366 100%)'
    }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
              }}>
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BCP2S Admin Portal</h1>
                <p className="text-sm text-gray-600">Portail d'administration centralisé</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.username}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              
              <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                <Button variant="ghost" size="sm">
                  ← Retour au Dashboard
                </Button>
              </Link>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bienvenue, {user?.username}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Accédez aux outils d'administration pour gérer l'ensemble du système BCP2S.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {adminTools.map((tool, index) => (
            <Card key={index} className="border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{tool.title}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Fonctionnalités principales:</h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4">
                  {tool.external ? (
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300`}
                      >
                        <span>Accéder à {tool.title}</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={tool.href} className="w-full">
                      <Button 
                        className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300`}
                      >
                        Accéder à {tool.title}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="h-5 w-5 text-orange-600" />
                État du système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">Email System</p>
                    <p className="text-sm text-green-600">Opérationnel</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">DOC Secure</p>
                    <p className="text-sm text-green-600">Opérationnel</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Dernière connexion</p>
                    <p className="text-sm text-blue-600">{new Date().toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
