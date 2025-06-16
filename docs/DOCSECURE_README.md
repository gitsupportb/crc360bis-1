# DOC Secure - Document Management System

## Overview

DOC Secure is a comprehensive document management system integrated into the BCP2S dashboard. It provides secure document storage, categorization, and management capabilities with a user-friendly web interface.

## Features

### 🔐 Security
- Secure file storage with SHA256 hash verification
- Duplicate file detection
- File type validation
- Size limit enforcement (50MB per file)

### 📁 Organization
- Automatic categorization into predefined folders:
  - **Procédures** → `procedures/`
  - **Modes d'emploi** → `modes_emploi/`
  - **Notes internes** → `notes_internes/`
  - **Politiques** → `politiques/`

### 📄 File Support
- **PDF** documents (`.pdf`)
- **Microsoft Word** documents (`.doc`, `.docx`)
- **Microsoft Excel** spreadsheets (`.xls`, `.xlsx`)
- **Microsoft PowerPoint** presentations (`.ppt`, `.pptx`)

### 🔍 Management
- Document search and filtering
- Metadata storage and retrieval
- Download functionality
- Document deletion
- Upload progress tracking

## Architecture

### Backend Components

#### 1. Python Database System (`utils/docsecure/database.py`)
- **DocSecureDatabase**: Main database class
- SQLite database for metadata storage
- File system management
- Validation and security checks

#### 2. API Routes
- **Upload**: `/api/docsecure/upload` - Handle file uploads
- **Documents**: `/api/docsecure/documents` - List and manage documents
- **Download**: `/api/docsecure/download/[id]` - Download specific documents

#### 3. Frontend Components
- **Import Page**: `/docsecure/import` - File upload interface
- **Documents Page**: `/docsecure/documents` - Document management interface
- **Dashboard Layout**: Consistent UI across all pages

### Database Schema

```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    file_size INTEGER NOT NULL,
    file_hash TEXT NOT NULL UNIQUE,
    mime_type TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT NOT NULL,
    metadata TEXT  -- JSON string for additional metadata
);
```

### Folder Structure

```
docsecureDOCS/
├── metadata.db                 # SQLite database
├── procedures/                 # Procédures documents
├── modes_emploi/              # Modes d'emploi documents
├── notes_internes/            # Notes internes documents
└── politiques/                # Politiques documents
```

## Installation & Setup

### 1. Initialize the Database

Run the initialization script to set up the database and folder structure:

```bash
python scripts/init_docsecure.py
```

### 2. Install Dependencies

The system uses only Python built-in modules, but you can install optional dependencies:

```bash
pip install -r requirements.txt
```

### 3. Verify Setup

Check that the following directories exist:
- `docsecureDOCS/` (created automatically)
- `utils/docsecure/` (contains database.py)
- `app/api/docsecure/` (contains API routes)

## Usage

### Uploading Documents

1. Navigate to `/docsecure/import`
2. Fill in the document details:
   - **Title**: Document name
   - **Category**: Select from predefined categories
   - **Description**: Optional description
3. Select or drag-and-drop a file (max 50MB)
4. Click "Importer le document"

### Managing Documents

1. Navigate to `/docsecure/documents`
2. Use the search bar to find specific documents
3. Filter by category using the tabs
4. Sort by title or upload date
5. Actions available:
   - **👁️ Preview**: View document details
   - **⬇️ Download**: Download the original file
   - **✏️ Edit**: Modify document metadata
   - **🗑️ Delete**: Remove document and file

### API Usage

#### Upload a Document
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('title', 'Document Title');
formData.append('category', 'Procédures');
formData.append('description', 'Optional description');

const response = await fetch('/api/docsecure/upload', {
    method: 'POST',
    body: formData
});
```

#### List Documents
```javascript
const response = await fetch('/api/docsecure/documents?category=Procédures&search=keyword');
const data = await response.json();
```

#### Download a Document
```javascript
const response = await fetch(`/api/docsecure/download/${documentId}`);
const blob = await response.blob();
```

## Configuration

### File Size Limit
Default: 50MB per file
Location: `utils/docsecure/database.py` → `max_file_size`

### Allowed File Types
Default: PDF, DOCX, XLSX, PPTX, DOC, XLS, PPT
Location: `utils/docsecure/database.py` → `allowed_extensions`

### Categories
Default: Procédures, Modes d'emploi, Notes internes, Politiques
Location: `utils/docsecure/database.py` → `categories`

## Security Considerations

1. **File Validation**: All files are validated for type and size
2. **Hash Verification**: SHA256 hashes prevent duplicate uploads
3. **Secure Storage**: Files are stored outside the web root
4. **Access Control**: API routes should be protected with authentication
5. **Input Sanitization**: All user inputs are sanitized

## Troubleshooting

### Common Issues

1. **Python Module Not Found**
   - Ensure `utils/docsecure/` is in the Python path
   - Run the initialization script

2. **File Upload Fails**
   - Check file size (max 50MB)
   - Verify file type is supported
   - Ensure write permissions on `docsecureDOCS/` directory

3. **Database Errors**
   - Run `python scripts/init_docsecure.py` to reinitialize
   - Check SQLite database permissions

### Logs and Debugging

- API errors are logged to the browser console
- Python errors are displayed in the terminal
- Check the `docsecureDOCS/` directory for file system issues

## Future Enhancements

- [ ] Document versioning
- [ ] Advanced search with full-text indexing
- [ ] Document preview in browser
- [ ] Bulk upload functionality
- [ ] User permissions and access control
- [ ] Document expiration and archiving
- [ ] Integration with external storage (AWS S3, etc.)
- [ ] Document templates and workflows

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Examine the browser console for errors
4. Check the Python terminal output
