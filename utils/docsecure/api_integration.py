#!/usr/bin/env python3
"""
DOC Secure API Integration Script
Connects Node.js API routes with Python database backend
"""

import sys
import json
import os
from pathlib import Path
import tempfile
import shutil

# Add the current directory to path so we can import our database module
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from database import DocSecureDatabase, create_database_instance

def handle_upload(temp_file_path: str, title: str, category: str, description: str = "") -> dict:
    """Handle document upload from Node.js"""
    try:
        # Create database instance
        db = create_database_instance()
        
        # Upload the document
        success, message, doc_id = db.upload_document(
            file_path=temp_file_path,
            title=title,
            category=category,
            description=description
        )
        
        return {
            "success": success,
            "message": message,
            "documentId": doc_id
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Upload processing error: {str(e)}"
        }

def handle_list_documents(category=None, search_term=None, limit=100, offset=0) -> dict:
    """Handle document listing request"""
    try:
        db = create_database_instance()
        documents = db.get_documents(
            category=category,
            search_term=search_term,
            limit=limit,
            offset=offset
        )
        
        return {
            "success": True,
            "documents": documents
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"List documents error: {str(e)}"
        }

def handle_get_statistics() -> dict:
    """Handle statistics request"""
    try:
        db = create_database_instance()
        stats = db.get_statistics()
        
        return {
            "success": True,
            "statistics": stats
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Statistics error: {str(e)}"
        }

def handle_delete_document(document_id: int) -> dict:
    """Handle document deletion"""
    try:
        db = create_database_instance()
        success, message = db.delete_document(document_id)
        
        return {
            "success": success,
            "message": message
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Delete error: {str(e)}"
        }

def handle_get_document(document_id: int) -> dict:
    """Handle get document by ID"""
    try:
        db = create_database_instance()
        document = db.get_document_by_id(document_id)
        
        if document:
            return {
                "success": True,
                "document": document
            }
        else:
            return {
                "success": False,
                "error": "Document not found"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Get document error: {str(e)}"
        }

def main():
    """Main function to handle command line arguments from Node.js"""
    try:
        if len(sys.argv) < 2:
            print(json.dumps({
                "success": False,
                "error": "No action specified"
            }))
            return
        
        action = sys.argv[1]
        
        if action == "upload":
            if len(sys.argv) < 5:
                print(json.dumps({
                    "success": False,
                    "error": "Missing upload parameters: file_path, title, category"
                }))
                return
            
            file_path = sys.argv[2]
            title = sys.argv[3]
            category = sys.argv[4]
            description = sys.argv[5] if len(sys.argv) > 5 else ""
            
            result = handle_upload(file_path, title, category, description)
            print(json.dumps(result))
            
        elif action == "list":
            # Parse optional parameters
            category = None
            search_term = None
            limit = 100
            offset = 0
            
            # Simple parameter parsing (can be enhanced)
            for i in range(2, len(sys.argv)):
                arg = sys.argv[i]
                if arg.startswith("--category="):
                    category = arg.split("=", 1)[1]
                elif arg.startswith("--search="):
                    search_term = arg.split("=", 1)[1]
                elif arg.startswith("--limit="):
                    limit = int(arg.split("=", 1)[1])
                elif arg.startswith("--offset="):
                    offset = int(arg.split("=", 1)[1])
            
            result = handle_list_documents(category, search_term, limit, offset)
            print(json.dumps(result))
            
        elif action == "stats":
            result = handle_get_statistics()
            print(json.dumps(result))
            
        elif action == "delete":
            if len(sys.argv) < 3:
                print(json.dumps({
                    "success": False,
                    "error": "Missing document ID for deletion"
                }))
                return
            
            document_id = int(sys.argv[2])
            result = handle_delete_document(document_id)
            print(json.dumps(result))
            
        elif action == "get":
            if len(sys.argv) < 3:
                print(json.dumps({
                    "success": False,
                    "error": "Missing document ID"
                }))
                return
            
            document_id = int(sys.argv[2])
            result = handle_get_document(document_id)
            print(json.dumps(result))
            
        elif action == "test":
            # Test connection
            result = {
                "success": True,
                "message": "DOC Secure API integration is working",
                "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                "database_path": str(create_database_instance().db_path)
            }
            print(json.dumps(result))
            
        else:
            print(json.dumps({
                "success": False,
                "error": f"Unknown action: {action}"
            }))
    
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Script error: {str(e)}",
            "error_type": type(e).__name__
        }))

if __name__ == "__main__":
    main()