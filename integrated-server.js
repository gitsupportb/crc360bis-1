const express = require('express');
const next = require('next');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const stringSimilarity = require('string-similarity');
const xml2js = require('xml2js');

// Next.js setup
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

// Custom require for pdf-parse to handle pkg packaging
let pdfParse;
try {
  // When running as an executable, use an absolute path
  if (process.pkg) {
    // Use path.join to ensure proper path resolution
    const pdfParsePath = path.join(path.dirname(process.execPath), 'node_modules', 'pdf-parse');
    pdfParse = require(pdfParsePath);
  } else {
    // Normal require when running in development
    pdfParse = require('pdf-parse');
  }
} catch (error) {
  console.error('Error loading pdf-parse module:', error);
  // Fallback to standard require
  pdfParse = require('pdf-parse');
}

// Determine the base directory for the application
// This ensures paths work correctly both in development and when packaged as an executable
const isPackaged = process.pkg !== undefined;
const baseDir = isPackaged ? path.dirname(process.execPath) : __dirname;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'app', 'amlcenter', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Wrap everything in Next.js prepare
nextApp.prepare().then(() => {
  const app = express();

  // Set up EJS as the view engine for LBCFT WEBAPP
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'app', 'amlcenter', 'views'));

  // Set up static file serving for LBCFT WEBAPP under /amlcenter
  app.use('/amlcenter', express.static(path.join(__dirname, 'app', 'amlcenter', 'public')));

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

// Track processed names to avoid duplicates
const processedNames = new Set();

// Function to auto-load the most recent XML file on startup
function autoLoadLatestXML() {
  try {
    const files = fs.readdirSync(uploadsDir);
    const xmlFiles = files.filter(file => file.endsWith('.xml'));

    if (xmlFiles.length > 0) {
      // Sort by modification time and get the most recent
      const xmlFilesWithStats = xmlFiles.map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return { file, path: filePath, mtime: stats.mtime };
      });

      xmlFilesWithStats.sort((a, b) => b.mtime - a.mtime);
      const latestXmlFile = xmlFilesWithStats[0];

      console.log(`Auto-loading latest XML file: ${latestXmlFile.file}`);

      const xmlData = fs.readFileSync(latestXmlFile.path, 'utf8');
      const parser = new xml2js.Parser({ explicitArray: false });

      parser.parseString(xmlData, (err, result) => {
        if (err) {
          console.error('Error parsing auto-loaded XML:', err);
          return;
        }

        pdfData = processXmlData(result);
        console.log(`✅ Auto-loaded XML file successfully. Found ${pdfData.length} entries.`);
      });
    } else {
      console.log('No XML files found for auto-loading.');
    }
  } catch (error) {
    console.error('Error auto-loading XML file:', error);
  }
}

// Auto-load the latest XML file on startup
autoLoadLatestXML();

// AML Center route - main LBCFT WEBAPP interface
app.get('/amlcenter', (req, res) => {
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

// Upload PDF route for /amlcenter
app.post('/amlcenter/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    pdfFilePath = req.file.path;
    console.log('PDF file path:', pdfFilePath);
    const dataBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdfParse(dataBuffer);

    // Process the PDF text to extract structured data
    pdfData = processPdfText(data.text);

    res.redirect('/amlcenter');
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).send('Error processing PDF');
  }
});

// Upload XML route for /amlcenter
app.post('/amlcenter/upload-xml', upload.single('xmlFile'), async (req, res) => {
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

      res.redirect('/amlcenter');
    });
  } catch (error) {
    console.error('Error processing XML:', error);
    res.status(500).send('Error processing XML');
  }
});

// Upload Excel and match route for /amlcenter
app.post('/amlcenter/match-excel', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    if (!pdfData) {
      return res.status(400).send('Please upload a PDF file first');
    }

    const excelFilePath = req.file.path;
    console.log('Excel file path:', excelFilePath);
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    // Perform matching between PDF data and Excel data
    const matchResults = matchData(pdfData, excelData);
    
    res.render('results', { 
      pdfData: pdfData, 
      excelData: excelData, 
      matchResults: matchResults 
    });
  } catch (error) {
    console.error('Error matching data:', error);
    res.status(500).send('Error matching data');
  }
});

// Search route for /amlcenter
app.get('/amlcenter/search', (req, res) => {
  const query = req.query.query || '';
  const idFilter = req.query.idFilter || '';
  const nameFilter = req.query.nameFilter || '';
  const typeFilter = req.query.typeFilter || '';
  const nationalityFilter = req.query.nationalityFilter || '';
  const perPage = parseInt(req.query.perPage) || 20; // Default to 20 results per page
  
  if (!pdfData) {
    return res.render('search', { 
      results: [], 
      query: query, 
      idFilter, 
      nameFilter, 
      typeFilter, 
      nationalityFilter, 
      perPage 
    });
  }
  
  const allResults = searchPdfData(pdfData, query, idFilter, nameFilter, typeFilter, nationalityFilter);
  
  // Apply pagination if perPage is not -1 (which means show all)
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

// Client Space route for /amlcenter
app.get('/amlcenter/client-space', (req, res) => {
  res.render('client-space', { clientData, clientCount });
});

// Test route to process an existing Excel file
app.get('/amlcenter/test-existing-file', async (req, res) => {
  try {
    const testFilePath = 'app/amlcenter/uploads/excelFile-1749842051636.xlsx';
    console.log('Testing with existing file:', testFilePath);

    const processedData = await processExcelFile(testFilePath);
    console.log('Test processing result:', processedData);

    if (processedData && processedData.clients) {
      clientData = processedData.clients;
      clientCount = clientData.length;
      console.log(`Test: Successfully processed ${clientCount} clients`);
      res.redirect('/amlcenter/client-space');
    } else {
      res.send('Test failed: No client data found');
    }
  } catch (error) {
    console.error('Test error:', error);
    res.send('Test error: ' + error.message);
  }
});

// Function to handle merged cells in Excel sheets
function expandMergedCells(worksheet, XLSX) {
  if (!worksheet['!merges']) {
    return worksheet; // No merged cells to process
  }

  // Create a copy of the worksheet to avoid modifying the original
  const expandedSheet = { ...worksheet };

  console.log(`Processing ${worksheet['!merges'].length} merged cell ranges...`);

  // Process each merged cell range
  worksheet['!merges'].forEach((merge, index) => {
    const startRow = merge.s.r;
    const endRow = merge.e.r;
    const startCol = merge.s.c;
    const endCol = merge.e.c;

    // Get the value from the top-left cell of the merged range
    const topLeftCellRef = XLSX.utils.encode_cell({ r: startRow, c: startCol });
    const topLeftValue = worksheet[topLeftCellRef];

    if (topLeftValue && topLeftValue.v) {
      console.log(`Merge ${index + 1}: ${XLSX.utils.encode_cell(merge.s)}:${XLSX.utils.encode_cell(merge.e)} = "${topLeftValue.v}"`);

      // Expand this value to all cells in the merged range
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

          // Always set the value, even if the cell already exists
          expandedSheet[cellRef] = {
            v: topLeftValue.v,
            t: topLeftValue.t || 's',
            w: topLeftValue.w || String(topLeftValue.v)
          };
        }
      }
    }
  });

  return expandedSheet;
}

// Function to process Excel file using JavaScript xlsx library
function processExcelFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const XLSX = require('xlsx');
      const fs = require('fs');

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`File ${filePath} does not exist`));
      }

      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      const clients = [];

      // Known categories for better detection
      const KNOWN_CATEGORIES = [
        'Zone géographique',
        'Caractéristiques du client',
        'Réputation du client',
        'Nature produits/opérations',
        'Canal de distribution'
      ];

      // List of sheets to skip
      const skipSheets = ['Instructions', 'Guide', 'Template', 'Index', 'Profil de risque'];

      // Process each sheet
      workbook.SheetNames.forEach(sheetName => {
        try {
          // Skip known non-client sheets
          if (skipSheets.includes(sheetName)) {
            console.log(`Skipping non-client sheet: ${sheetName}`);
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            console.log(`Sheet ${sheetName} is empty or invalid`);
            return;
          }

          // Log merged cell information for debugging
          if (worksheet['!merges']) {
            console.log(`Sheet ${sheetName} has ${worksheet['!merges'].length} merged cell ranges:`);
            worksheet['!merges'].forEach((merge, index) => {
              const startCell = XLSX.utils.encode_cell(merge.s);
              const endCell = XLSX.utils.encode_cell(merge.e);
              console.log(`  Merge ${index + 1}: ${startCell}:${endCell}`);
            });
          } else {
            console.log(`Sheet ${sheetName} has no merged cells`);
          }

          // Expand merged cells before processing
          const expandedWorksheet = expandMergedCells(worksheet, XLSX);

          // Convert sheet to JSON with range A1:Z100 to ensure we get enough data
          const jsonData = XLSX.utils.sheet_to_json(expandedWorksheet, {
            header: 1,
            range: 'A1:Z100',
            defval: null
          });

          if (!jsonData || jsonData.length < 10) {
            console.log(`Sheet ${sheetName} has insufficient data`);
            return;
          }

          console.log(`Processing sheet: ${sheetName}`);

          // Extract client information
          const clientInfo = extractClientInfo(jsonData, sheetName);

          // Extract risk data from range A8:E25 (rows 7-24 in 0-based indexing)
          const riskData = extractRiskData(jsonData, 7, 24, KNOWN_CATEGORIES);

          // Process the risk table
          const processedRiskTable = processRiskTable(riskData, KNOWN_CATEGORIES);

          // Create client object
          const client = {
            name: clientInfo.name,
            riskLevel: clientInfo.riskLevel,
            updateDate: clientInfo.updateDate,
            assessmentDate: clientInfo.assessmentDate,
            processedRiskTable: processedRiskTable,
            extractedRiskData: riskData,
            knownCategories: KNOWN_CATEGORIES
          };

          clients.push(client);
          console.log(`Processed client: ${client.name} with ${processedRiskTable.length} risk categories`);

        } catch (error) {
          console.error(`Error processing sheet ${sheetName}:`, error.message);
        }
      });

      resolve({ clients: clients });

    } catch (error) {
      console.error('Error processing Excel file:', error.message);
      reject(error);
    }
  });
}

// Helper function to extract client information
function extractClientInfo(jsonData, sheetName) {
  let clientName = sheetName;
  let riskLevel = 'Faible';
  let updateDate = '';
  let assessmentDate = '';

  // Try to find client name in first few rows
  for (let row = 0; row < Math.min(10, jsonData.length); row++) {
    const rowData = jsonData[row];
    if (rowData) {
      for (let col = 0; col < Math.min(6, rowData.length); col++) {
        const cellValue = rowData[col];
        if (cellValue && typeof cellValue === 'string') {
          if (cellValue.includes('RED MED') || cellValue.includes('BANK AL AMAL') ||
              cellValue.includes('SECURITIES') || cellValue.includes('CLIENT') ||
              cellValue.includes('CUSTOMER')) {
            clientName = cellValue;
            break;
          }
        }
      }
    }
  }

  // Try to find risk level in last few rows
  for (let row = Math.max(0, jsonData.length - 15); row < jsonData.length; row++) {
    const rowData = jsonData[row];
    if (rowData && rowData[1] === 'Niveau risque' && rowData[5]) {
      riskLevel = rowData[5];
      break;
    }
  }

  // Try to find dates
  for (let row = 0; row < Math.min(50, jsonData.length); row++) {
    const rowData = jsonData[row];
    if (rowData) {
      if (rowData[6] === 'Date de MAJ' && rowData[7]) {
        updateDate = formatDate(rowData[7]);
      }
      if (rowData[6] === "Date d'EER" && rowData[7]) {
        assessmentDate = formatDate(rowData[7]);
      }
    }
  }

  return {
    name: clientName,
    riskLevel: riskLevel,
    updateDate: updateDate,
    assessmentDate: assessmentDate
  };
}

// Helper function to format dates
function formatDate(dateValue) {
  if (!dateValue) return '';

  // If it's already a string in the right format, return it
  if (typeof dateValue === 'string' && dateValue.includes('-')) {
    return dateValue;
  }

  // If it's a number (Excel serial date), convert it
  if (typeof dateValue === 'number') {
    try {
      // Excel dates are number of days since 1900-01-01, with a leap year bug
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return String(dateValue);
    }
  }

  // If it's a Date object, format it
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }

  return String(dateValue);
}

// New function to extract risk data directly from Excel sheet with merged cell support
function extractRiskDataFromSheet(worksheet, range, knownCategories, XLSX) {
  const riskData = [];

  // Parse the range string (e.g., 'A8:E25')
  const [start, end] = range.split(':');
  const startCell = XLSX.utils.decode_cell(start);
  const endCell = XLSX.utils.decode_cell(end);

  const startRow = startCell.r;
  const endRow = endCell.r;
  const startCol = startCell.c;
  const endCol = endCell.c;

  console.log(`Extracting risk data from range ${range} (rows ${startRow}-${endRow}, cols ${startCol}-${endCol})`);

  const categoryPositions = [];

  // First pass: identify categories by checking each row
  for (let row = startRow; row <= endRow; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: startCol }); // Column A
    const cell = worksheet[cellRef];

    if (cell && cell.v) {
      const cellValue = String(cell.v).trim();
      console.log(`Row ${row + 1}: "${cellValue}"`);

      // Check if this is a category
      let isCategory = false;
      let matchedCategory = cellValue;

      for (const cat of knownCategories) {
        if (cellValue === cat ||
            cellValue.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(cellValue.toLowerCase())) {
          isCategory = true;
          matchedCategory = cat; // Use the standard category name
          break;
        }
      }

      // Additional keyword-based detection for categories
      if (!isCategory) {
        const keywords = ['zone', 'géo', 'client', 'caractéristique', 'réputation', 'produit', 'opération', 'canal', 'distribution'];
        if (keywords.some(keyword => cellValue.toLowerCase().includes(keyword))) {
          isCategory = true;
        }
      }

      if (isCategory) {
        console.log(`Found category at row ${row + 1}: "${matchedCategory}"`);
        categoryPositions.push({
          row: row,
          name: matchedCategory
        });
      }
    }
  }

  console.log(`Found ${categoryPositions.length} categories:`, categoryPositions.map(c => c.name));

  // If no categories found, create a default one
  if (categoryPositions.length === 0) {
    console.log('No categories found, creating default category');
    categoryPositions.push({
      row: startRow,
      name: 'Données non catégorisées'
    });
  }

  // Second pass: extract data with category assignment
  categoryPositions.forEach((categoryPos, index) => {
    const nextCategoryPos = categoryPositions[index + 1];
    const categoryEndRow = nextCategoryPos ? nextCategoryPos.row - 1 : endRow;

    // Get category rating from column E
    const ratingCellRef = XLSX.utils.encode_cell({ r: categoryPos.row, c: endCol }); // Column E
    let categoryRating = 'Faible';
    const ratingCell = worksheet[ratingCellRef];
    if (ratingCell && ratingCell.v) {
      const ratingStr = String(ratingCell.v).trim();
      if (['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(ratingStr)) {
        categoryRating = ratingStr === 'Elevé' ? 'Élevé' : ratingStr;
      }
    }

    console.log(`Category "${categoryPos.name}" has rating: ${categoryRating}`);

    // Add category row
    riskData.push({
      A: categoryPos.name,
      isCategory: true,
      rating: categoryRating,
      category: categoryPos.name
    });

    // Add risk factors for this category
    let factorCount = 0;
    for (let row = categoryPos.row + 1; row <= categoryEndRow; row++) {
      const factorNameCellRef = XLSX.utils.encode_cell({ r: row, c: startCol }); // Column A
      const factorNameCell = worksheet[factorNameCellRef];

      if (factorNameCell && factorNameCell.v) {
        const factorName = String(factorNameCell.v).trim();

        // Skip if this looks like another category
        const isAnotherCategory = knownCategories.some(cat =>
          factorName === cat || factorName.toLowerCase().includes(cat.toLowerCase())
        );

        if (!isAnotherCategory && factorName.length > 0) {
          const factorData = {
            A: factorName,
            category: categoryPos.name
          };

          // Extract data from columns B, C, D, E
          for (let col = startCol + 1; col <= endCol; col++) {
            const colLetter = String.fromCharCode(65 + col);
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellRef];

            if (cell && cell.v !== undefined && cell.v !== null) {
              factorData[colLetter] = String(cell.v).trim();
            } else {
              factorData[colLetter] = null;
            }
          }

          // Determine rating for this factor
          if (factorData.E && ['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(factorData.E)) {
            factorData.rating = factorData.E === 'Elevé' ? 'Élevé' : factorData.E;
          } else {
            factorData.rating = categoryRating;
          }

          riskData.push(factorData);
          factorCount++;
          console.log(`  Factor ${factorCount}: "${factorName}" - Profile: "${factorData.B || ''} ${factorData.C || ''} ${factorData.D || ''}".trim() - Rating: ${factorData.rating}`);
        }
      }
    }

    console.log(`Category "${categoryPos.name}" has ${factorCount} factors`);
  });

  console.log(`Total extracted risk data items: ${riskData.length}`);
  return riskData;
}

