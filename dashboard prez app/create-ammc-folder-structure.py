#!/usr/bin/env python3
"""
Create AMMC Folder Structure for BCP Securities Services Reporting Dashboard
This script creates the complete folder structure for AMMC reportings with the new organization:
- UPLOADED_REPORTINGS/AMMC/BCP/
- UPLOADED_REPORTINGS/AMMC/BCP2S/
- UPLOADED_REPORTINGS/AMMC/BANK_AL_YOUSR/

Each reporting type gets folders for 2025 with all 12 months.
"""

import os
import json
from datetime import datetime

def clean_folder_name(name):
    """Clean folder name for file system compatibility"""
    return (name
            .replace('<', '_').replace('>', '_')
            .replace(':', '_').replace('"', '_')
            .replace('/', '_').replace('\\', '_')
            .replace('|', '_').replace('?', '_')
            .replace('*', '_').replace(' ', '_')
            .replace('__', '_').replace('__', '_')
            .strip('_'))

def get_month_name(month):
    """Get month name"""
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]

def create_ammc_folder_structure():
    """Create the complete AMMC folder structure"""
    
    base_dir = os.getcwd()
    year = 2025
    months = list(range(1, 13))  # 1 to 12
    
    # AMMC reporting data (from the dashboard)
    ammc_reportings = {
        "BCP": [
            "Rapport de contrôle des OPCVM",
            "État des OPCVM gérés",
            "État des mandats de gestion",
            "État des commissions perçues",
            "État des actifs sous gestion",
            "Déclaration des opérations sur titres"
        ],
        "BCP2S": [
            "Rapport de contrôle des OPCVM BCP2S",
            "État des OPCVM gérés BCP2S", 
            "État des mandats de gestion BCP2S",
            "Déclaration des opérations sur titres BCP2S"
        ],
        "BANK_AL_YOUSR": [
            "Rapport de contrôle des OPCVM BAY",
            "État des OPCVM gérés BAY",
            "État des mandats de gestion BAY",
            "Déclaration des opérations sur titres BAY"
        ]
    }
    
    print("🏗️ Creating AMMC folder structure...")
    print(f"📅 Year: {year}")
    print(f"📂 Base directory: {base_dir}")
    
    total_folders = 0
    
    # Create AMMC base folder
    ammc_base = os.path.join(base_dir, "UPLOADED_REPORTINGS", "AMMC")
    os.makedirs(ammc_base, exist_ok=True)
    print(f"📁 Created AMMC base folder: {ammc_base}")
    
    for entity, reportings in ammc_reportings.items():
        print(f"\n📁 Creating entity: {entity}")
        entity_clean = clean_folder_name(entity)
        
        for reporting in reportings:
            print(f"   📄 Creating reporting: {reporting}")
            reporting_clean = clean_folder_name(reporting)
            
            for month in months:
                # Create folder structure
                folder_path = os.path.join(
                    base_dir,
                    "UPLOADED_REPORTINGS",
                    "AMMC",
                    entity_clean,
                    reporting_clean,
                    str(year),
                    str(month)
                )
                
                os.makedirs(folder_path, exist_ok=True)
                total_folders += 1
                
                # Create a placeholder README file in each month folder
                readme_path = os.path.join(folder_path, "README.txt")
                readme_content = f"""Folder for {reporting}
Entity: {entity}
Year: {year}
Month: {month} ({get_month_name(month)})

This folder is ready to receive uploaded AMMC reporting files.
Upload files through the BCP Securities Services Reporting Dashboard.

Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
                
                with open(readme_path, "w", encoding="utf-8") as f:
                    f.write(readme_content)
    
    print(f"\n✅ AMMC folder structure created successfully!")
    print(f"📊 Total folders created: {total_folders}")
    print(f"📁 Total entities: {len(ammc_reportings)}")
    print(f"📄 Total reporting types: {sum(len(reportings) for reportings in ammc_reportings.values())}")
    
    return total_folders

def create_ammc_index():
    """Create an index file for the AMMC structure"""
    
    base_dir = os.getcwd()
    ammc_base = os.path.join(base_dir, "UPLOADED_REPORTINGS", "AMMC")
    
    # Count folders and files
    total_folders = 0
    total_files = 0
    
    for root, dirs, files in os.walk(ammc_base):
        total_folders += len(dirs)
        total_files += len([f for f in files if not f.startswith('.')])
    
    index_content = f"""# AMMC Folder Structure Index

Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Structure Overview

```
UPLOADED_REPORTINGS/
└── AMMC/
    ├── BCP/
    │   ├── Rapport_de_contrôle_des_OPCVM/
    │   ├── État_des_OPCVM_gérés/
    │   ├── État_des_mandats_de_gestion/
    │   ├── État_des_commissions_perçues/
    │   ├── État_des_actifs_sous_gestion/
    │   └── Déclaration_des_opérations_sur_titres/
    ├── BCP2S/
    │   ├── Rapport_de_contrôle_des_OPCVM_BCP2S/
    │   ├── État_des_OPCVM_gérés_BCP2S/
    │   ├── État_des_mandats_de_gestion_BCP2S/
    │   └── Déclaration_des_opérations_sur_titres_BCP2S/
    └── BANK_AL_YOUSR/
        ├── Rapport_de_contrôle_des_OPCVM_BAY/
        ├── État_des_OPCVM_gérés_BAY/
        ├── État_des_mandats_de_gestion_BAY/
        └── Déclaration_des_opérations_sur_titres_BAY/
```

Each reporting type contains:
- 📅 Year folder: 2025
- 📂 Month folders: 1-12 (January to December)
- 📄 README.txt file in each month folder

## Statistics

- **Total Entities**: 3 (BCP, BCP2S, BANK AL YOUSR)
- **Total Reporting Types**: 14
- **Total Month Folders**: 168 (14 × 12 months)
- **Year**: 2025
- **Months**: 1-12 (January to December)

## File Browser

Access the file browser through the main dashboard:
1. Open `complete_dashboard.html`
2. Go to the "📁 File Browser" tab
3. Browse AMMC reportings under the AMMC regulator section

---
Generated by BCP Securities Services Reporting System
"""
    
    # Save the index file
    index_path = os.path.join(ammc_base, "AMMC_STRUCTURE_INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)
    
    print(f"📋 AMMC index created: {index_path}")
    return index_path

def main():
    """Main function"""
    print("🚀 Starting AMMC folder structure creation...")
    
    try:
        # Create the folder structure
        total_folders = create_ammc_folder_structure()
        
        # Create the index
        index_path = create_ammc_index()
        
        print(f"\n🎉 AMMC setup completed successfully!")
        print(f"📁 {total_folders} folders created")
        print(f"📋 Index file: {index_path}")
        print(f"\n🔗 Next steps:")
        print(f"1. Open complete_dashboard.html")
        print(f"2. Go to File Browser tab")
        print(f"3. Browse AMMC reportings")
        print(f"4. Upload files through the dashboard")
        
    except Exception as e:
        print(f"❌ Error creating AMMC structure: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
