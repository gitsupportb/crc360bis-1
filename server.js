const express = require('express');
const next = require('next');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const stringSimilarity = require('string-similarity');
const xml2js = require('xml2js');

// Custom require for pdf-parse to handle pkg packaging
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.error('Error loading pdf-parse module:', error);
  pdfParse = null;
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3002;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Determine the base directory for the LBCFT WEBAPP
const lbcftBaseDir = path.join(__dirname, 'app', 'amlcenter');

// Ensure uploads directory exists
const uploadsDir = path.join(lbcftBaseDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Store the parsed PDF data
let pdfData = null;
let pdfFilePath = null;

// Store client risk assessment data
let clientData = null;
let clientCount = 0;

// Initialize with sample data for demonstration
function initializeSampleData() {
  if (!clientData) {
    clientData = [
      {
        name: "SOCIETE GENERALE MAROC",
        riskLevel: "Faible",
        updateDate: "2024-01-15",
        assessmentDate: "2024-01-10",
        dataQuality: {
          categoriesFound: 5,
          factorsFound: 12,
          hasValidRiskLevel: true
        },
        additionalInfo: {
          "Type de client": "Institution financière",
          "Pays": "Maroc",
          "Secteur": "Banque"
        },
        processedRiskTable: [
          {
            name: "Zone géographique",
            rating: "Faible",
            factors: [
              {
                name: "Maroc",
                profile: "Pays à faible risque BC/FT",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Caractéristiques du client",
            rating: "Faible",
            factors: [
              {
                name: "Institution financière",
                profile: "Banque réglementée",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Réputation du client",
            rating: "Faible",
            factors: [
              {
                name: "Bonne réputation",
                profile: "Aucun antécédent négatif",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Nature produits/opérations",
            rating: "Faible",
            factors: [
              {
                name: "Garde et administration des titres",
                profile: "Services de base",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Canal de distribution",
            rating: "Faible",
            factors: [
              {
                name: "Direct",
                profile: "Relation directe",
                rating: "Faible"
              }
            ]
          }
        ]
      },
      {
        name: "ATTIJARIWAFA BANK",
        riskLevel: "Moyen",
        updateDate: "2024-01-12",
        assessmentDate: "2024-01-08",
        dataQuality: {
          categoriesFound: 5,
          factorsFound: 10,
          hasValidRiskLevel: true
        },
        additionalInfo: {
          "Type de client": "Institution financière",
          "Pays": "Maroc",
          "Secteur": "Banque"
        },
        processedRiskTable: [
          {
            name: "Zone géographique",
            rating: "Faible",
            factors: [
              {
                name: "Maroc",
                profile: "Pays à faible risque BC/FT",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Caractéristiques du client",
            rating: "Moyen",
            factors: [
              {
                name: "Institution financière",
                profile: "Banque avec activités internationales",
                rating: "Moyen"
              }
            ]
          },
          {
            name: "Réputation du client",
            rating: "Faible",
            factors: [
              {
                name: "Bonne réputation",
                profile: "Aucun antécédent négatif",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Nature produits/opérations",
            rating: "Moyen",
            factors: [
              {
                name: "Services diversifiés",
                profile: "Garde, administration et services complexes",
                rating: "Moyen"
              }
            ]
          },
          {
            name: "Canal de distribution",
            rating: "Faible",
            factors: [
              {
                name: "Direct",
                profile: "Relation directe",
                rating: "Faible"
              }
            ]
          }
        ]
      },
      {
        name: "BMCE BANK",
        riskLevel: "Élevé",
        updateDate: "2024-01-10",
        assessmentDate: "2024-01-05",
        dataQuality: {
          categoriesFound: 5,
          factorsFound: 15,
          hasValidRiskLevel: true
        },
        additionalInfo: {
          "Type de client": "Institution financière",
          "Pays": "Maroc",
          "Secteur": "Banque"
        },
        processedRiskTable: [
          {
            name: "Zone géographique",
            rating: "Moyen",
            factors: [
              {
                name: "Maroc + International",
                profile: "Présence dans plusieurs pays",
                rating: "Moyen"
              }
            ]
          },
          {
            name: "Caractéristiques du client",
            rating: "Élevé",
            factors: [
              {
                name: "Institution financière complexe",
                profile: "Banque avec activités à haut risque",
                rating: "Élevé"
              }
            ]
          },
          {
            name: "Réputation du client",
            rating: "Faible",
            factors: [
              {
                name: "Bonne réputation",
                profile: "Aucun antécédent négatif",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Nature produits/opérations",
            rating: "Élevé",
            factors: [
              {
                name: "Produits complexes",
                profile: "Services à haut risque BC/FT",
                rating: "Élevé"
              }
            ]
          },
          {
            name: "Canal de distribution",
            rating: "Moyen",
            factors: [
              {
                name: "Multiple",
                profile: "Canaux diversifiés",
                rating: "Moyen"
              }
            ]
          }
        ]
      },
      {
        name: "BANK AL AMAL",
        riskLevel: "Faible",
        updateDate: "2024-01-15",
        assessmentDate: "2024-01-10",
        dataQuality: {
          categoriesFound: 5,
          factorsFound: 15,
          hasValidRiskLevel: true
        },
        additionalInfo: {
          "Type de client": "Institution financière",
          "Pays": "Maroc",
          "Secteur": "Banque"
        },
        processedRiskTable: [
          {
            name: "Zone géographique",
            rating: "Faible",
            factors: [
              {
                name: "Pays d'enregistrement du client",
                profile: "Maroc",
                rating: "Faible"
              },
              {
                name: "Pays de résidence du(es) Bénéficiaire(s) Effectif(s) (Le pays le plus risqué)",
                profile: "Maroc",
                rating: "Faible"
              },
              {
                name: "Pays d'ouverture du compte",
                profile: "Maroc",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Caractéristiques du client",
            rating: "Faible",
            factors: [
              {
                name: "Secteur d'activité du client",
                profile: "Etablissement de crédit",
                rating: "Faible"
              },
              {
                name: "Le client est-t-il une société côtée en bourse ?",
                profile: "Non",
                rating: "Faible"
              },
              {
                name: "Le client est-t-il une société faisant appel public à l'épargne ?",
                profile: "Non",
                rating: "Faible"
              },
              {
                name: "L'état exerce t-il un contrôle sur le client ?",
                profile: "Non",
                rating: "Faible"
              },
              {
                name: "Etablissement soumis à la réglementation LCB-FT (BAM & ANRF)",
                profile: "Oui",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Réputation du client",
            rating: "Faible",
            factors: [
              {
                name: "Nombre de Déclarations de Soupçon à l'encontre du client",
                profile: "0",
                rating: "Faible"
              },
              {
                name: "Les Bénéficiaires Effectifs, actionnaires ou dirigeants du client sont-ils des PPE ?",
                profile: "Non",
                rating: "Faible"
              },
              {
                name: "Le client fait-il l'objet d'une sanction, ou a-t-il des activités dans un pays sous embargo ?",
                profile: "Non",
                rating: "Faible"
              },
              {
                name: "Le client fait-il l'objet d'Information Négative ?",
                profile: "Non",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Nature produits/opérations",
            rating: "Faible",
            factors: [
              {
                name: "Garde et administration des titres",
                profile: "Services de base",
                rating: "Faible"
              },
              {
                name: "Opérations Sur Titres",
                profile: "Opérations standards",
                rating: "Faible"
              }
            ]
          },
          {
            name: "Canal de distribution",
            rating: "Faible",
            factors: [
              {
                name: "Direct",
                profile: "Relation directe",
                rating: "Faible"
              }
            ]
          }
        ]
      }
    ];
    clientCount = clientData.length;
    console.log(`Initialized with ${clientCount} sample clients for demonstration`);
  }
}

// Track processed names to avoid duplicates
const processedNames = new Set();

app.prepare().then(() => {
  const server = express();

  // Initialize sample data for demonstration
  initializeSampleData();

  // Set up EJS as the view engine for LBCFT WEBAPP routes
  server.set('view engine', 'ejs');
  server.set('views', path.join(lbcftBaseDir, 'views'));

  // Serve static files from the LBCFT WEBAPP public directory under /amlcenter
  server.use('/amlcenter', express.static(path.join(lbcftBaseDir, 'public')));

  // Body parser middleware
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // LBCFT WEBAPP Routes under /amlcenter

  // Home route for LBCFT WEBAPP
  server.get('/amlcenter', (req, res) => {
    const perPage = parseInt(req.query.perPage) || 20; // Default to 20 results per page
    const page = parseInt(req.query.page) || 1; // Default to page 1

    let displayData = pdfData;
    let totalPages = 1;
    let currentPage = 1;

    if (pdfData && perPage !== -1) {
      // Calculate pagination
      totalPages = Math.ceil(pdfData.length / perPage);
      currentPage = Math.min(Math.max(1, page), totalPages); // Ensure page is within valid range
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      displayData = pdfData.slice(startIndex, endIndex);
    }

    res.render('index', {
      pdfData: displayData,
      allPdfData: pdfData,
      perPage,
      currentPage,
      totalPages
    });
  });

  // Upload PDF route
  server.post('/amlcenter/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      pdfFilePath = req.file.path;
      console.log('PDF file path:', pdfFilePath);
      
      if (pdfParse) {
        const dataBuffer = fs.readFileSync(pdfFilePath);
        const data = await pdfParse(dataBuffer);
        
        // Process the PDF text to extract structured data
        pdfData = processPdfText(data.text);
        console.log(`PDF processed successfully. Found ${pdfData.length} entries.`);
      } else {
        console.log('PDF parsing not available - pdf-parse module not loaded');
        pdfData = [];
      }
      
      res.redirect('/amlcenter');
    } catch (error) {
      console.error('Error processing PDF:', error);
      res.status(500).send('Error processing PDF');
    }
  });

  // Upload XML route
  server.post('/amlcenter/upload-xml', upload.single('xmlFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const xmlFilePath = req.file.path;
      console.log('XML file path:', xmlFilePath);
      const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
      
      // Parse XML data
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(xmlData, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err);
          return res.status(500).send('Error parsing XML');
        }
        
        // Process the XML data to extract structured data
        pdfData = processXmlData(result);
        console.log(`XML processed successfully. Found ${pdfData.length} entries.`);
        
        res.redirect('/amlcenter');
      });
    } catch (error) {
      console.error('Error processing XML:', error);
      res.status(500).send('Error processing XML');
    }
  });

  // Search route
  server.get('/amlcenter/search', (req, res) => {
    const query = req.query.query || '';
    const idFilter = req.query.idFilter || '';
    const nameFilter = req.query.nameFilter || '';
    const typeFilter = req.query.typeFilter || '';
    const nationalityFilter = req.query.nationalityFilter || '';
    const perPage = parseInt(req.query.perPage) || 20;
    
    if (!pdfData) {
      return res.render('search', { 
        results: [], 
        query, 
        idFilter, 
        nameFilter, 
        typeFilter, 
        nationalityFilter, 
        perPage 
      });
    }
    
    const allResults = searchPdfData(pdfData, query, idFilter, nameFilter, typeFilter, nationalityFilter);
    const results = perPage === -1 ? allResults : allResults.slice(0, perPage);
    
    res.render('search', { 
      results, 
      query, 
      idFilter, 
      nameFilter, 
      typeFilter, 
      nationalityFilter, 
      perPage 
    });
  });

  // Client Space route
  server.get('/amlcenter/client-space', (req, res) => {
    res.render('client-space', { clientData, clientCount });
  });

  // Upload risk assessment route for client space
  server.post('/amlcenter/upload-risk-assessment', upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const excelFilePath = req.file.path;
      console.log('Excel file path:', excelFilePath);

      // Use Python script to process the Excel file
      const pythonScriptPath = path.join(__dirname, 'app', 'amlcenter', 'process_excel.py');

      const { spawn } = require('child_process');
      const pythonProcess = spawn('python', [pythonScriptPath, excelFilePath]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', errorString);
          return res.status(500).send('Error processing Excel file');
        }

        try {
          const result = JSON.parse(dataString);
          clientData = result.clients || [];
          clientCount = clientData.length;

          console.log(`Risk assessment processed successfully. Found ${clientCount} clients.`);
          res.redirect('/amlcenter/client-space');
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          console.error('Python output:', dataString);
          res.status(500).send('Error parsing processed data');
        }
      });

    } catch (error) {
      console.error('Error processing risk assessment:', error);
      res.status(500).send('Error processing risk assessment');
    }
  });

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> LBCFT WEBAPP available at http://${hostname}:${port}/amlcenter`);
  });
});

// Function to process risk assessment data from Excel
function processRiskAssessmentData(rawData) {
  if (!rawData || rawData.length === 0) {
    return [];
  }

  const clients = [];
  let currentClient = null;
  let isInRiskTable = false;
  let riskTableData = [];

  // Known risk categories to identify
  const knownCategories = [
    'Zone géographique',
    'Caractéristiques du client',
    'Réputation du client',
    'Nature produits/opérations',
    'Canal de distribution'
  ];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const cellA = String(row[0] || '').trim();
    const cellB = String(row[1] || '').trim();
    const cellC = String(row[2] || '').trim();

    // Check if this is a client header row
    if (cellA && cellA.toLowerCase().includes('client') && cellB) {
      // Save previous client if exists
      if (currentClient) {
        currentClient.extractedRiskData = riskTableData;
        currentClient.processedRiskTable = processRiskTable(riskTableData, knownCategories);
        clients.push(currentClient);
      }

      // Start new client
      currentClient = {
        name: cellB,
        riskLevel: 'Non défini',
        updateDate: new Date().toISOString().split('T')[0],
        assessmentDate: new Date().toISOString().split('T')[0],
        riskFactors: [],
        extractedRiskData: []
      };
      riskTableData = [];
      isInRiskTable = false;
    }
    // Check for risk level
    else if (cellA && cellA.toLowerCase().includes('niveau') && cellA.toLowerCase().includes('risque')) {
      if (currentClient && cellB) {
        currentClient.riskLevel = cellB;
      }
    }
    // Check for dates
    else if (cellA && cellA.toLowerCase().includes('date')) {
      if (currentClient && cellB) {
        if (cellA.toLowerCase().includes('maj')) {
          currentClient.updateDate = cellB;
        } else if (cellA.toLowerCase().includes('eer')) {
          currentClient.assessmentDate = cellB;
        }
      }
    }
    // Check if we're entering the risk assessment table
    else if (cellA && cellA.toLowerCase().includes('facteur') && cellA.toLowerCase().includes('risque')) {
      isInRiskTable = true;
    }
    // Process risk table data
    else if (isInRiskTable && currentClient) {
      // Check if this is a category row
      const isCategory = knownCategories.some(cat =>
        cellA.toLowerCase().includes(cat.toLowerCase())
      );

      if (cellA) {
        const riskRow = {
          A: cellA,
          B: cellB,
          C: cellC,
          D: row[3] ? String(row[3]).trim() : '',
          isCategory: isCategory,
          rating: extractRating(row)
        };
        riskTableData.push(riskRow);
      }
    }
  }

  // Don't forget the last client
  if (currentClient) {
    currentClient.extractedRiskData = riskTableData;
    currentClient.processedRiskTable = processRiskTable(riskTableData, knownCategories);
    clients.push(currentClient);
  }

  return clients;
}

// Helper function to extract rating from a row
function extractRating(row) {
  for (let i = 0; i < row.length; i++) {
    const cell = String(row[i] || '').trim().toLowerCase();
    if (cell === 'élevé' || cell === 'elevé' || cell === 'eleve') return 'Élevé';
    if (cell === 'moyen') return 'Moyen';
    if (cell === 'faible') return 'Faible';
  }
  return 'Non défini';
}

// Helper function to process risk table into structured format
function processRiskTable(riskTableData, knownCategories) {
  const processedCategories = [];
  let currentCategory = null;

  riskTableData.forEach(row => {
    if (row.isCategory) {
      // Save previous category
      if (currentCategory) {
        processedCategories.push(currentCategory);
      }

      // Start new category
      currentCategory = {
        name: row.A,
        rating: row.rating,
        factors: []
      };
    } else if (currentCategory && row.A) {
      // Add factor to current category
      currentCategory.factors.push({
        name: row.A,
        profile: [row.B, row.C, row.D].filter(Boolean).join(' '),
        rating: row.rating
      });
    }
  });

  // Don't forget the last category
  if (currentCategory) {
    processedCategories.push(currentCategory);
  }

  return processedCategories;
}

// Function to process PDF text into structured data
function processPdfText(text) {
  const entries = [];
  const processedIds = new Set();

  // Simple regex to extract basic information
  const lines = text.split('\n');
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for ID patterns like TAi.001, QDe.001, etc.
    const idMatch = line.match(/^([A-Z]{2,3}[ei]?)\.(\d{3})/);
    if (idMatch) {
      // Save previous entry
      if (currentEntry && !processedIds.has(currentEntry.id)) {
        entries.push(currentEntry);
        processedIds.add(currentEntry.id);
      }

      // Start new entry
      currentEntry = {
        id: `${idMatch[1]}.${idMatch[2]}`,
        name: '',
        type: idMatch[1].endsWith('e') ? 'entity' : 'person',
        nationality: '',
        listedOn: '',
        lastUpdated: '',
        otherInfo: ''
      };
    }

    // Extract name
    if (currentEntry && (line.includes('Name:') || line.includes('Nom:'))) {
      const nameMatch = line.match(/(?:Name|Nom):\s*(.+)/);
      if (nameMatch) {
        currentEntry.name = nameMatch[1].trim();
      }
    }

    // Extract other information
    if (currentEntry && line.includes('Other information:')) {
      const infoMatch = line.match(/Other information:\s*(.+)/);
      if (infoMatch) {
        currentEntry.otherInfo = infoMatch[1].trim();
      }
    }
  }

  // Don't forget the last entry
  if (currentEntry && !processedIds.has(currentEntry.id)) {
    entries.push(currentEntry);
  }

  return entries;
}

// Function to process XML data into structured data
function processXmlData(xmlData) {
  const entries = [];

  if (!xmlData || !xmlData.CONSOLIDATED_LIST) {
    console.error('XML data does not have the expected structure');
    return entries;
  }

  // Process individuals
  if (xmlData.CONSOLIDATED_LIST.INDIVIDUALS) {
    const individuals = Array.isArray(xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL)
      ? xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL
      : [xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL];

    individuals.forEach(individual => {
      if (individual && individual.DATAID) {
        entries.push({
          id: individual.DATAID,
          name: individual.FIRST_NAME ? `${individual.FIRST_NAME} ${individual.SECOND_NAME || ''}`.trim() : individual.SECOND_NAME || '',
          type: 'person',
          nationality: individual.NATIONALITY1 || '',
          listedOn: individual.LISTED_ON || '',
          lastUpdated: individual.LAST_DAY_UPDATED || '',
          dateOfBirth: individual.INDIVIDUAL_DATE_OF_BIRTH || '',
          placeOfBirth: individual.INDIVIDUAL_PLACE_OF_BIRTH || '',
          otherInfo: individual.COMMENTS1 || ''
        });
      }
    });
  }

  // Process entities
  if (xmlData.CONSOLIDATED_LIST.ENTITIES) {
    const entities = Array.isArray(xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY)
      ? xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY
      : [xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY];

    entities.forEach(entity => {
      if (entity && entity.DATAID) {
        entries.push({
          id: entity.DATAID,
          name: entity.FIRST_NAME || '',
          type: 'entity',
          nationality: entity.UN_LIST_TYPE || '',
          listedOn: entity.LISTED_ON || '',
          lastUpdated: entity.LAST_DAY_UPDATED || '',
          otherInfo: entity.COMMENTS1 || ''
        });
      }
    });
  }

  return entries;
}

// Function to search PDF data
function searchPdfData(data, query, idFilter, nameFilter, typeFilter, nationalityFilter) {
  if (!data) return [];

  return data.filter(entry => {
    // Apply filters
    if (idFilter && !entry.id.toLowerCase().includes(idFilter.toLowerCase())) return false;
    if (nameFilter && !entry.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (typeFilter && entry.type !== typeFilter) return false;
    if (nationalityFilter && !entry.nationality.toLowerCase().includes(nationalityFilter.toLowerCase())) return false;

    // Apply general query
    if (query) {
      const searchText = `${entry.id} ${entry.name} ${entry.nationality} ${entry.otherInfo || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    }

    return true;
  });
}
