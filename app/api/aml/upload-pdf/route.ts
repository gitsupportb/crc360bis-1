import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Store the parsed PDF data (shared across API routes)
let pdfData: any = null;
let allPdfData: any = null;

// Track processed names to avoid duplicates
const processedNames = new Set();

// Function to process PDF text into structured data (from LBCFT WEBAPP)
function processPdfText(text: string) {
  const entries: any[] = [];
  const processedIds = new Set(); // Track processed IDs to avoid duplicates

  // First, try to identify and parse entity entries (KPe, QDe, IQe, CDe) - entities end with 'e'
  // Improved regex to match the specific format: 2 letters + 'e' + dot + 3 numbers
  const entityRegex = /([A-Z]{2}e)\.(\d{3})\s+(?:Nom|Name):/g;
  let entityMatches: any[] = [];
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
  let personMatches: any[] = [];

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

  // Log the number of entries found for debugging
  console.log(`Found ${entries.length} entries in the sanctions list.`);

  return entries;
}

// Function to parse a person entry (CDi, GBi, etc.)
function parsePersonEntry(text: string) {
  const entry: any = {
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
  const idNomMatch = text.match(/^\s*([A-Z]{2}[ei])\.\d{3}|(?:^|\n|\r)\s*([A-Z]{2}[ei])\.\d{3}\s+(?:Nom|Name):/);
  if (idNomMatch) {
    const idPart = idNomMatch[0].match(/([A-Z]{2}[ei])\.\d{3}/);
    if (idPart) {
      entry.id = idPart[0].trim();
      entry.type = idPart[1].endsWith('e') ? 'entity' : 'person';
    }
  } else {
    const dashedMatch = text.match(/\-\s+(\d+):\s+[A-Z]+/);
    if (dashedMatch) {
      entry.id = `COMP.${dashedMatch[1]}`;
    } else {
      const genericIdMatch = text.match(/^\s*([A-Z]{2,3})\.\d+|\b([A-Z]{2,3})\.\d+\s+(?:Nom|Name):/);
      if (genericIdMatch) {
        const idPart = genericIdMatch[0].match(/([A-Z]{2,3})\.\d+/);
        if (idPart) {
          entry.id = idPart[0].trim();
          const prefix = idPart[1];
          if (prefix.endsWith('i')) {
            entry.type = 'person';
          } else if (prefix.endsWith('e')) {
            entry.type = 'entity';
          }
        }
      } else {
        if (entry.type === 'person') {
          entry.id = `QDi.${Math.floor(Math.random() * 900) + 100}`;
        } else {
          entry.id = `QDe.${Math.floor(Math.random() * 900) + 100}`;
        }
      }
    }
  }

  // Extract name and name components
  const nameMatch = text.match(/(?:Nom|Name):\s*(.+?)\s*(?:Nom \(alphabet d'origine\)|Original script|Titre|Title|Désignation|Designation|Date de naissance|Date of birth|Lieu de naissance|Place of birth|Pseudonyme|A\.k\.a\.|Nationalité|Nationality|$)/is);
  if (nameMatch) {
    entry.name = nameMatch[1].trim();

    const nameComponentsMatch = entry.name.match(/\d+:\s*[^\d:]+(?=\s+\d+:|$)/g);
    if (nameComponentsMatch) {
      entry.nameComponents = nameComponentsMatch.map((component: string) => {
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
    const otherNames = otherNamesText.split(/[;,]|\d+\)/).filter((name: string) => name.trim() !== '');
    entry.otherNames = otherNames.map((name: string) => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }

  // Extract previously known as
  const previouslyKnownMatch = text.match(/Précédemment connu\(e\) sous le nom de:\s*(.+?)\s*(?:Titre|Désignation|Date de naissance|Lieu de naissance|Pseudonyme|Nationalité|$)/i);
  if (previouslyKnownMatch) {
    const previouslyKnownText = previouslyKnownMatch[1];
    const previouslyKnown = previouslyKnownText.split(/[;,]|\d+\)/).filter((name: string) => name.trim() !== '');
    entry.previouslyKnownAs = previouslyKnown.map((name: string) => name.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
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
    const reliableAliases = reliableAliasText.split(/[;,]|\d+\)/).filter((alias: string) => alias.trim() !== '');
    entry.reliableAlias = reliableAliases.map((alias: string) => alias.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
  }

  // Extract unreliable alias
  const unreliableAliasMatch = text.match(/Pseudonyme peu fiable:\s*(.+?)\s*(?:Nationalité|$)/is);
  if (unreliableAliasMatch) {
    const unreliableAliasText = unreliableAliasMatch[1];
    const multiAliasMatch = unreliableAliasText.match(/[a-z]\)\s*.+?(?=[a-z]\)|$)/g);

    if (multiAliasMatch) {
      entry.unreliableAlias = multiAliasMatch.map((alias: string) => alias.replace(/^[a-z]\)\s*/, '').trim());
    } else {
      const unreliableAliases = unreliableAliasText.split(/[;,]|\d+\)/).filter((alias: string) => alias.trim() !== '');
      entry.unreliableAlias = unreliableAliases.map((alias: string) => alias.trim().replace(/^[\s,;:]+|[\s,;:]+$/g, ''));
    }
  }

  // Extract nationality
  const nationalityMatch = text.match(/Nationalité:\s*(.+?)\s*(?:Numéro de passeport|Numéro national|Adresse|Date d'inscription|$)/is);
  if (nationalityMatch) {
    entry.nationality = nationalityMatch[1].trim();
  }

  // Extract passport number
  const passportMatch = text.match(/Numéro de passeport:\s*(.+?)\s*(?:Numéro national|Adresse|Date d'inscription|$)/is);
  if (passportMatch) {
    entry.passportNo = passportMatch[1].trim();
  } else {
    const altPassportMatch = text.match(/Numéro de passport:\s*(.+?)\s*(?:Numéro national|Adresse|Date d'inscription|$)/is);
    if (altPassportMatch) {
      entry.passportNo = altPassportMatch[1].trim();
    }
  }

  // Extract national ID
  const idNoMatch = text.match(/Numéro national d'identification:\s*(.+?)\s*(?:Adresse|Date d'inscription|$)/is);
  if (idNoMatch) {
    entry.nationalId = idNoMatch[1].trim();
  } else {
    const altIdNoMatch = text.match(/Numéro national d\'identité:\s*(.+?)\s*(?:Adresse|Date d'inscription|$)/is);
    if (altIdNoMatch) {
      entry.nationalId = altIdNoMatch[1].trim();
    }
  }

  return entry;
}

// Function to parse an entity entry (KPe, QDe, IQe, CDe)
function parseEntityEntry(text: string) {
  const entry: any = {
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
  const idNomMatch = text.match(/^\s*([A-Z]{2}[ei])\.\d{3}|(?:^|\n|\r)\s*([A-Z]{2}[ei])\.\d{3}\s+(?:Nom|Name):/);
  if (idNomMatch) {
    const idPart = idNomMatch[0].match(/([A-Z]{2}[ei])\.\d{3}/);
    if (idPart) {
      entry.id = idPart[0].trim();
      entry.type = idPart[1].endsWith('e') ? 'entity' : 'person';
    }
  }

  // Extract name
  const nameMatch = text.match(/Nom:\s*(.+?)\s*(?:Autre\(s\) nom\(s\)|Nom \(alphabet d'origine\)|Précédemment connu\(e\)|Adresse|Date d'inscription|Nationalité|Renseignements divers|$)/i);
  if (nameMatch) {
    entry.name = nameMatch[1].trim();
  }

  // Extract nationality
  const nationalityMatch = text.match(/Nationalité:\s*(.+?)\s*(?:Autre\(s\) nom\(s\)|Précédemment connu\(e\)|Adresse|Date d'inscription|Renseignements divers|$)/i);
  if (nationalityMatch) {
    entry.nationality = nationalityMatch[1].trim();
  }

  return entry;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('pdfFile') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the uploaded file to the amlcenter uploads directory
    const uploadDir = path.join(process.cwd(), 'app', 'amlcenter', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `pdfFile-${Date.now()}.pdf`);
    await writeFile(filePath, buffer);

    // Process the PDF using dynamic import to avoid module loading issues
    try {
      const pdfParse = require('pdf-parse');
      const data_parsed = await pdfParse(buffer);

      // Process the PDF text to extract structured data using the real function
      const processedData = processPdfText(data_parsed.text);

      // Store the data globally for access by other routes
      pdfData = processedData;
      allPdfData = processedData;

      console.log(`✅ PDF processed successfully. Found ${processedData.length} entries.`);
    } catch (error) {
      console.error('Error with pdf-parse:', error);
      // Fallback: create sample data structure
      const processedData = [
        {
          id: "QDi.001",
          name: "Sample Entry - PDF Processing Available After Dependencies Install",
          type: "person",
          nationality: "N/A",
          listedOn: new Date().toLocaleDateString(),
          lastUpdated: new Date().toLocaleDateString(),
          otherInfo: "This is sample data. Install pdf-parse dependency for full functionality."
        }
      ];

      pdfData = processedData;
      allPdfData = processedData;
    }


    // Redirect to the main page (this mimics the original LBCFT WEBAPP behavior)
    return NextResponse.redirect(new URL('/amlcenter', request.url));

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}

// Export the data for access by other routes
export { pdfData, allPdfData };
