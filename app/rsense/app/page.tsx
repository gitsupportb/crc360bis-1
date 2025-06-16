"use client";
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetRegister } from "../components/asset-register"
import { RiskMatrix } from "../components/risk-matrix"
import { ControlMeasures } from "../components/control-measures"
import { AssetTypeChart } from "../components/asset-type-chart"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Upload } from "lucide-react"

export default function DashboardPage() {
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null)
  const [importDate, setImportDate] = useState("")
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
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>16/06/2023</div>
          <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white pb-3">
            <CardTitle className="text-sm font-medium text-white">Position Totale</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">4,460,184 KMAD</div>
            <p className="text-xs text-gray-500 mt-1">Portefeuille propre</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white pb-3">
            <CardTitle className="text-sm font-medium text-white">Résultat de Gestion</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">3,038 KMAD</div>
            <p className="text-xs text-gray-500 mt-1">Revenus nets</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white pb-3">
            <CardTitle className="text-sm font-medium text-white">VaR (1, 99%)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">2,145 KMAD</div>
            <p className="text-xs text-gray-500 mt-1">Moyenne mensuelle</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white pb-3">
            <CardTitle className="text-sm font-medium text-white">Fonds Propres</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">373,112 KMAD</div>
            <p className="text-xs text-gray-500 mt-1">Actifs disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Button variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200">
          Instruments de Taux
        </Button>
        <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
          VaR & Stress Tests
        </Button>
        <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
          Sensibilités
        </Button>
      </div>

      {/* Portfolio Obligataire */}
      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
          <CardTitle className="text-white">Portefeuille Obligataire</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AssetRegister />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {/* Profil de Maturité */}
        <Card className="border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
            <CardTitle className="text-white">Profil de Maturité</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AssetTypeChart />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200">
              <Upload className="mr-2 h-4 w-4" />
              IMPORT
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-orange-200">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-orange-700">Import Data</h4>
                <p className="text-sm text-gray-600">Select the type of data to import and specify the date.</p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="type" className="text-gray-700">Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="col-span-2 border-orange-200">
                        {selectedImportType || "Select type"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border-orange-200">
                      {[
                        "Bilan",
                        "PTF Investissement",
                        "PTF Transaction",
                        "PTF Placements",
                        "PTF OPCVM Actions",
                        "PTF Titres",
                        "ETAT DAT",
                        "Etat Emprunts",
                        "Etat REPO",
                        "Etat REVREPO",
                        "Etat Prets",
                      ].map((type) => (
                        <DropdownMenuItem key={type} onSelect={() => setSelectedImportType(type)}>
                          {type}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="date" className="text-gray-700">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-2 border-orange-200"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => console.log(`Importing ${selectedImportType} for date ${importDate}`)}
                className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
              >
                Import
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200">
              <Download className="mr-2 h-4 w-4" />
              EXPORT
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-orange-200">
            <DropdownMenuItem onSelect={() => console.log("Exporting as PDF")}>PDF</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Exporting as XLSX")}>XLSX</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Exporting as CSV")}>CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

