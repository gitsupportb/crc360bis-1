#!/usr/bin/env python3
"""
Add sample files to the folder structure to test the file browser
This script adds realistic sample files to demonstrate the file browser functionality
"""

import os
import json
from datetime import datetime

def add_sample_files():
    """
    Add sample files to various folders to test the file browser
    """
    base_dir = os.getcwd()
    print(f"Adding sample files to: {base_dir}")
    
    # Sample files to add
    sample_files = [
        {
            "category": "I___Situation_comptable_et_états_annexes",
            "report": "Situation_Comptable_provisoire",
            "year": "2025",
            "month": "1",
            "files": [
                "situation_comptable_provisoire_jan_2025.xlsx",
                "annexe_situation_comptable_jan_2025.pdf"
            ]
        },
        {
            "category": "I___Situation_comptable_et_états_annexes",
            "report": "Situation_Comptable_provisoire",
            "year": "2025",
            "month": "2",
            "files": [
                "situation_comptable_provisoire_feb_2025.xlsx"
            ]
        },
        {
            "category": "I___Situation_comptable_et_états_annexes",
            "report": "Situation_Comptable_définitive",
            "year": "2025",
            "month": "3",
            "files": [
                "situation_comptable_definitive_q1_2025.xlsx",
                "rapport_auditeur_q1_2025.pdf"
            ]
        },
        {
            "category": "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires",
            "report": "Bilan",
            "year": "2025",
            "month": "1",
            "files": [
                "bilan_jan_2025.xlsx",
                "notes_explicatives_bilan_jan_2025.docx"
            ]
        },
        {
            "category": "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires",
            "report": "Compte_de_produits_et_charges",
            "year": "2025",
            "month": "1",
            "files": [
                "compte_produits_charges_jan_2025.xlsx"
            ]
        },
        {
            "category": "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires",
            "report": "Compte_de_produits_et_charges",
            "year": "2025",
            "month": "2",
            "files": [
                "compte_produits_charges_feb_2025.xlsx",
                "analyse_variance_feb_2025.pdf"
            ]
        },
        {
            "category": "III___Etats_relatifs_à_la_réglementation_prudentielle",
            "report": "Reporting_réglementaire_IRRBB",
            "year": "2025",
            "month": "1",
            "files": [
                "IRRBB_report_jan_2025.xlsx",
                "stress_test_IRRBB_jan_2025.xlsx"
            ]
        },
        {
            "category": "III___Etats_relatifs_à_la_réglementation_prudentielle",
            "report": "Etat_LCR",
            "year": "2025",
            "month": "1",
            "files": [
                "LCR_calculation_jan_2025.xlsx"
            ]
        },
        {
            "category": "III___Etats_relatifs_à_la_réglementation_prudentielle",
            "report": "Etat_LCR",
            "year": "2025",
            "month": "2",
            "files": [
                "LCR_calculation_feb_2025.xlsx",
                "LCR_stress_test_feb_2025.xlsx"
            ]
        }
    ]
    
    upload_logs = []
    total_files_added = 0
    
    for item in sample_files:
        folder_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", item["category"], item["report"], item["year"], item["month"])
        
        if not os.path.exists(folder_path):
            print(f"Warning: Folder does not exist: {folder_path}")
            continue
        
        for file_name in item["files"]:
            file_path = os.path.join(folder_path, file_name)
            
            # Create sample file content based on file type
            if file_name.endswith('.xlsx'):
                content = f"""Sample Excel File: {file_name}
Category: {item["category"].replace('_', ' ')}
Report: {item["report"].replace('_', ' ')}
Period: {item["month"]}/{item["year"]}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This is a sample Excel file for testing the file browser.
In a real implementation, this would contain actual reporting data in Excel format.

File Type: Excel Spreadsheet (.xlsx)
Purpose: Financial/Regulatory Reporting Data
Status: Sample/Demo File
"""
            elif file_name.endswith('.pdf'):
                content = f"""Sample PDF Document: {file_name}
Category: {item["category"].replace('_', ' ')}
Report: {item["report"].replace('_', ' ')}
Period: {item["month"]}/{item["year"]}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This is a sample PDF document for testing the file browser.
In a real implementation, this would contain actual reporting documentation in PDF format.

File Type: PDF Document (.pdf)
Purpose: Supporting Documentation/Reports
Status: Sample/Demo File
"""
            elif file_name.endswith('.docx'):
                content = f"""Sample Word Document: {file_name}
Category: {item["category"].replace('_', ' ')}
Report: {item["report"].replace('_', ' ')}
Period: {item["month"]}/{item["year"]}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This is a sample Word document for testing the file browser.
In a real implementation, this would contain actual reporting notes and explanations.

File Type: Word Document (.docx)
Purpose: Notes and Explanations
Status: Sample/Demo File
"""
            else:
                content = f"""Sample File: {file_name}
Category: {item["category"].replace('_', ' ')}
Report: {item["report"].replace('_', ' ')}
Period: {item["month"]}/{item["year"]}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This is a sample file for testing the file browser.
"""
            
            # Write the file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            print(f"Added: {file_path}")
            total_files_added += 1
            
            # Log the upload
            upload_logs.append({
                "timestamp": datetime.now().isoformat(),
                "report_name": item["report"].replace('_', ' '),
                "file_name": file_name,
                "category": item["category"].replace('_', ' '),
                "file_path": file_path,
                "year": int(item["year"]),
                "month": int(item["month"]),
                "file_type": "sample",
                "purpose": "testing"
            })
    
    # Update the upload log
    log_file_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", "upload_log.json")
    
    # Read existing logs
    existing_logs = []
    if os.path.exists(log_file_path):
        with open(log_file_path, "r", encoding="utf-8") as f:
            try:
                existing_logs = json.load(f)
            except:
                existing_logs = []
    
    # Add new logs
    existing_logs.extend(upload_logs)
    
    # Save updated logs
    with open(log_file_path, "w", encoding="utf-8") as f:
        json.dump(existing_logs, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully added {total_files_added} sample files!")
    print(f"📋 Updated upload log with {len(upload_logs)} new entries")
    print(f"📁 Files added to: {os.path.join(base_dir, 'UPLOADED_REPORTINGS')}")
    
    return total_files_added

def show_sample_files_summary():
    """
    Show a summary of the sample files added
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")
    
    print(f"\n📊 SAMPLE FILES SUMMARY")
    print("=" * 50)
    
    total_files = 0
    categories_with_files = 0
    
    for category in os.listdir(base_path):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path):
            continue
        
        category_files = 0
        for report in os.listdir(category_path):
            report_path = os.path.join(category_path, report)
            if not os.path.isdir(report_path):
                continue
            
            for year in os.listdir(report_path):
                year_path = os.path.join(report_path, year)
                if not os.path.isdir(year_path):
                    continue
                
                for month in os.listdir(year_path):
                    month_path = os.path.join(year_path, month)
                    if not os.path.isdir(month_path):
                        continue
                    
                    files = [f for f in os.listdir(month_path) 
                            if os.path.isfile(os.path.join(month_path, f)) 
                            and not f.lower().startswith('readme')]
                    category_files += len(files)
        
        if category_files > 0:
            categories_with_files += 1
            total_files += category_files
            print(f"📁 {category.replace('_', ' ')}: {category_files} files")
    
    print(f"\n🎯 TOTALS:")
    print(f"   • Categories with files: {categories_with_files}")
    print(f"   • Total sample files: {total_files}")
    print(f"   • Ready for file browser testing!")

if __name__ == "__main__":
    print("🚀 Adding Sample Files for File Browser Testing")
    print("=" * 60)
    
    # Add sample files
    files_added = add_sample_files()
    
    # Show summary
    show_sample_files_summary()
    
    print(f"\n✅ COMPLETE! Added {files_added} sample files.")
    print("🎯 You can now test the file browser in the dashboard!")
    print("📁 Go to the 'File Browser' tab to see the files.")
