#!/usr/bin/env python3
"""
UPLOADED_REPORTINGS File Listing Generator
Generates a JSON file listing all actual files in the UPLOADED_REPORTINGS folder
"""

import os
import json
from datetime import datetime
import sys

def scan_uploaded_reportings():
    """
    Scan the UPLOADED_REPORTINGS folder and create a file structure
    Only process folders that actually contain files
    """
    base_path = "./UPLOADED_REPORTINGS"
    
    if not os.path.exists(base_path):
        print(f"❌ Error: {base_path} folder not found!")
        return None
    
    print(f"🔍 Scanning folder structure: {base_path}")
    
    file_structure = {}
    total_files = 0
    total_folders = 0
    
    # Walk through all directories
    for root, dirs, files in os.walk(base_path):
        # Skip the base directory itself
        if root == base_path:
            continue
            
        # Only process folders that contain actual files
        reporting_files = []
        for file in files:
            if file.lower().endswith(('.xlsx', '.xls', '.pdf', '.docx', '.doc')):
                reporting_files.append(file)
                total_files += 1
        
        # Skip folders without files
        if not reporting_files:
            continue
            
        # Parse the path to extract authority/category/report/year/month
        rel_path = os.path.relpath(root, base_path)
        path_parts = rel_path.split(os.sep)

        # Only process folders that are at the correct depth (month level)
        # Handle different folder structures based on authority
        if len(path_parts) == 5:
            authority = path_parts[0]

            if authority == "BAM":
                # BAM structure: BAM/Category/Report/Year/Month
                category = path_parts[1]
                report = path_parts[2]
                year = path_parts[3]
                month = path_parts[4]
            else:
                continue  # Skip unknown authorities for 5-part paths
        elif len(path_parts) == 4:
            authority = path_parts[0]
            if authority in ["AMMC", "DGI"]:
                # AMMC/DGI structure: Authority/Report/Year/Month
                category = authority
                report = path_parts[1]
                year = path_parts[2]
                month = path_parts[3]
            else:
                # Legacy structure: Category/Report/Year/Month
                category = path_parts[0]
                report = path_parts[1]
                year = path_parts[2]
                month = path_parts[3]
        else:
            continue  # Skip paths that are not at month level

        # Initialize structure if needed
        if category not in file_structure:
            file_structure[category] = {}
        if report not in file_structure[category]:
            file_structure[category][report] = {}
        if year not in file_structure[category][report]:
            # Initialize with all 12 months for consistency
            file_structure[category][report][year] = {
                "1": [], "2": [], "3": [], "4": [], "5": [], "6": [],
                "7": [], "8": [], "9": [], "10": [], "11": [], "12": []
            }

        # Add files to structure
        file_structure[category][report][year][month] = reporting_files
        total_folders += 1

        print(f"📁 {category}/{report}/{year}/{month}: {len(reporting_files)} files")
        for file in reporting_files:
            print(f"   📄 {file}")
    
    print(f"\n📊 Scan Results:")
    print(f"   • Total files found: {total_files}")
    print(f"   • Total folders scanned: {total_folders}")
    print(f"   • Categories: {len(file_structure)}")
    
    return file_structure

def generate_file_listing():
    """
    Generate the file listing JSON
    """
    print("🚀 UPLOADED_REPORTINGS File Listing Generator")
    print("=" * 50)
    
    # Scan the folder structure
    file_structure = scan_uploaded_reportings()
    
    if file_structure is None:
        return False
    
    # Create the listing data
    listing_data = {
        "generated": datetime.now().isoformat(),
        "generator": "generate-file-listing-new.py",
        "description": "Real file listing for BCP Securities Services reporting dashboard",
        "base_path": "./UPLOADED_REPORTINGS",
        "structure": file_structure,
        "statistics": {
            "total_categories": len(file_structure),
            "total_reports": sum(len(reports) for reports in file_structure.values()),
            "total_files": sum(
                len(files) 
                for category in file_structure.values()
                for report in category.values()
                for year in report.values()
                for files in year.values()
            )
        }
    }
    
    # Write to JSON file
    output_file = "UPLOADED_REPORTINGS/file_listing.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(listing_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ File listing generated successfully!")
        print(f"📄 Output file: {output_file}")
        print(f"📊 Statistics:")
        print(f"   • Categories: {listing_data['statistics']['total_categories']}")
        print(f"   • Reports: {listing_data['statistics']['total_reports']}")
        print(f"   • Files: {listing_data['statistics']['total_files']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error writing file listing: {e}")
        return False

def main():
    """
    Main function
    """
    success = generate_file_listing()
    
    if success:
        print(f"\n🎯 File listing ready for dashboard!")
        print(f"The JavaScript file browser can now read real file contents.")
        print(f"Refresh the dashboard to see actual files.")
    else:
        print(f"\n❌ File listing generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
