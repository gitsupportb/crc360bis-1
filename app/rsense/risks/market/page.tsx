"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketRiskOverview } from "@/app/rsense/components/market-risk/overview"
import { FixedIncomeAnalysis } from "@/app/rsense/components/market-risk/fixed-income"
import { StressTestResults } from "@/app/rsense/components/market-risk/stress-tests"
import { VaRAnalysis } from "@/app/rsense/components/market-risk/var-analysis"
import { RiskSensitivities } from "@/app/rsense/components/market-risk/sensitivities"

// Utility function to get current date
const getCurrentDate = () => {
  const now = new Date()
  return now.toLocaleDateString('fr-FR')
}

export default function MarketRiskPage() {
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
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Risque de Marché</h1>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px', fontWeight: 300, letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Market Risk Management</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>{getCurrentDate()}</div>
          <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <MarketRiskOverview />

        {/* Tabs - RepWatch Style */}
        <div className="bg-white rounded-lg border border-orange-200 shadow-lg overflow-hidden">
          <Tabs defaultValue="fixed-income" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-orange-50 border-b border-orange-200">
              <TabsTrigger
                value="fixed-income"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-orange-700 font-medium"
              >
                Instruments de Taux
              </TabsTrigger>
              <TabsTrigger
                value="var"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-orange-700 font-medium"
              >
                VaR & Stress Tests
              </TabsTrigger>
              <TabsTrigger
                value="sensitivities"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-orange-700 font-medium"
              >
                Sensibilités
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixed-income" className="space-y-4 p-6">
              <FixedIncomeAnalysis />
            </TabsContent>

            <TabsContent value="var" className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <VaRAnalysis />
                <StressTestResults />
              </div>
            </TabsContent>

            <TabsContent value="sensitivities" className="space-y-4 p-6">
              <RiskSensitivities />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
