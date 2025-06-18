"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Wallet, AlertTriangle, ScrollText, LineChart, FileBarChart, Network } from "lucide-react"

const analyses = [
  {
    title: "Analyse des Risques de Crédit",
    description: "Évaluation de la capacité des contreparties à honorer leurs obligations financières",
    icon: Wallet,
    href: "/rsense/analytics/credit",
    color: "bg-blue-500/10 hover:bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Analyse des Risques de Marché",
    description: "Mesure de l'exposition aux fluctuations des prix des instruments financiers",
    icon: LineChart,
    href: "/rsense/analytics/market",
    color: "bg-orange-500/10 hover:bg-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    title: "Analyse des Risques de Liquidité",
    description: "Évaluation de la capacité à répondre aux obligations financières à court terme",
    icon: BarChart3,
    href: "/rsense/analytics/liquidity",
    color: "bg-green-500/10 hover:bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Analyse des Risques Opérationnels",
    description: "Identification des risques liés aux processus internes et externes",
    icon: AlertTriangle,
    href: "/rsense/analytics/operational",
    color: "bg-red-500/10 hover:bg-red-500/20",
    iconColor: "text-red-500",
  },
  {
    title: "Analyse des Risques de Conformité",
    description: "Vérification de la conformité aux réglementations en vigueur",
    icon: ScrollText,
    href: "/rsense/analytics/compliance",
    color: "bg-purple-500/10 hover:bg-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Stress Tests et Analyses de Scénarios",
    description: "Simulation de scénarios extrêmes pour évaluer la résilience",
    icon: FileBarChart,
    href: "/rsense/analytics/stress-tests",
    color: "bg-yellow-500/10 hover:bg-yellow-500/20",
    iconColor: "text-yellow-500",
  },
  {
    title: "Analyse des Risques de Concentration",
    description: "Évaluation des expositions significatives par contrepartie et secteur",
    icon: Network,
    href: "/rsense/analytics/concentration",
    color: "bg-indigo-500/10 hover:bg-indigo-500/20",
    iconColor: "text-indigo-500",
  },
]

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6">
      {/* Header Section - RepWatch Style */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB366 100%)',
        color: 'white',
        padding: '25px 35px',
        margin: '-30px -30px 30px -30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(255, 107, 53, 0.1), 0 10px 10px -5px rgba(255, 107, 53, 0.04)',
        borderRadius: '0'
      }}>
        {/* Background Pattern */}
        <div style={{
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="15" cy="15" r="2" fill="white" opacity="0.15"/><circle cx="85" cy="35" r="1.5" fill="white" opacity="0.12"/><circle cx="45" cy="75" r="1" fill="white" opacity="0.08"/><rect x="20" y="25" width="8" height="2" fill="white" opacity="0.1"/><rect x="30" y="23" width="8" height="4" fill="white" opacity="0.08"/><rect x="40" y="20" width="8" height="7" fill="white" opacity="0.1"/><rect x="50" y="18" width="8" height="9" fill="white" opacity="0.08"/><path d="M65,30 L70,25 L75,28 L80,22 L85,26" stroke="white" stroke-width="1" fill="none" opacity="0.12"/></svg>')`,
          zIndex: 0
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Analyses des Risques</h1>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px', fontWeight: 300, letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Sélectionnez un type d'analyse pour accéder aux rapports détaillés</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
        </div>
      </div>
      {/* Analysis Cards Grid - RepWatch Style */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <Card key={analysis.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <analysis.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-white">{analysis.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                {analysis.description}
              </CardDescription>
              <Link href={analysis.href}>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                  Accéder à l'analyse
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Reports Card - RepWatch Style */}
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
          <CardTitle className="text-xl font-bold text-white">Rapports Personnalisés</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CardDescription className="text-gray-600 mb-6 leading-relaxed">
            Créez des analyses personnalisées en combinant différents indicateurs de risque
          </CardDescription>
          <Button className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
            Créer un nouveau rapport
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
