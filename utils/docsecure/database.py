#!/usr/bin/env python3
"""
DOC Secure Database Management System
Handles document storage, categorization, and metadata management
"""

import os
import json
import sqlite3
import hashlib
import mimetypes
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import shutil

class DocSecureDatabase:
    """Main database class for DOC Secure document management"""
    
    def __init__(self, base_path: str = "docsecureDOCS"):
        self.base_path = Path(base_path)
        self.db_path = self.base_path / "metadata.db"
        self.categories = {
            "Procédures": "procedures",
            "Modes d'emploi": "modes_emploi", 
            "Notes internes": "notes_internes",
            "Politiques": "politiques"
        }
        self.max_file_size = 50 * 1024 * 1024  # 50MB in bytes
        self.allowed_extensions = {'.pdf', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt'}
        
        self._initialize_database()
        self._create_folder_structure()
    
    def _initialize_database(self):
        """Initialize SQLite database with document metadata schema"""
        self.base_path.mkdir(exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
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
            )
        ''')
        
        # Create index for faster searches
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON documents(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_title ON documents(title)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_upload_date ON documents(upload_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_file_hash ON documents(file_hash)')
        
        conn.commit()
        conn.close()
    
    def _create_folder_structure(self):
        """Create the folder structure for document categories"""
        for category_name, folder_name in self.categories.items():
            category_path = self.base_path / folder_name
            category_path.mkdir(exist_ok=True)
            
            # Create a README file in each category folder
            readme_path = category_path / "README.md"
            if not readme_path.exists():
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(f"# {category_name}\n\n")
                    f.write(f"Ce dossier contient les documents de type: {category_name}\n")
                    f.write(f"Créé automatiquement par DOC Secure le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _generate_unique_filename(self, original_filename: str, category: str) -> str:
        """Generate a unique filename to avoid conflicts"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(original_filename)
        # Clean filename of special characters
        clean_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        return f"{timestamp}_{clean_name}{ext}"
    
    def validate_file(self, file_path: Path, file_size: int) -> Tuple[bool, str]:
        """Validate file before upload"""
        # Check file size
        if file_size > self.max_file_size:
            return False, f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size (50MB)"
        
        # Check file extension
        file_ext = file_path.suffix.lower()
        if file_ext not in self.allowed_extensions:
            return False, f"File type '{file_ext}' is not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
        
        # Check if file exists and is readable
        if not file_path.exists():
            return False, "File does not exist"
        
        if not file_path.is_file():
            return False, "Path is not a file"
        
        return True, "File validation passed"
    
    def upload_document(self, 
                       file_path: str, 
                       title: str, 
                       category: str, 
                       description: str = "",
                       metadata: Dict = None) -> Tuple[bool, str, Optional[int]]:
        """
        Upload a document to the DOC Secure system
        
        Returns:
            Tuple[bool, str, Optional[int]]: (success, message, document_id)
        """
        try:
            source_path = Path(file_path)
            file_size = source_path.stat().st_size
            
            # Validate file
            is_valid, validation_message = self.validate_file(source_path, file_size)
            if not is_valid:
                return False, validation_message, None
            
            # Check if category is valid
            if category not in self.categories:
                return False, f"Invalid category. Must be one of: {', '.join(self.categories.keys())}", None
            
            # Calculate file hash to check for duplicates
            file_hash = self._calculate_file_hash(source_path)
            
            # Check for duplicate files
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT id, title FROM documents WHERE file_hash = ?', (file_hash,))
            existing = cursor.fetchone()
            
            if existing:
                conn.close()
                return False, f"File already exists with title: '{existing[1]}' (ID: {existing[0]})", None
            
            # Generate unique filename and destination path
            category_folder = self.categories[category]
            unique_filename = self._generate_unique_filename(source_path.name, category)
            dest_path = self.base_path / category_folder / unique_filename
            
            # Copy file to destination
            shutil.copy2(source_path, dest_path)
            
            # Get MIME type
            mime_type, _ = mimetypes.guess_type(str(dest_path))
            
            # Insert document metadata into database
            metadata_json = json.dumps(metadata or {})
            cursor.execute('''
                INSERT INTO documents 
                (title, original_filename, stored_filename, category, description, 
                 file_size, file_hash, mime_type, file_path, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                title,
                source_path.name,
                unique_filename,
                category,
                description,
                file_size,
                file_hash,
                mime_type,
                str(dest_path.relative_to(self.base_path)),
                metadata_json
            ))
            
            document_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return True, f"Document uploaded successfully with ID: {document_id}", document_id
            
        except Exception as e:
            return False, f"Error uploading document: {str(e)}", None
    
    def get_documents(self, 
                     category: Optional[str] = None, 
                     search_term: Optional[str] = None,
                     limit: int = 100,
                     offset: int = 0) -> List[Dict]:
        """Get documents with optional filtering"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = '''
            SELECT id, title, original_filename, stored_filename, category, 
                   description, file_size, upload_date, last_modified, 
                   file_path, mime_type, metadata
            FROM documents
        '''
        params = []
        conditions = []
        
        if category:
            conditions.append('category = ?')
            params.append(category)
        
        if search_term:
            conditions.append('(title LIKE ? OR description LIKE ?)')
            params.extend([f'%{search_term}%', f'%{search_term}%'])
        
        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)
        
        query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        documents = []
        for row in rows:
            doc = {
                'id': row[0],
                'title': row[1],
                'original_filename': row[2],
                'stored_filename': row[3],
                'category': row[4],
                'description': row[5],
                'file_size': row[6],
                'upload_date': row[7],
                'last_modified': row[8],
                'file_path': row[9],
                'mime_type': row[10],
                'metadata': json.loads(row[11]) if row[11] else {}
            }
            documents.append(doc)
        
        return documents
    
    def get_document_by_id(self, document_id: int) -> Optional[Dict]:
        """Get a specific document by ID"""
        documents = self.get_documents()
        for doc in documents:
            if doc['id'] == document_id:
                return doc
        return None
    
    def delete_document(self, document_id: int) -> Tuple[bool, str]:
        """Delete a document and its file"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get document info
            cursor.execute('SELECT file_path, title FROM documents WHERE id = ?', (document_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return False, f"Document with ID {document_id} not found"
            
            file_path, title = result
            full_path = self.base_path / file_path
            
            # Delete file if it exists
            if full_path.exists():
                full_path.unlink()
            
            # Delete database record
            cursor.execute('DELETE FROM documents WHERE id = ?', (document_id,))
            conn.commit()
            conn.close()
            
            return True, f"Document '{title}' deleted successfully"
            
        except Exception as e:
            return False, f"Error deleting document: {str(e)}"
    
    def get_statistics(self) -> Dict:
        """Get database statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total documents
        cursor.execute('SELECT COUNT(*) FROM documents')
        total_docs = cursor.fetchone()[0]
        
        # Documents by category
        cursor.execute('SELECT category, COUNT(*) FROM documents GROUP BY category')
        category_counts = dict(cursor.fetchall())
        
        # Total storage used
        cursor.execute('SELECT SUM(file_size) FROM documents')
        total_size = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_documents': total_docs,
            'category_counts': category_counts,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / 1024 / 1024, 2),
            'categories': list(self.categories.keys())
        }


# Utility functions for API integration
def create_database_instance():
    """Create and return a database instance"""
    return DocSecureDatabase()

def process_uploaded_file(file_data: bytes, 
                         filename: str, 
                         title: str, 
                         category: str, 
                         description: str = "") -> Tuple[bool, str, Optional[int]]:
    """Process an uploaded file from the web interface"""
    import tempfile
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as temp_file:
            temp_file.write(file_data)
            temp_path = temp_file.name
        
        # Upload to database
        db = create_database_instance()
        success, message, doc_id = db.upload_document(temp_path, title, category, description)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        return success, message, doc_id
        
    except Exception as e:
        return False, f"Error processing uploaded file: {str(e)}", None

if __name__ == "__main__":
    # Test the database system
    db = DocSecureDatabase()
    print("DOC Secure Database initialized successfully!")
    print(f"Database location: {db.db_path}")
    print(f"Document storage: {db.base_path}")
    print("Categories:", list(db.categories.keys()))
    print("Statistics:", db.get_statistics())
