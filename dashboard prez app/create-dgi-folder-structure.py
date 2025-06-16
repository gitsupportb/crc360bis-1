#!/usr/bin/env python3
"""
Create complete DGI folder structure for BCP Securities Services reporting dashboard.
This script creates the 5-level hierarchy: DGI > [Single Category] > Reporting Name > Year > Month
for all 15 DGI reportings with 2025 and all 12 months.
"""

import os
import json
from datetime import datetime

def clean_folder_name(name):
    """Clean folder name by replacing problematic characters"""
    # Replace problematic characters
    replacements = {
        ' ': '_',
        '–': '___',
        '-': '_',
        '(': '',
        ')': '',
        '*': '',
        '/': '_',
        '\\': '_',
        ':': '',
        '?': '',
        '"': '',
        '<': '',
        '>': '',
        '|': '',
        '&': '_and_',
        '%': '_percent_',
        ',': '_',
        '.': '_',
        ';': '_',
        "'": '',
        'é': 'e',
        'è': 'e',
        'à': 'a',
        'ù': 'u',
        'ç': 'c',
        'ô': 'o',
        'î': 'i',
        'ê': 'e',
        'â': 'a',
        'û': 'u'
    }
    
    result = name
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    # Remove multiple underscores
    while '__' in result:
        result = result.replace('__', '_')
    
    # Remove leading/trailing underscores
    result = result.strip('_')
    
    return result

def get_month_name(month):
    """Get month name in French"""
    months = {
        1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril",
        5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août",
        9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"
    }
    return months.get(month, f"Month_{month}")

def get_dgi_reportings():
    """
    Get all 15 DGI reportings from the requirements
    """
    dgi_reportings = [
        # Annual Declarations (10 reportings) - All due March 31
        "Déclaration de la contribution sociale de solidarité sur les bénéfices et revenus",
        "Déclaration du prorata des déductions",
        "Déclaration des Produits des actions, parts sociales et revenus assimilés",
        "Déclaration Prorata de déduction",
        "Déclaration des rémunérations versées à des personnes non-résidentes",
        "Déclaration des produits de placement à revenu fixe et des revenus des certificats de sukuk",
        "Déclaration du Résultat Fiscale & Liasse Comptable",
        "Versement de contribution sociale de solidarité sur les bénéfices et revenus",
        "Versement Reliquat IS",
        "Déclaration des rémunérations allouées à des tiers",
        
        # Quarterly Declarations (2 reportings) - Due before end of following month
        "Acomptes IS",
        "Délais de paiement",
        
        # Monthly Declarations (3 reportings) - Due before end of following month
        "TPPRF",
        "TVA",
        "RAS"
    ]
    
    return dgi_reportings

def create_dgi_folder_structure():
    """
    Create complete DGI folder structure for all reportings, 2025, and all 12 months
    """
    # Get current working directory (dashboard prez app folder)
    base_dir = os.getcwd()
    print(f"Creating DGI folder structure in: {base_dir}")
    print("=" * 80)

    # Get all DGI reportings
    dgi_reportings = get_dgi_reportings()

    # Year and months
    year = 2025
    months = list(range(1, 13))  # 1 to 12

    total_folders = 0
    total_reportings_count = len(dgi_reportings)

    print(f"📊 DGI Structure Overview:")
    print(f"   • Total DGI reportings: {total_reportings_count}")
    print(f"   • Year: {year}")
    print(f"   • Months: {len(months)} (1-12)")
    print(f"   • Expected total folders: {total_reportings_count * len(months)}")
    print()

    print(f"📁 Creating DGI category structure...")

    for reporting in dgi_reportings:
        print(f"   📄 Creating reporting: {reporting}")
        clean_reporting = clean_folder_name(reporting)

        for month in months:
            # Create folder structure: DGI > [Single Category] > Reporting Name > Year > Month
            folder_path = os.path.join(
                base_dir,
                "UPLOADED_REPORTINGS",
                "DGI",  # Single DGI category (no sub-categories)
                clean_reporting,
                str(year),
                str(month)
            )

            os.makedirs(folder_path, exist_ok=True)
            total_folders += 1

            # Create a placeholder README file in each month folder
            readme_path = os.path.join(folder_path, "README.txt")
            readme_content = f"""Folder for {reporting}
Regulator: DGI - Direction Générale des Impôts
Year: {year}
Month: {month} ({get_month_name(month)})

This folder is ready to receive uploaded DGI reporting files.
Upload your {reporting} files for {get_month_name(month)} {year} here.

Folder structure: ./UPLOADED_REPORTINGS/DGI/{clean_reporting}/{year}/{month}/
Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(readme_content)

        print(f"      ✅ Created {len(months)} month folders for {reporting}")

    print(f"   ✅ Completed DGI structure creation")
    print()

    print(f"🎉 DGI Structure creation completed!")
    print(f"   • Total folders created: {total_folders}")
    print(f"   • Total README files created: {total_folders}")

    return total_folders

def create_dgi_master_index():
    """
    Create a master index file with all the DGI structure information
    """
    base_dir = os.getcwd()
    dgi_reportings = get_dgi_reportings()

    index_content = f"""# BCP Securities Services - DGI Reporting Folder Structure
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Base Directory: {base_dir}

