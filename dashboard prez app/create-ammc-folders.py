#!/usr/bin/env python3
"""
Create AMMC Folder Structure for BCP Securities Services Reporting Dashboard
This script creates the complete folder structure for AMMC reportings.
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

def create_ammc_folders():
    """Create the AMMC folder structure"""
    
    base_dir = os.getcwd()
    year = 2025
    months = list(range(1, 13))  # 1 to 12
    
    # AMMC reporting data (simplified from the dashboard)
    ammc_reportings = {
        "BCP": [
            "Rapport_de_contrôle_des_OPCVM",
            "État_des_OPCVM_gérés",
            "État_des_mandats_de_gestion",
            "État_des_commissions_perçues",
            "État_des_actifs_sous_gestion"
        ],
        "BCP2S": [
            "Rapport_de_contrôle_des_OPCVM_BCP2S",
            "État_des_OPCVM_gérés_BCP2S", 
            "État_des_mandats_de_gestion_BCP2S"
        ],
        "BANK_AL_YOUSR": [
            "Rapport_de_contrôle_des_OPCVM_BAY",
            "État_des_OPCVM_gérés_BAY",
            "État_des_mandats_de_gestion_BAY"
        ]
    }
    
    print("🏗️ Creating AMMC folder structure...")
    print(f"📅 Year: {year}")
    print(f"📂 Base directory: {base_dir}")
    
    total_folders = 0
    
    for entity, reportings in ammc_reportings.items():
        print(f"\n📁 Creating entity: {entity}")
        
        for reporting in reportings:
            print(f"   📄 Creating reporting: {reporting}")
            
            for month in months:
                # Create folder structure
                folder_path = os.path.join(
                    base_dir,
                    "UPLOADED_REPORTINGS",
                    "AMMC",
                    entity,
                    reporting,
                    str(year),
                    str(month)
                )
                
                os.makedirs(folder_path, exist_ok=True)
                total_folders += 1
                
                # Create a placeholder README file in each month folder
                readme_path = os.path.join(folder_path, "README.txt")
                readme_content = f"""Folder for {reporting.replace('_', ' ')}
Entity: {entity}
Year: {year}
Month: {month}

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

def main():
    """Main function"""
    print("🚀 Starting AMMC folder structure creation...")
    
    try:
        # Create the folder structure
        total_folders = create_ammc_folders()
        
        print(f"\n🎉 AMMC setup completed successfully!")
        print(f"📁 {total_folders} folders created")
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