// Helper function to extract risk data from specific range (improved for merged cells)
function extractRiskData(jsonData, startRow, endRow, knownCategories) {
  const riskData = [];
  const categoryPositions = [];

  console.log(`Extracting risk data from rows ${startRow} to ${endRow}`);
  console.log(`JSON data length: ${jsonData.length}`);

  // Debug: Show a sample of the data structure
  if (jsonData.length > 8) {
    console.log('Sample data structure:');
    for (let i = 8; i <= Math.min(12, jsonData.length - 1); i++) {
      if (jsonData[i]) {
        console.log(`Row ${i + 1}: [${jsonData[i][0]}, ${jsonData[i][1]}, ${jsonData[i][2]}, ${jsonData[i][3]}, ${jsonData[i][4]}]`);
      }
    }
  }

  // Based on the merged cell patterns observed, categories are typically at these row ranges:
  // A9:A11 (rows 8-10), A12:A18 (rows 11-17), A19:A22 (rows 18-21), A23:A24 (rows 22-23)
  const expectedCategoryRows = [8, 11, 18, 22]; // 0-based indexing

  // First pass: identify categories with improved detection
  for (let row = startRow; row <= Math.min(endRow, jsonData.length - 1); row++) {
    const rowData = jsonData[row];
    if (rowData && rowData[0]) {
      const cellValue = String(rowData[0]).trim();
      console.log(`Row ${row + 1} (${row}): "${cellValue}"`);

      // Check if this is a category
      let isCategory = false;
      let matchedCategory = cellValue;

      // First try exact matches with known categories
      for (const cat of knownCategories) {
        if (cellValue === cat || cellValue.startsWith(cat) ||
            cat.toLowerCase().includes(cellValue.toLowerCase()) ||
            cellValue.toLowerCase().includes(cat.toLowerCase())) {
          isCategory = true;
          matchedCategory = cat; // Use the standard category name
          break;
        }
      }

      // If no exact match, try partial matching with keywords
      if (!isCategory) {
        const keywords = ['zone', 'géo', 'client', 'caractéristique', 'réputation', 'produit', 'opération', 'canal', 'distribution'];
        if (keywords.some(keyword => cellValue.toLowerCase().includes(keyword))) {
          isCategory = true;
          // Try to map to a known category
          if (cellValue.toLowerCase().includes('zone') || cellValue.toLowerCase().includes('géo')) {
            matchedCategory = 'Zone géographique';
          } else if (cellValue.toLowerCase().includes('client') || cellValue.toLowerCase().includes('caractéristique')) {
            matchedCategory = 'Caractéristiques du client';
          } else if (cellValue.toLowerCase().includes('réputation')) {
            matchedCategory = 'Réputation du client';
          } else if (cellValue.toLowerCase().includes('produit') || cellValue.toLowerCase().includes('opération')) {
            matchedCategory = 'Nature produits/opérations';
          } else if (cellValue.toLowerCase().includes('canal') || cellValue.toLowerCase().includes('distribution')) {
            matchedCategory = 'Canal de distribution';
          }
        }
      }

      // Also check if this row is in expected category positions
      if (!isCategory && expectedCategoryRows.includes(row)) {
        console.log(`Row ${row + 1} is in expected category position, checking content more carefully`);
        if (cellValue.length > 3) { // Avoid very short strings
          isCategory = true;
          // Try to map to known categories based on position
          if (row === 8) matchedCategory = 'Zone géographique';
          else if (row === 11) matchedCategory = 'Caractéristiques du client';
          else if (row === 18) matchedCategory = 'Réputation du client';
          else if (row === 22) matchedCategory = 'Nature produits/opérations';
        }
      }

      if (isCategory) {
        console.log(`Found category at row ${row + 1}: "${matchedCategory}"`);
        categoryPositions.push({
          row: row,
          name: matchedCategory
        });
      }
    }
  }

  console.log(`Found ${categoryPositions.length} categories:`, categoryPositions.map(c => c.name));

  // If no categories found, create default categories based on expected positions
  if (categoryPositions.length === 0) {
    console.log('No categories found, creating default categories at expected positions');
    expectedCategoryRows.forEach((row, index) => {
      if (row >= startRow && row <= endRow) {
        categoryPositions.push({
          row: row,
          name: knownCategories[index] || 'Données non catégorisées'
        });
      }
    });
  }

  // Second pass: extract data with category assignment
  categoryPositions.forEach((categoryPos, index) => {
    const nextCategoryPos = categoryPositions[index + 1];
    const categoryEndRow = nextCategoryPos ? nextCategoryPos.row - 1 : endRow;

    // Get category rating from column E (index 4)
    const categoryRowData = jsonData[categoryPos.row];
    let categoryRating = 'Faible';
    if (categoryRowData && categoryRowData[4]) {
      const ratingStr = String(categoryRowData[4]).trim();
      if (['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(ratingStr)) {
        categoryRating = ratingStr === 'Elevé' ? 'Élevé' : ratingStr;
      }
    }

    // Add category row
    riskData.push({
      A: categoryPos.name,
      isCategory: true,
      rating: categoryRating,
      category: categoryPos.name
    });

    // Add risk factors for this category - extract factors directly from the current row
    let factorCount = 0;

    // Check if the current category row itself contains factor data (categoryRowData already declared above)
    if (categoryRowData && categoryRowData[1]) {
      const factorName = String(categoryRowData[1]).trim();
      const profile = categoryRowData[3] ? String(categoryRowData[3]).trim() : '';
      const rating = categoryRowData[4] ? String(categoryRowData[4]).trim() : '';

      console.log(`  Checking factor: "${factorName}" (length: ${factorName.length}) for category "${categoryPos.name}"`);

      // Skip if this is just a header row or empty factor
      if (factorName.length > 5 &&
          factorName !== categoryPos.name &&
          factorName !== 'Profil de risques' &&
          !factorName.includes('Facteurs de risques')) {

        const factorData = {
          A: factorName, // Factor name from column B
          B: factorName, // Factor name
          C: profile, // Profile/value from column D
          D: profile, // Additional data
          E: rating, // Rating from column E
          category: categoryPos.name
        };

        // Determine rating for this factor
        if (factorData.E && ['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(factorData.E)) {
          factorData.rating = factorData.E === 'Elevé' ? 'Élevé' : factorData.E;
        } else {
          factorData.rating = categoryRating;
        }

        riskData.push(factorData);
        factorCount++;

        console.log(`  ✓ Factor ${factorCount}: "${factorName}" - Profile: "${profile}" - Rating: ${factorData.rating}`);
      } else {
        console.log(`  ✗ Skipped factor: "${factorName}" (reason: length=${factorName.length}, same as category=${factorName === categoryPos.name})`);
      }
    }

    console.log(`Category "${categoryPos.name}" has ${factorCount} factors`);
  });

  console.log(`Total extracted risk data items: ${riskData.length}`);
  return riskData;
}

// Helper function to process risk table data
function processRiskTable(riskData, knownCategories) {
  const processedData = [];

  if (!riskData || riskData.length === 0) {
    return [{
      name: 'Données non disponibles',
      rating: 'Faible',
      factors: [{
        name: 'Information manquante',
        profile: 'Aucune donnée trouvée dans la plage spécifiée',
        rating: 'Faible'
      }]
    }];
  }

  // First pass: create categories
  riskData.forEach(row => {
    if (row.isCategory) {
      const rating = row.rating === 'Elevé' ? 'Élevé' : row.rating;
      processedData.push({
        name: row.A || 'Catégorie non spécifiée',
        rating: rating,
        factors: []
      });
    }
  });

  // If no categories found, create default
  if (processedData.length === 0) {
    processedData.push({
      name: 'Données non catégorisées',
      rating: 'Faible',
      factors: []
    });
  }

  // Second pass: assign factors to categories
  riskData.forEach(row => {
    if (!row.isCategory && row.A) {
      const categoryName = row.category;
      let category = processedData.find(cat => cat.name === categoryName);

      if (!category && processedData.length > 0) {
        category = processedData[0]; // Use first category as fallback
      }

      if (category) {
        // Build profile from columns B, C, D
        const profileParts = [];
        ['B', 'C', 'D'].forEach(col => {
          if (row[col] && row[col] !== 'null' && row[col] !== 'undefined') {
            const value = String(row[col]).trim();
            if (value && !['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(value)) {
              // Skip numeric values that look like dates or codes
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue < 10000) {
                profileParts.push(value);
              }
            }
          }
        });

        const profile = profileParts.join(' ') || 'Non spécifié';
        const rating = row.rating === 'Elevé' ? 'Élevé' : (row.rating || category.rating);

        category.factors.push({
          name: row.A,
          profile: profile,
          rating: rating
        });
      }
    }
  });

  // Ensure each category has at least one factor
  processedData.forEach(category => {
    if (category.factors.length === 0) {
      category.factors.push({
        name: 'Information non disponible',
        profile: 'Aucune donnée trouvée pour cette catégorie',
        rating: category.rating
      });
    }
  });

  return processedData;
}

// Upload Risk Assessment Excel file route for /amlcenter
app.post('/amlcenter/upload-risk-assessment', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('=== UPLOAD RISK ASSESSMENT STARTED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).send('No file uploaded');
    }

    const excelFilePath = req.file.path;
    console.log('Risk Assessment Excel file path:', excelFilePath);
    console.log('File size:', req.file.size, 'bytes');
    console.log('File mimetype:', req.file.mimetype);

    // Use JavaScript function to process the Excel file
    console.log('Starting Excel file processing...');
    const processedData = await processExcelFile(excelFilePath);
    console.log('Excel processing completed. Result:', processedData);

    if (!processedData || !processedData.clients) {
      console.error('Error: Excel processing did not return valid client data');
      console.error('ProcessedData:', processedData);
      return res.status(500).send('Error processing Excel file');
    }

    clientData = processedData.clients;
    clientCount = clientData.length;

    console.log(`Successfully processed ${clientCount} clients from Excel file`);
    console.log('Client names:', clientData.map(c => c.name));
    
    // Define known categories (same as in Python script)
    const knownCategories = [
      'Zone géographique',
      'Caractéristiques du client',
      'Réputation du client',
      'Nature produits/opérations',
      'Canal de distribution'
    ];
    
    // Ensure processedRiskTable data is available for each client
    if (clientData && clientData.length > 0) {
      clientData.forEach(client => {
        // Add known categories to each client for use in the template if not already present
        if (!client.knownCategories) {
          client.knownCategories = knownCategories;
        }
        
        // Log the processedRiskTable data from Python
        console.log(`Client ${client.name} processedRiskTable:`, client.processedRiskTable ? 
          `Found with ${client.processedRiskTable.length} categories` : 'Not found');
        
        // If processedRiskTable is missing or empty, try to use the extractedRiskData
        if (!client.processedRiskTable || client.processedRiskTable.length === 0) {
          console.log(`No processedRiskTable found for ${client.name}, using extractedRiskData to create it`);

          // Process the extracted risk data into a structured format
          if (client.extractedRiskData && client.extractedRiskData.length > 0) {
            client.processedRiskTable = processRiskTable(client.extractedRiskData, knownCategories);
          } else {
            console.log(`No extractedRiskData found for ${client.name}, will use sample data`);
          }
        }
      });
    }
    
    // Add sample processedRiskTable if none were found
    if (clientData && clientData.length > 0) {
      clientData.forEach(client => {
        if (!client.processedRiskTable || client.processedRiskTable.length === 0) {
          console.log('Adding sample processedRiskTable for client:', client.name);
          client.processedRiskTable = [
            {
              name: 'Zone géographique',
              rating: 'Faible',
              factors: [
                {
                  name: 'Pays d\'enregistrement du client',
                  profile: 'Maroc',
                  rating: 'Faible'
                },
                {
                  name: 'Pays de résidence du(es) Bénéficiaire(s) Effectif(s) (Le pays le plus risqué)',
                  profile: 'Maroc',
                  rating: 'Faible'
                },
                {
                  name: 'Pays d\'ouverture du compte',
                  profile: 'Maroc',
                  rating: 'Faible'
                }
              ]
            },
            {
              name: 'Caractéristiques du client',
              rating: 'Faible',
              factors: [
                {
                  name: 'Secteur d\'activité du client',
                  profile: 'Société de gestion des OPCVM',
                  rating: 'Faible'
                },
                {
                  name: 'Chiffre d\'Affaires du client',
                  profile: '',
                  rating: 'Faible'
                },
                {
                  name: 'Date de création de la personne morale',
                  profile: '',
                  rating: 'Faible'
                },
                {
                  name: 'Le client est-t-il une société côtée en bourse ?',
                  profile: 'Non',
                  rating: 'Faible'
                },
                {
                  name: 'Le client est-t-il une société faisant appel public à l\'épargne ?',
                  profile: 'Non',
                  rating: 'Faible'
                },
                {
                  name: 'L\'état exerce t-il un contrôle sur le client ?',
                  profile: 'Oui',
                  rating: 'Faible'
                },
                {
                  name: 'Etablissement soumis à la réglementation LCB-FT (AMMC, ANRF)',
                  profile: 'Oui',
                  rating: 'Faible'
                }
              ]
            },
            {
              name: 'Réputation du client',
              rating: 'Faible',
              factors: [
                {
                  name: 'Nombre de Déclarations de Soupçon à l\'encontre du client',
                  profile: '0',
                  rating: 'Faible'
                },
                {
                  name: 'Les Bénéficiaires Effectifs, actionnaires ou dirigeants du client sont-ils des PPE ?',
                  profile: 'Non',
                  rating: 'Faible'
                },
                {
                  name: 'Le client fait-il l\'objet d\'une sanction, ou a-t-il des activités dans un pays sous embargo ?',
                  profile: 'Non',
                  rating: 'Faible'
                },
                {
                  name: 'Le client fait-il l\'objet d\'Information Négative ?',
                  profile: 'Non',
                  rating: 'Faible'
                }
              ]
            },
            {
              name: 'Nature produits/opérations',
              rating: 'Faible',
              factors: [
                {
                  name: 'Garde et administration des titres',
                  profile: '',
                  rating: 'Faible'
                },
                {
                  name: 'Opérations Sur Titres',
                  profile: '',
                  rating: 'Faible'
                }
              ]
            },
            {
              name: 'Canal de distribution',
              rating: 'Faible',
              factors: [
                {
                  name: 'Direct',
                  profile: '',
                  rating: 'Faible'
                }
              ]
            }
          ];
        }
      });
    }
    
    console.log('=== UPLOAD PROCESSING COMPLETE ===');
    console.log('Redirecting to client-space...');
    res.redirect('/amlcenter/client-space');
  } catch (error) {
    console.error('=== ERROR IN UPLOAD PROCESSING ===');
    console.error('Error processing Risk Assessment Excel:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).send('Error processing Risk Assessment Excel: ' + error.message);
  }
});

// Function to process PDF text into structured data
function processPdfText(text) {
  const entries = [];
  const processedIds = new Set(); // Track processed IDs to avoid duplicates
  
  // First, try to identify and parse entity entries (KPe, QDe, IQe, CDe) - entities end with 'e'
  // Improved regex to match the specific format: 2 letters + 'e' + dot + 3 numbers
  const entityRegex = /([A-Z]{2}e)\.(\d{3})\s+(?:Nom|Name):/g;
  let entityMatches = [];
  let match;
  
  // Find all entity matches with their positions
  while ((match = entityRegex.exec(text)) !== null) {
    entityMatches.push({
      id: `${match[1]}.${match[2]}`,
      startPos: match.index,
      endPos: match.index + match[0].length
    });
  }
  
  // Process each entity match
  for (let i = 0; i < entityMatches.length; i++) {
    const currentMatch = entityMatches[i];
    const nextMatch = entityMatches[i + 1];
    
    // Extract the text for this entry
    const startPos = currentMatch.startPos;
    const endPos = nextMatch ? nextMatch.startPos : text.length;
    const entryText = text.substring(startPos, endPos);
    
    const entry = parseEntityEntry(entryText);
    if (!processedIds.has(entry.id)) {
      entries.push(entry);
      processedIds.add(entry.id);
    }
  }
  
  // Then, try to identify and parse person entries (CDi, GBi, QDi, IQi, SOi, etc.) - individuals end with 'i'
  // Improved regex to match the specific format: 2 letters + 'i' + dot + 3 numbers
  const personRegex = /([A-Z]{2}i)\.(\d{3})\s+(?:Nom|Name):/g;
  let personMatches = [];
  
  // Reset lastIndex to start search from beginning
  personRegex.lastIndex = 0;
  
  // Find all person matches with their positions
  while ((match = personRegex.exec(text)) !== null) {
    personMatches.push({
      id: `${match[1]}.${match[2]}`,
      startPos: match.index,
      endPos: match.index + match[0].length
    });
  }
  
  // Process each person match
  for (let i = 0; i < personMatches.length; i++) {
    const currentMatch = personMatches[i];
    const nextMatch = personMatches[i + 1];
    
    // Extract the text for this entry
    const startPos = currentMatch.startPos;
    // Find any embedded entry IDs that might indicate the end of this entry
    let endPos = nextMatch ? nextMatch.startPos : text.length;
    
    // Look for embedded entry IDs like "TAi.007" in the text
    const embeddedIdMatch = text.substring(startPos + 10, endPos).match(/\b([A-Z]{2,3})\.\d+\b/);
    if (embeddedIdMatch) {
      const embeddedIdPos = text.indexOf(embeddedIdMatch[0], startPos + 10);
      if (embeddedIdPos > -1 && embeddedIdPos < endPos) {
        // Check if this is part of a "click here" section
        const clickHerePos = text.substring(startPos, embeddedIdPos).lastIndexOf('click here');
        if (clickHerePos > -1) {
          endPos = startPos + clickHerePos;
        }
      }
    }
    
    const entryText = text.substring(startPos, endPos);
    
    const entry = parsePersonEntry(entryText);
    if (!processedIds.has(entry.id)) {
      entries.push(entry);
      processedIds.add(entry.id);
    }
  }
  
  // Try to find additional entries with a more generic pattern
  // This will catch entries that don't match the standard formats
  // Improved regex to match both specific formats (2 letters + 'i'/'e' + dot + 3 numbers) and fallback to generic pattern
  // This handles both the specific format and any other format that might be present
  const genericRegex = /([A-Z]{2}[ie]|[A-Z]{2,3})\.(\d{3}|\d+)\s+(?:Nom|Name):\s*(.+?)\s*(?:Nom \(alphabet d'origine\)|Original script|Titre|Title|Désignation|Designation|Date de naissance|Date of birth|Lieu de naissance|Place of birth|Pseudonyme|A\.k\.a\.|Nationalité|Nationality|Adresse|Address|Date d'inscription|Listed on|$)/gis;
  genericRegex.lastIndex = 0;
  
  while ((match = genericRegex.exec(text)) !== null) {
    const id = `${match[1]}.${match[2]}`;
    
    // Skip if we've already processed this ID
    if (processedIds.has(id)) continue;
    
    // Skip if this ID matches the standard format we've already processed
    if (/[A-Z]{2}[ie]\.\d{3}/.test(id) && (id.endsWith('i') || id.endsWith('e'))) {
      continue;
    }
    
    const startPos = match.index;
    let endPos;
    
    // Find the next entry or end of text
    // Improved regex to match any 2-3 letter code + dot + numbers pattern with both French and English labels
    const nextRegex = /([A-Z]{2,3})\.\d+\s+(?:Nom|Name):/g;
    nextRegex.lastIndex = startPos + 1;
    const nextMatch = nextRegex.exec(text);
    
    if (nextMatch) {
      endPos = nextMatch.index;
    } else {
      endPos = Math.min(startPos + 5000, text.length); // Limit to reasonable chunk size
    }
    
    const entryText = text.substring(startPos, endPos);
    
    // Determine if this is a person or entity based on ID suffix ('i' for individuals, 'e' for entities)
    const isPerson = /[A-Z]{2}i\.\d{3}/.test(id);
    const isEntity = /[A-Z]{2}e\.\d{3}/.test(id);
    
    let entry;
    if (isPerson) {
      entry = parsePersonEntry(entryText);
    } else if (isEntity) {
      entry = parseEntityEntry(entryText);
    } else {
      // If can't determine from ID format, check for entity-specific or person-specific fields
      const hasEntityFields = /Autre\(s\) nom\(s\) connu\(s\)|Précédemment connu\(e\)/i.test(entryText);
      const hasPersonFields = /Date de naissance|Lieu de naissance|Pseudonyme peu fiable/i.test(entryText);
      
      entry = hasEntityFields && !hasPersonFields ? parseEntityEntry(entryText) : parsePersonEntry(entryText);
    }
    
    entries.push(entry);
    processedIds.add(id);
  }
  
  // Only use the numeric pattern if we haven't found enough entries with the specific patterns
  // This helps prevent duplicate entries
  if (entries.length < 300) {
    const numericRegex = /\b(\d+)\s*\.\s*Nom:\s*(.+?)\s*(?:Nom \(alphabet d'origine\)|Titre|Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|Adresse|Date d'inscription|$)/gis;
    numericRegex.lastIndex = 0;
    
    while ((match = numericRegex.exec(text)) !== null) {
      const id = `NUM.${match[1]}`;
      
      // Skip if we've already processed this ID
      if (processedIds.has(id)) continue;
      
      // Extract the name to check if we already have this entry
      const nameMatch = match[2].trim();
      
      // Skip if we've already processed this name
      if (processedNames.has(nameMatch.toLowerCase())) continue;
      
      const startPos = match.index;
      let endPos;
      
      // Find the next entry or end of text
      const nextNumericMatch = text.indexOf('Nom:', startPos + 10);
      if (nextNumericMatch > -1) {
        endPos = nextNumericMatch;
      } else {
        endPos = Math.min(startPos + 5000, text.length); // Limit to reasonable chunk size
      }
      
      const entryText = text.substring(startPos, endPos);
      const entry = parsePersonEntry(entryText);
      entry.id = id;
      
      if (entry.name && entry.name.trim() !== '') {
        entries.push(entry);
        processedIds.add(id);
        processedNames.add(entry.name.toLowerCase());
      }
    }
  }
  
  // Try to find entries with a dash followed by numbered components (e.g., "- 1: TAHA 2: IBRAHIM")
  // But only if we haven't found many entries yet
  if (entries.length < 300) {
    const dashedNameRegex = /\-\s+(\d+):\s+[A-Z]+(?:\s+\d+:\s+[A-Z]+)+/g;
    dashedNameRegex.lastIndex = 0;
    
    while ((match = dashedNameRegex.exec(text)) !== null) {
      const id = `COMP.${match[1]}`;
      
      // Skip if we've already processed this ID
      if (processedIds.has(id)) continue;
      
      // Extract the full match to use as a name
      const fullMatch = match[0].trim();
      
      // Skip if we've already processed this name or a similar one
      let isDuplicate = false;
      for (const existingName of processedNames) {
        // Check for significant overlap in names
        if (existingName.includes(fullMatch) || fullMatch.includes(existingName)) {
          isDuplicate = true;
          break;
        }
      }
      
      if (isDuplicate) continue;
      
      const startPos = match.index;
      let endPos;
      
      // Find the next entry or end of text
      // Look for patterns that indicate the start of a new entry
      const nextEntryPatterns = [
        '\n- \d+:', // Another dashed entry
        '\nNom:', // Standard entry
        '\n[A-Z]{2,3}\.\d+' // ID-based entry
      ];
      
      let nextEntryPos = text.length;
      for (const pattern of nextEntryPatterns) {
        const pos = text.indexOf(pattern, startPos + 10);
        if (pos > -1 && pos < nextEntryPos) {
          nextEntryPos = pos;
        }
      }
      
      endPos = nextEntryPos;
      
      const entryText = text.substring(startPos, endPos);
      const entry = parsePersonEntry(entryText);
      
      // Set a proper ID for this entry
      entry.id = id;
      
      // Add to entries array if it has a valid name
      if (entry.name && entry.name.trim() !== '') {
        entries.push(entry);
        processedIds.add(id);
        processedNames.add(entry.name.toLowerCase());
      }
    }
  }
  
  // We'll only use alternative parsing if we have a small number of entries
  // This helps prevent duplicate entries
  if (entries.length < 100) {
    console.log('Trying additional parsing methods to find more entries...');
    
    // Try alternative format
    const alternativeRegex = /\d+\. Name:\s*\d*\s*(.+?)\s*(?:Original|Listed)/g;
    let altMatch;
    let entryCount = 0;
    
    // Create a copy of the text for regex operations
    let textCopy = text;
    
    while ((altMatch = alternativeRegex.exec(textCopy)) !== null) {
      entryCount++;
      const id = `ALT.${entryCount}`;
      
      // Skip if we've already processed this ID
      if (processedIds.has(id)) continue;
      
      // Extract the name to check if we already have this entry
      const nameMatch = altMatch[1].trim();
      
      // Skip if we've already processed this name
      if (processedNames.has(nameMatch.toLowerCase())) continue;
      
      const startPos = altMatch.index;
      let endPos;
      
      // Find the next entry or end of text
      const nextMatch = alternativeRegex.exec(textCopy);
      if (nextMatch) {
        endPos = nextMatch.index;
        // Reset lastIndex to the position of the next match
        alternativeRegex.lastIndex = nextMatch.index;
      } else {
        endPos = textCopy.length;
      }
      
      const entryText = textCopy.substring(startPos, endPos);
      const entry = parseAlternativeEntry(entryText, entryCount);
      
      // Add to entries array if it has a valid name
      if (entry.name && entry.name.trim() !== '') {
        entries.push(entry);
        processedIds.add(id);
        processedNames.add(entry.name.toLowerCase());
      }
    }
  }
  
  // Log the number of entries found for debugging
  console.log(`Found ${entries.length} entries in the sanctions list.`);
  
  return entries;
}

// Function to parse an entity entry (KPe, QDe, IQe, CDe)
function parseEntityEntry(text) {
  const entry = {
    id: '',
    name: '',
    otherNames: [],
    previouslyKnownAs: [],
    address: [],
    listedOn: '',
    otherInfo: '',
    type: 'entity',
    nationality: '',
    originalScript: '',
    associatedWith: [],
    status: '',
    lastUpdated: ''
  };
  
  // Extract the ID - improved to match both entity format (XXe.YYY) and individual format (XXi.YYY)
  // First, try to find ID at the beginning of the text or directly followed by 'Nom:' without any text in between
  const idNomMatch = text.match(/^\s*([A-Z]{2}[ei])\.\d{3}|(?:^|\n|\r)\s*([A-Z]{2}[ei])\.\d{3}\s+(?:Nom|Name):/);
  if (idNomMatch) {
    // Extract just the ID part (without the 'Nom:' if present)
    const idPart = idNomMatch[0].match(/([A-Z]{2}[ei])\.\d{3}/);
    if (idPart) {
      entry.id = idPart[0].trim();
      // Set type based on 'e' or 'i' in the ID
      entry.type = idPart[1].endsWith('e') ? 'entity' : 'person';
    }
  } else {
    // Try to extract ID from dashed format entries (e.g., "- 1: TAHA 2: IBRAHIM")
    const dashedMatch = text.match(/\-\s+(\d+):\s+[A-Z]+/);
    if (dashedMatch) {
      entry.id = `COMP.${dashedMatch[1]}`;
    } else {
      // Try to match any 2-3 letter code + dot + numbers pattern as fallback
      // But only if it's at the beginning or followed by 'Nom:'
      const genericIdMatch = text.match(/^\s*([A-Z]{2,3})\.\d+|\b([A-Z]{2,3})\.\d+\s+(?:Nom|Name):/);
      if (genericIdMatch) {
        // Extract just the ID part
        const idPart = genericIdMatch[0].match(/([A-Z]{2,3})\.\d+/);
        if (idPart) {
          entry.id = idPart[0].trim();
          // Check if ID ends with 'i' or 'e' to determine if it's a person or entity
          const prefix = idPart[1];
          if (prefix.endsWith('i')) {
            entry.type = 'person';
          } else if (prefix.endsWith('e')) {
            entry.type = 'entity';
          }
        }
      } else {
        // Generate a fallback ID with proper format based on entry type
        if (entry.type === 'person') {
          entry.id = `QDi.${Math.floor(Math.random() * 900) + 100}`; // Generate a 3-digit number between 100-999 for persons
        } else {
          entry.id = `QDe.${Math.floor(Math.random() * 900) + 100}`; // Generate a 3-digit number between 100-999 for entities
        }
      }
    }
  }
  
  // Extract name
  const nameMatch = text.match(/Nom:\s*(.+?)\s*(?:Autre\(s\) nom\(s\)|Nom \(alphabet d'origine\)|Précédemment connu\(e\)|Adresse|Date d'inscription|Nationalité|Renseignements divers|$)/i);
  if (nameMatch) {
    entry.name = nameMatch[1].trim();
  }
  
  // Extract original script name
  const originalScriptMatch = text.match(/Nom \(alphabet d'origine\):\s*(.+?)\s*(?:Autre\(s\) nom\(s\)|Précédemment connu\(e\)|Adresse|Date d'inscription|Nationalité|Renseignements divers|$)/i);
  if (originalScriptMatch) {
    entry.originalScript = originalScriptMatch[1].trim();
  }
  
  // Extract nationality
  const nationalityMatch = text.match(/Nationalité:\s*(.+?)\s*(?:Autre\(s\) nom\(s\)|Précédemment connu\(e\)|Adresse|Date d'inscription|Renseignements divers|$)/i);
  if (nationalityMatch) {
    entry.nationality = nationalityMatch[1].trim();
  }
  
  // Extract other names
  const otherNamesMatch = text.match(/Autre\(s\) nom\(s\) connu\(s\):\s*(.+?)\s*(?:Précédemment connu\(e\)|Adresse|Date d'inscription|Renseignements divers|$)/i);
  if (otherNamesMatch) {
    const otherNamesText = otherNamesMatch[1];
    const otherNames = otherNamesText.split(/[;,]|\d+\)/).filter(name => name.trim() !== '');
    entry.otherNames = otherNames.map(name => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract previously known as
  const previouslyKnownMatch = text.match(/Précédemment connu\(e\) sous le nom de:\s*(.+?)\s*(?:Adresse|Date d'inscription|Renseignements divers|$)/i);
  if (previouslyKnownMatch) {
    const previouslyKnownText = previouslyKnownMatch[1];
    const previouslyKnown = previouslyKnownText.split(/[;,]|\d+\)/).filter(name => name.trim() !== '');
    entry.previouslyKnownAs = previouslyKnown.map(name => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract address - improved to handle multiple addresses with a), b), c) format
  // Modified to properly isolate address from Date d'inscription
  // The address goes from "Adresse:" to "Date d'inscription:"
  const addressMatch = text.match(/Adresse:\s*([^]*?)(?=\s+Date d'inscription:|\s+Listed on:|\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Status:|\s+Dernière mise à jour:|$)/is);
  if (addressMatch) {
    const addressText = addressMatch[1].trim();
    
    // Remove all parenthetical notes but keep the address
    const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
    
    // Check if there are multiple addresses with a), b), c) format
    const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
    
    if (multiAddressMatch && multiAddressMatch.length > 0) {
      entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
    } else {
      // Split by semicolons or commas if no a), b), c) format is found
      const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
      if (addressParts.length > 0) {
        entry.address = addressParts.map(part => part.trim());
      } else {
        entry.address = [cleanedAddressText];
      }
    }
  } else {
    // Try alternative format (English)
    const altAddressMatch = text.match(/Address:\s*([^]*?)(?=\s+Date d'inscription:|\s+Listed on:|\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Status:|\s+Dernière mise à jour:|$)/is);
    if (altAddressMatch) {
      const addressText = altAddressMatch[1].trim();
      const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
      
      const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
      
      if (multiAddressMatch && multiAddressMatch.length > 0) {
        entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
      } else {
        const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
        if (addressParts.length > 0) {
          entry.address = addressParts.map(part => part.trim());
        } else {
          entry.address = [cleanedAddressText];
        }
      }
    } else {
      // Ensure address is always an array even if not found
      entry.address = [];
    }
  }
  
  // Extract listed on date and modifications - improved to handle complex formats with multiple dates
  // First, look specifically for the Date d'inscription field and extract it precisely
  // This pattern specifically searches for Date d'inscription and stops at Renseignements divers
  // Modified to properly isolate the date from the address and other information
  const dateInscriptionSection = text.match(/Date d'inscription:\s*([^]*?)(?=\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Dernière mise à jour:|$)/is);
  
  if (dateInscriptionSection && dateInscriptionSection[1]) {
    const dateText = dateInscriptionSection[1].trim();
    
    // Check if there are modifications in parentheses
    const modificationMatch = dateText.match(/(.*?)\s*\(\s*(?:modifications|amended)\s+([^\)]+)\s*\)/is);
    
    if (modificationMatch) {
      // Extract the main date (before parentheses)
      entry.listedOn = modificationMatch[1].trim();
      
      // Extract modification dates
      const modificationDates = modificationMatch[2].split(/\s*\n\s*|\s*\r\n\s*|\s*\r\s*|\s*,\s*|\s+et\s+|\s+and\s+/);
      if (modificationDates.length > 0) {
        entry.lastUpdated = modificationDates[modificationDates.length - 1].trim();
      }
    } else {
      // No modifications, just the date
      entry.listedOn = dateText;
    }
  } else {
    // Try alternative format (English)
    const altListedSection = text.match(/Listed on:\s*([^]*?)(?=\s+Other information:|\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/is);
    
    if (altListedSection && altListedSection[1]) {
      const dateText = altListedSection[1].trim();
      
      // Check if there are amendments in parentheses
      const amendmentMatch = dateText.match(/(.*?)\s*\(\s*amended\s+([^\)]+)\s*\)/is);
      
      if (amendmentMatch) {
        // Extract the main date (before parentheses)
        entry.listedOn = amendmentMatch[1].trim();
        
        // Extract amendment dates
        const amendmentDates = amendmentMatch[2].split(/\s*\n\s*|\s*\r\n\s*|\s*\r\s*|\s*,\s*|\s+et\s+|\s+and\s+/);
        if (amendmentDates.length > 0) {
          entry.lastUpdated = amendmentDates[amendmentDates.length - 1].trim();
        }
      } else {
        // No amendments, just the date
        entry.listedOn = dateText;
      }
    }
  }
  
  // If date is still not found, try to extract it from the text directly
  if (!entry.listedOn || entry.listedOn === '') {
    const simpleDateMatch = text.match(/Date d'inscription:\s*(\d{1,2}\s+[a-zéû]+\.?\s+\d{4})/i);
    if (simpleDateMatch) {
      entry.listedOn = simpleDateMatch[1].trim();
    }
  }
  
  // If date is still not found, try to extract it from the text directly with more flexible pattern
  if (!entry.listedOn || entry.listedOn === '') {
    const flexibleDateMatch = text.match(/Date d'inscription:\s*([^\(\)]*?)(?=\s+\(|\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/i);
    if (flexibleDateMatch) {
      entry.listedOn = flexibleDateMatch[1].trim();
    }
  }
  
  // If date is still not found, try to extract it including the modifications
  if (!entry.listedOn || entry.listedOn === '') {
    const fullDateMatch = text.match(/Date d'inscription:\s*([^]*?)(?=\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/i);
    if (fullDateMatch) {
      entry.listedOn = fullDateMatch[1].trim();
    }
  }
  
  // Extract other information with improved parsing for physical description, languages, etc.
  // Limit the Renseignements divers section to stop at any new entry ID pattern or other entry indicators
  const otherInfoMatch = text.match(/Renseignements divers:\s*(.+?)(?=\s+(?:[A-Z]{2,3}\.\d+|\d+\s*:\s*[A-Z]+|Nom:|Name:|LYi\.|QDi\.|\- \d+:)|\s*$)/is);
  if (otherInfoMatch) {
    // Further clean up by removing any "click here" text and subsequent content
    let otherInfo = otherInfoMatch[1].trim();
    const clickHereIndex = otherInfo.indexOf('click here');
    if (clickHereIndex > -1) {
      otherInfo = otherInfo.substring(0, clickHereIndex).trim();
    }
    entry.otherInfo = otherInfo;
    
    // Extract associated entities/persons from other info
    const associatedMatch = otherInfo.match(/associé[e]? à (.+?)(?:\.|$)/g);
    if (associatedMatch) {
      entry.associatedWith = associatedMatch.map(assoc => {
        return assoc.replace(/associé[e]? à /, '').replace(/\.$/, '').trim();
      });
    }
    
    // Extract physical description
    const physicalDescMatch = otherInfoMatch[1].match(/Description physique\s*:\s*(.+?)(?:\.|Parle|Recherché|Photographie|$)/i);
    if (physicalDescMatch) {
      entry.physicalDescription = physicalDescMatch[1].trim();
    }
    
    // Extract languages spoken
    const languagesMatch = otherInfoMatch[1].match(/Parle\s+(.+?)(?:\.|Recherché|Photographie|$)/i);
    if (languagesMatch) {
      entry.languages = languagesMatch[1].trim();
    }
    
    // Extract Interpol information
    const interpolMatch = otherInfoMatch[1].match(/(?:Notice spéciale INTERPOL-Conseil de sécurité de l'Organisation des Nations Unies|INTERPOL-UN Security Council Special Notice).*?(?=\.|$)/i);
    if (interpolMatch) {
      entry.interpol = interpolMatch[0].trim();
    }
    
    // Extract resolution information
    const resolutionMatch = otherInfoMatch[1].match(/(?:application de la résolution|pursuant to resolution)\s+(\d+)\s*\((\d+)\)/i);
    if (resolutionMatch) {
      entry.resolution = `${resolutionMatch[1]} (${resolutionMatch[2]})`;
    }
  }
  
  // Extract last updated date - improved to handle different formats
  const lastUpdatedMatch = text.match(/(?:modifications|révision|s'est achevé le)\s+(\d{1,2}\s+[a-zéû]+\.?\s+\d{4})/i);
  if (lastUpdatedMatch) {
    entry.lastUpdated = lastUpdatedMatch[1].trim();
  }
  
  // Extract status (e.g., "Interdite au Pakistan")
  const statusMatch = text.match(/Interdite? (?:au|en|à) (.+?)\./i);
  if (statusMatch) {
    entry.status = `Interdite ${statusMatch[0]}`;
  }
  
  return entry;
}

// Function to parse a person entry (CDi, GBi, etc.)
function parsePersonEntry(text) {
  const entry = {
    id: '',
    name: '',
    title: '',
    designation: '',
    dateOfBirth: '',
    placeOfBirth: '',
    reliableAlias: [],
    unreliableAlias: [],
    nationality: '',
    passportNo: '',
    nationalId: '',
    address: [],
    listedOn: '',
    otherInfo: '',
    type: 'person',
    lastUpdated: '',
    associatedWith: [],
    status: '',
    physicalDescription: '',
    languages: '',
    interpol: '',
    resolution: '',
    originalScript: '',
    otherNames: [],
    previouslyKnownAs: []
  };
  
  // Extract the ID - improved to match both entity format (XXe.YYY) and individual format (XXi.YYY)
  // First, try to find ID at the beginning of the text or directly followed by 'Nom:' without any text in between
  const idNomMatch = text.match(/^\s*([A-Z]{2}[ei])\.\d{3}|(?:^|\n|\r)\s*([A-Z]{2}[ei])\.\d{3}\s+(?:Nom|Name):/);
  if (idNomMatch) {
    // Extract just the ID part (without the 'Nom:' if present)
    const idPart = idNomMatch[0].match(/([A-Z]{2}[ei])\.\d{3}/);
    if (idPart) {
      entry.id = idPart[0].trim();
      // Set type based on 'e' or 'i' in the ID
      entry.type = idPart[1].endsWith('e') ? 'entity' : 'person';
    }
  } else {
    // Try to extract ID from dashed format entries (e.g., "- 1: TAHA 2: IBRAHIM")
    const dashedMatch = text.match(/\-\s+(\d+):\s+[A-Z]+/);
    if (dashedMatch) {
      entry.id = `COMP.${dashedMatch[1]}`;
    } else {
      // Try to match any 2-3 letter code + dot + numbers pattern as fallback
      // But only if it's at the beginning or followed by 'Nom:'
      const genericIdMatch = text.match(/^\s*([A-Z]{2,3})\.\d+|\b([A-Z]{2,3})\.\d+\s+(?:Nom|Name):/);
      if (genericIdMatch) {
        // Extract just the ID part
        const idPart = genericIdMatch[0].match(/([A-Z]{2,3})\.\d+/);
        if (idPart) {
          entry.id = idPart[0].trim();
          // Check if ID ends with 'i' or 'e' to determine if it's a person or entity
          const prefix = idPart[1];
          if (prefix.endsWith('i')) {
            entry.type = 'person';
          } else if (prefix.endsWith('e')) {
            entry.type = 'entity';
          }
        }
      } else {
        // Generate a fallback ID with proper format based on entry type
        if (entry.type === 'person') {
          entry.id = `QDi.${Math.floor(Math.random() * 900) + 100}`; // Generate a 3-digit number between 100-999 for persons
        } else {
          entry.id = `QDe.${Math.floor(Math.random() * 900) + 100}`; // Generate a 3-digit number between 100-999 for entities
        }
      }
    }
  }
  
  // Extract name and name components - handle both French and English labels
  const nameMatch = text.match(/(?:Nom|Name):\s*(.+?)\s*(?:Nom \(alphabet d'origine\)|Original script|Titre|Title|Désignation|Designation|Date de naissance|Date of birth|Lieu de naissance|Place of birth|Pseudonyme|A\.k\.a\.|Nationalité|Nationality|$)/is);
  if (nameMatch) {
    entry.name = nameMatch[1].trim();
    
    // Extract numbered name components (1: FIRST 2: MIDDLE 3: LAST 4: etc)
    const nameComponentsMatch = entry.name.match(/\d+:\s*[^\d:]+(?=\s+\d+:|$)/g);
    if (nameComponentsMatch) {
      entry.nameComponents = nameComponentsMatch.map(component => {
        const [num, name] = component.split(':').map(part => part.trim());
        return { number: parseInt(num), value: name };
      });
    }
  }
  
  // Extract original script name
  const originalScriptMatch = text.match(/Nom \(alphabet d'origine\):\s*(.+?)\s*(?:Titre|Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|Autre\(s\) nom\(s\)|Précédemment connu\(e\)|$)/is);
  if (originalScriptMatch) {
    entry.originalScript = originalScriptMatch[1].trim();
  }
  
  // Extract other names
  const otherNamesMatch = text.match(/Autre\(s\) nom\(s\) connu\(s\):\s*(.+?)\s*(?:Précédemment connu\(e\)|Titre|Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|$)/i);
  if (otherNamesMatch) {
    const otherNamesText = otherNamesMatch[1];
    const otherNames = otherNamesText.split(/[;,]|\d+\)/).filter(name => name.trim() !== '');
    entry.otherNames = otherNames.map(name => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract previously known as
  const previouslyKnownMatch = text.match(/Précédemment connu\(e\) sous le nom de:\s*(.+?)\s*(?:Titre|Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|$)/i);
  if (previouslyKnownMatch) {
    const previouslyKnownText = previouslyKnownMatch[1];
    const previouslyKnown = previouslyKnownText.split(/[;,]|\d+\)/).filter(name => name.trim() !== '');
    entry.previouslyKnownAs = previouslyKnown.map(name => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract title
  const titleMatch = text.match(/Titre:\s*(.+?)\s*(?:Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|$)/is);
  if (titleMatch) {
    entry.title = titleMatch[1].trim();
  }
  
  // Extract designation
  const designationMatch = text.match(/Désignation:\s*(.+?)\s*(?:Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|$)/is);
  if (designationMatch) {
    entry.designation = designationMatch[1].trim();
  }
  
  // Extract date of birth
  const dobMatch = text.match(/Date de naissance:\s*(.+?)\s*(?:Lieu de naissance|Pseudonyme|Nationalité|$)/is);
  if (dobMatch) {
    entry.dateOfBirth = dobMatch[1].trim();
  }
  
  // Extract place of birth
  const pobMatch = text.match(/Lieu de naissance:\s*(.+?)\s*(?:Pseudonyme|Nationalité|$)/is);
  if (pobMatch) {
    entry.placeOfBirth = pobMatch[1].trim();
  }
  
  // Extract reliable alias
  const reliableAliasMatch = text.match(/Pseudonyme fiable:\s*(.+?)\s*(?:Pseudonyme peu fiable|Nationalité|$)/is);
  if (reliableAliasMatch) {
    const reliableAliasText = reliableAliasMatch[1];
    const reliableAliases = reliableAliasText.split(/[;,]|\d+\)/).filter(alias => alias.trim() !== '');
    entry.reliableAlias = reliableAliases.map(alias => alias.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract unreliable alias - improved to handle a), b) format
  const unreliableAliasMatch = text.match(/Pseudonyme peu fiable:\s*(.+?)\s*(?:Nationalité|$)/is);
  if (unreliableAliasMatch) {
    const unreliableAliasText = unreliableAliasMatch[1];
    
    // Check if there are multiple aliases with a), b), c) format
    const multiAliasMatch = unreliableAliasText.match(/[a-z]\)\s*.+?(?=[a-z]\)|$)/g);
    
    if (multiAliasMatch) {
      entry.unreliableAlias = multiAliasMatch.map(alias => alias.replace(/^[a-z]\)\s*/, '').trim());
    } else {
      // Fall back to the original splitting method
      const unreliableAliases = unreliableAliasText.split(/[;,]|\d+\)/).filter(alias => alias.trim() !== '');
      entry.unreliableAlias = unreliableAliases.map(alias => alias.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
    }
  }
  
  // Extract nationality - improved pattern matching
  const nationalityMatch = text.match(/Nationalité:\s*(.+?)\s*(?:Numéro de passeport|Numéro national|Adresse|Date d'inscription|$)/is);
  if (nationalityMatch) {
    entry.nationality = nationalityMatch[1].trim();
  }
  
  // Extract passport number - improved to capture additional details and handle multiple formats
  const passportMatch = text.match(/Numéro de passeport:\s*(.+?)\s*(?:Numéro national|Adresse|Date d'inscription|$)/is);
  if (passportMatch) {
    entry.passportNo = passportMatch[1].trim();
  } else {
    // Try alternative format
    const altPassportMatch = text.match(/Numéro de passport:\s*(.+?)\s*(?:Numéro national|Adresse|Date d'inscription|$)/is);
    if (altPassportMatch) {
      entry.passportNo = altPassportMatch[1].trim();
    }
  }
  
  // Extract national ID - improved to capture additional details and handle multiple formats
  const idNoMatch = text.match(/Numéro national d'identification:\s*(.+?)\s*(?:Adresse|Date d'inscription|$)/is);
  if (idNoMatch) {
    entry.nationalId = idNoMatch[1].trim();
  } else {
    // Try alternative format
    const altIdNoMatch = text.match(/Numéro national d\'identité:\s*(.+?)\s*(?:Adresse|Date d'inscription|$)/is);
    if (altIdNoMatch) {
      entry.nationalId = altIdNoMatch[1].trim();
    }
  }
  
  // Extract address - improved to handle multiple addresses with a), b), c) format
  // Modified to properly isolate address from Date d'inscription
  // The address goes from "Adresse:" to "Date d'inscription:"
  const addressMatch = text.match(/Adresse:\s*([^]*?)(?=\s+Date d'inscription:|\s+Listed on:|\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Status:|\s+Dernière mise à jour:|$)/is);
  if (addressMatch) {
    const addressText = addressMatch[1].trim();
    
    // Remove all parenthetical notes but keep the address
    const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
    
    // Check if there are multiple addresses with a), b), c) format
    const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
    
    if (multiAddressMatch && multiAddressMatch.length > 0) {
      entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
    } else {
      // Split by semicolons or commas if no a), b), c) format is found
      const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
      if (addressParts.length > 0) {
        entry.address = addressParts.map(part => part.trim());
      } else {
        entry.address = [cleanedAddressText];
      }
    }
  } else {
    // Try alternative format (English)
    const altAddressMatch = text.match(/Address:\s*([^]*?)(?=\s+Date d'inscription:|\s+Listed on:|\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Status:|\s+Dernière mise à jour:|$)/is);
    if (altAddressMatch) {
      const addressText = altAddressMatch[1].trim();
      const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
      
      const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
      
      if (multiAddressMatch && multiAddressMatch.length > 0) {
        entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
      } else {
        const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
        if (addressParts.length > 0) {
          entry.address = addressParts.map(part => part.trim());
        } else {
          entry.address = [cleanedAddressText];
        }
      }
    } else {
      // Ensure address is always an array even if not found
      entry.address = [];
    }
  }
  
  // Extract listed on date and modifications - improved to handle complex formats with multiple dates
  // First, look specifically for the Date d'inscription field and extract it precisely
  // This pattern specifically searches for Date d'inscription and stops at Renseignements divers
  // Modified to properly isolate the date from the address and other information
  const dateInscriptionSection = text.match(/Date d'inscription:\s*([^]*?)(?=\s+Renseignements divers:|\s+Other information:|\s+Statut:|\s+Dernière mise à jour:|$)/is);
  
  if (dateInscriptionSection && dateInscriptionSection[1]) {
    const dateText = dateInscriptionSection[1].trim();
    
    // Check if there are modifications in parentheses
    const modificationMatch = dateText.match(/(.*?)\s*\(\s*(?:modifications|amended)\s+([^\)]+)\s*\)/is);
    
    if (modificationMatch) {
      // Extract the main date (before parentheses)
      entry.listedOn = modificationMatch[1].trim();
      
      // Extract modification dates
      const modificationDates = modificationMatch[2].split(/\s*\n\s*|\s*\r\n\s*|\s*\r\s*|\s*,\s*|\s+et\s+|\s+and\s+/);
      if (modificationDates.length > 0) {
        entry.lastUpdated = modificationDates[modificationDates.length - 1].trim();
      }
    } else {
      // No modifications, just the date
      entry.listedOn = dateText;
    }
  } else {
    // Try alternative format (English)
    const altListedSection = text.match(/Listed on:\s*([^]*?)(?=\s+Other information:|\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/is);
    
    if (altListedSection && altListedSection[1]) {
      const dateText = altListedSection[1].trim();
      
      // Check if there are amendments in parentheses
      const amendmentMatch = dateText.match(/(.*?)\s*\(\s*amended\s+([^\)]+)\s*\)/is);
      
      if (amendmentMatch) {
        // Extract the main date (before parentheses)
        entry.listedOn = amendmentMatch[1].trim();
        
        // Extract amendment dates
        const amendmentDates = amendmentMatch[2].split(/\s*\n\s*|\s*\r\n\s*|\s*\r\s*|\s*,\s*|\s+et\s+|\s+and\s+/);
        if (amendmentDates.length > 0) {
          entry.lastUpdated = amendmentDates[amendmentDates.length - 1].trim();
        }
      } else {
        // No amendments, just the date
        entry.listedOn = dateText;
      }
    }
  }
  
  // If date is still not found, try to extract it from the text directly
  if (!entry.listedOn || entry.listedOn === '') {
    const simpleDateMatch = text.match(/Date d'inscription:\s*(\d{1,2}\s+[a-zéû]+\.?\s+\d{4})/i);
    if (simpleDateMatch) {
      entry.listedOn = simpleDateMatch[1].trim();
    }
  }
  
  // If date is still not found, try to extract it from the text directly with more flexible pattern
  if (!entry.listedOn || entry.listedOn === '') {
    const flexibleDateMatch = text.match(/Date d'inscription:\s*([^\(\)]*?)(?=\s+\(|\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/i);
    if (flexibleDateMatch) {
      entry.listedOn = flexibleDateMatch[1].trim();
    }
  }
  
  // If date is still not found, try to extract it including the modifications
  if (!entry.listedOn || entry.listedOn === '') {
    const fullDateMatch = text.match(/Date d'inscription:\s*([^]*?)(?=\s+Renseignements divers:|\s+Statut:|\s+Dernière mise à jour:|$)/i);
    if (fullDateMatch) {
      entry.listedOn = fullDateMatch[1].trim();
    }
  }
  
  // Extract other information with improved parsing for physical description, languages, etc.
  // Limit the Renseignements divers section to stop at any new entry ID pattern or other entry indicators
  const otherInfoMatch = text.match(/Renseignements divers:\s*(.+?)(?=\s+(?:[A-Z]{2,3}\.\d+|\d+\s*:\s*[A-Z]+|Nom:|Name:|LYi\.|QDi\.|\- \d+:)|\s*$)/is);
  if (otherInfoMatch) {
    // Further clean up by removing any "click here" text and subsequent content
    let otherInfo = otherInfoMatch[1].trim();
    const clickHereIndex = otherInfo.indexOf('click here');
    if (clickHereIndex > -1) {
      otherInfo = otherInfo.substring(0, clickHereIndex).trim();
    }
    entry.otherInfo = otherInfo;
    
    // Extract associated entities/persons from other info
    const associatedMatch = otherInfo.match(/associé[e]? à (.+?)(?:\.|$)/g);
    if (associatedMatch) {
      entry.associatedWith = associatedMatch.map(assoc => {
        return assoc.replace(/associé[e]? à /, '').replace(/\.$/, '').trim();
      });
    }
    
    // Extract physical description
    const physicalDescMatch = otherInfoMatch[1].match(/Description physique\s*:\s*(.+?)(?:\.|Parle|Recherché|Photographie|$)/i);
    if (physicalDescMatch) {
      entry.physicalDescription = physicalDescMatch[1].trim();
    }
    
    // Extract languages spoken
    const languagesMatch = otherInfoMatch[1].match(/Parle\s+(.+?)(?:\.|Recherché|Photographie|$)/i);
    if (languagesMatch) {
      entry.languages = languagesMatch[1].trim();
    }
    
    // Extract Interpol information
    const interpolMatch = otherInfoMatch[1].match(/(?:Notice spéciale INTERPOL-Conseil de sécurité de l'Organisation des Nations Unies|INTERPOL-UN Security Council Special Notice).*?(?=\.|$)/i);
    if (interpolMatch) {
      entry.interpol = interpolMatch[0].trim();
    }
    
    // Extract resolution information
    const resolutionMatch = otherInfoMatch[1].match(/(?:application de la résolution|pursuant to resolution)\s+(\d+)\s*\((\d+)\)/i);
    if (resolutionMatch) {
      entry.resolution = `${resolutionMatch[1]} (${resolutionMatch[2]})`;
    }
  }
  
  // Extract last updated date - improved to handle different formats
  const lastUpdatedMatch = text.match(/(?:modifications|révision|s'est achevé le)\s+(\d{1,2}\s+[a-zéû]+\.?\s+\d{4})/i);
  if (lastUpdatedMatch) {
    entry.lastUpdated = lastUpdatedMatch[1].trim();
  }
  
  // Extract status (e.g., "Interdite au Pakistan")
  const statusMatch = text.match(/Interdite? (?:au|en|à) (.+?)\./i);
  if (statusMatch) {
    entry.status = `Interdite ${statusMatch[0]}`;
  }
  
  return entry;
}

// Function to parse alternative format entries
function parseAlternativeEntry(text, index) {
  const entry = {
    id: `ALT.${index}`, // Ensure index is properly formatted
    // Make sure ID is always set
    name: '',
    aliases: [],
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    passportNo: '',
    nationalId: '',
    address: [],
    listedOn: '',
    otherInfo: '',
    type: 'person',
    lastUpdated: ''
  };
  
  // Extract name
  const nameMatch = text.match(/Name:\s*\d*\s*(.+?)\s*(?:Original|Listed|A\.k\.a)/i);
  if (nameMatch) {
    entry.name = nameMatch[1].trim();
  }
  
  // Extract aliases
  const aliasesMatch = text.match(/A\.k\.a\.?:?\s*(.+?)\s*(?:Date of birth|Nationality|Address|Listed on)/i);
  if (aliasesMatch) {
    const aliasesText = aliasesMatch[1];
    // Split by common separators in alternative format
    const aliases = aliasesText.split(/[;,]|\d+\)/).filter(alias => alias.trim() !== '');
    entry.aliases = aliases.map(alias => alias.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }
  
  // Extract date of birth
  const dobMatch = text.match(/(?:Date of birth|DOB):\s*(.+?)\s*(?:Place of birth|POB|Nationality|Address|Listed on)/i);
  if (dobMatch) {
    entry.dateOfBirth = dobMatch[1].trim();
  }
  
  // Extract place of birth
  const pobMatch = text.match(/(?:Place of birth|POB):\s*(.+?)\s*(?:Nationality|Address|Listed on)/i);
  if (pobMatch) {
    entry.placeOfBirth = pobMatch[1].trim();
  }
  
  // Extract nationality
  const nationalityMatch = text.match(/Nationality:\s*(.+?)\s*(?:Passport|National identification|Address|Listed on)/i);
  if (nationalityMatch) {
    entry.nationality = nationalityMatch[1].trim();
  }
  
  // Extract passport
  const passportMatch = text.match(/Passport:\s*(.+?)\s*(?:National identification|Address|Listed on)/i);
  if (passportMatch) {
    entry.passportNo = passportMatch[1].trim();
  }
  
  // Extract national ID
  const idMatch = text.match(/(?:National identification|National ID):\s*(.+?)\s*(?:Address|Listed on)/i);
  if (idMatch) {
    entry.nationalId = idMatch[1].trim();
  }
  
  // Extract address
  const addressMatch = text.match(/Address:\s*([^]*?)(?=\s+Listed on:|\s+Date d'inscription:|\s+Other information:|\s+Renseignements divers:|\s+Status:|\s+Statut:|$)/is);
  if (addressMatch) {
    const addressText = addressMatch[1].trim();
    // Remove all parenthetical notes but keep the address
    const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
    
    // Check if there are multiple addresses with a), b), c) format
    const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
    
    if (multiAddressMatch && multiAddressMatch.length > 0) {
      entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
    } else {
      // Split by semicolons or commas if no a), b), c) format is found
      const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
      if (addressParts.length > 0) {
        entry.address = addressParts.map(part => part.trim());
      } else {
        entry.address = [cleanedAddressText];
      }
    }
  } else {
    // Try alternative format (French)
    const altAddressMatch = text.match(/Adresse:\s*([^]*?)(?=\s+Listed on:|\s+Date d'inscription:|\s+Other information:|\s+Renseignements divers:|\s+Status:|\s+Statut:|$)/is);
    if (altAddressMatch) {
      const addressText = altAddressMatch[1].trim();
      const cleanedAddressText = addressText.replace(/\s*\([^\)]*?\)\s*/g, ' ').trim();
      
      const multiAddressMatch = cleanedAddressText.match(/(?:^|\s)[a-z]\)\s*.+?(?=\s+[a-z]\)|$)/gs);
      
      if (multiAddressMatch && multiAddressMatch.length > 0) {
        entry.address = multiAddressMatch.map(addr => addr.replace(/^\s*[a-z]\)\s*/, '').trim());
      } else {
        const addressParts = cleanedAddressText.split(/[;,]/).filter(part => part.trim() !== '');
        if (addressParts.length > 0) {
          entry.address = addressParts.map(part => part.trim());
        } else {
          entry.address = [cleanedAddressText];
        }
      }
    } else {
      // Ensure address is always an array even if not found
      entry.address = [];
    }
  }
  
  // Extract listed on date
  const listedMatch = text.match(/Listed on:\s*(.+?)\s*(?:Other information|$)/i);
  if (listedMatch) {
    entry.listedOn = listedMatch[1].trim();
  }
  
  // Extract other information
  const otherInfoMatch = text.match(/Other information:\s*(.+?)\s*$/is);
  if (otherInfoMatch) {
    entry.otherInfo = otherInfoMatch[1].trim();
  }
  
  // Extract last updated date
  const lastUpdatedMatch = text.match(/(?:modifications|révision|updated on).+?(\d{1,2}\s+[a-zéû]+\.?\s+\d{4})/i);
  if (lastUpdatedMatch) {
    entry.lastUpdated = lastUpdatedMatch[1].trim();
  }
  
  return entry;
}

// Function to match PDF data with Excel data
function matchData(pdfData, excelData) {
  const results = [];
  
  excelData.forEach(excelEntry => {
    const matches = [];
    let bestMatchScore = 0;
    let bestMatch = null;
    
    // Get the name from Excel (check multiple possible column names)
    const excelName = excelEntry.name || excelEntry.Name || excelEntry.NAME || excelEntry.full_name || excelEntry.FULL_NAME || '';
    // Get date of birth if available
    const excelDob = excelEntry.dateOfBirth || excelEntry.DateOfBirth || excelEntry.DOB || excelEntry.dob || '';
    // Get nationality if available
    const excelNationality = excelEntry.nationality || excelEntry.Nationality || excelEntry.NATIONALITY || '';
    // Get ID if available
    const excelId = excelEntry.id || excelEntry.ID || excelEntry.Id || '';
    // Get passport if available
    const excelPassport = excelEntry.passport || excelEntry.Passport || excelEntry.passportNo || excelEntry.PassportNo || '';
    // Get national ID if available
    const excelNationalId = excelEntry.nationalId || excelEntry.NationalId || excelEntry.national_id || excelEntry.National_ID || '';
    
    if (!excelName) return;
    
    pdfData.forEach(pdfEntry => {
      // Initialize scores
      let nameScore = 0;
      let aliasScore = 0;
      let dobScore = 0;
      let nationalityScore = 0;
      let idScore = 0;
      let passportScore = 0;
      let nationalIdScore = 0;
      
      // Calculate name similarity score
      nameScore = stringSimilarity.compareTwoStrings(excelName.toLowerCase(), pdfEntry.name.toLowerCase());
      
      // Calculate alias similarity scores based on entry type
      if (pdfEntry.type === 'entity') {
        // Check other names for entities
        if (pdfEntry.otherNames && pdfEntry.otherNames.length > 0) {
          pdfEntry.otherNames.forEach(alias => {
            const score = stringSimilarity.compareTwoStrings(excelName.toLowerCase(), alias.toLowerCase());
            if (score > aliasScore) aliasScore = score;
          });
        }
        
        // Check previously known as for entities
        if (pdfEntry.previouslyKnownAs && pdfEntry.previouslyKnownAs.length > 0) {
          pdfEntry.previouslyKnownAs.forEach(alias => {
            const score = stringSimilarity.compareTwoStrings(excelName.toLowerCase(), alias.toLowerCase());
            if (score > aliasScore) aliasScore = score;
          });
        }
      } else if (pdfEntry.type === 'person') {
        // Check reliable aliases for persons
        if (pdfEntry.reliableAlias && pdfEntry.reliableAlias.length > 0) {
          pdfEntry.reliableAlias.forEach(alias => {
            const score = stringSimilarity.compareTwoStrings(excelName.toLowerCase(), alias.toLowerCase());
            if (score > aliasScore) aliasScore = score;
          });
        }
        
        // Check unreliable aliases for persons
        if (pdfEntry.unreliableAlias && pdfEntry.unreliableAlias.length > 0) {
          pdfEntry.unreliableAlias.forEach(alias => {
            const score = stringSimilarity.compareTwoStrings(excelName.toLowerCase(), alias.toLowerCase());
            if (score > aliasScore) aliasScore = score;
          });
        }
      }
      
      // Calculate DOB similarity if both have DOB
      if (excelDob && pdfEntry.dateOfBirth) {
        // Normalize date formats before comparison
        const normalizedExcelDob = normalizeDate(excelDob);
        const normalizedPdfDob = normalizeDate(pdfEntry.dateOfBirth);
        
        if (normalizedExcelDob && normalizedPdfDob) {
          dobScore = normalizedExcelDob === normalizedPdfDob ? 0.2 : 0;
        }
      }
      
      // Calculate nationality similarity if both have nationality
      if (excelNationality && pdfEntry.nationality) {
        nationalityScore = stringSimilarity.compareTwoStrings(
          excelNationality.toLowerCase(), 
          pdfEntry.nationality.toLowerCase()
        ) * 0.1; // Weight nationality less than name
      }
      
      // Calculate ID similarity if both have ID
      if (excelId && pdfEntry.id) {
        idScore = pdfEntry.id.toLowerCase().includes(excelId.toLowerCase()) ? 0.3 : 0;
      }
      
      // Calculate passport similarity if both have passport
      if (excelPassport && pdfEntry.passportNo) {
        passportScore = stringSimilarity.compareTwoStrings(
          excelPassport.toLowerCase(),
          pdfEntry.passportNo.toLowerCase()
        ) * 0.2;
      }
      
      // Calculate national ID similarity if both have national ID
      if (excelNationalId && pdfEntry.nationalId) {
        nationalIdScore = stringSimilarity.compareTwoStrings(
          excelNationalId.toLowerCase(),
          pdfEntry.nationalId.toLowerCase()
        ) * 0.2;
      }
      
      // Calculate final weighted score
      // Name/alias is most important, followed by ID, passport, DOB, national ID and nationality
      const nameAliasScore = Math.max(nameScore, aliasScore);
      const score = nameAliasScore + dobScore + nationalityScore + idScore + passportScore + nationalIdScore;
      
      // Adjust threshold based on combined factors
      const threshold = 0.5; // Base threshold
      
      if (score > threshold) {
        matches.push({
          pdfEntry,
          score,
          nameScore: nameAliasScore,
          dobScore,
          nationalityScore,
          idScore,
          passportScore,
          nationalIdScore
        });
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = pdfEntry;
        }
      }
    });
    
    // Sort matches by score in descending order
    matches.sort((a, b) => b.score - a.score);
    
    results.push({
      excelEntry,
      matches,
      bestMatch,
      bestMatchScore
    });
  });
  
  return results;
}

// Helper function to normalize date formats
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  // Remove any non-numeric characters except for separators
  const cleaned = dateStr.replace(/[^0-9\/\.-]/g, '');
  
  // Try to parse different date formats
  const formats = [
    // DD/MM/YYYY or DD-MM-YYYY
    { regex: /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/, order: [1, 2, 3] },
    // YYYY/MM/DD or YYYY-MM-DD
    { regex: /(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/, order: [3, 2, 1] },
    // MM/DD/YYYY or MM-DD-YYYY
    { regex: /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/, order: [2, 1, 3] }
  ];
  
  for (const format of formats) {
    const match = cleaned.match(format.regex);
    if (match) {
      const day = match[format.order[0]];
      const month = match[format.order[1]];
      const year = match[format.order[2]];
      
      // Validate day and month
      if (parseInt(day) > 31 || parseInt(month) > 12) continue;
      
      // Return standardized format: YYYY-MM-DD
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // If we can't parse the date, return the original string
  return dateStr;
}

// Function to search PDF data
function searchPdfData(pdfData, query, idFilter, nameFilter, typeFilter, nationalityFilter) {
  if (!pdfData) return [];
  
  const results = [];
  const queryLower = query ? query.toLowerCase() : '';
  const idFilterLower = idFilter ? idFilter.toLowerCase() : '';
  const nameFilterLower = nameFilter ? nameFilter.toLowerCase() : '';
  const nationalityFilterLower = nationalityFilter ? nationalityFilter.toLowerCase() : '';
  
  pdfData.forEach(entry => {
    let matchScore = 0;
    let matchFields = [];
    let matchesFilters = true;
    
    // Apply specific filters
    if (idFilterLower && (!entry.id || typeof entry.id !== 'string' || !entry.id.toLowerCase().includes(idFilterLower))) {
      matchesFilters = false;
    }
    
    if (matchesFilters && nameFilterLower && (!entry.name || typeof entry.name !== 'string' || !entry.name.toLowerCase().includes(nameFilterLower))) {
      matchesFilters = false;
    }
    
    if (matchesFilters && typeFilter && entry.type !== typeFilter) {
      matchesFilters = false;
    }
    
    if (matchesFilters && nationalityFilterLower && (!entry.nationality || typeof entry.nationality !== 'string' || !entry.nationality.toLowerCase().includes(nationalityFilterLower))) {
      matchesFilters = false;
    }
    
    // If entry doesn't match all filters, skip it
    if (!matchesFilters) {
      return;
    }
    
    // If no general query is provided, add the entry with a default score
    if (!query) {
      results.push({
        ...entry,
        matchScore: 1,
        matchFields: ['filtered']
      });
      return;
    }
    
    // Check common fields with weighted scoring - ensure values are strings before calling toLowerCase()
    if (entry.id && typeof entry.id === 'string' && entry.id.toLowerCase().includes(queryLower)) {
      matchScore += 4;
      matchFields.push('ID');
    }
    
    if (entry.name && typeof entry.name === 'string' && entry.name.toLowerCase().includes(queryLower)) {
      matchScore += 5;
      matchFields.push('name');
    }
    
    // Address is always an array after our fixes
    if (entry.address && Array.isArray(entry.address)) {
      for (const addr of entry.address) {
        if (addr && typeof addr === 'string' && addr.toLowerCase().includes(queryLower)) {
          matchScore += 2;
          matchFields.push('address');
          break;
        }
      }
    }
    
    if (entry.listedOn && typeof entry.listedOn === 'string' && entry.listedOn.toLowerCase().includes(queryLower)) {
      matchScore += 3;
      matchFields.push('listed on');
    }
    
    // Improved handling of otherInfo field to handle potential embedded IDs
    if (entry.otherInfo && typeof entry.otherInfo === 'string') {
      // Clean up any potential embedded IDs that might be causing issues
      let cleanedOtherInfo = entry.otherInfo;
      const embeddedIdMatch = cleanedOtherInfo.match(/\b([A-Z]{2,3})\.\d+\b/);
      
      if (embeddedIdMatch) {
        // Check if this is part of a reference to another entry
        const embeddedIdPos = cleanedOtherInfo.indexOf(embeddedIdMatch[0]);
        const beforeId = cleanedOtherInfo.substring(Math.max(0, embeddedIdPos - 30), embeddedIdPos).toLowerCase();
        
        // Only consider the text before the ID if it's not a reference
        if (!beforeId.includes("associé") && !beforeId.includes("associée") && 
            !beforeId.includes("référence") && !beforeId.includes("reference")) {
          cleanedOtherInfo = cleanedOtherInfo.substring(0, embeddedIdPos).trim();
        }
      }
      
      if (cleanedOtherInfo.toLowerCase().includes(queryLower)) {
        matchScore += 1;
        matchFields.push('other info');
      }
    }
    
    // Check entity-specific fields
    if (entry.type === 'entity') {
      // Check other names
      if (entry.otherNames && entry.otherNames.length > 0) {
        for (const name of entry.otherNames) {
          if (name.toLowerCase().includes(queryLower)) {
            matchScore += 4;
            matchFields.push('other names');
            break;
          }
        }
      }
      
      // Check previously known as
      if (entry.previouslyKnownAs && entry.previouslyKnownAs.length > 0) {
        for (const name of entry.previouslyKnownAs) {
          if (name.toLowerCase().includes(queryLower)) {
            matchScore += 4;
            matchFields.push('previously known as');
            break;
          }
        }
      }
    }
    
    // Check person-specific fields
    if (entry.type === 'person') {
      if (entry.title && entry.title.toLowerCase().includes(queryLower)) {
        matchScore += 2;
        matchFields.push('title');
      }
      
      if (entry.designation && entry.designation.toLowerCase().includes(queryLower)) {
        matchScore += 2;
        matchFields.push('designation');
      }
      
      if (entry.dateOfBirth && entry.dateOfBirth.toLowerCase().includes(queryLower)) {
        matchScore += 3;
        matchFields.push('date of birth');
      }
      
      if (entry.placeOfBirth && entry.placeOfBirth.toLowerCase().includes(queryLower)) {
        matchScore += 3;
        matchFields.push('place of birth');
      }
      
      if (entry.nationality && entry.nationality.toLowerCase().includes(queryLower)) {
        matchScore += 3;
        matchFields.push('nationality');
      }
      
      if (entry.passportNo && entry.passportNo.toLowerCase().includes(queryLower)) {
        matchScore += 4;
        matchFields.push('passport');
      }
      
      if (entry.nationalId && entry.nationalId.toLowerCase().includes(queryLower)) {
        matchScore += 4;
        matchFields.push('national ID');
      }
      
      // Check reliable aliases
      if (entry.reliableAlias && entry.reliableAlias.length > 0) {
        for (const alias of entry.reliableAlias) {
          if (alias.toLowerCase().includes(queryLower)) {
            matchScore += 4;
            matchFields.push('reliable alias');
            break;
          }
        }
      }
      
      // Check unreliable aliases
      if (entry.unreliableAlias && entry.unreliableAlias.length > 0) {
        for (const alias of entry.unreliableAlias) {
          if (alias.toLowerCase().includes(queryLower)) {
            matchScore += 3;
            matchFields.push('unreliable alias');
            break;
          }
        }
      }
    }
    
    // Add to results if any match found
    if (matchScore > 0) {
      entry.matchScore = matchScore;
      entry.matchFields = matchFields;
      results.push(entry);
    }
  });
  
  // Sort results by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// Function to process XML data into structured data
function processXmlData(xmlData) {
  const entries = [];
  
  // Check if the XML has the expected structure
  if (!xmlData || !xmlData.CONSOLIDATED_LIST) {
    console.error('XML data does not have the expected structure');
    return entries;
  }
  
  // Process individuals if they exist
  if (xmlData.CONSOLIDATED_LIST.INDIVIDUALS) {
    const individuals = Array.isArray(xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL) 
      ? xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL 
      : [xmlData.CONSOLIDATED_LIST.INDIVIDUALS.INDIVIDUAL];
    
    individuals.forEach(individual => {
      const entry = {
        id: individual.REFERENCE_NUMBER || `XML-${individual.DATAID}`,
        name: '',
        type: 'person',
        title: '',
        designation: '',
        dateOfBirth: '',
        placeOfBirth: '',
        reliableAlias: [],
        unreliableAlias: [],
        nationality: '',
        passportNo: '',
        nationalId: '',
        address: [],
        listedOn: individual.LISTED_ON || '',
        otherInfo: individual.COMMENTS1 || '',
        lastUpdated: '',
        associatedWith: [],
        status: '',
        physicalDescription: '',
        languages: '',
        interpol: '',
        resolution: '',
        originalScript: individual.NAME_ORIGINAL_SCRIPT || '',
        gender: individual.GENDER || '',
        documents: [],
        notes: individual.NOTE || ''
      };
      
      // Construct name from name components
      if (individual.FIRST_NAME || individual.SECOND_NAME || individual.THIRD_NAME || individual.FOURTH_NAME) {
        const nameParts = [];
        if (individual.FIRST_NAME) nameParts.push(individual.FIRST_NAME);
        if (individual.SECOND_NAME) nameParts.push(individual.SECOND_NAME);
        if (individual.THIRD_NAME) nameParts.push(individual.THIRD_NAME);
        if (individual.FOURTH_NAME) nameParts.push(individual.FOURTH_NAME);
        entry.name = nameParts.join(' ');
      }
      
      // Process title
      if (individual.TITLE) {
        if (Array.isArray(individual.TITLE.VALUE)) {
          entry.title = individual.TITLE.VALUE.join(', ');
        } else if (individual.TITLE.VALUE) {
          entry.title = individual.TITLE.VALUE;
        }
      }
      
      // Process designation
      if (individual.DESIGNATION) {
        if (Array.isArray(individual.DESIGNATION.VALUE)) {
          entry.designation = individual.DESIGNATION.VALUE.join(', ');
        } else if (individual.DESIGNATION.VALUE) {
          entry.designation = individual.DESIGNATION.VALUE;
        }
      }
      
      // Process nationality
      if (individual.NATIONALITY) {
        if (Array.isArray(individual.NATIONALITY.VALUE)) {
          entry.nationality = individual.NATIONALITY.VALUE.join(', ');
        } else if (individual.NATIONALITY.VALUE) {
          entry.nationality = individual.NATIONALITY.VALUE;
        }
      }
      
      // Process date of birth
      if (individual.INDIVIDUAL_DATE_OF_BIRTH) {
        const dob = individual.INDIVIDUAL_DATE_OF_BIRTH;
        let dobString = '';
        
        // Check for exact date format first
        if (dob.DATE) {
          dobString = dob.DATE;
        } else {
          if (dob.TYPE_OF_DATE) {
            dobString += dob.TYPE_OF_DATE + ' ';
          }
          
          if (dob.YEAR) {
            dobString += dob.YEAR;
            if (dob.MONTH) {
              dobString += '-' + dob.MONTH;
              if (dob.DAY) {
                dobString += '-' + dob.DAY;
              }
            }
          }

          // Handle FROM_YEAR and TO_YEAR for date ranges
          if (dob.FROM_YEAR) {
            dobString += dobString ? ', ' : '';
            dobString += 'De ' + dob.FROM_YEAR;
            if (dob.TO_YEAR) {
              dobString += ' à ' + dob.TO_YEAR;
            }
          }
        }
        
        entry.dateOfBirth = dobString.trim();
      }
      
      // Process place of birth
      if (individual.INDIVIDUAL_PLACE_OF_BIRTH) {
        const pob = individual.INDIVIDUAL_PLACE_OF_BIRTH;
        let pobParts = [];
        
        if (pob.CITY || pob.CITY_OF_BIRTH) pobParts.push(pob.CITY || pob.CITY_OF_BIRTH);
        if (pob.STATE_PROVINCE) pobParts.push(pob.STATE_PROVINCE);
        if (pob.COUNTRY || pob.COUNTRY_OF_BIRTH) pobParts.push(pob.COUNTRY || pob.COUNTRY_OF_BIRTH);
        
        entry.placeOfBirth = pobParts.join(', ');
      }
      
      // Process identification documents
      if (individual.INDIVIDUAL_DOCUMENT) {
        const documents = Array.isArray(individual.INDIVIDUAL_DOCUMENT) 
          ? individual.INDIVIDUAL_DOCUMENT 
          : [individual.INDIVIDUAL_DOCUMENT];
        
        // Create arrays to store different document types
        const passports = [];
        const nationalIds = [];
        const otherDocs = [];
        
        documents.forEach(document => {
          // Skip empty document objects
          if (Object.keys(document).length === 0) return;
          
          const docType = document.TYPE_OF_DOCUMENT || '';
          const docType2 = document.TYPE_OF_DOCUMENT2 || '';
          const docNumber = document.NUMBER || '';
          const countryOfIssue = document.COUNTRY_OF_ISSUE || document.ISSUING_COUNTRY || '';
          const dateOfIssue = document.DATE_OF_ISSUE || '';
          const cityOfIssue = document.CITY_OF_ISSUE || '';
          const note = document.NOTE || '';
          
          // Store complete document information in the documents array
          if (docType || docType2 || docNumber) {
            entry.documents.push({
              type: docType,
              type2: docType2,
              number: docNumber,
              countryOfIssue: countryOfIssue,
              dateOfIssue: dateOfIssue,
              cityOfIssue: cityOfIssue,
              note: note
            });
            
            // Build document information string for display
            let docInfo = '';
            
            // Build document information string
            if (docNumber) docInfo += docNumber;
            
            // Handle document type information
            let typeInfo = '';
            if (docType) typeInfo += docType;
            if (docType2) typeInfo += typeInfo ? `, ${docType2}` : docType2;
            
            if (typeInfo) {
              docInfo += docInfo ? ` (${typeInfo})` : `(${typeInfo})`;
            }
            
            // Add additional information if available
            let additionalInfo = [];
            if (countryOfIssue) additionalInfo.push(`Pays d'émission: ${countryOfIssue}`);
            if (dateOfIssue) additionalInfo.push(`Date d'émission: ${dateOfIssue}`);
            if (cityOfIssue) additionalInfo.push(`Ville d'émission: ${cityOfIssue}`);
            if (note) additionalInfo.push(`Note: ${note}`);
            
            if (additionalInfo.length > 0) {
              docInfo += ` - ${additionalInfo.join(', ')}`;
            }
            
            // Categorize documents based on type
            const docTypeLC = (docType + ' ' + docType2).toLowerCase();
            if (docTypeLC.includes('passport') || docTypeLC.includes('passeport')) {
              passports.push(docInfo);
            } else if (docTypeLC.includes('national') || docTypeLC.includes('identity') || 
                      docTypeLC.includes('id') || docTypeLC.includes('identification') || 
                      docTypeLC.includes('carte')) {
              nationalIds.push(docInfo);
            } else if (docInfo) {
              otherDocs.push(docInfo);
            }
          }
        });
        
        // Assign document information to entry
        if (passports.length > 0) {
          entry.passportNo = passports.join('\n');
        }
        
        if (nationalIds.length > 0) {
          entry.nationalId = nationalIds.join('\n');
        }
        
        if (otherDocs.length > 0) {
          const otherDocsInfo = otherDocs.map(doc => `Document: ${doc}`).join('\n');
          entry.otherInfo += entry.otherInfo ? `\n${otherDocsInfo}` : otherDocsInfo;
        }
      }
      
      // Process aliases
      if (individual.INDIVIDUAL_ALIAS) {
        const aliases = Array.isArray(individual.INDIVIDUAL_ALIAS) 
          ? individual.INDIVIDUAL_ALIAS 
          : [individual.INDIVIDUAL_ALIAS];
        
        aliases.forEach(alias => {
          // Skip empty aliases
          if (!alias.ALIAS_NAME) return;
          
          // Process date of birth in alias if available
          let aliasInfo = alias.ALIAS_NAME;
          if (alias.DATE_OF_BIRTH) {
            aliasInfo += ` (né le: ${alias.DATE_OF_BIRTH})`;
          }
          
          if (alias.QUALITY === 'Good') {
            entry.reliableAlias.push(aliasInfo);
          } else if (alias.QUALITY === 'Low') {
            entry.unreliableAlias.push(aliasInfo);
          } else {
            // If quality is not specified, add to reliable alias by default
            entry.reliableAlias.push(aliasInfo);
          }
        });
      }
      
      // Process address
      if (individual.INDIVIDUAL_ADDRESS) {
        const addresses = Array.isArray(individual.INDIVIDUAL_ADDRESS) 
          ? individual.INDIVIDUAL_ADDRESS 
          : [individual.INDIVIDUAL_ADDRESS];
        
        addresses.forEach(address => {
          let addressParts = [];
          
          if (address.STREET) addressParts.push(address.STREET);
          if (address.CITY) addressParts.push(address.CITY);
          if (address.STATE_PROVINCE) addressParts.push(address.STATE_PROVINCE);
          if (address.COUNTRY) addressParts.push(address.COUNTRY);
          if (address.NOTE) addressParts.push(address.NOTE);
          if (address.ZIP_CODE) addressParts.push(`Code postal: ${address.ZIP_CODE}`);
          
          if (addressParts.length > 0) {
            entry.address.push(addressParts.join(', '));
          }
        });
      }
      
      // Process last updated date
      if (individual.LAST_DAY_UPDATED) {
        const lastUpdates = Array.isArray(individual.LAST_DAY_UPDATED.VALUE) 
          ? individual.LAST_DAY_UPDATED.VALUE 
          : [individual.LAST_DAY_UPDATED.VALUE];
        
        if (lastUpdates.length > 0) {
          entry.lastUpdated = lastUpdates[lastUpdates.length - 1];
        }
      }
      
      entries.push(entry);
    });
  }
  
  // Process entities if they exist
  if (xmlData.CONSOLIDATED_LIST.ENTITIES) {
    const entities = Array.isArray(xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY) 
      ? xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY 
      : [xmlData.CONSOLIDATED_LIST.ENTITIES.ENTITY];
    
    entities.forEach(entity => {
      const entry = {
        id: entity.REFERENCE_NUMBER || `XML-${entity.DATAID}`,
        name: entity.FIRST_NAME || '',
        type: 'entity',
        otherNames: [],
        previouslyKnownAs: [],
        address: [],
        listedOn: entity.LISTED_ON || '',
        otherInfo: entity.COMMENTS1 || '',
        nationality: '',
        originalScript: entity.NAME_ORIGINAL_SCRIPT || '',
        associatedWith: [],
        status: '',
        lastUpdated: ''
      };
      
      // Process aliases (other names)
      if (entity.ENTITY_ALIAS) {
        const aliases = Array.isArray(entity.ENTITY_ALIAS) 
          ? entity.ENTITY_ALIAS 
          : [entity.ENTITY_ALIAS];
        
        aliases.forEach(alias => {
          if (alias.QUALITY === 'a.k.a.') {
            if (alias.ALIAS_NAME) entry.otherNames.push(alias.ALIAS_NAME);
          } else if (alias.QUALITY === 'f.k.a.') {
            if (alias.ALIAS_NAME) entry.previouslyKnownAs.push(alias.ALIAS_NAME);
          }
        });
      }
      
      // Process addresses
      if (entity.ENTITY_ADDRESS) {
        const addresses = Array.isArray(entity.ENTITY_ADDRESS) 
          ? entity.ENTITY_ADDRESS 
          : [entity.ENTITY_ADDRESS];
        
        addresses.forEach(address => {
          let addressParts = [];
          
          if (address.STREET) addressParts.push(address.STREET);
          if (address.CITY) addressParts.push(address.CITY);
          if (address.STATE_PROVINCE) addressParts.push(address.STATE_PROVINCE);
          if (address.COUNTRY) addressParts.push(address.COUNTRY);
          if (address.NOTE) addressParts.push(address.NOTE);
          
          if (addressParts.length > 0) {
            entry.address.push(addressParts.join(', '));
          }
        });
      }
      
      // Process last updated date
      if (entity.LAST_DAY_UPDATED) {
        const lastUpdates = Array.isArray(entity.LAST_DAY_UPDATED.VALUE) 
          ? entity.LAST_DAY_UPDATED.VALUE 
          : [entity.LAST_DAY_UPDATED.VALUE];
        
        if (lastUpdates.length > 0) {
          entry.lastUpdated = lastUpdates[lastUpdates.length - 1];
        }
      }
      
      entries.push(entry);
    });
  }
  
  // Log the number of entries found for debugging
  console.log(`Found ${entries.length} entries in the XML sanctions list.`);
  
  return entries;
}

// Function to process risk assessment Excel file
function processRiskAssessmentExcel(workbook) {
  const clients = [];
  
  // Process each sheet in the workbook (each sheet represents a client)
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    // Use raw: false to get formatted values and header: 'A' to get column-based access
    const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 'A', raw: false });
    
    // Extract data from the specific range A8:E25 as requested
    const specificRangeData = extractSpecificRange(sheet, 'A8:E25');
    console.log(`Extracted specific range data for sheet ${sheetName}:`, JSON.stringify(specificRangeData).substring(0, 200) + '...');
    
    // Process the risk table using the dedicated function
    const processedRiskTable = processRiskTable(sheet);
    console.log(`Processed risk table for sheet ${sheetName}:`, JSON.stringify(processedRiskTable).substring(0, 200) + '...');
    
    // Skip empty sheets or sheets with insufficient data
    if (sheetData.length < 10) return;
    
    // Extract client name (usually in cell C1 or similar)
    const clientNameRow = sheetData.find(row => row.C && typeof row.C === 'string' && 
      (row.C.includes('RED MED') || row.C.includes('BANK AL AMAL') || row.C.includes('SECURITIES')));
    const clientName = clientNameRow?.C || sheetName;
    
    // Extract risk level (usually at the bottom of the sheet)
    let riskLevel = 'Faible'; // Default value
    for (let i = sheetData.length - 1; i >= 0; i--) {
      if (sheetData[i].B === 'Niveau risque' && sheetData[i].F) {
        riskLevel = sheetData[i].F;
        break;
      }
    }
    
    // Extract dates
    let updateDate = '';
    let assessmentDate = '';
    for (const row of sheetData) {
      if (row.G === 'Date de MAJ' && row.H) {
        updateDate = row.H;
      }
      if (row.G === 'Date d\'EER' && row.H) {
        assessmentDate = row.H;
      }
    }
    
    // Extract risk factors - create a new array for each client
    const riskFactors = [];
    let inRiskFactorsSection = false;
    let currentCategory = '';
    let categoryRating = 'Faible';
    
    console.log(`Processing risk factors for client: ${clientName}`);
    
    // Define known categories
    const knownCategories = [
      'Zone géographique',
      'Caractéristiques du client',
      'Réputation du client',
      'Nature produits/opérations',
      'Canal de distribution'
    ];
    
    // Process the specific range data (A8:E25) for risk factors
    if (specificRangeData && specificRangeData.length > 0) {
      console.log(`Processing specific range data for risk factors for client: ${clientName}`);
      
      // Map columns to their expected content
      // A: Risk factor name
      // B-D: Profile details
      // E: Risk rating
      
      let currentRangeCategory = '';
      let categoryRating = 'Faible';
      
      // First pass: identify all categories and their ratings
      specificRangeData.forEach(row => {
        if (!row.A) return;
        
        // Check if this is a category header
        const isCategory = knownCategories.some(cat => 
          row.A === cat || (typeof row.A === 'string' && row.A.includes(cat))
        ) || row.isCategory === true;
        
        if (isCategory) {
          currentRangeCategory = row.A;
          // Extract category rating from column E
          categoryRating = row.E || row.rating || 'Faible';
          console.log(`Found category in range data for ${clientName}:`, currentRangeCategory, 'with rating:', categoryRating);
          
          // Add this category to the risk factors structure
          const existingCategory = riskFactors.find(factor => 
            factor.category === currentRangeCategory && factor.factors);
          
          if (!existingCategory) {
            riskFactors.push({
              category: currentRangeCategory,
              rating: categoryRating,
              factors: []
            });
          }
        }
      });
      
      // Second pass: process all risk factors and assign them to their categories
      currentRangeCategory = '';
      specificRangeData.forEach(row => {
        // Skip empty rows
        if (!row.A) return;
        
        // Check if this is a category header
        const isCategory = knownCategories.some(cat => 
          row.A === cat || (typeof row.A === 'string' && row.A.includes(cat))
        );
        
        if (isCategory) {
          currentRangeCategory = row.A;
          categoryRating = row.E || 'Faible';
          return; // Skip category headers
        }
        
        // Process risk factor
        if (currentRangeCategory && row.A) {
          // Combine columns B, C, and D for the profile
          const profile = [row.B, row.C, row.D].filter(Boolean).join(' ');
          const rating = row.E || categoryRating;
          
          console.log(`Adding risk factor from range for ${clientName}:`, row.A, 'profile:', profile, 'rating:', rating);
          
          // Find the category in the risk factors array
          const categoryIndex = riskFactors.findIndex(factor => 
            factor.category === currentRangeCategory && factor.factors);
          
          if (categoryIndex !== -1) {
            // Add this factor to the category's factors array
            riskFactors[categoryIndex].factors.push({
              category: currentRangeCategory,
              name: row.A,
              profile: profile || 'Non spécifié',
              rating: rating
            });
          } else {
            // If category not found, add it as a standalone factor
            riskFactors.push({
              category: currentRangeCategory,
              name: row.A,
              profile: profile || 'Non spécifié',
              rating: rating
            });
          }
        }
      });
    }
    
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Detect the start of risk factors section
      if (row.A === 'Facteurs de risques' || 
          (row.A && typeof row.A === 'string' && row.A.includes('Facteurs de risques'))) {
        inRiskFactorsSection = true;
        console.log('Found risk factors section:', row);
        continue;
      }
      
      // Process risk factors
      if (inRiskFactorsSection && row.A && row.A !== 'Niveau risque' && row.A !== 'Facteurs de risques') {
        // Check if this is a category header
        const isCategory = knownCategories.some(cat => 
          row.A === cat || (typeof row.A === 'string' && row.A.includes(cat))
        );
        
        if (isCategory) {
          // Update current category
          currentCategory = row.A;
          // Extract category rating (usually in column I for category headers)
          categoryRating = row.I || 'Faible';
          console.log('Found category:', currentCategory, 'with rating:', categoryRating);
          continue;
        }
        
        // Skip empty rows
        if (!row.A || row.A.trim && row.A.trim() === '') {
          continue;
        }
        
        // Get the profile from column D (Profil de risques column)
        // Based on the image, this is where the profile data is typically located
        let profile = '';
        
        // First check column D which is the main Profil de risques column
        if (row.D && typeof row.D === 'string' && row.D.trim() !== '' && 
            !['Faible', 'Moyen', 'Élevé'].includes(row.D)) {
          profile = row.D;
        } else {
          // If not found in D, check other columns that might contain profile data
          for (const col of ['C', 'E', 'F', 'G', 'H']) {
            if (row[col] && typeof row[col] === 'string' && row[col].trim() !== '') {
              // Skip if it looks like a rating
              if (!['Faible', 'Moyen', 'Élevé'].includes(row[col])) {
                profile = row[col];
                break;
              }
            }
          }
        }
        
        // For specific risk factors, ensure we capture the correct data
        // These are the specific fields mentioned in the user's requirements
        const specificFactors = {
          "Pays d'enregistrement du client": true,
          "Pays de résidence du(es) Bénéficiaire(s) Effectif(s) (Le pays le plus risqué)": true,
          "Pays d'ouverture du compte": true,
          "Secteur d'activité du client": true,
          "Chiffre d'Affaires du client": true,
          "Date de création de la personne morale": true,
          "Le client est-t-il une société côtée en bourse ?": true,
          "Le client est-t-il une société faisant appel public à l'épargne ?": true,
          "L'état exerce t-il un contrôle sur le client ?": true,
          "Etablissement soumis à la réglementation LCB-FT (AMMC, ANRF)": true,
          "Nombre de Déclarations de Soupçon à l'encontre du client": true,
          "Les Bénéficiaires Effectifs, actionnaires ou dirigeants du client sont-ils des PPE ?": true,
          "Le client fait-il l'objet d'une sanction, ou a-t-il des activités dans un pays sous embargo ?": true,
          "Le client fait-il l'objet d'Information Négative ?": true,
          "Garde et administration des titres": true,
          "Opérations Sur Titres": true,
          "Direct": true
        };
        
        // If this is a specific factor we're looking for, make an extra effort to find its value
        if (row.A && specificFactors[row.A]) {
          console.log(`Found specific factor for ${clientName}:`, row.A);
          // Look in all columns for a value
          for (const col of ['D', 'C', 'E', 'F', 'G', 'H']) {
            if (row[col] && typeof row[col] === 'string' && row[col].trim() !== '') {
              // For these specific factors, we'll accept any value, even if it looks like a rating
              profile = row[col];
              
              // Also store these specific values in the client object for direct access in the template
              if (row.A === "Pays d'enregistrement du client") {
                client.countryOfRegistration = profile;
              } else if (row.A === "Pays de résidence du(es) Bénéficiaire(s) Effectif(s) (Le pays le plus risqué)") {
                client.beneficiaryCountry = profile;
              } else if (row.A === "Pays d'ouverture du compte") {
                client.accountOpeningCountry = profile;
              } else if (row.A === "Secteur d'activité du client") {
                client.businessSector = profile;
              } else if (row.A === "Chiffre d'Affaires du client") {
                client.revenue = profile;
              } else if (row.A === "Date de création de la personne morale") {
                client.creationDate = profile;
              } else if (row.A === "Le client est-t-il une société côtée en bourse ?") {
                client.isListed = profile;
              } else if (row.A === "Le client est-t-il une société faisant appel public à l'épargne ?") {
                client.isPublicAppeal = profile;
              } else if (row.A === "L'état exerce t-il un contrôle sur le client ?") {
                client.isStateControlled = profile;
              } else if (row.A === "Etablissement soumis à la réglementation LCB-FT (AMMC, ANRF)") {
                client.isRegulated = profile;
              } else if (row.A === "Nombre de Déclarations de Soupçon à l'encontre du client") {
                client.suspicionReports = profile;
              } else if (row.A === "Les Bénéficiaires Effectifs, actionnaires ou dirigeants du client sont-ils des PPE ?") {
                client.isPEP = profile;
              } else if (row.A === "Le client fait-il l'objet d'une sanction, ou a-t-il des activités dans un pays sous embargo ?") {
                client.isSanctioned = profile;
              } else if (row.A === "Le client fait-il l'objet d'Information Négative ?") {
                client.hasNegativeInfo = profile;
              } else if (row.A === "Garde et administration des titres") {
                client.securitiesCustody = profile;
              } else if (row.A === "Opérations Sur Titres") {
                client.securitiesOperations = profile;
              } else if (row.A === "Direct") {
                client.directChannel = profile;
              }
              
              break;
            }
          }
        }
        
        // Get the rating - check column I first (Notation de risque column)
        // Based on the image, this is where the rating is typically located
        let rating = row.I;
        if (!rating || rating === '') {
          // Check other columns that might contain rating
          for (const col of ['E', 'F', 'G', 'H', 'J']) {
            if (row[col] && ['Faible', 'Moyen', 'Élevé'].includes(row[col])) {
              rating = row[col];
              break;
            }
          }
        }
        
        // If still no rating found, use the category rating
        if (!rating || rating === '') {
          rating = categoryRating;
        }
        
        console.log('Extracted factor:', row.A, 'profile:', profile, 'rating:', rating);
        
        // Add the risk factor with its category
        if (row.A && (typeof row.A !== 'string' || row.A.trim() !== '')) {
          const riskFactor = {
            category: currentCategory || 'Non catégorisé',
            name: row.A,
            profile: profile || 'Non spécifié',
            rating: rating || 'Faible'
          };
          
          console.log('Adding risk factor:', riskFactor);
          riskFactors.push(riskFactor);
        }
      }
      
      // Detect the end of risk factors section
      if (inRiskFactorsSection && row.B === 'Niveau risque') {
        break;
      }
    }
    
    // Organize risk factors by category
    const organizedFactors = [];
    const categories = [...new Set(riskFactors.map(factor => factor.category))];
    
    // Sort categories in the standard order
    categories.sort((a, b) => {
      const order = knownCategories;
      const indexA = order.findIndex(cat => a.includes(cat));
      const indexB = order.findIndex(cat => b.includes(cat));
      
      // If both categories are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one is in the order list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither is in the list, sort alphabetically
      return a.localeCompare(b);
    });
    
    // Group factors by category
    categories.forEach(category => {
      const factorsInCategory = riskFactors.filter(factor => factor.category === category);
      
      // Get the category rating (use the rating of the first factor as default)
      const categoryRating = factorsInCategory.length > 0 ? factorsInCategory[0].rating : 'Faible';
      
      organizedFactors.push({
        category: category,
        rating: categoryRating,
        factors: factorsInCategory
      });
    });
    
    // Create client object with organized risk factors
    const client = {
      name: clientName,
      riskLevel: riskLevel,
      updateDate: updateDate,
      assessmentDate: assessmentDate,
      riskFactors: organizedFactors,
      // Add the extracted risk data from the specific range A8:E25
      extractedRiskData: [],
      // Don't override processedRiskTable if it's coming from Python script
      processedRiskTable: processedRiskTable
    };
    
    // Log the processed risk table for debugging
    console.log(`Client ${clientName} processedRiskTable:`, processedRiskTable ? 
      `Found with ${processedRiskTable.length} categories` : 'Not found');
    
    // Process the specific range data to include all categories and their risk factors
    if (specificRangeData && specificRangeData.length > 0) {
      console.log(`Processing ${specificRangeData.length} rows of data for client ${clientName}`);
      
      // First, identify all categories
      const categories = specificRangeData
        .filter(row => row.isCategory)
        .map(row => ({
          name: row.A,
          rating: row.rating || 'Faible',
          factors: []
        }));
      
      console.log(`Found ${categories.length} categories for client ${clientName}:`, categories.map(c => c.name).join(', '));
      
      // Then add all risk factors to their respective categories
      specificRangeData.forEach(row => {
        if (!row.isCategory && row.category && row.A) {
          // Find the category this factor belongs to
          const categoryIndex = categories.findIndex(cat => cat.name === row.category);
          if (categoryIndex !== -1) {
            // Determine the profile based on the examples provided
            let profile = '';
            
            // For yes/no questions, prioritize column D
            if (row.D && ['Oui', 'Non'].includes(row.D)) {
              profile = row.D;
            }
            // For country fields, use column D if it has content
            else if (row.D && row.D !== '' && !['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(row.D)) {
              profile = row.D;
            }
            // For numeric values (like number of declarations), use column D
            else if (row.D && !isNaN(row.D)) {
              profile = row.D;
            }
            // Otherwise, try column C
            else if (row.C && row.C !== '' && !['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(row.C)) {
              profile = row.C;
            }
            // If nothing else, combine non-empty columns
            else {
              profile = [row.B, row.C, row.D].filter(val => val && val !== '' && !['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(val)).join(' ') || 'Non spécifié';
            }
            
            console.log(`Adding factor '${row.A}' to category '${categories[categoryIndex].name}' with profile '${profile}' and rating '${row.rating || 'Faible'}'`);
            
            // Add this factor to the category
            categories[categoryIndex].factors.push({
              name: row.A,
              profile: profile,
              rating: row.rating || 'Faible'
            });
          }
        }
      });
      
      // Set the extractedRiskData property
      client.extractedRiskData = categories;
      
      // Also store specific values in the client object for direct access in the template
      const specificFactors = {
        "Pays d'enregistrement du client": 'countryOfRegistration',
        "Pays de résidence du(es) Bénéficiaire(s) Effectif(s) (Le pays le plus risqué)": 'beneficiaryCountry',
        "Pays d'ouverture du compte": 'accountOpeningCountry',
        "Secteur d'activité du client": 'businessSector',
        "Chiffre d'Affaires du client": 'revenue',
        "Date de création de la personne morale": 'creationDate',
        "Le client est-t-il une société côtée en bourse ?": 'isListed',
        "Le client est-t-il une société faisant appel public à l'épargne ?": 'isPublicAppeal',
        "L'état exerce t-il un contrôle sur le client ?": 'isStateControlled',
        "Etablissement soumis à la réglementation LCB-FT (BAM & ANRF)": 'isRegulated',
        "Nombre de Déclarations de Soupçon à l'encontre du client": 'suspicionReports',
        "Les Bénéficiaires Effectifs, actionnaires ou dirigeants du client sont-ils des PPE ?": 'isPEP',
        "Le client fait-il l'objet d'une sanction, ou a-t-il des activités dans un pays sous embargo ?": 'isSanctioned',
        "Le client fait-il l'objet d'Information Négative ?": 'hasNegativeInfo',
        "Garde et administration des titres": 'securitiesCustody',
        "Opérations Sur Titres": 'securitiesOperations',
        "Direct": 'directChannel'
      };
      
      specificRangeData.forEach(row => {
        if (!row.isCategory && row.A && specificFactors[row.A]) {
          const propertyName = specificFactors[row.A];
          let factorValue = '';
          
          // Determine the value based on the factor name
          if (row.D && row.D !== '') {
            factorValue = row.D;
          } else if (row.C && row.C !== '') {
            factorValue = row.C;
          }
          
          if (factorValue) {
            client[propertyName] = factorValue;
            console.log(`Set client.${propertyName} = '${factorValue}'`);
          }
        }
      });
    }
    
    // Ensure all categories have at least empty arrays for factors
    if (client.extractedRiskData) {
      client.extractedRiskData.forEach(category => {
        if (!category.factors) {
          category.factors = [];
        }
      });
    }
    
    console.log(`Extracted ${riskFactors.length} risk factors for client ${clientName}`);
    if (riskFactors.length > 0) {
      console.log('Sample risk factors:', riskFactors.slice(0, 3));
    } else {
      console.log('WARNING: No risk factors found for client', clientName);
    }
    
    clients.push(client);
  });
  
  return { clients };
}

// Function to extract data from a specific Excel range
function extractSpecificRange(sheet, range) {
  // Parse the range string (e.g., 'A8:E25')
  const [start, end] = range.split(':');
  
  // Convert Excel column letters to indices
  const startCol = start.replace(/[0-9]/g, '').charCodeAt(0) - 65; // A=0, B=1, etc.
  const startRow = parseInt(start.replace(/[A-Z]/g, '')) - 1; // 1-indexed to 0-indexed
  const endCol = end.replace(/[0-9]/g, '').charCodeAt(0) - 65;
  const endRow = parseInt(end.replace(/[A-Z]/g, '')) - 1;
  
  // Extract data from the specified range
  const rangeData = [];
  
  // Define known categories (same as in Python script)
  const knownCategories = [
    'Zone géographique',
    'Caractéristiques du client',
    'Réputation du client',
    'Nature produits/opérations',
    'Canal de distribution'
  ];
  
  let currentCategory = '';
  let currentCategoryRating = 'Faible';
  
  // First pass: identify all categories and their positions
  const categoryPositions = [];
  for (let row = startRow; row <= endRow; row++) {
    // Check if this row contains a category name (in column A)
    const cellRef = 'A' + (row + 1); // Convert to 1-indexed
    if (sheet[cellRef]) {
      const cellValue = sheet[cellRef].w || sheet[cellRef].v;
      if (cellValue) {
        const isCategory = knownCategories.some(cat => 
          cellValue === cat || (typeof cellValue === 'string' && cellValue.includes(cat))
        );
        
        if (isCategory) {
          categoryPositions.push({
            row: row,
            name: cellValue
          });
        }
      }
    }
  }
  
  // Second pass: extract all data with proper category assignment
  for (let i = 0; i < categoryPositions.length; i++) {
    const categoryPos = categoryPositions[i];
    const nextCategoryPos = categoryPositions[i + 1];
    const categoryEndRow = nextCategoryPos ? nextCategoryPos.row - 1 : endRow;
    
    // Get category rating from column E
    const ratingCellRef = 'E' + (categoryPos.row + 1);
    let categoryRating = 'Faible';
    if (sheet[ratingCellRef]) {
      const ratingValue = sheet[ratingCellRef].w || sheet[ratingCellRef].v;
      if (ratingValue && ['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(ratingValue)) {
        categoryRating = ratingValue;
      }
    }
    
    // Add the category row
    const categoryRowData = { A: categoryPos.name, isCategory: true, rating: categoryRating };
    rangeData.push(categoryRowData);
    
    // Add all risk factors for this category
    for (let row = categoryPos.row + 1; row <= categoryEndRow; row++) {
      const rowData = { category: categoryPos.name };
      let hasData = false;
      
      // Extract all columns for this row
      for (let col = startCol; col <= endCol; col++) {
        const colLetter = String.fromCharCode(65 + col);
        const cellRef = colLetter + (row + 1); // Convert to 1-indexed
        
        if (sheet[cellRef]) {
          const cellValue = sheet[cellRef].w || sheet[cellRef].v;
          rowData[colLetter] = cellValue;
          
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            hasData = true;
          }
        } else {
          rowData[colLetter] = null;
        }
      }
      
      // Determine rating for this factor
      if (rowData['E'] && ['Faible', 'Moyen', 'Élevé', 'Elevé'].includes(rowData['E'])) {
        rowData.rating = rowData['E'];
      } else {
        rowData.rating = categoryRating;
      }
      
      // Only add rows that have data in column A (factor name)
      if (hasData && rowData['A']) {
        rangeData.push(rowData);
      }
    }
  }
  
  return rangeData;
}



  // Handle all other requests with Next.js
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  const porte = 3000; // ✅ Port fixe - Integrated with main dashboard

  app.listen(porte, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${porte}`);
    console.log(`> LBCFT WEBAPP available at http://localhost:${porte}/amlcenter`);
  });
});