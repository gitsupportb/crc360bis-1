"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const assets = [
  {
    name: "Environmental Data",
    responsible: "Olivier Martin",
    priority: "high",
    assetType: "Information",
    controlsImplemented: "60.0%",
    actionsImplemented: "55.0%",
  },
  {
    name: "Client Data",
    responsible: "Sophie Dubois",
    priority: "medium",
    assetType: "Information",
    controlsImplemented: "80.0%",
    actionsImplemented: "75.0%",
  },
  {
    name: "Trading System",
    responsible: "Jean Dupont",
    priority: "high",
    assetType: "System",
    controlsImplemented: "100.0%",
    actionsImplemented: "100.0%",
  },
]

const priorityColors = {
  high: "destructive",
  medium: "warning",
  low: "success",
} as const

export function AssetRegister() {
  return (
    <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow)', marginTop: '20px', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'white' }}>
        <thead>
          <tr>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Name</th>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Responsible</th>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Priority</th>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Asset Type</th>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Controls Implemented</th>
            <th style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', fontWeight: 600, color: 'white', position: 'sticky', top: 0, zIndex: 10, textShadow: '0 1px 2px rgba(0,0,0,0.2)', borderBottom: '2px solid var(--primary-hover)', padding: '12px 8px', textAlign: 'left' }}>Actions Implemented (%)</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.name} style={{ transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>{asset.name}</td>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{asset.responsible}</td>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <span className={`status-badge ${asset.priority === 'high' ? 'status-overdue' : asset.priority === 'medium' ? 'status-pending' : 'status-completed'}`} style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: asset.priority === 'high' ? '#fee2e2' : asset.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                  color: asset.priority === 'high' ? '#991b1b' : asset.priority === 'medium' ? '#92400e' : '#166534'
                }}>
                  {asset.priority}
                </span>
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{asset.assetType}</td>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: asset.controlsImplemented,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                      borderRadius: '8px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{asset.controlsImplemented}</span>
                </div>
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: asset.actionsImplemented,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--success-color) 0%, #20c997 100%)',
                      borderRadius: '8px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{asset.actionsImplemented}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

