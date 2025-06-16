#!/usr/bin/env python3
"""
Demo script to create the folder structure for uploaded reportings
This demonstrates that the folders are created in the dashboard prez app directory
"""

import os
import json
from datetime import datetime

def clean_folder_name(name):
    """
    Clean the name to create a valid folder name
    """
    if not name or name == "Unknown":
        return "Unknown"
    
    # Replace special characters with underscores
    import re
    # Keep only letters, numbers, spaces, hyphens and underscores
    cleaned = re.sub(r'[^\w\s\-]', '_', name)
    # Replace multiple spaces with single underscore
    cleaned = re.sub(r'\s+', '_', cleaned)
    # Remove leading and trailing underscores
    cleaned = cleaned.strip('_')
    
    return cleaned if cleaned else "Unknown"

def create_demo_structure():
    """
    Create a demo folder structure with sample files
    """
    # Get current working directory (dashboard prez app folder)
    base_dir = os.getcwd()
    print(f"Creating folder structure in: {base_dir}")
    
    # Demo data
    demo_data = [
        {
            "category": "I – Situation comptable et états annexes",
            "report": "Situation Comptable provisoire",
            "year": 2024,
            "month": 1,
            "files": ["situation_comptable_jan_2024.xlsx"]
        },
        {
            "category": "I – Situation comptable et états annexes",
            "report": "Situation Comptable provisoire",
            "year": 2024,
            "month": 2,
            "files": ["situation_comptable_feb_2024.xlsx"]
        },
        {
            "category": "I – Situation comptable et états annexes",
            "report": "Situation Comptable définitive",
            "year": 2024,
            "month": 3,
            "files": ["situation_comptable_def_q1_2024.xlsx"]
        },
        {
            "category": "II – Etats de synthèse et documents qui leur sont complémentaires",
            "report": "Bilan et hors bilan",
            "year": 2024,
            "month": 1,
            "files": ["bilan_jan_2024.xlsx"]
        },
        {
            "category": "II – Etats de synthèse et documents qui leur sont complémentaires",
            "report": "Bilan et hors bilan",
            "year": 2024,
            "month": 2,
            "files": ["bilan_feb_2024.xlsx"]
        },
        {
            "category": "III – Etats relatifs à la réglementation prudentielle",
            "report": "Fonds propres réglementaires",
            "year": 2024,
            "month": 1,
            "files": ["fonds_propres_jan_2024.xlsx"]
        },
        {
            "category": "III – Etats relatifs à la réglementation prudentielle",
            "report": "Fonds propres réglementaires",
            "year": 2024,
            "month": 2,
            "files": ["fonds_propres_feb_2024.xlsx"]
        }
    ]
    
    upload_logs = []
    
    for item in demo_data:
        # Clean names for folder structure
        clean_category = clean_folder_name(item["category"])
        clean_report = clean_folder_name(item["report"])
        
        # Create folder structure
        folder_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", clean_category, clean_report, str(item["year"]), str(item["month"]))
        os.makedirs(folder_path, exist_ok=True)
        
        print(f"Created folder: {folder_path}")
        
        # Create demo files
        for file_name in item["files"]:
            file_path = os.path.join(folder_path, file_name)
            
            # Create a simple demo file with some content
            demo_content = f"""Demo Reporting File
Category: {item["category"]}
Report: {item["report"]}
Year: {item["year"]}
Month: {item["month"]}
File: {file_name}
Created: {datetime.now().isoformat()}

This is a demo file created to demonstrate the folder structure.
In a real implementation, this would contain the actual reporting data.
"""
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(demo_content)
            
            print(f"Created file: {file_path}")
            
            # Log the upload
            upload_logs.append({
                "timestamp": datetime.now().isoformat(),
                "report_name": item["report"],
                "file_name": file_name,
                "category": item["category"],
                "file_path": file_path,
                "year": item["year"],
                "month": item["month"]
            })
    
    # Create upload log file
    log_file_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", "upload_log.json")
    with open(log_file_path, "w", encoding="utf-8") as f:
        json.dump(upload_logs, f, indent=2, ensure_ascii=False)
    
    print(f"Created upload log: {log_file_path}")
    
    return True

def show_structure():
    """
    Display the created folder structure
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")
    
    if not os.path.exists(base_path):
        print("No UPLOADED_REPORTINGS folder found.")
        return
    
    print(f"\n📁 Folder Structure in {base_dir}:")
    print("UPLOADED_REPORTINGS/")
    
    for category in sorted(os.listdir(base_path)):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path):
            continue
            
        print(f"├── {category}/")
        
        for report in sorted(os.listdir(category_path)):
            report_path = os.path.join(category_path, report)
            if not os.path.isdir(report_path):
                continue
                
            print(f"│   ├── {report}/")
            
            for year in sorted(os.listdir(report_path)):
                year_path = os.path.join(report_path, year)
                if not os.path.isdir(year_path):
                    continue
                    
                print(f"│   │   ├── {year}/")
                
                for month in sorted(os.listdir(year_path)):
                    month_path = os.path.join(year_path, month)
                    if not os.path.isdir(month_path):
                        continue
                        
                    print(f"│   │   │   ├── {month}/")
                    
                    files = [f for f in os.listdir(month_path) if os.path.isfile(os.path.join(month_path, f))]
                    for i, file in enumerate(sorted(files)):
                        if i == len(files) - 1:
                            print(f"│   │   │   │   └── {file}")
                        else:
                            print(f"│   │   │   │   ├── {file}")

def get_statistics():
    """
    Get statistics about the uploaded files
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")
    
    if not os.path.exists(base_path):
        return {"total_files": 0, "total_categories": 0, "total_reports": 0}
    
    total_files = 0
    total_categories = 0
    total_reports = 0
    
    for category in os.listdir(base_path):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path):
            continue
            
        total_categories += 1
        
        for report in os.listdir(category_path):
            report_path = os.path.join(category_path, report)
            if not os.path.isdir(report_path):
                continue
                
            total_reports += 1
            
            for year in os.listdir(report_path):
                year_path = os.path.join(report_path, year)
                if not os.path.isdir(year_path):
                    continue
                    
                for month in os.listdir(year_path):
                    month_path = os.path.join(year_path, month)
                    if not os.path.isdir(month_path):
                        continue
                        
                    files = [f for f in os.listdir(month_path) if os.path.isfile(os.path.join(month_path, f))]
                    total_files += len(files)
    
    return {
        "total_files": total_files,
        "total_categories": total_categories,
        "total_reports": total_reports
    }

if __name__ == "__main__":
    print("🚀 Creating Demo Folder Structure for BCP Securities Services")
    print("=" * 60)
    
    # Create the demo structure
    success = create_demo_structure()
    
    if success:
        print("\n✅ Demo structure created successfully!")
        
        # Show the structure
        show_structure()
        
        # Show statistics
        stats = get_statistics()
        print(f"\n📊 Statistics:")
        print(f"Total Files: {stats['total_files']}")
        print(f"Total Categories: {stats['total_categories']}")
        print(f"Total Reports: {stats['total_reports']}")
        
        print(f"\n🎯 All files are stored in: {os.path.join(os.getcwd(), 'UPLOADED_REPORTINGS')}")
        print("You can now test the file browser in the dashboard!")
    else:
        print("❌ Failed to create demo structure")
