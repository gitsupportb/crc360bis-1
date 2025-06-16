#!/usr/bin/env python3
"""
DOC Secure Database Initialization Script
This script initializes the DOC Secure database and folder structure
"""

import os
import sys
from pathlib import Path

# Add the utils directory to the Python path
current_dir = Path(__file__).parent
project_root = current_dir.parent
utils_dir = project_root / "utils" / "docsecure"
sys.path.append(str(utils_dir))

try:
    from database import DocSecureDatabase
except ImportError as e:
    print(f"Error importing database module: {e}")
    print(f"Make sure the utils/docsecure/database.py file exists")
    sys.exit(1)

def main():
    """Initialize the DOC Secure database system"""
    print("🔧 Initializing DOC Secure Database System...")
    print("=" * 50)
    
    try:
        # Create database instance
        db = DocSecureDatabase()
        
        print(f"✅ Database initialized successfully!")
        print(f"📁 Database location: {db.db_path}")
        print(f"📂 Document storage: {db.base_path}")
        print()
        
        # Display folder structure
        print("📋 Folder Structure:")
        for category_name, folder_name in db.categories.items():
            category_path = db.base_path / folder_name
            print(f"   📁 {category_name} → {category_path}")
            
            # Check if folder exists and list contents
            if category_path.exists():
                files = list(category_path.glob("*"))
                if files:
                    print(f"      📄 {len(files)} file(s) found")
                else:
                    print(f"      📄 Empty folder")
            else:
                print(f"      ❌ Folder not found")
        print()
        
        # Display database statistics
        print("📊 Database Statistics:")
        stats = db.get_statistics()
        print(f"   📄 Total documents: {stats['total_documents']}")
        print(f"   💾 Total storage: {stats['total_size_mb']} MB")
        print(f"   📂 Categories: {len(stats['categories'])}")
        
        if stats['category_counts']:
            print("   📋 Documents by category:")
            for category, count in stats['category_counts'].items():
                print(f"      • {category}: {count} document(s)")
        print()
        
        # Display configuration
        print("⚙️  Configuration:")
        print(f"   📏 Max file size: {db.max_file_size / 1024 / 1024:.0f} MB")
        print(f"   📎 Allowed extensions: {', '.join(db.allowed_extensions)}")
        print()
        
        print("✅ DOC Secure Database System is ready!")
        print("🚀 You can now use the import functionality in the web interface.")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
