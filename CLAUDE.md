# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRC360 (Comprehensive Risk and Compliance 360°) is an enterprise-grade risk management and compliance platform for BCP Securities Services. It's a Next.js 15 application with an integrated Express.js server that provides four main modules: Rep Watch, AML Center, Doc Secure, and R-Sense.

## Development Commands

### Core Commands
- `npm run dev` - Start the integrated development server (uses integrated-server.js)
- `npm run build` - Build the Next.js application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### Alternative Development
- `npm run dev-all` - Run all services concurrently (Next.js + Python Django services)
- `npm run dev-original` - Alias for dev-all using pnpm

### Docker Commands
- `./docker-build-crc360.bat` or `./docker-build-crc360.sh` - Build Docker image
- `./docker-run-crc360.bat` or `./docker-run-crc360.sh` - Run containerized application
- `docker-compose up` - Start complete multi-service environment

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.2.4 with React 19, TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.17 with custom orange/brown color scheme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Backend**: Integrated Express.js server with Next.js API routes
- **File Processing**: XLSX, PDF-Parse, XML2JS, Multer for uploads
- **Database**: SQLite for document metadata, in-memory for real-time data

### Key Server Files
- `integrated-server.js` - Main development server combining Express.js and Next.js
- `server.js` - Alternative server configuration
- `lbcft-server.js` - LBCFT (AML) specific server

### Application Structure
```
app/
├── page.tsx              # Main dashboard with 4 module cards
├── layout.tsx            # Root layout with Inter font
├── globals.css           # Global styles and CSS variables
├── rep-watch/            # Risk monitoring and reporting module
├── amlcenter/            # Anti-Money Laundering compliance module
├── docsecure/            # Document management and security module
├── rsense/               # Risk calculation and modeling tools
├── api/                  # Next.js API routes
└── admin/                # Administrative interfaces

components/
├── ui/                   # Shadcn/UI component library
├── admin/                # Admin-specific components
├── docsecure/            # Document security components
├── rsense/               # Risk sensing components
└── theme-provider.tsx    # Theme context provider
```

## Module Architecture

### Main Dashboard (`app/page.tsx`)
- Card-based layout with hover effects and animations
- Four main navigation cards linking to primary modules
- Responsive design with mobile-optimized navigation
- BCP Securities Services branding with orange (#FF6B35) color scheme

### Rep Watch
- Advanced risk monitoring and reporting system
- Calendar heatmap for deadline tracking
- 68+ regulatory reports across 3 categories
- Plotly.js visualizations with PNG export capabilities

### AML Center
- Anti-Money Laundering compliance and monitoring
- Python-based backend processing (Django components)
- Excel file analysis and profile matching algorithms
- Upload analytics and comprehensive tracking

### Doc Secure
- Secure document management system
- File upload/download with category-based filtering
- Document processing and metadata extraction

### R-Sense
- Advanced risk calculation and modeling tools
- Financial risk analytics and stress testing

## Python Integration

The application includes Python Django services for specialized processing:
- `app/amlcenter/` contains Python scripts for Excel analysis and AML processing
- Multiple Django projects under `app/Dashboard/bcp2s-risk-platform/`
- Use `npm run dev-all` to start both Next.js and Python services simultaneously

## Development Notes

### Configuration
- TypeScript strict mode enabled with ES6 target
- Path aliases configured: `@/*` maps to project root
- Images unoptimized in next.config.mjs for standalone deployment
- Build optimization with parallel compilation enabled

### Styling
- Tailwind CSS with custom orange/brown color palette
- CSS variables in globals.css for theme consistency
- shadcn/ui components with Radix UI primitives
- Responsive design patterns throughout

### File Processing
- Upload directory: `app/amlcenter/uploads/`
- Supports XLSX, PDF, XML file processing
- Multer middleware for file handling
- String similarity algorithms for data matching

## Docker & Deployment

- Multiple Dockerfile configurations (main, dev, bcp2s-specific)
- Docker Compose setup for multi-service deployment
- Supervisor configuration for process management
- Production builds use standalone output mode

## Important Patterns

1. **Server Integration**: The application uses `integrated-server.js` to combine Express.js middleware with Next.js, enabling custom file upload handling and API endpoints alongside Next.js functionality.

2. **Module Architecture**: Each major feature (rep-watch, amlcenter, docsecure, rsense) is organized as a separate app directory with its own pages, components, and API routes.

3. **Hybrid Stack**: Combines Next.js/React frontend with Python Django services for specialized data processing, particularly in the AML Center module.

4. **File Processing Pipeline**: Extensive file handling capabilities with support for Excel, PDF, and XML processing, including similarity matching and data extraction.

5. **Component Library**: Uses shadcn/ui components built on Radix UI primitives, with custom styling to match BCP Securities Services branding.