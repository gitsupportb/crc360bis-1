"use client";
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetRegister } from "@/app/rsense/components/asset-register"
import { RiskMatrix } from "@/app/rsense/components/risk-matrix"
import { ControlMeasures } from "@/app/rsense/components/control-measures"
import { AssetTypeChart } from "@/app/rsense/components/asset-type-chart"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Upload } from "lucide-react"

// Utility function to get current date
const getCurrentDate = () => {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

export default function DashboardPage() {
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null)
  const [importDate, setImportDate] = useState("")
  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '20px auto', background: 'var(--card-background)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>

      <div className="flex-1 space-y-4 p-6" style={{ background: 'var(--card-background)' }}>

        {/* Key Metrics - RepWatch Style */}
        <div className="progress-summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="summary-card" style={{ background: 'linear-gradient(135deg, var(--card-background) 0%, #FFF8F5 100%)', borderRadius: '15px', padding: '25px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
            <div style={{ content: '', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)' }}></div>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Treatment Activities Completed</h3>
            <div className="completion-percentage" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '8px', textShadow: '0 2px 4px rgba(255, 107, 53, 0.1)' }}>78.0%</div>
            <div className="completion-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, var(--card-background) 0%, #FFF8F5 100%)', borderRadius: '15px', padding: '25px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
            <div style={{ content: '', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)' }}></div>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ongoing Risk Treatment Activities</h3>
            <div className="completion-percentage" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '8px', textShadow: '0 2px 4px rgba(255, 107, 53, 0.1)' }}>14</div>
            <div className="completion-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, var(--card-background) 0%, #FFF8F5 100%)', borderRadius: '15px', padding: '25px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
            <div style={{ content: '', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)' }}></div>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Controls Implemented</h3>
            <div className="completion-percentage" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '8px', textShadow: '0 2px 4px rgba(255, 107, 53, 0.1)' }}>50.0%</div>
            <div className="completion-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Implemented</div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, var(--card-background) 0%, #FFF8F5 100%)', borderRadius: '15px', padding: '25px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
            <div style={{ content: '', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--danger-color) 0%, #FF6B6B 100%)' }}></div>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Controls Not Implemented</h3>
            <div className="completion-percentage" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger-color)', marginBottom: '8px', textShadow: '0 2px 4px rgba(220, 53, 69, 0.1)' }}>3</div>
            <div className="completion-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Implemented</div>
          </div>
        </div>

        {/* Asset Register - RepWatch Style */}
        <div className="chart-container" style={{ position: 'relative', background: 'white', borderRadius: '12px', padding: '20px', margin: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', padding: '15px 20px', margin: '-20px -20px 20px -20px', borderRadius: '12px 12px 0 0', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Asset Register</h2>
          </div>
          <AssetRegister />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ margin: '20px' }}>
          {/* Risk Matrix - RepWatch Style */}
          <div className="chart-container" style={{ position: 'relative', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', padding: '15px 20px', margin: '-20px -20px 20px -20px', borderRadius: '12px 12px 0 0', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Risk Matrix</h2>
            </div>
            <RiskMatrix />
          </div>

          {/* Control Measures - RepWatch Style */}
          <div className="chart-container" style={{ position: 'relative', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', padding: '15px 20px', margin: '-20px -20px 20px -20px', borderRadius: '12px 12px 0 0', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Control Measures Implemented</h2>
            </div>
            <ControlMeasures />
          </div>

          {/* Asset Type Distribution - RepWatch Style */}
          <div className="chart-container" style={{ position: 'relative', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', padding: '15px 20px', margin: '-20px -20px 20px -20px', borderRadius: '12px 12px 0 0', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Asset Type Distribution</h2>
            </div>
            <AssetTypeChart />
          </div>
        </div>
        {/* Import/Export Buttons - RepWatch Style */}
        <div className="flex justify-end space-x-4 mt-8" style={{ padding: '20px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderRadius: '12px', margin: '20px', border: '1px solid var(--border-color)' }}>
          <Popover>
            <PopoverTrigger asChild>
              <button className="download-btn" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', border: '2px solid var(--primary-color)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
                <Upload className="mr-2 h-4 w-4" />
                IMPORT
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" style={{ background: 'var(--card-background)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Import Data</h4>
                  <p className="text-sm text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>Select the type of data to import and specify the date.</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="type" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Type</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="col-span-2" style={{ padding: '8px 15px', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', background: 'white', color: 'var(--text-primary)', fontWeight: 500, transition: 'all 0.3s ease', width: '100%' }}>
                          {selectedImportType || "Select type"}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent style={{ background: 'var(--card-background)', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
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
                          <DropdownMenuItem key={type} onSelect={() => setSelectedImportType(type)} style={{ color: 'var(--text-primary)', padding: '8px 12px' }}>
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="date" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-2"
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                      style={{ padding: '8px 15px', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', background: 'white', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <button onClick={() => console.log(`Importing ${selectedImportType} for date ${importDate}`)} className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: 'white', border: '2px solid var(--primary-color)', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: 'var(--shadow)' }}>
                  Import
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="download-btn" style={{ background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%)', color: 'white', border: '2px solid var(--secondary-color)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
                <Download className="mr-2 h-4 w-4" />
                EXPORT
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ background: 'var(--card-background)', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
              <DropdownMenuItem onSelect={() => console.log("Exporting as PDF")} style={{ color: 'var(--text-primary)', padding: '8px 12px' }}>PDF</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Exporting as XLSX")} style={{ color: 'var(--text-primary)', padding: '8px 12px' }}>XLSX</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Exporting as CSV")} style={{ color: 'var(--text-primary)', padding: '8px 12px' }}>CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
