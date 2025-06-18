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
  try {
    pdfParse = require('pdf-parse');
  } catch (fallbackError) {
    console.error('Fallback pdf-parse require also failed:', fallbackError);
    pdfParse = null;
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Determine the base directory for the application
const isPackaged = process.pkg !== undefined;
const baseDir = isPackaged ? path.dirname(process.execPath) : path.join(__dirname, 'app', 'amlcenter');

// Ensure uploads directory exists
const uploadsDir = path.join(baseDir, 'uploads');
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

// Track processed names to avoid duplicates
const processedNames = new Set();
