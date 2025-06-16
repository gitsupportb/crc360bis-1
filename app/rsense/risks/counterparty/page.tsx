"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CounterpartyOverview } from "@/app/rsense/components/counterparty-risk/overview"
import { LargeExposures } from "@/app/rsense/components/counterparty-risk/large-exposures"
import { ExposureBreakdown } from "@/app/rsense/components/counterparty-risk/exposure-breakdown"

export default function CounterpartyRiskPage() {
  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Risque de Contrepartie</h1>
        <span className="text-sm text-muted-foreground">31/12/2024</span>
      </div>

      <CounterpartyOverview />

      <Tabs defaultValue="large-exposures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="large-exposures">Grands Risques</TabsTrigger>
          <TabsTrigger value="exposure-breakdown">Analyse des Expositions</TabsTrigger>
        </TabsList>

        <TabsContent value="large-exposures" className="space-y-4">
          <LargeExposures />
        </TabsContent>

        <TabsContent value="exposure-breakdown" className="space-y-4">
          <ExposureBreakdown />
        </TabsContent>
      </Tabs>
    </div>
  )
}
