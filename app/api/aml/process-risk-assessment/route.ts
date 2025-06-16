import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

// Enhanced risk assessment data extraction
function extractRiskAssessmentData(buffer: Buffer): any {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const clients: any[] = [];
    
    // Known risk categories for better detection
    const knownCategories = [
      'Zone géographique',
      'Caractéristiques du client',
      'Réputation du client',
      'Nature produits/opérations',
      'Canal de distribution'
    ];

    workbook.SheetNames.forEach(sheetName => {
      // Skip non-client sheets
      const skipSheets = ['Instructions', 'Guide', 'Template', 'Index', 'Profil de risque'];
      if (skipSheets.includes(sheetName)) {
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');
      
      // Extract client information
      const clientInfo = {
        name: sheetName,
        riskLevel: 'Faible',
        updateDate: '',
        assessmentDate: '',
        riskFactors: [],
        categories: [],
        additionalInfo: {}
      };

      // Search for client name in header area
      for (let row = 0; row < Math.min(10, range.e.r); row++) {
        for (let col = 0; col < Math.min(10, range.e.c); col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          
          if (cell && cell.v && typeof cell.v === 'string') {
            const cellValue = cell.v.trim();
            
            // Look for client names
            if (cellValue.length > 5 && 
                (cellValue.includes('BANK') || cellValue.includes('SECURITIES') || 
                 cellValue.includes('AMAL') || cellValue.includes('CLIENT'))) {
              clientInfo.name = cellValue;
            }
          }
        }
      }

      // Extract risk assessment data from the main table (typically A8:E25)
      const startRow = 7; // Row 8 in Excel (0-indexed)
      const endRow = Math.min(24, range.e.r); // Row 25 or sheet end
      
      let currentCategory = null;
      
      for (let row = startRow; row <= endRow; row++) {
        const rowData: any = {};
        let hasData = false;
        
        // Extract data from columns A to E
        for (let col = 0; col <= 4; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          const colLetter = String.fromCharCode(65 + col); // A, B, C, D, E
          
          if (cell && cell.v !== undefined) {
            rowData[colLetter] = cell.v;
            hasData = true;
          }
        }
        
        if (hasData && rowData.A) {
          const factorName = String(rowData.A).trim();
          
          // Check if this is a category header
          const isCategory = knownCategories.some(cat => 
            factorName === cat || 
            factorName.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(factorName.toLowerCase())
          );
          
          if (isCategory) {
            currentCategory = {
              name: factorName,
              rating: rowData.E || 'Faible',
              factors: []
            };
            clientInfo.categories.push(currentCategory);
          } else if (currentCategory) {
            // This is a risk factor under the current category
            const profile = [rowData.B, rowData.C, rowData.D]
              .filter(val => val && String(val).trim() && 
                      !['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(String(val).trim()))
              .map(val => String(val).trim())
              .join(' ');
            
            const factor = {
              name: factorName,
              profile: profile || 'Non spécifié',
              rating: rowData.E || currentCategory.rating || 'Faible'
            };
            
            currentCategory.factors.push(factor);
            clientInfo.riskFactors.push(factor);
          }
        }
      }

      // Extract risk level from bottom of sheet
      for (let row = Math.max(endRow, range.e.r - 10); row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          
          if (cell && cell.v && typeof cell.v === 'string') {
            const cellValue = cell.v.trim();
            
            if (cellValue.toLowerCase().includes('niveau risque') || 
                cellValue.toLowerCase().includes('risk level')) {
              // Look for risk value in adjacent cells
              for (let riskCol = col + 1; riskCol <= Math.min(col + 3, range.e.c); riskCol++) {
                const riskAddress = XLSX.utils.encode_cell({ r: row, c: riskCol });
                const riskCell = sheet[riskAddress];
                
                if (riskCell && riskCell.v && 
                    ['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(String(riskCell.v).trim())) {
                  clientInfo.riskLevel = String(riskCell.v).trim();
                  if (clientInfo.riskLevel === 'Elevé') {
                    clientInfo.riskLevel = 'Élevé';
                  }
                  break;
                }
              }
            }
          }
        }
      }

      // Extract dates
      for (let row = 0; row <= Math.min(15, range.e.r); row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          
          if (cell && cell.v && typeof cell.v === 'string') {
            const cellValue = cell.v.trim().toLowerCase();
            
            if (cellValue.includes('date de maj') || cellValue.includes('update date')) {
              const dateAddress = XLSX.utils.encode_cell({ r: row, c: col + 1 });
              const dateCell = sheet[dateAddress];
              if (dateCell && dateCell.v) {
                clientInfo.updateDate = dateCell.v;
              }
            } else if (cellValue.includes("date d'eer") || cellValue.includes('assessment date')) {
              const dateAddress = XLSX.utils.encode_cell({ r: row, c: col + 1 });
              const dateCell = sheet[dateAddress];
              if (dateCell && dateCell.v) {
                clientInfo.assessmentDate = dateCell.v;
              }
            }
          }
        }
      }

      // Add data quality metrics
      clientInfo.dataQuality = {
        categoriesFound: clientInfo.categories.length,
        factorsFound: clientInfo.riskFactors.length,
        hasValidRiskLevel: ['Faible', 'Moyen', 'Élevé'].includes(clientInfo.riskLevel),
        hasUpdateDate: !!clientInfo.updateDate,
        hasAssessmentDate: !!clientInfo.assessmentDate
      };

      clients.push(clientInfo);
    });

    return {
      success: true,
      clients: clients,
      metadata: {
        totalSheets: workbook.SheetNames.length,
        processedSheets: clients.length,
        extractionTimestamp: new Date().toISOString(),
        totalCategories: clients.reduce((sum, client) => sum + client.categories.length, 0),
        totalFactors: clients.reduce((sum, client) => sum + client.riskFactors.length, 0)
      }
    };

  } catch (error) {
    console.error('Error extracting risk assessment data:', error);
    return {
      success: false,
      error: error.message,
      clients: []
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('excelFile') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the uploaded file
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `risk-assessment-${Date.now()}.xlsx`);
    await writeFile(filePath, buffer);

    // Extract comprehensive risk assessment data
    const result = extractRiskAssessmentData(buffer);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to extract risk assessment data',
        details: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Risk assessment data extracted successfully',
      ...result
    });

  } catch (error) {
    console.error('Error processing risk assessment file:', error);
    return NextResponse.json({ 
      error: 'Failed to process risk assessment file',
      details: error.message 
    }, { status: 500 });
  }
}
