"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StressTestOverview } from "@/app/rsense/components/stress-tests/overview"
import { CreditRiskStressTest } from "@/app/rsense/components/stress-tests/credit-risk"
import { ConcentrationRiskStressTest } from "@/app/rsense/components/stress-tests/concentration-risk"
import { CountryRiskStressTest } from "@/app/rsense/components/stress-tests/country-risk"
import { MarketRiskStressTest } from "@/app/rsense/components/stress-tests/market-risk"
import { LiquidityRiskStressTest } from "@/app/rsense/components/stress-tests/liquidity-risk"
import { MacroStressTest } from "@/app/rsense/components/stress-tests/macro-stress"
import { RealEstateStressTest } from "@/app/rsense/components/stress-tests/real-estate"

export default function StressTestsPage() {
  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stress Tests Réglementaires</h1>
          <p className="text-sm text-muted-foreground">Au 30 Juin 2024 - BCP Securities Services</p>
        </div>
      </div>

      <StressTestOverview />

      <Tabs defaultValue="credit" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-7 w-full">
          <TabsTrigger value="credit">Crédit</TabsTrigger>
          <TabsTrigger value="concentration">Concentration</TabsTrigger>
          <TabsTrigger value="country">Pays</TabsTrigger>
          <TabsTrigger value="market">Marché</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidité</TabsTrigger>
          <TabsTrigger value="macro">Macro</TabsTrigger>
          <TabsTrigger value="realestate">Immobilier</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          <CreditRiskStressTest />
        </TabsContent>

        <TabsContent value="concentration" className="space-y-4">
          <ConcentrationRiskStressTest />
        </TabsContent>

        <TabsContent value="country" className="space-y-4">
          <CountryRiskStressTest />
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <MarketRiskStressTest />
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <LiquidityRiskStressTest />
        </TabsContent>

        <TabsContent value="macro" className="space-y-4">
          <MacroStressTest />
        </TabsContent>

        <TabsContent value="realestate" className="space-y-4">
          <RealEstateStressTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}
