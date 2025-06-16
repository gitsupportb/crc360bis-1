"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OperationalRiskOverview } from "@/app/rsense/components/operational-risk/overview"
import { IncidentTracking } from "@/app/rsense/components/operational-risk/incident-tracking"
import { PCADashboard } from "@/app/rsense/components/operational-risk/pca-dashboard"
import { ControlMatrix } from "@/app/rsense/components/operational-risk/control-matrix"

export default function OperationalRiskPage() {
  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Risque Opérationnel & PCA</h1>
        <span className="text-sm text-muted-foreground">31/12/2024</span>
      </div>

      <OperationalRiskOverview />

      <Tabs defaultValue="pca" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pca">Plan de Continuité d'Activité</TabsTrigger>
          <TabsTrigger value="incidents">Suivi des Incidents</TabsTrigger>
          <TabsTrigger value="controls">Matrice de Contrôle</TabsTrigger>
        </TabsList>

        <TabsContent value="pca" className="space-y-4">
          <PCADashboard />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <IncidentTracking />
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <ControlMatrix />
        </TabsContent>
      </Tabs>
    </div>
  )
}
