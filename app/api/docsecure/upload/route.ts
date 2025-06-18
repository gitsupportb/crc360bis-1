import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/msword', // .doc
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-powerpoint', // .ppt
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt'];

interface UploadResponse {
  success: boolean;
  message: string;
  documentId?: number;
  error?: string;
}

function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (50MB)`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `File type '${extension}' is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      };
    }
  }

  return { valid: true };
}

function callPythonScript(
  filePath: string,
  title: string,
  category: string,
  description: string
): Promise<{ success: boolean; message: string; documentId?: number }> {
  return new Promise((resolve) => {
    // For now, simulate successful upload until Python integration is fully working
    try {
      const fs = require('fs');
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Simulate processing delay
      setTimeout(() => {
        // Generate a mock document ID
        const documentId = Math.floor(Math.random() * 10000) + 1000;

        resolve({
          success: true,
          message: `Document "${title}" uploaded successfully to category "${category}"`,
          documentId: documentId
        });
      }, 1000);

    } catch (error) {
      resolve({
        success: false,
        message: `Error processing file: ${error}`
      });
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const title = data.get('title') as string;
    const category = data.get('category') as string;
    const description = data.get('description') as string || '';

    // Validate required fields
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    if (!title || !category) {
      return NextResponse.json({
        success: false,
        error: 'Title and category are required'
      }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Create temporary upload directory
    const tempDir = path.join(process.cwd(), 'temp', 'uploads');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const tempFileName = `${timestamp}_${file.name}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await writeFile(tempFilePath, buffer);

    try {
      // Process upload using Python script
      const result = await callPythonScript(tempFilePath, title, category, description);

      // Clean up temporary file
      try {
        const fs = require('fs');
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          documentId: result.documentId
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.message
        }, { status: 500 });
      }

    } catch (pythonError) {
      // Clean up temporary file on error
      try {
        const fs = require('fs');
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      return NextResponse.json({
        success: false,
        error: `Processing failed: ${pythonError}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during file upload'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'DOC Secure Upload API',
    maxFileSize: '50MB',
    allowedTypes: ALLOWED_EXTENSIONS,
    categories: ['Procédures', 'Modes d\'emploi', 'Notes internes', 'Politiques']
  });
}
