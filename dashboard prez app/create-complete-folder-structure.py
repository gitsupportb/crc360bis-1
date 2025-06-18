#!/usr/bin/env python3
"""
Complete folder structure creation for BCP Securities Services
Creates folders for ALL reportings, year 2025, and all 12 months
This provides a complete basis for the reporting system
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

def get_all_reportings():
    """
    Get ALL reportings from all categories - COMPLETE LIST from dashboard
    Category I: 26 reportings, Category II: 23 reportings, Category III: 19 reportings
    """
    reportings = {
        "I – Situation comptable et états annexes": [
            # Complete Category I - 26 reportings from dataCat1
            "Situation Comptable provisoire",
            "Situation Comptable définitive (*)",
            "Ventilation, en fonction de la résidence et par catégorie de contrepartie, des opérations de trésorerie et des créances sur les établissements de crédit et assimilés",
            "Ventilation, en fonction de la résidence et par catégorie de contrepartie, des opérations de trésorerie et des dettes envers les établissements de crédit et assimilés",
            "Ventilation, en fonction de la résidence et par catégorie de contrepartie, des créances sur la clientèle financière",
            "Ventilation, en fonction de la résidence et par catégorie de contrepartie, des dettes envers la clientèle financière",
            "Ventilation, en fonction de la résidence et par catégorie d'agent économique, des créances sur la clientèle non financière",
            "Ventilation, en fonction de la résidence et par catégorie d'agent économique, des dettes envers la clientèle non financière",
            "Ventilation, par sections et sous sections d'activité, des créances sur la clientèle",
            "Ventilation, en fonction du support, des valeurs reçues ou données en pension",
            "Ventilation, en fonction de la résidence de l'émetteur et par catégorie de contrepartie, des titres en portefeuille",
            "Ventilation des éléments d'actif , de passif et d'hors bilan concernant les apparentés",
            "Ventilation , en fonction de la durée initiale, des emplois et des ressources",
            "Ventilation , en fonction de la durée résiduelle, des emplois, des ressources et des engagements de hors bilan",
            "Détails des autres actifs et passifs",
            "Ventilation, en fonction de leur terme, des dettes en devises envers les banques étrangères et organismes assimilés",
            "Ventilation des titres par émetteur",
            "Ventilation, par catégorie de contrepartie, des opérations de trésorerie et des créances sur les établissements de crédit assimilés",
            "Ventilation, par catégorie de contrepartie, des opérations de trésorerie et des dettes envers les établissements de crédit assimilés",
            "Ventilation, par catégorie de détenteurs et par durée initiale des titres de dettes",
            "Ventilation, par catégorie d'agent économique des autres actifs et passifs",
            "Ventilation, par agent économique, de l'actif net des OPCVM",
            "Ventilation, par agent économique, de l'actif net des OPCVM autres que monétaires",
            "Ventilation, en fonction de la durée résiduelle, de l'endettement des banques en devises",
            "Ventilation par guichet des dépôts et crédits par décaissement",
            "Etat d'exposition sur les contreparties étrangères"
        ],
        "II – Etats de synthèse et documents qui leur sont complémentaires": [
            # Complete Category II - 23 reportings from dataCat2
            "Bilan",
            "Compte de produits et charges",
            "Etat des soldes de gestion",
            "Tableau des flux de trésorerie",
            "Compte de produits et charges détaillé",
            "Immobilisations incorporelles et corporelles",
            "Cession des immobilisations incorporelles et corporelles",
            "Détail des titres de placement (titres de propriété)",
            "Détail des titres de participation et emplois assimilés",
            "Cession des titres de placement, des titres d'investissement, des titres de participation et emplois assimilés",
            "Valeur du portefeuille titres suivant différentes méthodes d'évaluation de ces titres",
            "Détail des provisions",
            "Répartition du capital social",
            "Répartition, par classe, nationalité, sexe et âge, du personnel",
            "Composition du conseil de surveillance",
            "Liste des membres et des agents de direction",
            "Liste des membres du directoire",
            "Liste des apparentés",
            "Evolution des valeurs mobilières conservées pour le compte de la clientèle par catégories d'agents économiques et d'instruments financiers",
            "Ventilation des valeurs mobilières conservées pour le compte de la clientèle",
            "Ventilation de l'encours des dépôts dirhams éligibles par nombre, catégorie de déposants et par tranche de montant",
            "Ventilation de l'encours des dépôts devises éligibles par nombre, catégorie de déposants et par tranche de montant",
            "Ventilation par montant de l'encours des dépôts éligibles et non éligibles"
        ],
        "III – Etats relatifs à la réglementation prudentielle": [
            # Complete Category III - 19 reportings from dataCat3
            "Reporting réglementaire IRRBB",
            "Etat LCR",
            "Etat de calcul du ratio de levier sur base individuelle",
            "Risques encourus sur un même bénéficiaire égaux ou supérieurs à 5% des fonds propres, déclarés sur base individuelle",
            "Détail des risques sur les clients individuels au sein des groupes (base individuelle)",
            "Calcul des seuils de 5 % et 20 % des fonds propres",
            "Statistiques sur le nombre des DS transmises à l'UTRF par ligne de métiers et typologie d'infraction sous-jacente sur la période 2018-2019",
            "Risque inhérent 'Banque de l'entreprise et de financement'",
            "Reporting COREP individuel et Etats des fonds propres",
            "Reporting sur le risque du marché",
            "Stress tests au titre du risque de liquidité",
            "Stress tests au titre du risque de crédit",
            "Stress tests au titre du risque de concentration",
            "Stress tests au titre du risque de marché",
            "Stress tests au titre du risque pays",
            "Choc sur le marché immobilier",
            "Déterioration des conditions macroéconomiques",
            "Reporting sur les reports d'échéances des crédits (Global, Zoom Tourisme et Moratoires 2022)",
            "Expositions par segment (TPE, PME, ETI, GE)"
        ]
    }
    return reportings

def create_complete_structure():
    """
    Create complete folder structure for all reportings, 2025, and all 12 months
    """
    # Get current working directory (dashboard prez app folder)
    base_dir = os.getcwd()
    print(f"Creating complete folder structure in: {base_dir}")
    print("=" * 80)

    # Get all reportings
    all_reportings = get_all_reportings()

    # Year and months
    year = 2025
    months = list(range(1, 13))  # 1 to 12

    total_folders = 0
    total_categories = len(all_reportings)
    total_reportings_count = sum(len(reports) for reports in all_reportings.values())

    print(f"📊 Creating structure for:")
    print(f"   • Categories: {total_categories}")
    print(f"   • Reportings: {total_reportings_count}")
    print(f"   • Year: {year}")
    print(f"   • Months: {len(months)} (January to December)")
    print(f"   • Total folders to create: {total_categories * total_reportings_count * len(months)}")
    print()

    for category, reportings in all_reportings.items():
        print(f"📁 Creating category: {category}")
        clean_category = clean_folder_name(category)

        for reporting in reportings:
            print(f"   📄 Creating reporting: {reporting}")
            clean_reporting = clean_folder_name(reporting)

            for month in months:
                # Create folder structure
                folder_path = os.path.join(
                    base_dir,
                    "UPLOADED_REPORTINGS",
                    clean_category,
                    clean_reporting,
                    str(year),
                    str(month)
                )

                os.makedirs(folder_path, exist_ok=True)
                total_folders += 1

                # Create a placeholder README file in each month folder
                readme_path = os.path.join(folder_path, "README.txt")
                readme_content = f"""Folder for {reporting}
