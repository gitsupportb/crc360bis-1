import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

interface DocumentInfo {
  id: number;
  title: string;
  original_filename: string;
  stored_filename: string;
  category: string;
  file_path: string;
  mime_type: string;
  file_size: number;
}

function getDocumentInfo(documentId: number): Promise<DocumentInfo | null> {
  return new Promise((resolve) => {
    // Mock document data for testing
    const mockDocuments: { [key: number]: DocumentInfo } = {
      1: {
        id: 1,
        title: "Procédure d'ouverture de compte",
        original_filename: "procedure_ouverture.pdf",
        stored_filename: "20250615_120000_procedure_ouverture.pdf",
        category: "Procédures",
        file_path: "procedures/20250615_120000_procedure_ouverture.pdf",
        mime_type: "application/pdf",
        file_size: 2048576
      },
      2: {
        id: 2,
        title: "Mode d'emploi système de trading",
        original_filename: "guide_trading.docx",
        stored_filename: "20250615_113000_guide_trading.docx",
        category: "Modes d'emploi",
        file_path: "modes_emploi/20250615_113000_guide_trading.docx",
        mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file_size: 1536000
      },
      3: {
        id: 3,
        title: "Note interne conformité",
        original_filename: "note_conformite.pdf",
        stored_filename: "20250615_100000_note_conformite.pdf",
        category: "Notes internes",
        file_path: "notes_internes/20250615_100000_note_conformite.pdf",
        mime_type: "application/pdf",
        file_size: 1024000
      },
      4: {
        id: 4,
        title: "Politique de sécurité des données",
        original_filename: "politique_securite.pdf",
        stored_filename: "20250614_160000_politique_securite.pdf",
        category: "Politiques",
        file_path: "politiques/20250614_160000_politique_securite.pdf",
        mime_type: "application/pdf",
        file_size: 3072000
      }
    };

    const document = mockDocuments[documentId];
    resolve(document || null);
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const documentId = parseInt(params.id);

    if (isNaN(documentId)) {
      return NextResponse.json({
        error: 'Invalid document ID'
      }, { status: 400 });
    }

    // Get document information from database
    const documentInfo = await getDocumentInfo(documentId);

    if (!documentInfo) {
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 });
    }

    // For demo purposes, create a mock file content
    let fileBuffer: Buffer;

    if (documentInfo.mime_type === 'application/pdf') {
      // Create a simple PDF-like content
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${documentInfo.title}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;
      fileBuffer = Buffer.from(pdfContent, 'utf8');
    } else {
      // Create a simple text content for other file types
      const textContent = `Document: ${documentInfo.title}
Category: ${documentInfo.category}
Original Filename: ${documentInfo.original_filename}

This is a mock document for demonstration purposes.
The actual document content would be displayed here.

Generated on: ${new Date().toISOString()}`;
      fileBuffer = Buffer.from(textContent, 'utf8');
    }

    // Determine content type
    const contentType = documentInfo.mime_type || 'application/octet-stream';

    // Create response with file
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(documentInfo.original_filename)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    return response;

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({
      error: 'Internal server error during file download'
    }, { status: 500 });
  }
}
