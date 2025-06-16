#!/usr/bin/env python3
"""
Test script for DOC Secure integration
This script can be called from Node.js to test the Python integration
"""

import sys
import json
import os

def test_python_integration():
    """Test function to verify Python integration works"""
    try:
        # Test basic functionality
        result = {
            "success": True,
            "message": "Python integration is working",
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "current_directory": os.getcwd(),
            "script_path": __file__,
            "test_data": {
                "documents": [
                    {
                        "id": 1,
                        "title": "Test Document 1",
                        "category": "Procédures",
                        "file_size": 1024
                    },
                    {
                        "id": 2,
                        "title": "Test Document 2", 
                        "category": "Politiques",
                        "file_size": 2048
                    }
                ]
            }
        }
        
        print(json.dumps(result, indent=2))
        return True
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
        print(json.dumps(error_result, indent=2))
        return False

if __name__ == "__main__":
    # Check if we have command line arguments
    if len(sys.argv) > 1:
        action = sys.argv[1]
        
        if action == "test":
            test_python_integration()
        elif action == "list":
            # Mock list documents
            result = {
                "success": True,
                "documents": [
                    {
                        "id": 1,
                        "title": "Procédure d'ouverture de compte",
                        "original_filename": "procedure_ouverture.pdf",
                        "stored_filename": "20250615_120000_procedure_ouverture.pdf",
                        "category": "Procédures",
                        "description": "Document décrivant la procédure d'ouverture de compte client",
                        "file_size": 2048576,
                        "upload_date": "2025-06-15T10:30:00Z",
                        "last_modified": "2025-06-15T10:30:00Z",
                        "file_path": "procedures/20250615_120000_procedure_ouverture.pdf",
                        "mime_type": "application/pdf",
                        "metadata": {}
                    }
                ]
            }
            print(json.dumps(result, default=str))
        elif action == "stats":
            # Mock statistics
            result = {
                "success": True,
                "statistics": {
                    "total_documents": 4,
                    "category_counts": {
                        "Procédures": 1,
                        "Modes d'emploi": 1,
                        "Notes internes": 1,
                        "Politiques": 1
                    },
                    "total_size_bytes": 7680576,
                    "total_size_mb": 7.33,
                    "categories": ["Procédures", "Modes d'emploi", "Notes internes", "Politiques"]
                }
            }
            print(json.dumps(result, default=str))
        else:
            print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))
    else:
        # Default test
        test_python_integration()
