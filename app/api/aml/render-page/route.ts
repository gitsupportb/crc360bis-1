import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Import EJS for template rendering
const ejs = require('ejs');

// Store the parsed PDF data (this will be shared across requests)
let pdfData: any = null;
let allPdfData: any = null;

export async function GET(request: NextRequest) {
  try {
    // Path to the LBCFT WEBAPP views
    const viewsPath = path.join(process.cwd(), 'app', 'amlcenter', 'views');
    const indexTemplatePath = path.join(viewsPath, 'index.ejs');
    
    // Check if template exists
    if (!fs.existsSync(indexTemplatePath)) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Read the template
    const templateContent = fs.readFileSync(indexTemplatePath, 'utf8');
    
    // Get pagination parameters from URL
    const url = new URL(request.url);
    const perPage = parseInt(url.searchParams.get('perPage') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');

    // Calculate pagination
    let displayData = pdfData;
    let totalPages = 1;
    let currentPage = 1;

    if (pdfData && perPage !== -1) {
      totalPages = Math.ceil(pdfData.length / perPage);
      currentPage = Math.min(Math.max(1, page), totalPages);
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      displayData = pdfData.slice(startIndex, endIndex);
    }

    // Prepare data for the template
    const templateData = {
      pdfData: displayData,
      allPdfData: allPdfData,
      perPage,
      currentPage,
      totalPages
    };
    
    // Render the EJS template
    const renderedHtml = ejs.render(templateContent, templateData, {
      views: viewsPath,
      filename: indexTemplatePath
    });
    
    // Modify the rendered HTML to fix asset paths and form actions
    const modifiedHtml = renderedHtml
      .replace(/href="\/css\//g, 'href="/amlcenter/css/')
      .replace(/src="\/js\//g, 'src="/amlcenter/js/')
      .replace(/action="\/upload-pdf"/g, 'action="/api/aml/upload-pdf"')
      .replace(/action="\/upload-xml"/g, 'action="/api/aml/upload-xml"')
      .replace(/action="\/match-excel"/g, 'action="/api/aml/match-excel"')
      .replace(/action="\/search"/g, 'action="/api/aml/search"');
    
    return new NextResponse(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error rendering page:', error);
    return NextResponse.json({ error: 'Failed to render page' }, { status: 500 });
  }
}

// Export the pdfData for use in other API routes
export { pdfData, allPdfData };