## DGI Folder Structure Overview

This document provides a complete overview of the DGI reporting folder structure.
All folders are organized as: ./UPLOADED_REPORTINGS/DGI/REPORTING_NAME/YEAR/MONTH/

## DGI Reportings (15 total)

### Annual Declarations (10 reportings) - Due March 31:
"""

    # Add annual reportings
    annual_reportings = dgi_reportings[:10]
    for i, reporting in enumerate(annual_reportings, 1):
        clean_name = clean_folder_name(reporting)
        index_content += f"{i:2d}. {reporting}\n    Folder: ./UPLOADED_REPORTINGS/DGI/{clean_name}/2025/[1-12]/\n\n"

    index_content += "\n### Quarterly Declarations (2 reportings) - Due before end of following month:\n"
    
    # Add quarterly reportings
    quarterly_reportings = dgi_reportings[10:12]
    for i, reporting in enumerate(quarterly_reportings, 11):
        clean_name = clean_folder_name(reporting)
        index_content += f"{i:2d}. {reporting}\n    Folder: ./UPLOADED_REPORTINGS/DGI/{clean_name}/2025/[1-12]/\n\n"

    index_content += "\n### Monthly Declarations (3 reportings) - Due before end of following month:\n"
    
    # Add monthly reportings
    monthly_reportings = dgi_reportings[12:15]
    for i, reporting in enumerate(monthly_reportings, 13):
        clean_name = clean_folder_name(reporting)
        index_content += f"{i:2d}. {reporting}\n    Folder: ./UPLOADED_REPORTINGS/DGI/{clean_name}/2025/[1-12]/\n\n"

    index_content += f"""
## Summary Statistics

- Total DGI reportings: {len(dgi_reportings)}
- Annual reportings: 10
- Quarterly reportings: 2  
- Monthly reportings: 3
- Total folders created: {len(dgi_reportings) * 12} (15 reportings × 12 months)
- Year coverage: 2025
- Month coverage: 1-12 (January-December)

## Folder Naming Convention

All folder names are cleaned to be filesystem-safe:
- Spaces replaced with underscores
- Special characters removed or replaced
- Accented characters normalized
- Multiple underscores collapsed to single underscores

## Integration

This DGI structure integrates with:
- ALL_REPORTINGS.json (centralized data source)
- File browser component (real-time folder scanning)
- Upload system (organized file storage)
- Completion tracking (checkbox states)
- Email notification system (deadline reminders)
- Analytics dashboard (progression tracking)
"""

    # Write the index file
    index_path = os.path.join(base_dir, "DGI_FOLDER_STRUCTURE_INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)

    print(f"📋 Created master index: {index_path}")

if __name__ == "__main__":
    print("🏗️ Starting DGI folder structure creation...")
    print()
    
    try:
        total_folders = create_dgi_folder_structure()
        create_dgi_master_index()
        
        print()
        print("✅ DGI folder structure creation completed successfully!")
        print(f"📊 Total folders created: {total_folders}")
        print("🔗 Ready for integration with dashboard components")
        
    except Exception as e:
        print(f"❌ Error creating DGI folder structure: {e}")
        raise