Category: {category}
Year: {year}
Month: {month} ({get_month_name(month)})

This folder is ready to receive uploaded reporting files.
Upload your {reporting} files for {get_month_name(month)} {year} here.

Folder structure: ./UPLOADED_REPORTINGS/{clean_category}/{clean_reporting}/{year}/{month}/
Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

                with open(readme_path, "w", encoding="utf-8") as f:
                    f.write(readme_content)

            print(f"      ✅ Created {len(months)} month folders for {reporting}")

        print(f"   ✅ Completed category: {category}")
        print()

    print(f"🎉 Structure creation completed!")
    print(f"   • Total folders created: {total_folders}")
    print(f"   • Total README files created: {total_folders}")

    return total_folders

def get_month_name(month_num):
    """
    Get month name from number
    """
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    return months[month_num - 1]

def create_master_index():
    """
    Create a master index file with all the structure information
    """
    base_dir = os.getcwd()
    all_reportings = get_all_reportings()

    index_content = f"""# BCP Securities Services - Reporting Folder Structure
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Base Directory: {base_dir}

## Folder Structure Overview

This document provides a complete overview of the reporting folder structure.
All folders are organized as: ./UPLOADED_REPORTINGS/CATEGORY/REPORTING_NAME/YEAR/MONTH/

## Categories and Reportings

"""

    for category, reportings in all_reportings.items():
        index_content += f"### {category}\n\n"
        for i, reporting in enumerate(reportings, 1):
            clean_reporting = clean_folder_name(reporting)
            index_content += f"{i:2d}. **{reporting}**\n"
            index_content += f"    - Folder: `{clean_folder_name(category)}/{clean_reporting}/`\n"
            index_content += f"    - Full path: `./UPLOADED_REPORTINGS/{clean_folder_name(category)}/{clean_reporting}/2025/[1-12]/`\n\n"

        index_content += "\n"

    index_content += f"""## Monthly Structure

Each reporting has folders for all 12 months of 2025:

"""

    for month in range(1, 13):
        index_content += f"- **{month:2d}** - {get_month_name(month)}\n"

    index_content += f"""

## Usage Instructions

1. **Upload Files**: Place your reporting files in the appropriate month folder
2. **File Naming**: Use descriptive names like `reporting_name_month_year.xlsx`
3. **Organization**: Files are automatically organized by category, report, year, and month
4. **Search**: Use the dashboard file browser to search and filter files

## Statistics

- **Total Categories**: {len(all_reportings)}
- **Total Reportings**: {sum(len(reports) for reports in all_reportings.values())}
- **Total Month Folders**: {sum(len(reports) for reports in all_reportings.values()) * 12}
- **Year**: 2025
- **Months**: 1-12 (January to December)

## File Browser

Access the file browser through the main dashboard:
1. Open `complete_dashboard.html`
2. Go to the "📁 File Browser" tab
3. Browse, search, and manage your uploaded files

---
Generated by BCP Securities Services Reporting System
"""

    # Save the index file
    index_path = os.path.join(base_dir, "UPLOADED_REPORTINGS", "FOLDER_STRUCTURE_INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)

    print(f"📋 Master index created: {index_path}")
    return index_path

def show_summary():
    """
    Show a summary of the created structure
    """
    base_dir = os.getcwd()
    base_path = os.path.join(base_dir, "UPLOADED_REPORTINGS")

    if not os.path.exists(base_path):
        print("❌ No UPLOADED_REPORTINGS folder found.")
        return

    print(f"\n📊 SUMMARY - Folder Structure in {base_dir}")
    print("=" * 80)

    total_categories = 0
    total_reportings = 0
    total_months = 0

    for category in sorted(os.listdir(base_path)):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path):
            continue

        total_categories += 1
        print(f"\n📁 {category.replace('_', ' ')}")

        category_reportings = 0
        for reporting in sorted(os.listdir(category_path)):
            reporting_path = os.path.join(category_path, reporting)
            if not os.path.isdir(reporting_path):
                continue

            category_reportings += 1
            total_reportings += 1

            # Count months for this reporting
            year_path = os.path.join(reporting_path, "2025")
            if os.path.exists(year_path):
                months = [m for m in os.listdir(year_path) if os.path.isdir(os.path.join(year_path, m))]
                total_months += len(months)
                print(f"   📄 {reporting.replace('_', ' ')} ({len(months)} months)")

        print(f"   ✅ {category_reportings} reportings in this category")

    print(f"\n🎯 TOTALS:")
    print(f"   • Categories: {total_categories}")
    print(f"   • Reportings: {total_reportings}")
    print(f"   • Month folders: {total_months}")
    print(f"   • Year: 2025")
    print(f"   • Ready for file uploads!")

if __name__ == "__main__":
    print("🚀 Creating Complete Folder Structure for BCP Securities Services")
    print("📅 Year 2025 - All 12 Months - All Reportings")
    print("=" * 80)

    # Create the complete structure
    total_folders = create_complete_structure()

    # Create master index
    create_master_index()

    # Show summary
    show_summary()

    print(f"\n✅ COMPLETE! Created {total_folders} folders with README files.")
    print(f"🎯 All reportings are ready for 2025 with all 12 months.")
    print(f"📁 Location: {os.path.join(os.getcwd(), 'UPLOADED_REPORTINGS')}")
    print(f"📋 See FOLDER_STRUCTURE_INDEX.md for complete documentation.")
