#!/usr/bin/env python3
"""
Update the embedded file data in file-manager.js with real files from the folder structure
This script scans the UPLOADED_REPORTINGS folder and updates the JavaScript with real file data
"""

import os
import json
import re
from datetime import datetime

def scan_for_real_files():
    """
    Scan the UPLOADED_REPORTINGS folder for real files
    """
    base_path = "./UPLOADED_REPORTINGS"
    
    if not os.path.exists(base_path):
        print(f"❌ Error: {base_path} folder not found")
        return {}
    
    print(f"🔍 Scanning for real files in: {base_path}")
    
    real_files = {}
    total_files = 0
    
    # Walk through all directories
    for root, dirs, files in os.walk(base_path):
        # Skip the base directory itself
        if root == base_path:
            continue
            
        # Parse the path to extract category/report/year/month
        rel_path = os.path.relpath(root, base_path)
        path_parts = rel_path.split(os.sep)
        
        if len(path_parts) >= 4:
            category = path_parts[0]
            report = path_parts[1]
            year = path_parts[2]
            month = path_parts[3]
            
            # Filter out non-reporting files
            reporting_files = []
            for file in files:
                if file.lower().endswith(('.xlsx', '.xls', '.pdf', '.docx', '.doc')):
                    reporting_files.append(file)
                    total_files += 1
            
            if reporting_files:
                # Initialize structure if needed
                if category not in real_files:
                    real_files[category] = {}
                if report not in real_files[category]:
                    real_files[category][report] = {}
                if year not in real_files[category][report]:
                    real_files[category][report][year] = {}
                
                # Add files to structure
                real_files[category][report][year][month] = reporting_files
                
                print(f"📁 Found: {category}/{report}/{year}/{month} - {len(reporting_files)} files")
                for file in reporting_files:
                    print(f"   📄 {file}")
    
    print(f"\n📊 Total real files found: {total_files}")
    return real_files

def generate_javascript_code(real_files):
    """
    Generate JavaScript code for the embedded file data
    """
    js_code = """  /**
   * Load from embedded file data (fallback for CORS issues)
   */
  loadFromEmbeddedData() {
    console.log('🔍 Loading from embedded file data...');
    
    // Get the base empty structure
    const structure = this.generateActualFileStructure();
    
    // Real files found in the folder structure
    const realFiles = """ + json.dumps(real_files, indent=6) + """;
    
    // Update the structure with real files
    for (const category in realFiles) {
      if (structure[category]) {
        for (const report in realFiles[category]) {
          if (structure[category][report]) {
            for (const year in realFiles[category][report]) {
              if (structure[category][report][year]) {
                for (const month in realFiles[category][report][year]) {
                  structure[category][report][year][month] = realFiles[category][report][year][month];
                }
              }
            }
          }
        }
      }
    }
    
    console.log('✅ Embedded real files added to structure');
    console.log('📊 Real files loaded:', Object.keys(realFiles).length, 'categories');
    
    return structure;
  }"""
    
    return js_code

def update_file_manager_js(js_code):
    """
    Update the file-manager.js file with the new embedded data
    """
    file_path = "file-manager.js"
    
    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found")
        return False
    
    # Read the current file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the loadFromEmbeddedData method
    pattern = r'  /\*\*\s*\n\s*\* Load from embedded file data.*?\n\s*\}(?=\s*\n\s*/\*\*|\s*\n\s*async|\s*\n\s*\}|\s*$)'
    
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, js_code, content, flags=re.DOTALL)
        
        # Write the updated file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated {file_path} with real file data")
        return True
    else:
        print(f"❌ Could not find loadFromEmbeddedData method in {file_path}")
        return False

def main():
    """
    Main function
    """
    print("🚀 EMBEDDED FILE DATA UPDATER")
    print("=" * 40)
    
    # Scan for real files
    real_files = scan_for_real_files()
    
    if not real_files:
        print("❌ No real files found to embed")
        return
    
    # Generate JavaScript code
    js_code = generate_javascript_code(real_files)
    
    # Update the file-manager.js file
    success = update_file_manager_js(js_code)
    
    if success:
        print(f"\n🎉 SUCCESS!")
        print(f"📄 file-manager.js updated with real file data")
        print(f"🔄 Refresh the dashboard to see your real files")
        print(f"📊 Files embedded: {sum(len(reports) for reports in real_files.values())} reporting types")
    else:
        print(f"\n❌ FAILED!")
        print(f"Could not update file-manager.js")

if __name__ == "__main__":
    main()
