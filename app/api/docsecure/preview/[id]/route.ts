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
    const scriptPath = path.join(process.cwd(), 'utils', 'docsecure', 'api_integration.py');
    
    // Try different Python commands to ensure compatibility
    const pythonCommands = ['python', 'python3', 'py'];
    let python;
    
    for (const cmd of pythonCommands) {
      try {
        python = spawn(cmd, [scriptPath, 'get', documentId.toString()], {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        });
        break;
      } catch (error) {
        console.warn(`Failed to spawn ${cmd}, trying next command`);
        continue;
      }
    }
    
    if (!python) {
      console.warn('No Python command found, using fallback document lookup');
      // Use fallback mock data immediately
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
      return;
    }

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.success && result.document) {
            resolve(result.document);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse Python output for document info');
        }
      }

      // Fallback to mock data if Python fails
      console.warn('Python script failed for document info, using fallback');
      resolve(null);
    });

    python.on('error', (error) => {
      console.warn('Python execution failed for document info:', error.message);
      resolve(null);
    });
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const documentId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

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

    // Try to read the actual file content for preview
    let previewContent = '';
    let previewType = 'text';

    try {
      const docsSecureDir = path.join(process.cwd(), 'docsecureDOCS');
      const filePath = path.join(docsSecureDir, documentInfo.file_path);
      
      if (existsSync(filePath)) {
        // Read the file content
        const fileBuffer = await readFile(filePath);
        
        if (documentInfo.mime_type === 'application/pdf') {
          // Both admin and regular users get the PDF content
          // Security restrictions are handled in the frontend component
          previewType = isAdmin ? 'pdf' : 'pdf-secure';
          previewContent = fileBuffer.toString('base64');
        } else {
          // For other file types, try to read as text
          previewType = 'text';
          previewContent = fileBuffer.toString('utf8');
        }
      } else {
        previewType = 'text';
        previewContent = `Document file not found at: ${filePath}`;
      }
    } catch (error) {
      console.error('Error reading file for preview:', error);
      previewType = 'text';
      previewContent = `Error reading document: ${error}`;
    }

    // Return document info and preview content
    return NextResponse.json({
      success: true,
      document: documentInfo,
      preview: {
        type: previewType,
        content: previewContent
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({
      error: 'Internal server error during preview'
    }, { status: 500 });
  }
}